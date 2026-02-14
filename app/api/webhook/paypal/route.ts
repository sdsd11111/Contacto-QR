import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const eventType = body.event_type;
        const resource = body.resource;

        console.log(`[PayPal Webhook] Evento recibido: ${eventType}`);

        // PAYMENT.CAPTURE.COMPLETED es el evento que confirma que el dinero ha sido procesado
        if (eventType === 'PAYMENT.CAPTURE.COMPLETED' || eventType === 'PAYMENT.SALE.COMPLETED') {
            // Buscamos el email en custom_id (que enviamos desde el frontend)
            // O en el objeto de la orden si es un evento de checkout
            const email = resource.custom_id || resource.amount?.details?.subtotal;
            // Nota: En RegisterWizard.tsx pusimos custom_id: formData.email

            if (email && email.includes('@')) {
                console.log(`[PayPal Webhook] Confirmando pago para el usuario: ${email}`);

                const { data, error } = await supabaseAdmin
                    .from('registraya_vcard_registros')
                    .update({ status: 'pagado' })
                    .eq('email', email)
                    .select();

                if (error) {
                    console.error('[PayPal Webhook] Error actualizando Supabase:', error);
                    return NextResponse.json({ error: error.message }, { status: 500 });
                }

                if (data && data.length > 0) {
                    console.log(`[PayPal Webhook] ¡Éxito! Usuario ${email} marcado como pagado.`);

                    // Opcional: Disparar notificación por WhatsApp de pago aprobado
                    try {
                        const wpNotifyUrl = new URL('/api/notify-whatsapp', req.url).toString();
                        await fetch(wpNotifyUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                name: data[0].nombre,
                                email: email,
                                whatsapp: data[0].whatsapp,
                                plan: 'PAGO CONFIRMADO (PayPal)'
                            })
                        });
                    } catch (notifyErr) {
                        console.error('[PayPal Webhook] Error al notificar WhatsApp:', notifyErr);
                    }
                } else {
                    console.warn(`[PayPal Webhook] No se encontró ningún registro pendiente para el email: ${email}`);
                }
            } else {
                console.warn('[PayPal Webhook] Evento recibido sin custom_id (email) válido.');
            }
        }

        // Siempre responder 200 a PayPal para evitar reintentos innecesarios
        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('[PayPal Webhook] Error procesando el webhook:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
