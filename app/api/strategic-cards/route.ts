import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    if (!category) {
        return NextResponse.json({ error: 'Categoría requerida' }, { status: 400 });
    }

    try {
        const query = `
            SELECT 
                pain_point, 
                attention_grabber, 
                recommended_angle, 
                objection_response, 
                avoid_mentioning
            FROM registraya_vcard_strategic_cards 
            WHERE business_category = ?
            LIMIT 1
        `;
        const [rows]: any = await pool.execute(query, [category]);

        if (rows.length === 0) {
            return NextResponse.json({ success: true, data: null }); // No card for this category
        }

        return NextResponse.json({ success: true, data: rows[0] });
    } catch (err: any) {
        console.error('Error fetching strategic card:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
