import http from 'http';
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { getBotResponse } from '../lib/openai-bot';
import { saveToGoogleContacts } from '../lib/google-contacts';

// Cargar variables de entorno desde .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

// ======================================
// CONFIGURACIÓN
// ======================================
const POLL_INTERVAL_MS = 5000;          // Revisar cola cada 5 segundos
const ACCUMULATION_WINDOW_MS = 25000;   // Esperar 25s de silencio antes de procesar
const TYPING_DELAY_MS = 2000;           // Delay antes de "Typing..."

// DB Pool (reutilizable)
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 5,
    ssl: undefined,
});

// Evolution API Config
const apiUrl = process.env.EVOLUTION_API_URL!;
const apiKey = process.env.EVOLUTION_API_KEY!;
const instance = process.env.EVOLUTION_INSTANCE!;

// ======================================
// PASO 1: HEALTH CHECK HTTP (Crítico para Render)
// Render requiere que un puerto se abra en los primeros 60s.
// Sin esto, el servicio es matado con error "Bind Port Timeout".
// ======================================
const port = process.env.PORT || 10000;
const healthServer = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ActivaQR Message Worker: Active ✅');
});
healthServer.listen(Number(port), '0.0.0.0', () => {
    console.log(`🌍 Health Check Server running on port ${port}`);
});

// ======================================
// ENVÍO DE "ESCRIBIENDO..." (Typing Indicator)
// Le da al usuario sensación de que alguien atiende, evita la impaciencia
// ======================================
async function sendTyping(jid: string) {
    try {
        await fetch(`${apiUrl}/chat/sendPresence/${instance}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'apikey': apiKey },
            body: JSON.stringify({ number: jid, presence: 'composing', delay: TYPING_DELAY_MS }),
        });
    } catch (_e) { /* silencioso */ }
}

// ======================================
// ENVÍO DE MENSAJE DE TEXTO
// ======================================
async function sendText(jid: string, text: string) {
    await fetch(`${apiUrl}/message/sendText/${instance}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': apiKey },
        body: JSON.stringify({ number: jid, text }),
    });
}

