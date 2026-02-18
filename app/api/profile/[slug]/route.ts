import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await context.params;

        try {
            // Search by slug or id
            const [rows] = await pool.execute(
                'SELECT * FROM registraya_vcard_registros WHERE slug = ? OR id = ?',
                [slug, slug]
            );

            const users = rows as any[];

            if (users.length === 0) {
                return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
            }

            const user = users[0];
            return NextResponse.json(user);

        } catch (dbErr) {
            throw dbErr;
        }
    } catch (err: any) {
        console.error('Error fetching profile:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
