import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');

    if (!email) {
        return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    try {
        try {
            const [rows] = await pool.execute(
                'SELECT slug, foto_url, comprobante_url, galeria_urls FROM registraya_vcard_registros WHERE email = ?',
                [email]
            );

            const results = rows as any[];
            if (results.length > 0) {
                return NextResponse.json(results[0]);
            } else {
                return NextResponse.json(null);
            }
        } catch (dbErr) {
            throw dbErr;
        }
    } catch (err: any) {
        console.error('Lookup error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
