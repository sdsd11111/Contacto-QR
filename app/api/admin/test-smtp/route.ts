import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

/**
 * Endpoint de diagnóstico SMTP — SOLO PARA DESARROLLO/TESTING
 * Llámalo desde: GET /api/admin/test-smtp?key=TU_ADMIN_KEY&to=email@test.com
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');
    const to = searchParams.get('to') || process.env.SMTP_USER;

    if (key !== process.env.ADMIN_API_KEY) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Sanitizar variables (limpiar comillas accidentales y espacios)
    const host = process.env.SMTP_HOST?.trim().replace(/^["']|["']$/g, '');
    const user = process.env.SMTP_USER?.trim().replace(/^["']|["']$/g, '');
    const pass = process.env.SMTP_PASS?.trim().replace(/^["']|["']$/g, '');
    const originalPort = process.env.SMTP_PORT?.trim().replace(/^["']|["']$/g, '');

    const config = {
        host,
        user,
        from: process.env.EMAIL_FROM,
        originalPort,
        pass_defined: !!pass,
        pass_length: pass?.length,
    };

    const portsToTry = [
        { port: 465, secure: true },
        { port: 587, secure: false }
    ];

    const attempts = [];

    for (const setup of portsToTry) {
        try {
            const transporter = nodemailer.createTransport({
                host,
                port: setup.port,
                secure: setup.secure,
                auth: { user, pass },
                tls: { rejectUnauthorized: false },
                connectionTimeout: 5000, // 5 segundos para no colgar el request
            });

            await transporter.verify();

            // Si llega aquí, funcionó
            const info = await transporter.sendMail({
                from: process.env.EMAIL_FROM || user,
                to: to!,
                subject: `✅ Test SMTP ActivaQR — Puerto ${setup.port}`,
                html: `<p>SMTP funcionando en <strong>Puerto ${setup.port}</strong>.</p>
                       <p>Host: ${host}</p>`,
            });

            return NextResponse.json({
                success: true,
                message: `✅ SMTP funciona correctamente en puerto ${setup.port}`,
                messageId: info.messageId,
                config: { ...config, usedPort: setup.port, usedSecure: setup.secure },
                attempts
            });

        } catch (error: any) {
            attempts.push({
                port: setup.port,
                secure: setup.secure,
                error: error.message,
                code: error.code
            });
        }
    }

    return NextResponse.json({
        success: false,
        error: 'Fallaron todos los intentos de conexión SMTP',
        attempts,
        config
    }, { status: 500 });
}
