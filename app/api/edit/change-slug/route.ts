import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const { code, current_slug, new_slug } = await req.json();

        if (!code || !current_slug || !new_slug) {
            return NextResponse.json(
                { error: 'Faltan datos: code, current_slug y new_slug son requeridos' },
                { status: 400 }
            );
        }

        // Validar formato del nuevo slug (solo letras, números y guiones)
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
            // 1. Validar que el código de edición pertenezca al slug actual
            const [userRows] = await connection.execute(
                'SELECT id, slug, edit_code FROM registraya_vcard_registros WHERE slug = ? AND UPPER(edit_code) = UPPER(?)',
                [current_slug, code]
            );

            const user = (userRows as any[])[0];
            if (!user) {
                return NextResponse.json(
                    { error: 'Código inválido para este perfil' },
                    { status: 401 }
                );
            }

            // 2. Verificar que el nuevo slug no esté ocupado por OTRO usuario
            const [existingRows] = await connection.execute(
                'SELECT id FROM registraya_vcard_registros WHERE slug = ? AND id != ?',
                [new_slug, user.id]
            );

            if ((existingRows as any[]).length > 0) {
                return NextResponse.json(
                    { error: 'El nuevo slug ya está en uso por otro perfil' },
                    { status: 409 }
                );
            }

            // 3. Actualizar el slug + timestamp para refrescar caché OG
            await connection.execute(
                'UPDATE registraya_vcard_registros SET slug = ?, last_edited_at = NOW() WHERE id = ?',
                [new_slug, user.id]
            );

            return NextResponse.json({
                success: true,
                message: 'Slug actualizado correctamente',
                old_slug: current_slug,
                new_slug: new_slug,
                new_url: `https://www.activaqr.com/card/${new_slug}`
            });

        } finally {
            connection.release();
        }

    } catch (error: any) {
        console.error('Error changing slug:', error);
        return NextResponse.json(
            { error: 'Error al cambiar el slug' },
            { status: 500 }
        );
    }
}
