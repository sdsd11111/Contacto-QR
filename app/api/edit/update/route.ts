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

            // Calculate new nombre, but preserve existing if new would be empty
            let nombreLegacy = data.tipo_perfil === 'negocio'
                ? data.nombre_negocio
                : `${data.nombres || ''} ${data.apellidos || ''}`.trim();
            
            // If the computed nombre is empty, preserve the existing one from DB
            if (!nombreLegacy) {
                const [currentRows] = await connection.execute(
                    'SELECT nombre FROM registraya_vcard_registros WHERE id = ?',
                    [user.id]
                );
                const currentRecord = (currentRows as any[])[0];
                if (currentRecord?.nombre) {
                    nombreLegacy = currentRecord.nombre;
                }
            }

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
                    youtube = ?,
                    x = ?,
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
                    menu_digital = ?,
                    wifi_ssid = ?,
                    wifi_password = ?,
                    portada_desktop = ?,
                    portada_movil = ?,
                    hero_button_text = ?,
                    hero_action = ?,
                    hero_file_url = ?,
                    hero_external_link = ?,
                    hero_wifi_steps = ?,
                    hero_section_title = ?,
                    hero_step1_title = ?,
                    hero_step2_title = ?,
                    hero_step2_text = ?,
                    hero_step3_title = ?,
                    hero_step3_text = ?,
                    catalogo_json = ?,
                    youtube_video_url = ?,
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
                data.youtube,
                data.x,
                data.products,
                data.categories,
                data.email,
                data.tipo_perfil || 'persona',
                data.nombres || '',
                data.apellidos || '',
                data.nombre_negocio || '',
                data.contacto_nombre || '',
                data.contacto_apellido || '',
                nombreLegacy,
                data.menu_digital || null,
                data.wifi_ssid || null,
                data.wifi_password || null,
                data.portada_desktop || null,
                data.portada_movil || null,
                data.hero_button_text || null,
                data.hero_action || 'wifi',
                data.hero_file_url || null,
                data.hero_external_link || null,
                data.hero_wifi_steps ? (Array.isArray(data.hero_wifi_steps) ? JSON.stringify(data.hero_wifi_steps) : data.hero_wifi_steps) : null,
                data.hero_section_title || 'Oferta del Hero',
                data.hero_step1_title || 'Descarga Nuestro Contacto',
                data.hero_step2_title || 'Asegurate de importar el contacto',
                data.hero_step2_text || null,
                data.hero_step3_title || 'Conéctate a la Red',
                data.hero_step3_text || null,
                data.catalogo_json ? (typeof data.catalogo_json === 'string' ? data.catalogo_json : JSON.stringify(data.catalogo_json)) : null,
                data.youtube_video_url || null
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
