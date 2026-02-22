import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { sendMail } from "@/lib/mailer";

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const adminKey = req.headers.get('x-admin-key');
    if (!adminKey || adminKey !== process.env.ADMIN_API_KEY) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        const { id } = await params;
        if (!id) {
            return NextResponse.json({ error: "ID de Vendedor es requerido" }, { status: 400 });
        }

        const body = await req.json();
        const { nombre, email, password, comision_porcentaje } = body;

        let query = "";
        let values: any[] = [];

        if (password && password.trim() !== '') {
            query = `UPDATE registraya_vcard_sellers SET nombre = ?, email = ?, password = ?, comision_porcentaje = ? WHERE id = ?`;
            values = [nombre, email, password, comision_porcentaje, id];
        } else {
            query = `UPDATE registraya_vcard_sellers SET nombre = ?, email = ?, comision_porcentaje = ? WHERE id = ?`;
            values = [nombre, email, comision_porcentaje, id];
        }

        const [result]: any = await pool.execute(query, values);

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: "Vendedor no encontrado" }, { status: 404 });
        }

        // NOTIFICACIÓN POR CORREO — No-bloqueante
        const origin = req.headers.get('origin') || 'https://contacto-qr.vercel.app';
        const dashboardUrl = `${origin}/admin/vendedor`;

        sendMail({
            to: email,
            subject: '🔐 Actualización de Seguridad - Tu Cuenta ActivaQR',
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #FF6B00;">¡Hola, ${nombre}!</h2>
                    <p>Un administrador ha actualizado los datos de tu cuenta en ActivaQR. Aquí tienes tus credenciales actualizadas:</p>
                    
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>Usuario:</strong> ${email}</p>
                        ${password ? `<p style="margin: 5px 0;"><strong>Nueva Contraseña:</strong> ${password}</p>` : '<p style="margin: 5px 0; color: #666;">Tu contraseña no ha sido modificada.</p>'}
                    </div>

                    <p>Si no solicitaste este cambio, por favor contacta con soporte de inmediato.</p>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${dashboardUrl}" style="background: #FF6B00; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Acceder a Mi Panel</a>
                    </div>

                    <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
                    <p style="font-size: 0.8em; color: #888;">Este es un mensaje automático de ActivaQR.</p>
                </div>
            `
        }).catch(emailErr => {
            // No bloqueamos la respuesta si falla el correo
            console.error('[sellers/[id]] Error al enviar correo de actualización:', emailErr);
        });

        return NextResponse.json({ success: true, message: "Vendedor actualizado y notificado exitosamente" });

    } catch (err: any) {
        console.error("[sellers/[id]] Error al actualizar vendedor:", err);
        return NextResponse.json({ error: "Error interno del servidor", details: err.message }, { status: 500 });
    }
}
