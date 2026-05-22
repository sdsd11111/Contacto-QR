import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import pool from '@/lib/db';
import { sendMail } from '@/lib/mailer';
import { construirSnapshotContrato, generarTerminosTexto, SERVICIOS_LIST, generarNombresServicios } from '@/lib/contrato-utils';

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
        // POST-FIRMA: Crear producto en registraya_vcard_registros
        // ============================================================
        let productId = '';
        let productSlug = '';
        let productCreated = false;
        let productError = '';

        try {
            const email = contrato.cliente_email || '';
            const telefono = contrato.cliente_telefono || '';

            // Verificar si ya existe un producto con ese email
            const [existentes]: any = await pool.execute(
                'SELECT id, slug FROM registraya_vcard_registros WHERE email = ?',
                [email]
            );

            if (existentes && existentes.length > 0) {
                // Ya existe → actualizar en lugar de insertar
                productId = existentes[0].id;
                productSlug = existentes[0].slug;
                await pool.execute(
                    `UPDATE registraya_vcard_registros SET
                        nombre = ?, whatsapp = ?, empresa = ?,
                        bio = ?, productos_servicios = ?, instagram = ?,
                        updated_at = NOW()
                    WHERE id = ?`,
                    [
                        contrato.cliente_nombre || firma_nombre,
                        telefono,
                        contrato.cliente_negocio || null,
                        contrato.cliente_categorias || null,
                        contrato.cliente_categorias || null,
                        contrato.cliente_red_social || null,
                        productId
                    ]
                );
                productCreated = true;
                console.log(`[Contratos] Producto ACTUALIZADO para ${email}: ${productId}`);
            } else {
                // No existe → insertar nuevo
                const planMapping: Record<string, string> = {
                    digital: 'contacto', business: 'business',
                    catalogo: 'catalogo', web: 'web', auditoria: 'auditoria',
                };
                // Usar el servicio de MAYOR valor (no el primero)
                const ordenServicios = ['digital', 'business', 'catalogo', 'web', 'auditoria'];
                const servPrincipal = serviciosSeleccionados.reduce((a, b) =>
                    ordenServicios.indexOf(a) > ordenServicios.indexOf(b) ? a : b
                , serviciosSeleccionados[0] || contrato.servicio_contratado);
                const planValue = planMapping[servPrincipal] || 'contacto';
                const tipoPerfil = contrato.cliente_cedula_ruc?.length === 13 ? 'negocio' : 'persona';
                const nombresArr = (contrato.cliente_nombre || '').split(' ');
                const nombres = nombresArr.slice(0, Math.ceil(nombresArr.length / 2)).join(' ');
                const apellidos = nombresArr.slice(Math.ceil(nombresArr.length / 2)).join(' ');

                productId = uuidv4();
                const cleanName = (contrato.cliente_nombre || 'cliente').toLowerCase()
                    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                    .replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
                productSlug = `${cleanName}-${Math.random().toString(36).substring(2, 6)}`;

                const rawPhone = telefono.replace(/\D/g, '');
                const formattedPhone = rawPhone.startsWith('593')
                    ? `+593 ${rawPhone.substring(3)}`
                    : rawPhone.startsWith('0')
                        ? `+593 ${rawPhone.substring(1)}`
                        : telefono;

                const templateId = servPrincipal === 'business' || servPrincipal === 'catalogo' ? 'dynamic' : 'classic';
                const tieneRuc = contrato.cliente_cedula_ruc && contrato.cliente_cedula_ruc.length === 13;

                await pool.execute(
                    `INSERT INTO registraya_vcard_registros (
                        id, slug, created_at, nombre, email, whatsapp,
                        empresa, bio, productos_servicios,
                        instagram, facebook,
                        plan, foto_url, status, paid_at, edit_code, edit_uses_remaining,
                        tipo_perfil, nombres, apellidos, nombre_negocio,
                        contacto_nombre, contacto_apellido, template_id,
                        google_business
                    ) VALUES (?, ?, NOW(), ?, ?, ?,
                        ?, ?, ?,
                        ?, ?,
                        ?, ?, 'pendiente', NULL, ?, 2,
                        ?, ?, ?, ?,
                        ?, ?, ?,
                        ?)`,
                    [
                        productId, productSlug,
                        contrato.cliente_nombre || firma_nombre,
                        email, formattedPhone,
                        contrato.cliente_negocio || null,
                        contrato.cliente_categorias || null,
                        contrato.cliente_categorias || null,
                        contrato.cliente_red_social || null, null,
                        planValue, contrato.logo_url || null,
                        `CONTRATO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                        tieneRuc ? 'negocio' : 'persona',
                        nombres || contrato.cliente_nombre, apellidos || '',
                        contrato.cliente_negocio || null,
                        contrato.cliente_nombre || null, null,
                        templateId,
                        tieneRuc ? contrato.cliente_cedula_ruc : null
                    ]
                );
                productCreated = true;
                console.log(`[Contratos] Producto CREADO para ${email}: ${productId}`);
            }
        } catch (prodErr: any) {
            productError = prodErr?.message || 'Error desconocido';
            console.error('[Contratos] Error al crear producto desde contrato:', prodErr);
        }

        // ============================================================
        // POST-FIRMA: Notificar al equipo por WhatsApp
        // ============================================================
        let teamNotified = false;
        try {
            const notifyUrl = new URL('/api/notify-whatsapp', req.url).toString();
            const serviciosTexto = serviciosSeleccionados.map(id => {
                const s = SERVICIOS_LIST.find(sv => sv.id === id);
                return s ? `${s.icono} ${s.nombre} ($${s.precio})` : id;
            }).join(', ');

            await fetch(notifyUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: contrato.cliente_nombre || firma_nombre,
                    email: contrato.cliente_email || '',
                    whatsapp: contrato.cliente_telefono || '',
                    plan: `CONTRATO FIRMADO - ${serviciosTexto}`,
                    businessName: contrato.cliente_negocio || '',
                    profession: `Contrato: ${uuid.substring(0, 8)}... | Total: $${montoTotal}`,
                })
            });
            teamNotified = true;
        } catch (notifyErr) {
            console.error('[Contratos] Error al notificar por WhatsApp:', notifyErr);
        }

        // ============================================================
        // POST-FIRMA: Enviar email al cliente
        // ============================================================
        let emailSent = false;
        try {
            const clienteEmail = contrato.cliente_email || '';
            if (clienteEmail) {
                const serviciosTexto = serviciosSeleccionados.map(id => {
                    const s = SERVICIOS_LIST.find(sv => sv.id === id);
                    return s ? `${s.icono} ${s.nombre} ($${s.precio})` : id;
                }).join('<br>');

                const fechaFormateada = new Date().toLocaleDateString('es-EC', {
                    year: 'numeric', month: 'long', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                });

                const emailHtml = `
                <!DOCTYPE html>
                <html>
                <head><meta charset="utf-8"></head>
                <body style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 40px 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 24px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #001549; font-size: 24px; margin: 0; text-transform: uppercase; letter-spacing: -0.5px;">ActivaQR</h1>
                            <p style="color: #f66739; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Confirmación de Contrato</p>
                        </div>

                        <div style="background: #f66739; color: white; text-align: center; padding: 20px; border-radius: 16px; margin-bottom: 25px;">
                            <p style="font-size: 14px; margin: 0; opacity: 0.9;">✅ Contrato firmado exitosamente</p>
                        </div>

                        <p style="color: #001549; font-size: 16px; font-weight: bold;">Hola ${contrato.cliente_nombre || firma_nombre},</p>
                        <p style="color: #555; font-size: 14px; line-height: 1.6;">Tu contrato de servicios digitales con <strong>ActivaQR</strong> ha sido firmado y registrado correctamente.</p>

                        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin: 20px 0;">
                            <h3 style="color: #001549; font-size: 13px; text-transform: uppercase; margin: 0 0 15px 0;">Resumen del contrato</h3>
                            <table style="width: 100%; font-size: 13px; color: #555;">
                                <tr><td style="padding: 5px 0; color: #999;">Servicios:</td><td style="padding: 5px 0; text-align: right; font-weight: bold; color: #001549;">${serviciosTexto}</td></tr>
                                <tr><td style="padding: 5px 0; color: #999;">Monto total:</td><td style="padding: 5px 0; text-align: right; font-weight: bold; color: #001549;">$${montoTotal.toFixed(2)} USD</td></tr>
                                <tr><td style="padding: 5px 0; color: #999;">Fecha:</td><td style="padding: 5px 0; text-align: right; color: #001549;">${fechaFormateada}</td></tr>
                                <tr><td style="padding: 5px 0; color: #999;">ID Contrato:</td><td style="padding: 5px 0; text-align: right; font-family: monospace; font-size: 11px; color: #001549;">${uuid.substring(0, 12)}...</td></tr>
                            </table>
                        </div>

                        <p style="color: #555; font-size: 13px; line-height: 1.6;">
                            Recibirás la clave de edición para que puedas gestionar tus datos de forma autónoma. 
                            Cualquier consulta, responde a este correo o escríbenos al WhatsApp.
                        </p>

                        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                            <p style="color: #999; font-size: 11px;">© ${new Date().getFullYear()} ActivaQR · Grupo Empresarial Reyes</p>
                            <p style="color: #999; font-size: 10px;">Loja, Ecuador</p>
                        </div>
                    </div>
                </body>
                </html>
                `;

                await sendMail({
                    to: clienteEmail,
                    subject: `✅ Contrato firmado - ActivaQR`,
                    html: emailHtml,
                });
                emailSent = true;
                console.log(`[Contratos] Email enviado a ${clienteEmail}`);
            }
        } catch (emailErr) {
            console.error('[Contratos] Error al enviar email al cliente:', emailErr);
        }

        const baseUrl = req.nextUrl.origin;
        const productUrl = productCreated ? `${baseUrl}/admin/registros` : '';

        return NextResponse.json({
            success: true,
            message: 'Contrato firmado exitosamente',
            contrato_id: uuid,
            snapshot_hash,
            audit_id: auditId,
            timestamp_firma: timestamp,
            producto: productCreated ? {
                id: productId,
                slug: productSlug,
                url: productUrl
            } : { error: productError || 'No se pudo crear' },
            notificaciones: {
                equipo_whatsapp: teamNotified,
                email_cliente: emailSent
            }
        });

    } catch (error: any) {
        console.error('[Contratos] Error al firmar contrato:', error);
        return NextResponse.json({ error: 'Error al procesar la firma del contrato' }, { status: 500 });
    }
}
