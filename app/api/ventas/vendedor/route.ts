import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { sendMail } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { nombre, celular, ciudad, experiencia } = body;

        if (!nombre || !celular || !ciudad || !experiencia) {
            return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
        }

        // 1. Guardar en la base de datos
        const query = `
            INSERT INTO ventas_leads (nombre, celular, ciudad, experiencia)
            VALUES (?, ?, ?, ?)
        `;
        const [result]: any = await pool.execute(query, [nombre, celular, ciudad, experiencia]);

        // 2. Enviar correo a registro@activaqr.com con todos los datos (CC a cristhopheryeah113@gmail.com)
        const leadHtml = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #66bf19; border-bottom: 2px solid #66bf19; padding-bottom: 10px;">Nuevo Lead de Vendedor</h2>
                <p><strong>Nombre:</strong> ${nombre}</p>
                <p><strong>Celular:</strong> ${celular}</p>
                <p><strong>Ciudad:</strong> ${ciudad}</p>
                <p><strong>¿Tiene experiencia vendiendo?:</strong> ${experiencia}</p>
                <p style="font-size: 12px; color: #777; margin-top: 20px;">Este lead ha sido registrado automáticamente desde la página de Ventas.</p>
            </div>
        `;

        try {
            // Correo principal
            await sendMail({
                to: 'registro@activaqr.com, cristhopheryeah113@gmail.com',
                subject: `Nuevo Vendedor: ${nombre} - ${ciudad}`,
                html: leadHtml
            });
        } catch (mailErr) {
            console.error('Error enviando email principal:', mailErr);
        }

        // 3. Notificación a cristhopheryeah113@gmail.com
        try {
            await sendMail({
                to: 'cristhopheryeah113@gmail.com',
                subject: 'Tienes un nuevo vendedor',
                html: `<p>Hola, tienes un nuevo lead de vendedor interesado: <strong>${nombre}</strong> de <strong>${ciudad}</strong>.</p><p>Revisa el correo de registro@activaqr.com para ver todos los detalles.</p>`
            });
        } catch (mailErr) {
            console.error('Error enviando email de notificación:', mailErr);
        }

        return NextResponse.json({ success: true, id: result.insertId });

    } catch (err: any) {
        console.error('Error in sales lead API:', err);
        return NextResponse.json({ error: 'Error interno del servidor', details: err.message }, { status: 500 });
    }
}
