import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE;

export async function GET(req: NextRequest) {
    const authHeader = req.headers.get('Authorization');
    const cronSecret = process.env.CRON_SECRET || process.env.ADMIN_API_KEY;

    const { searchParams } = new URL(req.url);
    const isManual = searchParams.get('manual') === 'true';

    // Security check
    if (!isManual && authHeader !== `Bearer ${cronSecret}` && searchParams.get('key') !== cronSecret) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        console.log('[Cron-Expiry-Reminders] Iniciando bot de avisos de vencimiento multinivel...');

        // 0. Autocreate columns if missing
        try {
            await pool.execute('ALTER TABLE registraya_vcard_registros ADD COLUMN IF NOT EXISTS expires_reminder_30d_sent TINYINT(1) DEFAULT 0');
            await pool.execute('ALTER TABLE registraya_vcard_registros ADD COLUMN IF NOT EXISTS expires_reminder_7d_sent TINYINT(1) DEFAULT 0');
            await pool.execute('ALTER TABLE registraya_vcard_registros ADD COLUMN IF NOT EXISTS expires_reminder_0d_sent TINYINT(1) DEFAULT 0');
        } catch (e) {
            console.log('[Cron-Expiry-Reminders] Las columnas ya existen.');
        }

        // 1. NIVEL 1: 30 DÍAS ANTES
        const query30d = `
            SELECT id, nombre, nombre_negocio, whatsapp, expires_at 
            FROM registraya_vcard_registros
            WHERE status != 'cancelado' AND expires_at IS NOT NULL
            AND expires_at BETWEEN DATE_ADD(NOW(), INTERVAL 25 DAY) AND DATE_ADD(NOW(), INTERVAL 31 DAY)
            AND expires_reminder_30d_sent = 0 LIMIT 20
        `;
        
        // 2. NIVEL 2: 7 DÍAS ANTES
        const query7d = `
            SELECT id, nombre, nombre_negocio, whatsapp, expires_at 
            FROM registraya_vcard_registros
            WHERE status != 'cancelado' AND expires_at IS NOT NULL
            AND expires_at BETWEEN DATE_ADD(NOW(), INTERVAL 5 DAY) AND DATE_ADD(NOW(), INTERVAL 8 DAY)
            AND expires_reminder_7d_sent = 0 LIMIT 20
        `;

        // 3. NIVEL 3: HOY (O AYER PARA ASEGURAR)
        const query0d = `
            SELECT id, nombre, nombre_negocio, whatsapp, expires_at 
            FROM registraya_vcard_registros
            WHERE status != 'cancelado' AND expires_at IS NOT NULL
            AND expires_at <= NOW()
            AND expires_reminder_0d_sent = 0 LIMIT 20
        `;

        const [rows30d]: any = await pool.execute(query30d);
        const [rows7d]: any = await pool.execute(query7d);
        const [rows0d]: any = await pool.execute(query0d);

        const allToNotify = [
            ...rows30d.map((r: any) => ({ ...r, level: 30 })),
            ...rows7d.map((r: any) => ({ ...r, level: 7 })),
            ...rows0d.map((r: any) => ({ ...r, level: 0 }))
        ];

        console.log(`[Cron-Expiry-Reminders] Procesando ${allToNotify.length} notificaciones.`);

        const results = [];

        for (const r of allToNotify) {
            try {
                const clientName = r.nombre || r.nombre_negocio || "Cliente";
                const expiryDateStr = new Date(r.expires_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
                
                const planNames: Record<string, string> = {
                    'pro': 'Contacto Digital',
                    'business': 'Contacto Business',
                    'catalogo': 'C. Business + Catálogo'
                };
                const pName = planNames[r.plan] || "Contacto Digital";

                let message = "";
                if (r.level === 30) {
                    message = `Hola ${clientName} 👋, soy Alejandra de ActivaQR. ¡Tu ${pName} sigue funcionando perfecto! ✨ Te recuerdo que vence el *${expiryDateStr}*. ¿Renovamos? 😊 (Tip: agrégame para activar links)`;
                } else if (r.level === 7) {
                    message = `Hola ${clientName} 👋, soy Alejandra. ¡Tu ${pName} sigue al aire! 🚀 Pero vence en *7 días* (${expiryDateStr}). ¿Te paso la cuenta para la renovación?`;
                } else {
                    message = `${clientName} 👋, soy Alejandra. Tu ${pName} venció hoy *${expiryDateStr}*. Se desactivará pronto si no renovamos. ¿Te mando los datos para mantenerlo activo? ⚠️`;
                }

                // Format WhatsApp number to international 593 format (Ecuador)
                let clientWhatsApp = r.whatsapp.replace(/\D/g, '');
                if (clientWhatsApp.length === 10 && clientWhatsApp.startsWith('0')) {
                    clientWhatsApp = '593' + clientWhatsApp.substring(1);
                } else if (clientWhatsApp.length === 9 && !clientWhatsApp.startsWith('593')) {
                    clientWhatsApp = '593' + clientWhatsApp;
                }

                const waRes = await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'apikey': EVOLUTION_API_KEY || '' },
                    body: JSON.stringify({ number: clientWhatsApp, text: message })
                });

                if (waRes.ok) {
                    const column = r.level === 30 ? 'expires_reminder_30d_sent' : r.level === 7 ? 'expires_reminder_7d_sent' : 'expires_reminder_0d_sent';
                    await pool.execute(`UPDATE registraya_vcard_registros SET ${column} = 1 WHERE id = ?`, [r.id]);
                    results.push({ id: r.id, status: 'sent', level: r.level });

                    // Notify César about expiration reminder
                    try {
                        const cesarMsg = `🔔 *Aviso de Expiración:* Se envió recordatorio de *${r.level} días* a *${clientName}* (${r.whatsapp}). Vence el ${expiryDateStr}.`;
                        await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'apikey': EVOLUTION_API_KEY || '' },
                            body: JSON.stringify({ number: "593963410409", text: cesarMsg })
                        });
                    } catch (e) { console.error("Error notifying Cesar:", e); }
                } else {
                    results.push({ id: r.id, status: 'failed', error: await waRes.text() });
                }
            } catch (err: any) {
                results.push({ id: r.id, status: 'error', error: err.message });
            }
        }

        return NextResponse.json({ success: true, processed: results.length, details: results });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
