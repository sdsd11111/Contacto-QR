import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { construirSnapshotContrato, generarTerminosTexto } from '@/lib/contrato-utils';

export const dynamic = 'force-dynamic';

/**
 * POST /api/contratos/[uuid]/firmar
 * 
 * Firma el contrato. Guarda el snapshot completo, metadatos forenses,
 * y registra la aceptación en la tabla consentimientos.
 * 
 * Body:
 * {
 *   firma_nombre: string;        // Nombre escrito por el cliente
 *   dispositivo_fingerprint: object;
 *   ubicacion: { lat, lng, precision };
 *   archivos_subidos: {
 *     logo_url?: string;
 *     fotos_url?: string[];
 *     archivos_extra_url?: string[];
 *   };
 * }
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ uuid: string }> }
) {
    try {
        const { uuid } = await params;

        // Auto-crear tabla contratos si no existe (producción)
        await pool.execute(`CREATE TABLE IF NOT EXISTS contratos (
            id VARCHAR(36) PRIMARY KEY,
            cliente_nombre VARCHAR(255) NOT NULL,
            cliente_negocio VARCHAR(255),
            cliente_cedula_ruc VARCHAR(20),
            cliente_telefono VARCHAR(30) NOT NULL,
            cliente_email VARCHAR(255) NOT NULL,
            cliente_red_social TEXT,
            cliente_categorias TEXT,
            facturacion_ruc VARCHAR(20),
            facturacion_razon_social VARCHAR(255),
            facturacion_direccion TEXT,
            facturacion_foto_url VARCHAR(500),
            servicio_contratado ENUM('digital','business','catalogo','auditoria','web') NOT NULL,
            servicios_seleccionados TEXT,
            monto_total DECIMAL(10,2) NOT NULL,
            monto_anticipo DECIMAL(10,2) NOT NULL,
            estado_pago ENUM('pendiente','abonado','pagado') NOT NULL DEFAULT 'pendiente',
            snapshot_json LONGTEXT NOT NULL,
            snapshot_hash VARCHAR(64) NOT NULL,
            version_terminos VARCHAR(10) NOT NULL DEFAULT 'v1.0',
            firma_nombre VARCHAR(255) NOT NULL,
            acepta_terminos TINYINT(1) NOT NULL DEFAULT 1,
            acepta_privacidad TINYINT(1) NOT NULL DEFAULT 1,
            audit_id_consentimiento VARCHAR(36),
            timestamp_firma DATETIME(3) NOT NULL,
            ip VARCHAR(45) NOT NULL,
            ubicacion_lat DECIMAL(10,7),
            ubicacion_lng DECIMAL(10,7),
            ubicacion_precision ENUM('exacta','ciudad','no_disponible') DEFAULT 'no_disponible',
            dispositivo_fingerprint JSON,
            contrato_url VARCHAR(500),
            logo_url VARCHAR(500),
            fotos_url JSON,
            archivos_extra_url JSON,
            created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
            updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

        const body = await req.json();

        const { 
            firma_nombre, dispositivo_fingerprint, ubicacion, archivos_subidos 
        } = body;

        // Validaciones
        if (!firma_nombre || firma_nombre.trim().length < 3) {
            return NextResponse.json({ error: 'Debe escribir su nombre completo para firmar' }, { status: 400 });
        }

        // Obtener el contrato actual de la DB (datos guardados previamente)
        const [rows]: any = await pool.execute(
            `SELECT * FROM contratos WHERE id = ?`,
            [uuid]
        );

        if (!rows || rows.length === 0) {
            return NextResponse.json({ error: 'Contrato no encontrado' }, { status: 404 });
        }

        const contrato = rows[0];

        // Verificar que no esté ya firmado
        if (contrato.acepta_terminos === 1 && contrato.firma_nombre?.length > 0) {
            return NextResponse.json({ error: 'Este contrato ya fue firmado anteriormente.' }, { status: 400 });
        }

        // Registrar IP
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
            || req.headers.get('x-real-ip') 
            || 'Unknown IP';

        // Fecha actual con milisegundos
        const timestamp = new Date().toISOString();

        // Texto legal de privacidad (versión actual)
        const privacidadTexto = `
POLÍTICA DE PRIVACIDAD Y TRATAMIENTO DE DATOS — ACTIVAQR

1. IDENTIDAD DEL RESPONSABLE
ActivaQR, operada por el Grupo Empresarial Reyes, es el Responsable del tratamiento de tus datos personales.

2. FINALIDADES DEL TRATAMIENTO
Tus datos (nombre, teléfono y correo) serán tratados para:
- Gestión de Identidad Digital: entrega de VCard y registro en agenda de contactos.
- Notificaciones de Valor: envío de cotizaciones, actualizaciones y casos de éxito vía WhatsApp y email.
- Ejecución del servicio contratado según los términos del presente contrato.

3. BASE LEGAL
Este tratamiento se basa en tu consentimiento libre e inequívoco, manifestado mediante la firma del presente contrato.

4. TIEMPO DE CONSERVACIÓN
Conservaremos tu información mientras dure la relación comercial o hasta que solicites su eliminación.

5. TUS DERECHOS (ARCO+PAL)
Puedes ejercer tus derechos de Acceso, Rectificación, Cancelación/Eliminación, Oposición, Portabilidad, Anonimización y Limitación escribiendo a [Email de Soporte].

6. REVOCATORIA
Puedes retirar tu consentimiento en cualquier momento escribiendo "BAJA" en nuestro chat de WhatsApp.
        `.trim();

        // Parsear servicios seleccionados
        let serviciosSeleccionados: string[] = [];
        try {
            serviciosSeleccionados = contrato.servicios_seleccionados 
                ? JSON.parse(contrato.servicios_seleccionados)
                : [contrato.servicio_contratado];
        } catch {
            serviciosSeleccionados = [contrato.servicio_contratado];
        }

        // Texto de términos (generado dinámicamente con variables del cliente)
        const montoTotal = parseFloat(contrato.monto_total) || 0;
        const montoAnticipo = parseFloat(contrato.monto_anticipo) || 0;
        const fechaLegible = new Date().toLocaleDateString('es-EC', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });

        const terminosTexto = generarTerminosTexto({
            cliente_nombre: contrato.cliente_nombre || firma_nombre,
            cliente_cedula: contrato.cliente_cedula_ruc || '',
            servicios_seleccionados: serviciosSeleccionados,
            monto_total: montoTotal,
            monto_anticipo: montoAnticipo,
            fecha: fechaLegible,
        });

        // Construir el snapshot del contrato
        const { snapshot_json, snapshot_hash } = construirSnapshotContrato({
            cliente: {
                nombre: contrato.cliente_nombre || firma_nombre,
                negocio: contrato.cliente_negocio || undefined,
                cedula_ruc: contrato.cliente_cedula_ruc || undefined,
                telefono: contrato.cliente_telefono || '',
                email: contrato.cliente_email || '',
                red_social: contrato.cliente_red_social || undefined,
                categorias: contrato.cliente_categorias || undefined,
            },
            facturacion: contrato.facturacion_ruc ? {
                ruc: contrato.facturacion_ruc,
                razon_social: contrato.facturacion_razon_social || undefined,
                direccion: contrato.facturacion_direccion || undefined,
            } : undefined,
            servicios_seleccionados: serviciosSeleccionados,
            monto_total: montoTotal,
            monto_anticipo: montoAnticipo,
            terminos_texto: terminosTexto,
            privacidad_texto: privacidadTexto,
            fecha_actual: timestamp,
        });

        // Parsear URLs de archivos
        const logoUrl = archivos_subidos?.logo_url || contrato.logo_url || null;
        const fotosUrl = archivos_subidos?.fotos_url || 
            (contrato.fotos_url ? (typeof contrato.fotos_url === 'string' ? JSON.parse(contrato.fotos_url) : contrato.fotos_url) : []);
        const archivosExtraUrl = archivos_subidos?.archivos_extra_url || 
            (contrato.archivos_extra_url ? (typeof contrato.archivos_extra_url === 'string' ? JSON.parse(contrato.archivos_extra_url) : contrato.archivos_extra_url) : []);

        // Guardar en DB
        await pool.execute(
            `UPDATE contratos SET
                snapshot_json = ?, snapshot_hash = ?,
                firma_nombre = ?, acepta_terminos = 1, acepta_privacidad = 1,
                timestamp_firma = ?, ip = ?,
                ubicacion_lat = ?, ubicacion_lng = ?, ubicacion_precision = ?,
                dispositivo_fingerprint = ?,
                logo_url = ?, fotos_url = ?, archivos_extra_url = ?,
                servicios_seleccionados = ?,
                updated_at = NOW()
            WHERE id = ?`,
            [
                snapshot_json, snapshot_hash,
                firma_nombre.trim(), timestamp, ip,
                ubicacion?.lat || null, ubicacion?.lng || null, ubicacion?.precision || 'no_disponible',
                JSON.stringify(dispositivo_fingerprint || {}),
                logoUrl, JSON.stringify(fotosUrl), JSON.stringify(archivosExtraUrl),
                JSON.stringify(serviciosSeleccionados),
                uuid
            ]
        );

        // Registrar también en tabla consentimientos
        const auditId = uuid.replace(/-/g, '').substring(0, 8) + '-CONTRATO';
        try {
            const userAgent = dispositivo_fingerprint?.userAgent || 'Unknown';
            await pool.execute(
                `INSERT INTO consentimientos 
                 (telefono, nombre, email, acepta_comercial, acepta_exito, ip, user_agent, version_politica, url_origen, audit_id) 
                 VALUES (?, ?, ?, 1, 1, ?, ?, 'v2.0-contrato', ?, ?)`,
                [
                    contrato.cliente_telefono || '',
                    firma_nombre.trim(),
                    contrato.cliente_email || '',
                    ip,
                    userAgent,
                    contrato.contrato_url || '',
                    auditId
                ]
            );
        } catch (consentErr) {
            console.warn('[Contratos] Error al registrar consentimiento (no crítico):', consentErr);
        }

        // ============================================================
        // POST-FIRMA: El producto se creará DESPUÉS del pago
        // (confirmar-pago endpoint)
        // ============================================================

        return NextResponse.json({
            success: true,
            message: 'Contrato firmado exitosamente',
            contrato_id: uuid,
            snapshot_hash,
            audit_id: auditId,
            timestamp_firma: timestamp,
        });

    } catch (error: any) {
        console.error('[Contratos] Error al firmar contrato:', error);
        return NextResponse.json({ error: 'Error al procesar la firma del contrato' }, { status: 500 });
    }
}
