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
            return NextResponse.json({ error: 'El email ya está registrado' }, { status: 400 });
        }
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const parentId = searchParams.get('parent_id');

        if (!id || !parentId) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        const query = `
            UPDATE registraya_vcard_sellers 
            SET activo = 0 
            WHERE id = ? AND parent_id = ?
        `;

        const [result]: any = await pool.execute(query, [id, parentId]);

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: 'Not authorized or not found' }, { status: 403 });
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('Error deleting team member:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
