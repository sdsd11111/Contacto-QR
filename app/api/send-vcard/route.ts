import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
    try {
        const { email, name, vcardUrl, qrUrl, backupData } = await req.json();

        // VALIDACIÓN DE VARIABLES DE ENTORNO
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
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
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
                filename: `backup_${name.replace(/\s+/g, '_')}_${Date.now()}.json`,
                content: JSON.stringify(backupData, null, 2),
                contentType: 'application/json'
            });
        }

        const mailOptions = {
            from: process.env.EMAIL_FROM || '"RegistraYa VCards" <noreply@registraya.com>',
            to: email, // Could also send to an admin address if it's for internal backup
            subject: '¡Tu Contacto Digital está Listo! 🚀',
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #4F46E5;">¡Hola ${name}!</h1>
                    <p>Tu Contacto Digital profesional ha sido aprobado y generado exitosamente.</p>
                    <p>Adjunto encontrarás tu código QR para compartir.</p>
                    <br/>
                    <a href="${vcardUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Descargar Contacto (.vcf)</a>
                    <br/><br/>
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
