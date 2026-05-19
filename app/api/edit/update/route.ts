import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { formatPhoneEcuador } from '@/lib/utils';
import { syncMenuDigitalToRelational } from '@/lib/menuSync';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const { code, data, slug } = await req.json();

        if (!code || !data) {
            return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
        }

        const connection = await pool.getConnection();

        try {
            // 1. Validate code and remaining uses again (scoped by slug if provided)
            let checkQuery = 'SELECT id, edit_uses_remaining FROM registraya_vcard_registros WHERE UPPER(edit_code) = UPPER(?)';
            const checkParams = [code];
            
            if (slug) {
                checkQuery += ' AND slug = ?';
                checkParams.push(slug);
            }

            const [rows] = await connection.execute(checkQuery, checkParams);

            const user = (rows as any[])[0];

            if (!user) {
                return NextResponse.json({ error: 'Código inválido para este perfil' }, { status: 401 });
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
                    seller_id = ?,
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
                    hero_slides_json = ?,
                    youtube_video_url = ?,
                    google_rating = ?,
                    google_reviews_count = ?,
                    template_id = ?,
                    json_override = ?,
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
                data.productos_servicios,
                data.etiquetas,
                data.email || null,
                data.sellerCode || null,
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
                data.hero_slides_json ? (typeof data.hero_slides_json === 'string' ? data.hero_slides_json : JSON.stringify(data.hero_slides_json)) : null,
                data.youtube_video_url || null,
                data.google_rating || null,
                data.google_reviews_count || null,
                data.template_id || 'classic',
                data.json_override ? (typeof data.json_override === 'string' ? data.json_override : JSON.stringify(data.json_override)) : null
            ];

            // If foto_url is provided (base64 from frontend), update it
            if (data.foto_url && data.foto_url.length > 0) {
                updateQuery += `, foto_url = ? `;
                queryParams.push(data.foto_url);
            }

            updateQuery += ` WHERE id = ?`;
            queryParams.push(user.id);

            await connection.execute(updateQuery, queryParams);

            // Synchronize menu_digital string with relational database tables
            try {
                await syncMenuDigitalToRelational(connection, user.id, data.menu_digital);
            } catch (syncErr) {
                console.error("Error syncing menu to relational tables in update route:", syncErr);
            }

            return NextResponse.json({
                success: true,
                message: 'Perfil actualizado correctamente',
                remaining: 'Ilimitado'
            });

        } finally {
            connection.release();
        }

    } catch (error: any) {
        console.error('Error updating profile:', error);
        return NextResponse.json({ error: 'Error al actualizar el perfil' }, { status: 500 });
    }
}
