import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET: Obtiene detalles completos de un cliente específico
 * Autenticación: x-crm-api-key header
 * 
 * Parámetros:
 * - id: ID del cliente (en la URL)
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    // Autenticación con API key del CRM
    const crmApiKey = req.headers.get('x-crm-api-key');
    if (crmApiKey !== process.env.CRM_API_KEY) {
        return NextResponse.json({ error: 'No autorizado - API key inválida' }, { status: 401 });
    }

    try {
        const { id } = params;

        // Query para obtener detalles completos del cliente
        const query = `
            SELECT 
                r.id,
                r.slug,
                r.nombre,
                r.nombre_negocio,
                r.empresa,
                r.email,
                r.whatsapp,
                r.status,
                r.plan,
                r.created_at as fecha_registro,
                r.activated_at as fecha_activacion,
                r.expires_at as fecha_expiracion,
                r.tipo_perfil,
                r.profesion,
                r.bio,
                r.direccion,
                r.web,
                r.instagram,
                r.linkedin,
                r.facebook,
                r.tiktok,
                r.youtube,
                r.x,
                r.template_id,
                r.foto_url,
                r.portada_desktop,
                r.portada_movil,
                r.seller_id,
                s.nombre as vendedor_nombre,
                s.codigo as vendedor_codigo,
                s.parent_id,
                p.nombre as vendedor_padre_nombre,
                p.codigo as vendedor_padre_codigo,
                r.commission_status,
                r.leader_paid_at,
                r.payment_method,
                r.google_rating,
                r.google_reviews_count,
                r.reminder_count,
                r.last_reminder_at,
                r.activation_type,
                r.hero_action,
                r.hero_file_url,
                r.hero_external_link,
                r.hero_section_title,
                r.hero_button_text,
                r.hero_wifi_steps,
                r.hero_step1_title,
                r.hero_step1_text,
                r.hero_step2_title,
                r.hero_step2_text,
                r.hero_step3_title,
                r.hero_step3_text,
                r.hero_slides_json,
                r.productos_servicios,
                r.etiquetas,
                (SELECT COUNT(*) FROM vcard_downloads_log WHERE slug = r.slug) as descargas
            FROM registraya_vcard_registros r
            LEFT JOIN registraya_vcard_sellers s ON r.seller_id = s.id
            LEFT JOIN registraya_vcard_sellers p ON s.parent_id = p.id
            WHERE r.id = ?
        `;

        const [rows]: any = await pool.execute(query, [id]);

        if (!rows.length) {
            return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: rows[0]
        });
    } catch (err: any) {
        console.error('Error fetching CRM client details:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
