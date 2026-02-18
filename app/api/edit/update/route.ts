import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { formatPhoneEcuador } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const { code, data } = await req.json();

        if (!code || !data) {
            return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
        }

        const connection = await pool.getConnection();

        try {
            // 1. Validate code and remaining uses again
            const [rows] = await connection.execute(
                'SELECT id, edit_uses_remaining FROM registraya_vcard_registros WHERE edit_code = ?',
                [code]
            );

            const user = (rows as any[])[0];

            if (!user) {
                return NextResponse.json({ error: 'Código inválido' }, { status: 404 });
            }

            if (user.edit_uses_remaining <= 0) {
                return NextResponse.json({ error: 'Sin ediciones restantes' }, { status: 403 });
            }

            const nombreLegacy = data.tipo_perfil === 'negocio'
                ? data.nombre_negocio
                : `${data.nombres || ''} ${data.apellidos || ''}`.trim();

            let updateQuery = `
                UPDATE registraya_vcard_registros SET
                    whatsapp = ?,
                    profesion = ?,
                    empresa = ?,
                    bio = ?,
                    direccion = ?,
                    web = ?,
                    google_business = ?,
                    instagram = ?,
                    linkedin = ?,
                    facebook = ?,
                    tiktok = ?,
                    productos_servicios = ?,
                    etiquetas = ?,
                    email = ?,
                    tipo_perfil = ?,
                    nombres = ?,
                    apellidos = ?,
                    nombre_negocio = ?,
                    contacto_nombre = ?,
                    contacto_apellido = ?,
                    nombre = ?,
                    edit_uses_remaining = edit_uses_remaining - 1,
                    last_edited_at = NOW()
            `;

            const queryParams: any[] = [
                formatPhoneEcuador(data.whatsapp || ''),
                data.profession,
                data.company,
                data.bio,
                data.address,
                data.web,
                data.google_business,
                data.instagram,
                data.linkedin,
                data.facebook,
                data.tiktok,
                data.products,
                data.categories,
                data.email,
                data.tipo_perfil || 'persona',
                data.nombres || '',
                data.apellidos || '',
                data.nombre_negocio || '',
                data.contacto_nombre || '',
                data.contacto_apellido || '',
                nombreLegacy
            ];

            // If foto_url is provided (base64 from frontend), update it
            if (data.foto_url && data.foto_url.length > 0) {
                updateQuery += `, foto_url = ? `;
                queryParams.push(data.foto_url);
            }

            updateQuery += ` WHERE id = ?`;
            queryParams.push(user.id);

            await connection.execute(updateQuery, queryParams);

            return NextResponse.json({
                success: true,
                message: 'Perfil actualizado correctamente',
                remaining: user.edit_uses_remaining - 1
            });

        } finally {
            connection.release();
        }

    } catch (error: any) {
        console.error('Error updating profile:', error);
        return NextResponse.json({ error: 'Error al actualizar el perfil' }, { status: 500 });
    }
}
