import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import pool from '@/lib/db';
import { sendMail } from '@/lib/mailer';
import { SERVICIOS_LIST } from '@/lib/contrato-utils';

export const dynamic = 'force-dynamic';

/**
 * POST /api/contratos/[uuid]/confirmar-pago
 *
 * Confirma el pago de un contrato y crea el producto en registraya_vcard_registros.
 * Se llama DESPUÉS de que PayPhone procesa el pago exitosamente.
 *
 * Body (opcional):
 * {
 *   clientTransactionId?: string;  // ID de transacción PayPhone
 * }
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ uuid: string }> }
) {
    try {
        const { uuid } = await params;

        // Obtener el contrato
        const [rows]: any = await pool.execute(
            `SELECT * FROM contratos WHERE id = ?`,
            [uuid]
        );

        if (!rows || rows.length === 0) {
            return NextResponse.json({ error: 'Contrato no encontrado' }, { status: 404 });
        }

        const contrato = rows[0];

        // Leer body opcional
        let body: any = {};
        try { body = await req.json(); } catch {}

        const metodoPago = body?.metodo || 'payphone';
        const montoPagado = parseFloat(body?.monto) || 0;

        // Verificar que esté firmado
        if (!contrato.firma_nombre || contrato.firma_nombre.trim().length === 0) {
            return NextResponse.json({ error: 'El contrato aún no ha sido firmado' }, { status: 400 });
        }

        // Verificar que no se haya creado el producto ya (idempotencia)
        if (contrato.estado_pago === 'pagado') {
            return NextResponse.json({
                success: true,
                message: 'El producto ya fue creado anteriormente',
                ya_existia: true,
            });
        }

        // Parsear servicios seleccionados
        let serviciosSeleccionados: string[] = [];
        try {
            serviciosSeleccionados = contrato.servicios_seleccionados
                ? JSON.parse(contrato.servicios_seleccionados)
                : [contrato.servicio_contratado];
        } catch {
            serviciosSeleccionados = [contrato.servicio_contratado];
        }

        const montoTotal = parseFloat(contrato.monto_total) || 0;

        // ============================================================
        // Crear producto en registraya_vcard_registros
        // ============================================================
        let productId = '';
        let productSlug = '';
        let productCreated = false;
        let productError = '';

        try {
            const email = contrato.cliente_email || '';
            const telefono = contrato.cliente_telefono || '';
            const firmaNombre = contrato.firma_nombre || '';

            // Calcular plan según el servicio de MAYOR valor
            const planMapping: Record<string, string> = {
                digital: 'contacto', business: 'business',
                catalogo: 'catalogo', web: 'web', auditoria: 'auditoria',
            };
            const ordenServicios = ['digital', 'business', 'catalogo', 'web', 'auditoria'];
            const servPrincipal = serviciosSeleccionados.reduce((a, b) =>
                ordenServicios.indexOf(a) > ordenServicios.indexOf(b) ? a : b
            , serviciosSeleccionados[0] || contrato.servicio_contratado);
            const planValue = planMapping[servPrincipal] || 'contacto';

            // Verificar si ya existe un producto con ese email
            const [existentes]: any = await pool.execute(
                'SELECT id, slug FROM registraya_vcard_registros WHERE email = ?',
                [email]
            );

            if (existentes && existentes.length > 0) {
                // Ya existe → actualizar
                productId = existentes[0].id;
                productSlug = existentes[0].slug;
                const rawPhone = telefono.replace(/\D/g, '');
                const formattedPhone = rawPhone.startsWith('593')
                    ? `+593 ${rawPhone.substring(3)}`
                    : rawPhone.startsWith('0')
                        ? `+593 ${rawPhone.substring(1)}`
                        : telefono;
                await pool.execute(
                    `UPDATE registraya_vcard_registros SET
                        nombre = ?, whatsapp = ?, email = ?,
                        empresa = ?, plan = ?,
                        bio = ?, productos_servicios = ?, instagram = ?
                    WHERE id = ?`,
                    [
                        contrato.cliente_nombre || firmaNombre,
                        formattedPhone, email,
                        contrato.cliente_negocio || null,
                        planValue,
                        contrato.cliente_categorias || null,
                        contrato.cliente_categorias || null,
                        contrato.cliente_red_social || null,
                        productId
                    ]
                );
                productCreated = true;
                console.log(`[Contratos] Producto ACTUALIZADO para ${email}: ${productId} → plan: ${planValue}`);
            } else {
                // No existe → insertar nuevo
                const tipoPerfil = contrato.cliente_cedula_ruc?.length === 13 ? 'negocio' : 'persona';
                const nombresArr = (contrato.cliente_nombre || firmaNombre).split(' ');
                const nombres = nombresArr.slice(0, Math.ceil(nombresArr.length / 2)).join(' ');
                const apellidos = nombresArr.slice(Math.ceil(nombresArr.length / 2)).join(' ');

                productId = uuidv4();
                const cleanName = (contrato.cliente_nombre || firmaNombre || 'cliente').toLowerCase()
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
                        contrato.cliente_nombre || firmaNombre,
                        email, formattedPhone,
                        contrato.cliente_negocio || null,
                        contrato.cliente_categorias || null,
                        contrato.cliente_categorias || null,
                        contrato.cliente_red_social || null, null,
                        planValue, contrato.logo_url || null,
                        `CONTRATO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                        tieneRuc ? 'negocio' : 'persona',
                        nombres || contrato.cliente_nombre || firmaNombre, apellidos || '',
                        contrato.cliente_negocio || null,
                        contrato.cliente_nombre || firmaNombre || null, null,
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

        if (!productCreated) {
            return NextResponse.json({
                error: 'No se pudo crear el producto',
                detalle: productError,
            }, { status: 500 });
        }

        // ============================================================
        // Marcar contrato según el monto recibido
        // ============================================================
        const nuevoEstado = montoPagado > 0 ? 'pagado' : 'pendiente';
        await pool.execute(
            `UPDATE contratos SET estado_pago = ?, updated_at = NOW() WHERE id = ?`,
            [nuevoEstado, uuid]
        );

        // ============================================================
        // Notificar al equipo por WhatsApp
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
                    name: contrato.cliente_nombre || contrato.firma_nombre,
                    email: contrato.cliente_email || '',
                    whatsapp: contrato.cliente_telefono || '',
                    plan: montoPagado > 0 ? `✅ PAGO CONFIRMADO - ${serviciosTexto}` : `📋 CONTRATO FIRMADO (sin pago) - ${serviciosTexto}`,
                    businessName: contrato.cliente_negocio || '',
                    profession: `Contrato: ${uuid.substring(0, 8)}... | Total: $${montoTotal} | Pagado: $${montoPagado}`,
                })
            });
            teamNotified = true;
        } catch (notifyErr) {
            console.error('[Contratos] Error al notificar por WhatsApp:', notifyErr);
        }

        // ============================================================
        // Enviar email al cliente con confirmación de pago
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
                            <p style="color: #f66739; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Pago Confirmado ✅</p>
                        </div>

                        <div style="background: #28a745; color: white; text-align: center; padding: 20px; border-radius: 16px; margin-bottom: 25px;">
                            <p style="font-size: 14px; margin: 0; opacity: 0.9;">✅ Pago recibido — Tu producto está activo</p>
                        </div>

                        <p style="color: #001549; font-size: 16px; font-weight: bold;">Hola ${contrato.cliente_nombre || contrato.firma_nombre},</p>
                        <p style="color: #555; font-size: 14px; line-height: 1.6;">
                            ¡Tu pago ha sido procesado exitosamente! Tu producto digital ya está disponible.
                        </p>

                        <div style="background: #f8f9fa; border-radius: 16px; padding: 20px; margin: 20px 0;">
                            <h3 style="color: #001549; font-size: 13px; text-transform: uppercase; margin: 0 0 15px 0;">Resumen del pago</h3>
                            <table style="width: 100%; font-size: 13px; color: #555;">
                                <tr><td style="padding: 5px 0; color: #999;">Servicios:</td><td style="padding: 5px 0; text-align: right; font-weight: bold; color: #001549;">${serviciosTexto}</td></tr>
                                <tr><td style="padding: 5px 0; color: #999;">Monto total:</td><td style="padding: 5px 0; text-align: right; font-weight: bold; color: #001549;">$${montoTotal.toFixed(2)} USD</td></tr>
                                <tr><td style="padding: 5px 0; color: #999;">Estado:</td><td style="padding: 5px 0; text-align: right; color: #28a745; font-weight: bold;">✅ PAGADO</td></tr>
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
                    subject: `✅ Pago confirmado - ActivaQR`,
                    html: emailHtml,
                });
                emailSent = true;
                console.log(`[Contratos] Email de pago enviado a ${clienteEmail}`);
            }
        } catch (emailErr) {
            console.error('[Contratos] Error al enviar email de pago:', emailErr);
        }

        const baseUrl = req.nextUrl.origin;

        return NextResponse.json({
            success: true,
            message: 'Pago confirmado y producto creado exitosamente',
            contrato_id: uuid,
            producto: {
                id: productId,
                slug: productSlug,
                url: `${baseUrl}/admin/registros`,
            },
            notificaciones: {
                equipo_whatsapp: teamNotified,
                email_cliente: emailSent,
            },
        });

    } catch (error: any) {
        console.error('[Contratos] Error al confirmar pago:', error);
        return NextResponse.json({ error: 'Error al confirmar el pago' }, { status: 500 });
    }
}
