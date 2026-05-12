import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const auth = requireAdmin(req);
    if (auth) return auth;

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (!slug) {
        return NextResponse.json({ error: 'Slug es requerido' }, { status: 400 });
    }

    try {
        const [rows]: any = await pool.execute(
            `SELECT * FROM vcard_downloads_log 
             WHERE slug = ? 
             ORDER BY created_at DESC 
             LIMIT 50`,
            [slug]
        );

        return NextResponse.json({ data: rows });
    } catch (err: any) {
        console.error('[ADMIN DESCARGAS] Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
