import { NextRequest, NextResponse } from 'next/server';
import { sendMail, EMAIL_FROM } from '@/lib/mailer';
import { isRateLimited, getClientIP } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        // Verificación de admin key
        const adminKey = req.headers.get('x-admin-key');
        if (!adminKey || adminKey !== process.env.ADMIN_API_KEY) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        // Rate limiting: máximo 10 emails por minuto
        const clientIP = getClientIP(req);
        if (isRateLimited(`send-vcard:${clientIP}`, 10, 60000)) {
            return NextResponse.json(
                { error: 'Demasiadas solicitudes. Intenta en un momento.' },
                { status: 429 }
            );
        }

        const body = await req.json();
        const { email, name, nombre, vcardUrl, qrUrl, backupData, edit_code } = body;

        const recipientEmail = email;
        const recipientName = name || nombre;

        if (!recipientEmail || typeof recipientEmail !== 'string' || !recipientEmail.includes('@')) {
            return NextResponse.json(
                { error: 'Email del destinatario es requerido y debe ser válido' },
                { status: 400 }
            );
        }

        if (!recipientName || typeof recipientName !== 'string') {
            return NextResponse.json(
                { error: 'Nombre del destinatario es requerido' },
                { status: 400 }
            );
        }

        const attachments = [];
        if (qrUrl) {
            attachments.push({ filename: 'qr-code.png', path: qrUrl });
        }
        if (backupData) {
            attachments.push({
                filename: `backup_${recipientName.replace(/\s+/g, '_')}_${Date.now()}.json`,
                content: JSON.stringify(backupData, null, 2),
                contentType: 'application/json'
            });
        }

        // Sección del código de edición
        const editCodeSection = edit_code ? `
            <div style="background-color: #F8FAFC; border: 2px solid #3B82F6; border-radius: 16px; padding: 24px; margin: 24px 0; text-align: center;">
                <h3 style="color: #1E3A8A; margin: 0 0 12px 0; font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">✏️ Actualiza tu Información</h3>
                <p style="margin: 0 0 16px 0; font-size: 15px; color: #475569; line-height: 1.5;">
                    ¿Cambiaste de número o cargo? No te preocupes. Tu plan incluye <strong>2 cambios gratuitos</strong>.
                </p>
                <div style="background-color: #EEF2FF; border: 1px dashed #6366F1; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                    <p style="margin: 0 0 8px 0; font-size: 13px; color: #6366F1; font-weight: bold; text-transform: uppercase;">Tu Código de Edición:</p>
                    <span style="font-family: 'Courier New', monospace; font-size: 28px; font-weight: 900; color: #1E3A8A; letter-spacing: 4px;">${edit_code}</span>
                </div>
                <a href="https://contacto-qr.vercel.app/#editar" style="background-color: #3B82F6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: 800; display: inline-block; margin-bottom: 16px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Entrar a Editar Tarjeta →</a>
                <p style="margin: 16px 0 0 0; font-size: 12px; color: #94A3B8; font-style: italic;">
                    Nota: Los primeros 2 cambios son gratuitos. A partir del 3er cambio, el costo es de <strong>$2.00 USD</strong> por actualización.
                </p>
            </div>
        ` : '';

        const info = await sendMail({
            to: recipientEmail,
            subject: 'ActivaQR: Tu Contacto Digital está listo',
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #334155; max-width: 600px; margin: 0 auto; line-height: 1.6;">
                    <div style="padding: 20px 0; text-align: center;">
                        <h1 style="color: #FF6B00; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">¡Hola ${recipientName}!</h1>
                        <p style="font-size: 16px; color: #64748b; margin-top: 8px;">Tu Contacto Digital profesional ha sido aprobado y generado exitosamente.</p>
                    </div>

                    <div style="background: #f8fafc; border-radius: 20px; padding: 30px; border: 1px solid #e2e8f0; text-align: center;">
                        <p style="margin-bottom: 24px;">Adjunto a este correo encontrarás tu <strong>Código QR</strong> oficial para compartir de inmediato.</p>
                        
                        <a href="${vcardUrl}" style="background-color: #FF6B00; color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(255,107,0,0.25);">Descargar Contacto (.vcf)</a>
                    </div>
                    
                    ${editCodeSection}

                    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 11px;">
                        <p style="margin-bottom: 4px;"><strong>ActivaQR - Tecnologías de Contacto Profesional</strong></p>
                        <p style="margin-bottom: 12px;">Servicio proporcionado por César Reyes Jaramillo | Ecuador</p>
                        <p>Recibes este correo porque adquiriste un servicio en activaqr.com. <br/> Si deseas no recibir más correos informativos, puedes responder a este mensaje con la palabra "Baja".</p>
                    </div>
                </div>
            `,
            attachments
        });

        return NextResponse.json({ success: true, messageId: info.messageId });

    } catch (error: any) {
        console.error('[send-vcard] Error al enviar correo:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
