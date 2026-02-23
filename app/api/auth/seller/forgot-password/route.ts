import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { sendMail } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Correo electrónico es requerido' }, { status: 400 });
        }

        const [users]: any = await pool.execute(
            'SELECT id, nombre, email, password FROM registraya_vcard_sellers WHERE email = ? LIMIT 1',
            [email]
        );

        if (users.length === 0) {
            // No revelamos si el correo existe o no por seguridad
            return NextResponse.json({ success: true, message: 'Si el correo existe, fue enviado.' });
        }

        const user = users[0];

        const origin = req.headers.get('origin') || 'https://contacto-qr.vercel.app';
        const dashboardUrl = `${origin}/admin/vendedor`;

        await sendMail({
            to: user.email,
            subject: 'Recuperación de Credenciales - ActivaQR',
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #334155; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 30px; border-radius: 20px;">
                    <h2 style="color: #FF6B00; margin: 0 0 16px 0; font-size: 24px; font-weight: 800;">Hola, ${user.nombre}</h2>
                    <p style="font-size: 16px; margin-bottom: 24px;">Has solicitado recuperar tus credenciales de acceso para tu panel de vendedor.</p>
                    
                    <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin: 24px 0; border-left: 4px solid #FF6B00;">
                        <p style="margin: 0; font-size: 14px; color: #64748b; font-weight: bold; text-transform: uppercase;">Tu Contraseña Actual:</p>
                        <p style="margin: 8px 0 0 0; font-size: 24px; font-weight: bold; font-family: monospace; color: #0A1229; letter-spacing: 1px;">${user.password}</p>
                    </div>

                    <p style="font-size: 14px; color: #64748b;">Si no has solicitado este correo, te recomendamos iniciar sesión y cambiar tu contraseña desde la pestaña "Mi Perfil" en tu Dashboard de inmediato.</p>

                    <div style="text-align: center; margin: 32px 0;">
                        <a href="${dashboardUrl}" style="background: #0A1229; color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block;">Entrar al Panel →</a>
                    </div>
                    
                    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 11px;">
                        <p style="margin-bottom: 4px;"><strong>ActivaQR - Seguridad</strong></p>
                        <p>Este es un mensaje automático de seguridad. Por favor, no respondas a este correo.</p>
                    </div>
                </div>
            `
        });

        return NextResponse.json({ success: true, message: 'Correo de recuperación enviado.' });

    } catch (err: any) {
        console.error('[forgot-password] Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
