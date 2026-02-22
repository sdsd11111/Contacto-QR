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
            subject: '🔑 Recuperación de Credenciales - ActivaQR',
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #FF6B00;">Hola, ${user.nombre}</h2>
                    <p>Has solicitado recuperar tus credenciales de acceso para tu panel de vendedor.</p>
                    
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FF6B00;">
                        <p style="margin: 5px 0;"><strong>Tu Contraseña Actual es:</strong> <span style="font-size: 1.2em; font-weight: bold; font-family: monospace;">${user.password}</span></p>
                    </div>

                    <p>Si no has sido tú, te recomendamos iniciar sesión de inmediato y cambiar tu contraseña desde la pestaña "Mi Perfil" (Ícono de engranaje) en tu Dashboard.</p>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${dashboardUrl}" style="background: #0A1229; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Acceder a Mi Panel</a>
                    </div>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
                    <p style="font-size: 0.8em; color: #888;">Este es un mensaje automático de ActivaQR. No respondas a este correo.</p>
                </div>
            `
        });

        return NextResponse.json({ success: true, message: 'Correo de recuperación enviado.' });

    } catch (err: any) {
        console.error('[forgot-password] Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
