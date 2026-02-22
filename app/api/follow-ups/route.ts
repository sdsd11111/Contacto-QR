import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get('seller_id');

    if (!sellerId) {
        return NextResponse.json({ error: 'Seller ID requerido' }, { status: 400 });
    }

    try {
        const query = `
            SELECT 
                f.id,
                f.visit_id,
                f.scheduled_date,
                f.whatsapp_message,
                f.status,
                v.business_name,
                v.contact_name,
                v.result,
                v.location_sector
            FROM registraya_vcard_follow_ups f
            JOIN registraya_vcard_field_visits v ON f.visit_id = v.id
            WHERE f.seller_id = ? AND f.status = 'pendiente'
            ORDER BY f.scheduled_date ASC
        `;
        const [rows] = await pool.execute(query, [sellerId]);

        return NextResponse.json({ success: true, data: rows });
    } catch (err: any) {
        console.error('Error fetching follow-ups:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json({ error: 'Faltan campos (id, status)' }, { status: 400 });
        }

        const query = `
            UPDATE registraya_vcard_follow_ups 
            SET status = ?, completed_at = IF(? = 'completado' OR ? = 'descartado', CURRENT_TIMESTAMP, NULL)
            WHERE id = ?
        `;

        await pool.execute(query, [status, status, status, id]);

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('Error updating follow-up:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
