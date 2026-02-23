import { NextResponse } from 'next/server';
import { getBotResponse, saveMessage } from '@/lib/openai-bot';
import pool from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log("Evolution API Webhook received:", JSON.stringify(body, null, 2));

        if (body.event !== 'messages.upsert' && body.event !== 'MESSAGES_UPSERT') {
            return NextResponse.json({ message: "Event ignored" });
        }

        const data = body.data;
        if (!data || !data.message) {
            return NextResponse.json({ message: "No message data" });
        }

        const remoteJid = data.key?.remoteJid;
        const fromMe = data.key?.fromMe;

        if (!remoteJid) {
            return NextResponse.json({ message: "No remoteJid" });
        }

        // Lógica de Silencio de 24h
        if (fromMe) {
            console.log(`Human interaction detected for ${remoteJid}. Mutting bot for 24h.`);
            const mutedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

            await pool.execute(
                `INSERT INTO registraya_whatsapp_sessions (jid, last_human_interaction, bot_muted_until) 
                 VALUES (?, NOW(), ?) 
                 ON DUPLICATE KEY UPDATE last_human_interaction = NOW(), bot_muted_until = ?`,
                [remoteJid, mutedUntil, mutedUntil]
            );

            // Guardar el mensaje del humano en el historial para contexto del bot después
            let humanMessage = "";
            if (data.message.conversation) humanMessage = data.message.conversation;
            else if (data.message.extendedTextMessage?.text) humanMessage = data.message.extendedTextMessage.text;

            if (humanMessage) {
                await saveMessage(remoteJid, 'assistant', `[MENSAJE HUMANO]: ${humanMessage}`);
            }

            return NextResponse.json({ message: "Bot muted due to human interaction" });
        }

        // Verificar si el bot está silenciado
        const [sessionRows] = await pool.execute(
            'SELECT bot_muted_until FROM registraya_whatsapp_sessions WHERE jid = ?',
            [remoteJid]
        );
        const sessions = sessionRows as any[];
        if (sessions.length > 0) {
            const mutedUntil = new Date(sessions[0].bot_muted_until);
            if (mutedUntil > new Date()) {
                console.log(`Bot is muted for ${remoteJid} until ${mutedUntil.toISOString()}`);
                return NextResponse.json({ message: "Bot is muted" });
            }
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

        // Guardar mensaje del usuario en el historial (Memoria)
        await saveMessage(remoteJid, 'user', userMessage);

        console.log(`Message from ${remoteJid}: ${userMessage}`);

        // Obtener respuesta de la IA (pasando remoteJid para lookup y memoria automática)
        const botReply = await getBotResponse(userMessage, remoteJid);

        // Enviar respuesta vía Evolution API
        const apiUrl = process.env.EVOLUTION_API_URL;
        const apiKey = process.env.EVOLUTION_API_KEY;
        const instance = process.env.EVOLUTION_INSTANCE;

        if (!apiUrl || !apiKey || !instance) {
            console.error("Missing Evolution API configuration");
            return NextResponse.json({ error: "Configuration missing" }, { status: 500 });
        }

        // Lógica para dividir mensajes (Saludo vs Menú)
        const splitIndex = botReply.search(/\n1\./);
        let messagesToSend = [botReply];

        if (splitIndex !== -1) {
            const greeting = botReply.substring(0, splitIndex).trim();
            const rest = botReply.substring(splitIndex).trim();
            if (greeting && rest) {
                messagesToSend = [greeting, rest];
            }
        }

        for (const text of messagesToSend) {
            const payload = {
                number: remoteJid,
                text: text,
                delay: 1500
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
                console.error("Error sending message to Evolution API:", await sendResponse.json());
            } else {
                // Guardar respuesta del bot en el historial (Memoria)
                await saveMessage(remoteJid, 'assistant', text);
            }

            if (messagesToSend.length > 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        console.log("Responses sent successfully to:", remoteJid);
        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Error in WhatsApp Webhook:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}
