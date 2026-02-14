import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { name, email, whatsapp, plan } = await request.json();

        const missingVars = [];
        if (!process.env.EVOLUTION_API_URL) missingVars.push('EVOLUTION_API_URL');
        if (!process.env.EVOLUTION_API_KEY) missingVars.push('EVOLUTION_API_KEY');
        if (!process.env.EVOLUTION_INSTANCE) missingVars.push('EVOLUTION_INSTANCE');
        if (!process.env.NOTIFY_WHATSAPP_NUMBER) missingVars.push('NOTIFY_WHATSAPP_NUMBER');

        if (missingVars.length > 0) {
            console.error("Missing Evolution API vars:", missingVars);
            return NextResponse.json({ error: `Faltan variables en Vercel: ${missingVars.join(', ')}` }, { status: 500 });
        }

        const apiUrl = process.env.EVOLUTION_API_URL;
        const apiKey = process.env.EVOLUTION_API_KEY;
        const instance = process.env.EVOLUTION_INSTANCE;
        const targetNumber = process.env.NOTIFY_WHATSAPP_NUMBER;

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

        try {
            const response = await fetch(`${apiUrl}/message/sendText/${instance}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': apiKey || ''
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("Evolution API Error Detail:", JSON.stringify(data, null, 2));
                return NextResponse.json({ error: "Error de Evolution API", details: data }, { status: response.status });
            }

            return NextResponse.json({ success: true, data });
        } catch (fetchError: any) {
            console.error("Fetch Error:", fetchError);
            return NextResponse.json({ error: "Error de conexión con Evolution API", details: fetchError.message }, { status: 500 });
        }
    } catch (error: any) {
        console.error("Error in notify-whatsapp route:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}
