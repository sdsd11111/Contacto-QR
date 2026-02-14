import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
    try {
        const rawBody = await req.text();
        const signature = req.headers.get("x-crossmint-signature");

        if (!signature) {
            return NextResponse.json({ error: "Missing signature" }, { status: 401 });
        }

        const expectedSignature = crypto
            .createHmac("sha256", process.env.CROSSMINT_WEBHOOK_SECRET!)
            .update(rawBody)
            .digest("hex");

        if (signature !== expectedSignature) {
            console.error("[Crossmint Webhook] Firma inválida");
            return NextResponse.json(
                { error: "Invalid signature" },
                { status: 401 }
            );
        }

        const event = JSON.parse(rawBody);
        console.log("[Crossmint Webhook] Evento recibido:", event.type);

        // orders.payment.succeeded o similar dependiendo de la versión del API
        if (event.type === "orders.payment.succeeded") {
            const paymentId = event.data.id;
            const email = event.data.recipient.email;

            console.log(`[Crossmint Webhook] Pago exitoso para ${email}, ID: ${paymentId}`);

            // Actualizar registro en Supabase
            const { data, error } = await supabaseAdmin
                .from('registraya_vcard_registros')
                .update({ status: 'pagado' })
                .eq('email', email)
                .select();

            if (error) {
                console.error("[Crossmint Webhook] Error en Supabase:", error);
            } else if (data && data.length > 0) {
                console.log(`[Crossmint Webhook] Usuario ${email} marcado como pagado.`);

                // Notificar por WhatsApp
                try {
                    const wpNotifyUrl = new URL('/api/notify-whatsapp', req.url).toString();
                    await fetch(wpNotifyUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: data[0].nombre,
                            email: email,
                            whatsapp: data[0].whatsapp,
                            plan: 'PAGO CRYPTO CONFIRMADO (Crossmint)'
                        })
                    });
                } catch (notifyErr) {
                    console.error('[Crossmint Webhook] Error al notificar WhatsApp:', notifyErr);
                }
            }
        }

        return NextResponse.json({ received: true });
    } catch (err: any) {
        console.error("[Crossmint Webhook] Error crítico:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
