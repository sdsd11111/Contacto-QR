import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const adminKey = req.headers.get('x-admin-key');
    if (!adminKey || adminKey !== process.env.ADMIN_API_KEY) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        // Fetch sellers with their sales count
        const query = `
            SELECT 
                s.id, s.nombre, s.codigo, s.email, s.comision_porcentaje, s.activo, s.created_at,
                COUNT(r.id) as total_ventas,
                SUM(CASE WHEN r.status IN ('pagado', 'entregado') THEN 1 ELSE 0 END) as ventas_pagadas
            FROM registraya_vcard_sellers s
            LEFT JOIN registraya_vcard_registros r ON s.id = r.seller_id
            GROUP BY s.id, s.nombre, s.codigo, s.email, s.comision_porcentaje, s.activo, s.created_at
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
