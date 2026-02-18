import { NextResponse } from 'next/server';
import { getBotResponse } from '@/lib/openai-bot';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log("Evolution API Webhook received:", JSON.stringify(body, null, 2));

        // Validar el evento (usualmente messages.upsert o MESSAGES_UPSERT)
        if (body.event !== 'messages.upsert' && body.event !== 'MESSAGES_UPSERT') {
            return NextResponse.json({ message: "Event ignored" });
        }

        const data = body.data;
        if (!data || !data.message) {
            return NextResponse.json({ message: "No message data" });
        }

        // Evitar bucles: Ignorar mensajes enviados por el propio bot
        if (data.key?.fromMe) {
            console.log("Ignoring self message to avoid loop");
            return NextResponse.json({ message: "Self message ignored" });
        }

        // Extraer el texto del mensaje
        let userMessage = "";
        if (data.message.conversation) {
            userMessage = data.message.conversation;
        } else if (data.message.extendedTextMessage?.text) {
            userMessage = data.message.extendedTextMessage.text;
        } else if (data.message.imageMessage?.caption) {
            userMessage = data.message.imageMessage.caption;
        }

        if (!userMessage) {
            return NextResponse.json({ message: "No text found in message" });
        }

        const remoteJid = data.key.remoteJid;
        console.log(`Message from ${remoteJid}: ${userMessage}`);

        // Obtener respuesta de la IA
        const botReply = await getBotResponse(userMessage);

        // Enviar respuesta vía Evolution API
        const apiUrl = process.env.EVOLUTION_API_URL;
        const apiKey = process.env.EVOLUTION_API_KEY;
        const instance = process.env.EVOLUTION_INSTANCE;

        if (!apiUrl || !apiKey || !instance) {
            console.error("Missing Evolution API configuration");
            return NextResponse.json({ error: "Configuration missing" }, { status: 500 });
        }

        const payload = {
            number: remoteJid,
            text: botReply,
            delay: 1000 // Un pequeño delay para que parezca más natural
        };

        const sendResponse = await fetch(`${apiUrl}/message/sendText/${instance}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': apiKey
            },
            body: JSON.stringify(payload)
        });

        if (!sendResponse.ok) {
            const errorData = await sendResponse.json();
            console.error("Error sending response via Evolution API:", errorData);
            return NextResponse.json({ error: "Failed to send message", details: errorData }, { status: 500 });
        }

        console.log("Response sent successfully to:", remoteJid);
        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Error in WhatsApp Webhook:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}
