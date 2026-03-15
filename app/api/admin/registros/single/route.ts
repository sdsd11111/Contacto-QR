import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const adminKey = req.headers.get('x-admin-key');
    const sellerIdHeader = req.headers.get('x-seller-id');
    const isAdmin = adminKey === process.env.ADMIN_API_KEY;

    if (!isAdmin && !sellerIdHeader) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!id) {
        return NextResponse.json({ error: 'Falta ID' }, { status: 400 });
    }

    try {
        let query = `
            SELECT 
                r.*, 
                s.nombre as sold_by_name, 
                s.codigo as sold_by_code
            FROM registraya_vcard_registros r
            LEFT JOIN registraya_vcard_sellers s ON r.seller_id = s.id
            WHERE r.id = ?
        `;

        if (!isAdmin && sellerIdHeader) {
            query += ` AND r.seller_id = ?`;
            const [rows]: any = await pool.execute(query, [id, sellerIdHeader]);
            return NextResponse.json({ data: rows[0] });
        } else {
            const [rows]: any = await pool.execute(query, [id]);
            return NextResponse.json({ data: rows[0] });
        }
    } catch (err: any) {
        console.error('Error fetching single registro:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
