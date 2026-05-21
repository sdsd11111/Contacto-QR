import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const adminKey = req.headers.get('x-admin-key');
        if (adminKey !== process.env.ADMIN_API_KEY) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { id, new_slug } = await req.json();

        if (!id || !new_slug) {
            return NextResponse.json(
                { error: 'Faltan datos: id y new_slug son requeridos' },
                { status: 400 }
            );
        }

        // Validar formato del nuevo slug
        if (!/^[a-z0-9-]+$/.test(new_slug)) {
            return NextResponse.json(
                { error: 'El slug solo puede contener letras minúsculas, números y guiones' },
                { status: 400 }
            );
        }

        if (new_slug.length < 5 || new_slug.length > 100) {
            return NextResponse.json(
                { error: 'El slug debe tener entre 5 y 100 caracteres' },
                { status: 400 }
            );
        }

        const connection = await pool.getConnection();

        try {
            // 1. Verificar que el registro existe
            const [userRows] = await connection.execute(
                'SELECT id, slug FROM registraya_vcard_registros WHERE id = ?',
                [id]
            );

            const user = (userRows as any[])[0];
            if (!user) {
                return NextResponse.json(
                    { error: 'Registro no encontrado' },
                    { status: 404 }
                );
            }

            // 2. Verificar que el nuevo slug no esté ocupado por OTRO usuario
            const [existingRows] = await connection.execute(
                'SELECT id FROM registraya_vcard_registros WHERE slug = ? AND id != ?',
                [new_slug, user.id]
            );

            if ((existingRows as any[]).length > 0) {
                return NextResponse.json(
                    { error: 'El slug "' + new_slug + '" ya está en uso por otro perfil' },
                    { status: 409 }
                );
            }

            // 3. Actualizar el slug
            await connection.execute(
                'UPDATE registraya_vcard_registros SET slug = ? WHERE id = ?',
                [new_slug, user.id]
            );

            return NextResponse.json({
                success: true,
                message: 'Slug actualizado correctamente',
                old_slug: user.slug,
                new_slug: new_slug,
                new_url: `/card/${new_slug}`
            });

        } finally {
            connection.release();
        }

    } catch (error: any) {
        console.error('Error changing slug (admin):', error);
        return NextResponse.json(
            { error: 'Error al cambiar el slug' },
            { status: 500 }
        );
    }
}
