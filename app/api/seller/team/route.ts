import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const parentId = searchParams.get('parent_id');

    if (!parentId) {
        return NextResponse.json({ error: 'Parent ID es requerido' }, { status: 400 });
    }

    try {
        const query = `
            SELECT 
                s.id, s.nombre, s.code, s.email, s.activo, s.created_at,
                COUNT(r.id) as total_ventas,
                SUM(CASE WHEN r.status IN ('pagado', 'entregado') THEN 1 ELSE 0 END) as ventas_pagadas
            FROM registraya_vcard_sellers s
            LEFT JOIN registraya_vcard_registros r ON s.id = r.seller_id
            WHERE s.parent_id = ? AND s.activo = 1
            GROUP BY s.id, s.nombre, s.code, s.email, s.activo, s.created_at
            ORDER BY s.created_at DESC
        `;
        const [rows] = await pool.execute(query, [parentId]);
        return NextResponse.json({ data: rows });
    } catch (err: any) {
        console.error('Error fetching team:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { parent_id, nombre, email, password } = await req.json();

        if (!parent_id || !nombre || !email || !password) {
            return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
        }

        // 1. Obtener el código del padre
        const [parentRows]: any = await pool.execute(
            'SELECT code FROM registraya_vcard_sellers WHERE id = ?',
            [parent_id]
        );

        if (parentRows.length === 0) {
            return NextResponse.json({ error: 'Vendedor padre no encontrado' }, { status: 404 });
        }

        const parentCode = parentRows[0].code || 'VEND';

        // 2. Generar código de sub-vendedor: CODIGO_PADRE-XXXX
        const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
        const code = `${parentCode}-${suffix}`;

        // 3. Insertar sub-vendedor
        const query = `
            INSERT INTO registraya_vcard_sellers (parent_id, nombre, email, password, role, comision_porcentaje, code, activo)
            VALUES (?, ?, ?, ?, 'seller', 30, ?, 1)
        `;

        const [result]: any = await pool.execute(query, [
            parent_id,
            nombre,
            email,
            password,
            code
        ]);

        // 4. Enviar correo de bienvenida al sub-vendedor
        try {
            const { sendMail } = await import('@/lib/mailer');

            const htmlContent = `
                <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="color: #FF8A33; margin: 0;">¡Bienvenido a ActivaQR!</h2>
                        <p style="color: #666; font-size: 14px; margin-top: 5px;">Tu cuenta de Sub-Vendedor ha sido creada</p>
                    </div>
                    
                    <p>Hola <strong>${nombre}</strong>,</p>
                    <p>Has sido registrado exitosamente como Asesor de Ventas en nuestro sistema.</p>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #001549;">Tus Credenciales de Acceso:</h3>
                        <p style="margin: 5px 0;"><strong>Enlace de Ingreso:</strong> <a href="https://activaqr.com/admin/vendedor" style="color: #FF8A33;">https://activaqr.com/admin/vendedor</a></p>
                        <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                        <p style="margin: 5px 0;"><strong>Contraseña:</strong> ${password} <span style="font-size: 12px; color: #666;">(Te recomendamos cambiarla al ingresar)</span></p>
                        <p style="margin: 5px 0;"><strong>Tu Código de Vendedor:</strong> <span style="background: #001549; color: white; padding: 3px 8px; border-radius: 4px;">${code}</span></p>
                    </div>
                    
                    <p>Ya puedes ingresar a tu panel de control, firmar tu Acuerdo de Rendimiento y empezar a generar vCards para tus clientes.</p>
                    
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #999; text-align: center;">Generador de Tarjetas Digitales - ActivaQR</p>
                </div>
            `;

            await sendMail({
                to: email,
                subject: 'Tu cuenta de Ventas ActivaQR ha sido creada 🚀',
                html: htmlContent
            });
            console.log('Correo de bienvenida enviado exitosamente a:', email);
        } catch (mailError) {
            console.error('Error enviando correo de bienvenida al sub-vendedor:', mailError);
            // No detenemos el flujo aunque falle el correo, el usuario ya se creó.
        }

        return NextResponse.json({
            success: true,
            data: {
                id: result.insertId,
                nombre,
                code,
                email
            }
        });
    } catch (err: any) {
        console.error('Error creating team member:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ error: 'El email ya está registrado como Vendedor/Asesor.' }, { status: 400 });
        }
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    let connection;
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const parentId = searchParams.get('parent_id');

        if (!id || !parentId) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 1. Verificar y Desactivar Sub-vendedor
        const deactivateQuery = `
            UPDATE registraya_vcard_sellers 
            SET activo = 0 
            WHERE id = ? AND parent_id = ?
        `;
        const [result]: any = await connection.execute(deactivateQuery, [id, parentId]);

        if (result.affectedRows === 0) {
            await connection.rollback();
            return NextResponse.json({ error: 'Not authorized or not found' }, { status: 403 });
        }

        // Obtener nombre para la trazabilidad
        const [sellerRows]: any = await connection.execute('SELECT nombre FROM registraya_vcard_sellers WHERE id = ?', [id]);
        const sellerName = sellerRows.length > 0 ? sellerRows[0].nombre : 'Desconocido';
        const dateStr = new Date().toLocaleDateString('es-ES');
        const note = `\n\n[Sistema]: Cliente heredado del Asesor: ${sellerName} en fecha ${dateStr}`;

        // 2. Heredar Clientes/Ventas (Reasignar seller_id y añadir nota al historial - usando 'bio' como cajón de notas)
        const reassignClientsQuery = `
            UPDATE registraya_vcard_registros 
            SET 
                seller_id = ?,
                bio = CONCAT(IFNULL(bio, ''), ?)
            WHERE seller_id = ?
        `;
        await connection.execute(reassignClientsQuery, [parentId, note, id]);

        // 3. Heredar Visitas de Campo (Puntos en el Mapa)
        const reassignVisitsQuery = `
            UPDATE registraya_vcard_field_visits 
            SET seller_id = ? 
            WHERE seller_id = ?
        `;
        await connection.execute(reassignVisitsQuery, [parentId, id]);

        // 4. Heredar Seguimientos Activos
        const reassignFollowUpsQuery = `
            UPDATE registraya_vcard_follow_ups 
            SET seller_id = ? 
            WHERE seller_id = ?
        `;
        await connection.execute(reassignFollowUpsQuery, [parentId, id]);

        await connection.commit();

        return NextResponse.json({ success: true });
    } catch (err: any) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Error in heritage transaction:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    } finally {
        if (connection) {
            connection.release();
        }
    }
}
