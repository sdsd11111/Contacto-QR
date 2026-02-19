import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { isRateLimited, getClientIP } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
    try {
        // Verificación de admin key (defensa en profundidad, el middleware ya valida)
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

        // Validar campos requeridos
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

        // VALIDACIÓN DE VARIABLES DE ENTORNO SMTP
        const smtpHost = process.env.SMTP_HOST;
        const smtpPort = process.env.SMTP_PORT;
        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASS;

        if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
            console.error('ERROR: Faltan variables de entorno SMTP:', {
                host: !!smtpHost,
                port: !!smtpPort,
                user: !!smtpUser,
                pass: !!smtpPass
            });
            return NextResponse.json({
                error: 'Error de configuración del servidor: Variables SMTP no definidas.'
            }, { status: 500 });
        }

        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: Number(smtpPort) || 465,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        });

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

        // Build edit code section if available
        const editCodeSection = edit_code ? `
                    <div style="background-color: #F0F9FF; border: 2px solid #3B82F6; border-radius: 12px; padding: 20px; margin: 20px 0;">
                        <h3 style="color: #1E40AF; margin: 0 0 8px 0; font-size: 16px;">✏️ ¿Necesitas actualizar tu información?</h3>
                        <p style="margin: 0 0 12px 0; font-size: 14px; color: #374151;">Tienes <strong>2 cambios disponibles</strong> para editar tu tarjeta digital.</p>
                        <p style="margin: 0 0 12px 0; font-size: 14px; color: #374151;">Tu código de edición es:</p>
                        <div style="background-color: #1E3A5F; color: #FF8C00; font-size: 22px; font-weight: bold; text-align: center; padding: 14px 20px; border-radius: 8px; letter-spacing: 3px; font-family: monospace;">${edit_code}</div>
                        <br/>
                        <a href="https://contacto-qr.vercel.app/editar" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Editar mi Tarjeta Digital →</a>
                    </div>
        ` : '';

        const mailOptions = {
            from: process.env.EMAIL_FROM || '"ActivaQR" <registrameya@cesarreyesjaramillo.com>',
            to: recipientEmail,
            subject: '¡Tu Contacto Digital está Listo! 🚀',
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #4F46E5;">¡Hola ${recipientName}!</h1>
                    <p>Tu Contacto Digital profesional ha sido aprobado y generado exitosamente.</p>
                    <p>Adjunto encontrarás tu código QR para compartir.</p>
                    <br/>
                    <a href="${vcardUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Descargar Contacto (.vcf)</a>
                    <br/><br/>
                    ${editCodeSection}
                    <hr/>
                    <p style="font-size: 12px; color: #888;">TE RECORDAMOS. Al recibir este correo, has sido suscrito a nuestro boletín de noticias exclusivo para profesionales, donde compartiremos tips de networking y tecnología. Si deseas desuscribirte, responde a este correo.</p>
                </div>
            `,
            attachments
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Message sent: %s", info.messageId);

        return NextResponse.json({ success: true, messageId: info.messageId });

    } catch (error: any) {
        console.error('Error sending email:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
