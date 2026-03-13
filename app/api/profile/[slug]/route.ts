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
            // Search by slug or id - ONLY returning public fields
            const [rows] = await pool.execute(
                `SELECT 
                    id, slug, nombre, profesion, empresa, bio, direccion, web, whatsapp, email, 
                    google_business, instagram, linkedin, facebook, tiktok, youtube, x, productos_servicios, 
                    plan, foto_url, galeria_urls, status, tipo_perfil, nombres, apellidos, 
                    nombre_negocio, contacto_nombre, contacto_apellido, etiquetas, created_at,
                    menu_digital, wifi_ssid, wifi_password, portada_desktop, portada_movil,
                    hero_button_text, hero_action, hero_file_url, hero_external_link, 
                    hero_wifi_steps, hero_section_title, hero_step1_title, 
                    hero_step2_title, hero_step2_text, hero_step3_title, 
                    hero_step3_text, catalogo_json, youtube_video_url
                 FROM registraya_vcard_registros 
                 WHERE slug = ? OR id = ?`,
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
