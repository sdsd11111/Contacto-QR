import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        await pool.query(
            `UPDATE registraya_vcard_registros 
             SET portada_desktop = '/images/hero_desktop_default.png', 
                 portada_movil = '/images/hero_mobile_default.png'
             WHERE slug = 'activaqr-9ag4'`
        );
        return NextResponse.json({ message: 'Dummy images updated successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message, code: error.code }, { status: 500 });
    }
}
