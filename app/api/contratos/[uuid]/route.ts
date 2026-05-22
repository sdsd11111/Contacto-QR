import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/contratos/[uuid]
 * 
 * Obtiene los datos de un contrato por su UUID.
 * Usado por la página de onboarding para cargar datos pre-existentes
 * y por el admin para consultar contratos.
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ uuid: string }> }
) {
    try {
        const { uuid } = await params;

        // Validar UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(uuid)) {
            return NextResponse.json({ error: 'UUID inválido' }, { status: 400 });
        }

        const [rows]: any = await pool.execute(
            `SELECT 
                id, cliente_nombre, cliente_negocio, cliente_cedula_ruc,
                cliente_telefono, cliente_email, cliente_red_social, cliente_categorias,
                facturacion_ruc, facturacion_razon_social, facturacion_direccion, facturacion_foto_url,
                servicio_contratado, servicios_seleccionados, monto_total, monto_anticipo, estado_pago,
                snapshot_json, snapshot_hash, version_terminos,
                firma_nombre, acepta_terminos, acepta_privacidad,
                audit_id_consentimiento, timestamp_firma,
                ip, ubicacion_lat, ubicacion_lng, ubicacion_precision,
                dispositivo_fingerprint, contrato_url,
                logo_url, fotos_url, archivos_extra_url,
                created_at, updated_at
            FROM contratos WHERE id = ?`,
            [uuid]
        );

        if (!rows || rows.length === 0) {
            return NextResponse.json({ error: 'Contrato no encontrado' }, { status: 404 });
        }

        const contrato = rows[0];

        // Parsear JSON fields
        if (contrato.cliente_red_social && typeof contrato.cliente_red_social === 'string') {
            try { contrato.cliente_red_social = JSON.parse(contrato.cliente_red_social); } catch { /* keep as is */ }
        }
        if (contrato.fotos_url && typeof contrato.fotos_url === 'string') {
            try { contrato.fotos_url = JSON.parse(contrato.fotos_url); } catch { contrato.fotos_url = []; }
        }
        if (contrato.archivos_extra_url && typeof contrato.archivos_extra_url === 'string') {
            try { contrato.archivos_extra_url = JSON.parse(contrato.archivos_extra_url); } catch { contrato.archivos_extra_url = []; }
        }
        if (contrato.dispositivo_fingerprint && typeof contrato.dispositivo_fingerprint === 'string') {
            try { contrato.dispositivo_fingerprint = JSON.parse(contrato.dispositivo_fingerprint); } catch { contrato.dispositivo_fingerprint = {}; }
        }

        const firmado = contrato.acepta_terminos === 1 && contrato.acepta_privacidad === 1 && contrato.firma_nombre?.length > 0;

        return NextResponse.json({
            success: true,
            contrato,
            firmado
        });

    } catch (error: any) {
        console.error('[Contratos] Error al obtener contrato:', error);
        return NextResponse.json({ error: 'Error al obtener el contrato' }, { status: 500 });
    }
}

/**
 * PATCH /api/contratos/[uuid]
 * 
 * Actualiza campos del contrato (usado para guardado parcial / auto-save).
 */
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ uuid: string }> }
) {
    try {
        const { uuid } = await params;
        const body = await req.json();

        // Verificar que el contrato existe y no está firmado
        const [existing]: any = await pool.execute(
            'SELECT id, acepta_terminos, firma_nombre FROM contratos WHERE id = ?',
            [uuid]
        );

        if (!existing || existing.length === 0) {
            return NextResponse.json({ error: 'Contrato no encontrado' }, { status: 404 });
        }

        const contrato = existing[0];
        if (contrato.acepta_terminos === 1 && contrato.firma_nombre?.length > 0) {
            return NextResponse.json({ error: 'El contrato ya está firmado. No se puede modificar.' }, { status: 400 });
        }

        // Construir UPDATE dinámico con los campos enviados
        const camposPermitidos = [
            'cliente_nombre', 'cliente_negocio', 'cliente_cedula_ruc',
            'cliente_telefono', 'cliente_email', 'cliente_red_social', 'cliente_categorias',
            'facturacion_ruc', 'facturacion_razon_social', 'facturacion_direccion', 'facturacion_foto_url',
            'servicios_seleccionados',
            'monto_total', 'monto_anticipo', 'servicio_contratado',
            'logo_url', 'fotos_url', 'archivos_extra_url'
        ];

        const updates: string[] = [];
        const values: any[] = [];

        for (const campo of camposPermitidos) {
            if (body[campo] !== undefined) {
                // Serializar objetos/arrays a JSON string para MySQL
                if (typeof body[campo] === 'object') {
                    updates.push(`${campo} = ?`);
                    values.push(JSON.stringify(body[campo]));
                } else {
                    updates.push(`${campo} = ?`);
                    values.push(body[campo]);
                }
            }
        }

        if (updates.length === 0) {
            return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 });
        }

        updates.push('updated_at = NOW()');
        values.push(uuid);

        await pool.execute(
            `UPDATE contratos SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        return NextResponse.json({ success: true, message: 'Contrato actualizado' });

    } catch (error: any) {
        console.error('[Contratos] Error al actualizar contrato:', error);
        return NextResponse.json({ error: 'Error al actualizar el contrato' }, { status: 500 });
    }
}
