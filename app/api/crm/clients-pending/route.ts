import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET: Lista clientes pendientes para el CRM
 * Autenticación: x-crm-api-key header
 * 
 * Respuesta incluye:
 * - Información básica del cliente
 * - Fecha desde cuándo está en pendiente (created_at)
 * - Producto comprado (plan)
 * - Estado actual
 */
export async function GET(req: NextRequest) {
    // Autenticación con API key del CRM
    const crmApiKey = req.headers.get('x-crm-api-key');
    if (crmApiKey !== process.env.CRM_API_KEY) {
        return NextResponse.json({ error: 'No autorizado - API key inválida' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '100');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Query para obtener clientes pendientes
        const query = `
            SELECT 
                r.id,
                r.slug,
                r.nombre,
                r.nombre_negocio,
                r.email,
                r.whatsapp,
                r.status,
                r.plan,
                r.created_at as fecha_pendiente,
                r.activated_at,
                r.expires_at,
                r.tipo_perfil,
                r.profesion,
                r.bio,
                r.direccion,
                r.seller_id,
                s.nombre as vendedor_nombre,
                s.codigo as vendedor_codigo,
                r.commission_status,
                r.leader_paid_at,
                r.payment_method,
                r.google_rating,
                r.google_reviews_count,
                (SELECT COUNT(*) FROM vcard_downloads_log WHERE slug = r.slug) as descargas
            FROM registraya_vcard_registros r
            LEFT JOIN registraya_vcard_sellers s ON r.seller_id = s.id
            WHERE r.status = 'pendiente'
            ORDER BY r.created_at DESC
            LIMIT ? OFFSET ?
        `;

        const [rows]: any = await pool.execute(query, [limit, offset]);

        // Query para obtener el total de clientes pendientes
        const [countResult]: any = await pool.execute(
            'SELECT COUNT(*) as total FROM registraya_vcard_registros WHERE status = ?',
            ['pendiente']
        );

        return NextResponse.json({
            success: true,
            data: rows,
            meta: {
                total: countResult[0].total,
                limit,
                offset,
                has_more: offset + limit < countResult[0].total
            }
        });
    } catch (err: any) {
        console.error('Error fetching CRM clients pending:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
