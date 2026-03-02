import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { formatPhoneEcuador } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const whatsapp = formatPhoneEcuador(searchParams.get('whatsapp') || '');
    const email = searchParams.get('email') || '';

    if (!whatsapp && !email) {
        return NextResponse.json({ found: false });
    }

    try {
        // Search for a visit in the last 30 days
        // Normalize both sides to the core 9 digits (removing leading 0 or 593)
        const cleanWhatsapp = whatsapp.replace(/\D/g, '');
        const coreDigits = cleanWhatsapp.startsWith('593') ? cleanWhatsapp.substring(3) :
            (cleanWhatsapp.startsWith('0') ? cleanWhatsapp.substring(1) : cleanWhatsapp);

        const query = `
            SELECT s.nombre as seller_name, v.created_at
            FROM registraya_vcard_field_visits v
            JOIN registraya_vcard_sellers s ON v.seller_id = s.id
            WHERE (
                RIGHT(REPLACE(REPLACE(REPLACE(v.contact_phone, ' ', ''), '+', ''), '-', ''), 9) = ? 
                OR v.contact_phone = ?
                OR (v.contact_email IS NOT NULL AND v.contact_email = ?)
            )
              AND v.created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
            ORDER BY v.created_at DESC
            LIMIT 1
        `;

        const [rows]: any = await pool.execute(query, [coreDigits, whatsapp, email]);

        if (rows.length > 0) {
            return NextResponse.json({
                found: true,
                sellerName: rows[0].seller_name,
                date: rows[0].created_at
            });
        }

        return NextResponse.json({ found: false });
    } catch (err: any) {
        console.error('Error checking footprint:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
