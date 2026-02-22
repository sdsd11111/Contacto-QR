/**
 * Módulo centralizado de correo para ActivaQR
 * Utiliza las variables SMTP del .env.local
 * SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, EMAIL_FROM
 */
import nodemailer from 'nodemailer';

/**
 * Crea y retorna un transporter de Nodemailer reutilizable.
 * Lanza un error si faltan variables de entorno SMTP.
 */
export function createMailTransporter() {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !port || !user || !pass) {
        const missing = { host: !!host, port: !!port, user: !!user, pass: !!pass };
        console.error('[MAILER] Variables SMTP faltantes:', missing);
        throw new Error(`Configuración SMTP incompleta. Variables faltantes: ${JSON.stringify(missing)}`);
    }

    return nodemailer.createTransport({
        host,
        port: Number(port),
        secure: process.env.SMTP_SECURE === 'true', // true para 465, false para 587/TLS
        auth: { user, pass },
        // Opciones de debugging para desarrollo local
        ...(process.env.NODE_ENV === 'development' && {
            debug: true,
            logger: true,
        }),
        // TLS options — para servidores con certificados auto-firmados
        tls: {
            rejectUnauthorized: false, // Permite certificados no verificados en desarrollo
        },
    });
}

/** Remitente "from" por defecto usando la variable EMAIL_FROM del .env */
export const EMAIL_FROM = process.env.EMAIL_FROM || '"ActivaQR" <activaqr@cesarreyesjaramillo.com>';

/**
 * Función de ayuda que crea un transporter y envía un correo.
 * Retorna la info de Nodemailer (messageId, etc).
 */
export async function sendMail(options: {
    to: string;
    subject: string;
    html: string;
    attachments?: any[];
}) {
    const transporter = createMailTransporter();
    const info = await transporter.sendMail({
        from: EMAIL_FROM,
        to: options.to,
        subject: options.subject,
        html: options.html,
        attachments: options.attachments,
    });
    console.log(`[MAILER] ✅ Correo enviado a ${options.to} | MessageId: ${info.messageId}`);
    return info;
}
