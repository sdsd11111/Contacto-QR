import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const adminKey = req.headers.get('x-admin-key');
    if (!adminKey || adminKey !== process.env.ADMIN_API_KEY) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const getNextCode = searchParams.get('nextCode') === 'true';

    try {
        if (getNextCode) {
            const [lastSeller]: any = await pool.execute('SELECT id FROM registraya_vcard_sellers ORDER BY id DESC LIMIT 1');
            const nextId = lastSeller.length > 0 ? lastSeller[0].id + 1 : 1;
            const nextCode = nextId.toString().padStart(3, '0');
            return NextResponse.json({ nextCode });
        }

        // Fetch sellers with their sales count
        const query = `
            SELECT 
                s.id, s.nombre, s.codigo, s.email, s.comision_porcentaje, s.activo, s.created_at,
                (
                    SELECT COUNT(*) 
                    FROM registraya_vcard_registros r 
                    LEFT JOIN registraya_vcard_sellers sub ON r.seller_id = sub.id
                    WHERE r.seller_id = s.id OR sub.parent_id = s.id
                ) as total_ventas,
                (
                    SELECT COUNT(*) 
                    FROM registraya_vcard_registros r 
                    LEFT JOIN registraya_vcard_sellers sub ON r.seller_id = sub.id
                    WHERE (r.seller_id = s.id OR sub.parent_id = s.id)
                    AND r.status IN ('pagado', 'entregado')
                ) as ventas_pagadas
            FROM registraya_vcard_sellers s
            WHERE s.parent_id IS NULL
            ORDER BY s.nombre ASC
        `;
        const [rows] = await pool.execute(query);
        return NextResponse.json({ data: rows });
    } catch (err: any) {
        console.error('Error fetching sellers:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const adminKey = req.headers.get('x-admin-key');
    if (!adminKey || adminKey !== process.env.ADMIN_API_KEY) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        const { nombre, email, password, comision_porcentaje } = await req.json();

        if (!nombre || !email || !password) {
            return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
        }

        // Generar un código único (basado en el último ID o secuencial)
        const [lastSeller]: any = await pool.execute('SELECT id FROM registraya_vcard_sellers ORDER BY id DESC LIMIT 1');
        const nextId = lastSeller.length > 0 ? lastSeller[0].id + 1 : 1;
        const codigo = nextId.toString().padStart(3, '0');

        const query = `
            INSERT INTO registraya_vcard_sellers (nombre, email, password, role, comision_porcentaje, codigo, activo)
            VALUES (?, ?, ?, 'seller', ?, ?, 1)
        `;

        const [result]: any = await pool.execute(query, [
            nombre,
            email,
            password,
            comision_porcentaje || 30,
            codigo
        ]);

        // ENVIAR CORREO DE BIENVENIDA
        try {
            const smtpHost = process.env.SMTP_HOST;
            const smtpPort = process.env.SMTP_PORT;
            const smtpUser = process.env.SMTP_USER;
            const smtpPass = process.env.SMTP_PASS;

            if (smtpHost && smtpPort && smtpUser && smtpPass) {
                const transporter = nodemailer.createTransport({
                    host: smtpHost,
                    port: Number(smtpPort),
                    secure: process.env.SMTP_SECURE === 'true',
                    auth: { user: smtpUser, pass: smtpPass },
                });

                const origin = req.headers.get('origin') || 'https://contacto-qr.vercel.app';
                const dashboardUrl = `${origin}/admin/vendedor`;
                const referralUrl = `${origin}/registro?ref=${codigo}`;

                await transporter.sendMail({
                    from: process.env.EMAIL_FROM || smtpUser,
                    to: email,
                    subject: '🎉 ¡Bienvenido al Equipo de Ventas de RegistraYa!',
                    html: `
                        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                            <h2 style="color: #FF6B00;">¡Hola, ${nombre}!</h2>
                            <p>Estamos muy emocionados de tenerte con nosotros. Aquí tienes tus credenciales para acceder a tu panel de control:</p>
                            
                            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <p style="margin: 5px 0;"><strong>Usuario:</strong> ${email}</p>
                                <p style="margin: 5px 0;"><strong>Contraseña:</strong> ${password}</p>
                                <p style="margin: 5px 0;"><strong>Tu Código:</strong> <span style="font-size: 1.2em; color: #FF6B00; font-weight: bold;">${codigo}</span></p>
                            </div>

                            <p><strong>Tu enlace de ventas personalizado:</strong></p>
                            <p style="background: #eef; padding: 10px; border-radius: 5px; word-break: break-all;">
                                <a href="${referralUrl}">${referralUrl}</a>
                            </p>
                            <p style="font-size: 0.9em; color: #666;">Cualquier cliente que use este link se te asignará automáticamente.</p>

                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${dashboardUrl}" style="background: #FF6B00; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Acceder a Mi Panel</a>
                            </div>

                            <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
                            <p style="font-size: 0.8em; color: #888;">Este es un mensaje automático, por favor no respondas a este correo.</p>
                        </div>
                    `
                });
            }
        } catch (emailErr) {
            console.error('Error sending welcome email:', emailErr);
            // No detenemos la respuesta del API si falla el correo, el vendedor ya se creó.
        }

        return NextResponse.json({
            success: true,
            data: {
                id: result.insertId,
                nombre,
                codigo,
                email
            }
        });
    } catch (err: any) {
        console.error('Error creating seller:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ error: 'El email ya está registrado' }, { status: 400 });
        }
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
