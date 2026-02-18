import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';
// Deployment trigger: Actualización de automatización de correos

export async function GET(req: NextRequest) {
    const authHeader = req.headers.get('Authorization');
    const cronSecret = process.env.CRON_SECRET || process.env.ADMIN_API_KEY;

    // Basic security to prevent unauthorized calls
    if (authHeader !== `Bearer ${cronSecret}`) {
        // Fallback check for query param for easier manual testing/cron setup if desired
        const { searchParams } = new URL(req.url);
        if (searchParams.get('key') !== cronSecret) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }
    }

    try {
        console.log('[Cron] Iniciando procesamiento de correos retrasados...');

        // 1. Buscar registros pagados hace más de 24 horas que no se hayan enviado automáticamente
        const query = `
            SELECT * FROM registraya_vcard_registros 
            WHERE status = 'pagado' 
            AND auto_email_sent = 0 
            AND paid_at <= DATE_SUB(NOW(), INTERVAL 24 HOUR)
            LIMIT 20
        `;

        const [rows]: any = await pool.execute(query);
        const registros = rows as any[];

        console.log(`[Cron] Encontrados ${registros.length} registros para procesar.`);

        const results = [];

        for (const registro of registros) {
            try {
                // Preparar datos para enviar email
                const origin = req.headers.get('origin') || 'https://contacto-qr.vercel.app';
                const vcardUrl = `${origin}/api/vcard/${registro.slug || registro.id}`;
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(vcardUrl)}`;

                // Llamar al API de envío de email
                // Usamos la URL absoluta basada en el request actual
                const sendEmailUrl = new URL('/api/send-vcard', req.url).toString();

                const emailRes = await fetch(sendEmailUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-admin-key': process.env.ADMIN_API_KEY || ''
                    },
                    body: JSON.stringify({
                        vcardUrl,
                        qrUrl,
                        email: registro.email,
                        nombre: registro.nombre
                    })
                });

                if (emailRes.ok) {
                    // Marcar como enviado y entregado
                    await pool.execute(
                        'UPDATE registraya_vcard_registros SET auto_email_sent = 1, status = ? WHERE id = ?',
                        ['entregado', registro.id]
                    );
                    results.push({ id: registro.id, email: registro.email, status: 'success' });
                    console.log(`[Cron] Email enviado con éxito a ${registro.email}`);
                } else {
                    const error = await emailRes.text();
                    results.push({ id: registro.id, email: registro.email, status: 'error', details: error });
                    console.error(`[Cron] Error al enviar email a ${registro.email}:`, error);
                }

            } catch (err: any) {
                console.error(`[Cron] Error procesando registro ${registro.id}:`, err);
                results.push({ id: registro.id, email: registro.email, status: 'exception', error: err.message });
            }
        }

        return NextResponse.json({
            success: true,
            processed: results.length,
            results: results
        });

    } catch (err: any) {
        console.error('[Cron] Error crítico en el cron job:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
