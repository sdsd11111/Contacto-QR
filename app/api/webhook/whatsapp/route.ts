import { NextResponse } from 'next/server';
import { saveMessage } from '@/lib/openai-bot';
import pool from '@/lib/db';

/**
 * WEBHOOK PRINCIPAL (RECEPTOR)
 * Misión: Capturar mensajes y encolarlos para evitar respuestas fragmentadas.
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Solo procesar mensajes entrantes (MESSAGES_UPSERT)
        if (body.event !== 'messages.upsert' && body.event !== 'MESSAGES_UPSERT') {
            return NextResponse.json({ message: "Event ignored" });
        }

        const data = body.data;
        if (!data || !data.message) return NextResponse.json({ message: "No message data" });

        const remoteJid = data.key?.remoteJid;
        const fromMe = data.key?.fromMe;

        if (!remoteJid) return NextResponse.json({ message: "No remoteJid" });

        // --- Lógica de Interacción Humana (Silencio de 24h) ---
        if (fromMe) {
            const mutedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
            await pool.execute(
                `INSERT INTO registraya_whatsapp_sessions (jid, last_human_interaction, bot_muted_until) 
                 VALUES (?, NOW(), ?) 
                 ON DUPLICATE KEY UPDATE last_human_interaction = NOW(), bot_muted_until = ?`,
                [remoteJid, mutedUntil, mutedUntil]
            );

            const humanMessage = data.message.conversation || data.message.extendedTextMessage?.text || "";
            if (humanMessage) {
                await saveMessage(remoteJid, 'assistant', `[HUMANO]: ${humanMessage}`);
            }
            return NextResponse.json({ message: "Bot muted" });
        }

        // --- Verificar Silencio ---
        const [sessionRows] = await pool.execute(
            'SELECT bot_muted_until FROM registraya_whatsapp_sessions WHERE jid = ?',
            [remoteJid]
        );
        const sessions = sessionRows as any[];
        if (sessions.length > 0 && new Date(sessions[0].bot_muted_until) > new Date()) {
            return NextResponse.json({ message: "Bot is muted" });
        }

        // --- Extraer Mensaje Usuario ---
        let content = data.message.conversation || data.message.extendedTextMessage?.text || data.message.imageMessage?.caption || "";
        if (!content) return NextResponse.json({ message: "No text" });

        console.log(`📥 Recibido de ${remoteJid}: ${content}`);

        // --- ENCOLADO / DEBOUNCE (25 SEGUNDOS) ---
        // Guardamos en la cola para acumular mensajes fragmentados
        const processAt = new Date(Date.now() + 25 * 1000); // Ventana de 25s

        await pool.execute(
            `INSERT INTO registraya_whatsapp_message_queue (jid, combined_content, process_at, processed)
             VALUES (?, ?, ?, 0)
             ON DUPLICATE KEY UPDATE 
                combined_content = CONCAT(combined_content, ' ', VALUES(combined_content)),
                process_at = VALUES(process_at),
                processed = 0`,
            [remoteJid, content.trim(), processAt]
        );

        return NextResponse.json({ success: true, message: "Message queued for accumulation" });

    } catch (error: any) {
        console.error("Webhook Receiver Error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
