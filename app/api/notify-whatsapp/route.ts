import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { name, email, whatsapp, plan } = await request.json();

        const apiUrl = process.env.EVOLUTION_API_URL;
        const apiKey = process.env.EVOLUTION_API_KEY;
        const instance = process.env.EVOLUTION_INSTANCE;
        const targetNumber = process.env.NOTIFY_WHATSAPP_NUMBER;

        if (!apiUrl || !apiKey || !instance || !targetNumber) {
            console.error("Missing Evolution API configuration");
            return NextResponse.json({ error: "Configuración incompleta" }, { status: 500 });
        }

        const message = `🚀 *ACABAN DE COMPRAR UN NUEVO CONTACTO DIGITAL*\n\n` +
            `👤 *Nombre:* ${name}\n` +
            `📧 *Email:* ${email}\n` +
            `📱 *WhatsApp:* ${whatsapp}\n` +
            `💎 *Plan:* ${plan?.toUpperCase() || 'N/A'}\n\n` +
            `✅ Registro recibido y procesado.`;

        const payload = {
            number: targetNumber,
            text: message
        };

        console.log("Evolution API Request Payload:", JSON.stringify(payload, null, 2));

        const response = await fetch(`${apiUrl}/message/sendText/${instance}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': apiKey
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Evolution API Error Detail:", JSON.stringify(data, null, 2));
            return NextResponse.json({ error: "Error enviando notificación WhatsApp", details: data }, { status: response.status });
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("Error in notify-whatsapp route:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
