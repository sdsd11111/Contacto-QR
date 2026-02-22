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

    const config = {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 465),
        secure: process.env.SMTP_SECURE === 'true',
        user: process.env.SMTP_USER,
        from: process.env.EMAIL_FROM,
        node_env: process.env.NODE_ENV,
        // No mostrar la contraseña completa, solo si está definida
        pass_defined: !!process.env.SMTP_PASS,
        pass_length: process.env.SMTP_PASS?.length,
    };

    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT || 465),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: { rejectUnauthorized: false },
        });

        // 1. Verificar conexión
        await transporter.verify();

        // 2. Enviar correo de prueba
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || process.env.SMTP_USER,
            to: to!,
            subject: '✅ Test SMTP ActivaQR — Diagnóstico',
            html: `<p>Si recibes esto, el SMTP funciona correctamente desde <strong>${process.env.NODE_ENV}</strong>.</p>
                   <p>Host: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}</p>`,
        });

        return NextResponse.json({
            success: true,
            message: '✅ SMTP funciona correctamente',
            messageId: info.messageId,
            config,
        });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message,
            code: error.code,
            command: error.command,
            config,
        }, { status: 500 });
    }
}
