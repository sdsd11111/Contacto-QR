import { NextResponse } from 'next/server';

/**
 * ActivaQR Widget API
 * Endpoint para tracking de leads desde el widget flotante de WhatsApp.
 * 
 * POST /api/widget
 * Body: { phone, message, visitorId, url, referrer, timestamp }
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { phone, message, visitorId, url, referrer } = body;

        // ─── Validación mínima ───────────────────────────────────
        if (!phone) {
            return NextResponse.json({ error: 'Falta el número de teléfono' }, { status: 400 });
        }

        // ─── Registrar el lead ────────────────────────────────────
        console.log('[Widget] 📩 Nuevo click en widget:', {
            phone,
            message: message?.slice(0, 80),
            visitorId,
            url,
            referrer,
            timestamp: new Date().toISOString(),
        });

        // ─── Notificar vía Evolution API (opcional) ──────────────
        const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
        const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;
        const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE;
        const NOTIFY_NUMBER = process.env.NOTIFY_WHATSAPP_NUMBER;

        if (EVOLUTION_API_URL && EVOLUTION_API_KEY && EVOLUTION_INSTANCE && NOTIFY_NUMBER) {
            const notifyBody = {
                number: NOTIFY_NUMBER,
                text: `🔔 *Nuevo lead desde widget web*\n\n📱 Número: ${phone}\n💬 Mensaje: ${message || 'No especificado'}\n🆔 Visitante: ${visitorId || 'N/A'}\n🌐 Página: ${url || 'N/A'}\n📎 Referrer: ${referrer || 'N/A'}\n🕐 ${new Date().toLocaleString('es-EC', { timeZone: 'America/Guayaquil' })}`,
                // Opcional: enviar mensaje al propio lead
                // delay: 120,
            };

            fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': EVOLUTION_API_KEY,
                },
                body: JSON.stringify(notifyBody),
            }).catch(err => {
                console.error('[Widget] Error notificando vía Evolution API:', err);
            });
        }

        // ─── También registrar en base de datos (opcional futuro) ─
        // TODO: Guardar en tabla widget_leads cuando se implemente

        return NextResponse.json({
            success: true,
            message: 'Lead registrado correctamente',
        });

    } catch (error) {
        console.error('[Widget] Error en API:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}

/**
 * Health check para el widget
 */
export async function GET() {
    return NextResponse.json({
        status: 'ok',
        widget: 'ActivaQR WhatsApp Widget API v1.0',
        timestamp: new Date().toISOString(),
    });
}
