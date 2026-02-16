import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const adminKey = req.headers.get('x-admin-key');
    if (!adminKey || adminKey !== process.env.ADMIN_API_KEY) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        const connection = await pool.getConnection();
        try {
            // Fetch sellers with their sales count
            const query = `
                SELECT 
                    s.id, s.nombre, s.email, s.comision_porcentaje, s.activo, s.created_at,
                    COUNT(r.id) as total_ventas,
                    SUM(CASE WHEN r.status IN ('pagado', 'entregado') THEN 1 ELSE 0 END) as ventas_pagadas
                FROM registraya_vcard_sellers s
                LEFT JOIN registraya_vcard_registros r ON s.id = r.seller_id
                GROUP BY s.id
                ORDER BY s.nombre ASC
            `;
            const [rows] = await connection.execute(query);
            return NextResponse.json({ data: rows });
        } finally {
            connection.release();
        }
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
