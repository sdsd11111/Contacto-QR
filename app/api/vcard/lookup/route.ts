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
        const connection = await pool.getConnection();

        try {
            const [rows] = await connection.execute(
                'SELECT slug, foto_url, comprobante_url, galeria_urls FROM registraya_vcard_registros WHERE email = ?',
                [email]
            );

            const results = rows as any[];

            if (results.length > 0) {
                return NextResponse.json(results[0]);
            } else {
                // Not found is not an error here, just null
                return NextResponse.json(null);
            }

        } finally {
            connection.release();
        }

    } catch (err: any) {
        console.error('Lookup error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
