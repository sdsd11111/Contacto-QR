import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await context.params;

        const connection = await pool.getConnection();

        try {
            // Search by slug or id
            const [rows] = await connection.execute(
                'SELECT * FROM registraya_vcard_registros WHERE slug = ? OR id = ?',
                [slug, slug]
            );

            const users = rows as any[];

            if (users.length === 0) {
                return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
            }

            const user = users[0];

            // Parse existing JSON fields if necessary (mysql2 returns them as objects usually if defined as JSON, but let's be safe)
            // galeria_urls is JSON type in DB.

            return NextResponse.json(user);

        } finally {
            connection.release();
        }

    } catch (err: any) {
        console.error('Error fetching profile:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