// ======================================
// ENVÍO DE MEDIOS (VCF y QR)
// ======================================
async function sendMedia(jid: string, type: 'document' | 'image', url: string, fileName: string, mimetype?: string, caption?: string) {
    try {
        const payload: any = {
            number: jid,
            mediatype: type,
            media: url,
            fileName: fileName,
        };
        if (mimetype) payload.mimetype = mimetype;
        if (caption) payload.caption = caption;

        await fetch(`${apiUrl}/message/sendMedia/${instance}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'apikey': apiKey },
            body: JSON.stringify(payload),
        });
    } catch (e) {
        console.error(`Error sendMedia (${type}):`, e);
    }
}

// ======================================
// NOTIFICACIÓN A ADMINISTRADORES (César / Soporte)
// ======================================
async function notifyAdmins(jid: string, summary: string, isSupport: boolean, isReseller: boolean) {
    const cesarPhone = "593963410409";
    const supportPhone = "593967491847";
    const isSameContact = cesarPhone === supportPhone;
    try {
        const [leadRows] = await pool.execute(
            'SELECT profesion, negocio, ciudad, puntuacion_calidad, notas FROM registraya_whatsapp_leads WHERE jid = ?',
            [jid]
        );
        const leads = leadRows as any[];
        let leadInfo = '';
        let notaStr = '';
        if (leads.length > 0) {
            const l = leads[0];
            leadInfo = `\n\n📝 *Perfil*:\n- Negocio: ${l.negocio || '?'}\n- Profesión: ${l.profesion || '?'}\n- Ciudad: ${l.ciudad || '?'}\n- Score: ${l.puntuacion_calidad}/10`;
            notaStr = l.notas ? `\n📌 *Notas*: ${l.notas}` : '';
        }
        const alertText = `🚨 *TRANSFERENCIA ACTIVA* 🚨\n\n👤 *Usuario*: ${jid.split('@')[0]}\n💬 *Resumen IA*: ${summary || 'Sin resumen'}${leadInfo}${notaStr}`;
        await sendText(cesarPhone, alertText);
        if (isSupport && !isSameContact) await sendText(supportPhone, alertText);
    } catch (e) { console.error("Error notifyAdmins:", e); }
}

// ======================================
// PROCESAMIENTO DE MENSAJES GUARDADOS
// ======================================
async function saveMessage(jid: string, role: string, content: string) {
    try {
        await pool.execute('INSERT INTO registraya_whatsapp_messages (jid, role, content) VALUES (?, ?, ?)', [jid, role, content]);
    } catch (_e) { }
}

async function getChatHistory(jid: string) {
    const [rows] = await pool.execute('SELECT role, content FROM registraya_whatsapp_messages WHERE jid = ? ORDER BY created_at DESC LIMIT 10', [jid]);
    return (rows as any[]).reverse();
}

// ======================================
// BUCLE PRINCIPAL DEL WORKER
// ======================================
async function processQueue() {
    try {
        const now = new Date();
        // 1. Buscar mensajes NO procesados cuya ventana de 25s YA haya cerrado (calculado en DB para evitar bugs de Zona Horaria)
        const [rows] = await pool.execute(
            `SELECT id, jid, push_name, combined_content 
             FROM registraya_whatsapp_message_queue 
             WHERE processed = 0 AND created_at <= DATE_SUB(NOW(), INTERVAL 25 SECOND)
             GROUP BY jid 
             ORDER BY MIN(created_at) ASC`
        );
        const pending = rows as { id: number; jid: string; push_name: string; combined_content: string }[];

        if (pending.length > 0) {
            console.log(`🤖 [${now.toISOString()}] Procesando ${pending.length} hilos acumulados...`);
        }

        for (const item of pending) {
            const { jid, push_name, combined_content } = item;

            // 2. Obtener todos los IDs de mensajes de este jid para borrarlo atómicamente
            const [idsRows] = await pool.execute(
                'SELECT id FROM registraya_whatsapp_message_queue WHERE jid = ? AND processed = 0',
                [jid]
            );
            const ids = (idsRows as any[]).map(r => r.id);

            if (ids.length === 0) continue;

            // 3. Concatenar contenido acumulado
            const [allMsgsRows] = await pool.execute(
                `SELECT combined_content FROM registraya_whatsapp_message_queue WHERE id IN (${ids.map(() => '?').join(',')}) ORDER BY created_at ASC`,
                ids
            );
            const fullMessage = (allMsgsRows as any[]).map(r => r.combined_content).join(' ');

            // 4. Marcar como procesados ANTES de llamar a la IA (evitar duplicados si el worker corre de nuevo)
            await pool.execute(
                `DELETE FROM registraya_whatsapp_message_queue WHERE id IN (${ids.map(() => '?').join(',')})`,
                ids
            );

            console.log(`  📩 Processing JID: ${jid.split('@')[0]} -> "${fullMessage.substring(0, 60)}..."`);

            try {
                // 5. Enviar "Escribiendo..." para que el usuario no espere en silencio
                await sendTyping(jid);

                // 6. Guardar en historial
                await saveMessage(jid, 'user', fullMessage);

                // 7. Llamar a la IA
                let botReply = await getBotResponse(fullMessage, jid);

                // 8. Extraer Tags de Control
                let requiresSupport = false;
                let requiresReseller = false;
                let transferSummary = '';

                if (botReply.includes('[TRANSFER_SUPPORT]')) {
                    botReply = botReply.replace(/\[TRANSFER_SUPPORT\]/g, '').trim();
                    requiresSupport = true;
                }
                if (botReply.includes('[TRANSFER_RESELLER]')) {
                    botReply = botReply.replace(/\[TRANSFER_RESELLER\]/g, '').trim();
                    requiresReseller = true;
                }
                const summaryMatch = botReply.match(/\[SUMMARY:(.*?)\]/);
                if (summaryMatch) {
                    transferSummary = summaryMatch[1];
                    botReply = botReply.replace(/\[SUMMARY:.*?\]/g, '').trim();
                }

                // 8.5. Manejo de Guardado de Contacto (Disparado por Tags de la IA)
                if (botReply.includes('[SAVE_CONTACT]')) {
                    const cleanPhone = jid.replace('@s.whatsapp.net', '').replace(/\D/g, '');
                    const nameToSave = push_name || 'Nuevo Cliente ActivaQR';

                    // Guardar en Google Contacts (Silencioso en segundo plano)
                    saveToGoogleContacts(nameToSave, cleanPhone).then(success => {
                        if (success) console.log(`✨ Sincronizado Lead: ${nameToSave}`);
                    });

                    // Enviar imagen del QR de Soporte
                    await sendMedia(jid, 'image', 'https://www.activaqr.com/support_qr_v2.png', 'ActivaQR_Soporte.png', 'image/png');
                    // Esperar un poco para que no lleguen desordenados
                    await new Promise(r => setTimeout(r, 1000));
                    // Enviar tarjeta VCF oficial de ActivaQR
                    await sendMedia(jid, 'document', 'https://www.activaqr.com/api/vcard/activaqr-9ag4', 'Contacto_ActivaQR.vcf');

                    botReply = botReply.replace(/\[SAVE_CONTACT\]/g, '').trim();
                }

                // 9. Enviar respuesta (separada en múltiples globos de chat)
                let messagesToSend: string[] = [];
                if (botReply.includes('[SPLIT]')) {
                    messagesToSend = botReply.split('[SPLIT]').map(m => m.trim()).filter(Boolean);
                } else {
                    const splitIndex = botReply.search(/\n1\./);
                    messagesToSend = splitIndex !== -1
                        ? [botReply.substring(0, splitIndex).trim(), botReply.substring(splitIndex).trim()].filter(Boolean)
                        : [botReply];
                }

                for (let i = 0; i < messagesToSend.length; i++) {
                    const text = messagesToSend[i];
                    await sendText(jid, text);
                    await saveMessage(jid, 'assistant', text);

                    if (i < messagesToSend.length - 1) {
                        await new Promise(r => setTimeout(r, 1500));
                        await sendTyping(jid); // Volver a mostrar "Escribiendo..." para la siguiente burbuja
                    }
                }

                // 10. Notificar admins si hay transferencia
                if (requiresSupport || requiresReseller) {
                    await notifyAdmins(jid, transferSummary, requiresSupport, requiresReseller);
                }

                console.log(`  ✅ Reply sent to ${jid.split('@')[0]}`);
            } catch (aiErr) {
                console.error(`  ❌ Error processing ${jid}:`, aiErr);
                // Si falla la IA, avisar a César
                await sendText("593963410409", `⚠️ Error crítico procesando mensaje de ${jid.split('@')[0]}. Revisar logs del Worker.`);
            }
        }
    } catch (err) {
        console.error("❌ Queue Worker Error:", err);
    } finally {
        // CLAVE: Programar el siguiente ciclo SIEMPRE al final, después del try/finally.
        // Esto garantiza que no overlapen ciclos aunque el procesamiento tarde más de 5s.
        setTimeout(processQueue, POLL_INTERVAL_MS);
    }
}

// ======================================
// ARRANQUE
// ======================================
console.log(`🚀 ActivaQR Message Worker iniciado.`);
console.log(`   - Polling interval: ${POLL_INTERVAL_MS / 1000}s`);
console.log(`   - Accumulation window: ${ACCUMULATION_WINDOW_MS / 1000}s`);
processQueue();
