import OpenAI from 'openai';
import pool from './db';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Busca información de una vCard por número de WhatsApp O Email
 */
export async function lookupUserData(identifier: string) {
    try {
        // Limpiar el identificador (quitar @s.whatsapp.net si es JID)
        const cleanId = identifier.replace('@s.whatsapp.net', '').replace(/\D/g, '');

        const query = `
            SELECT nombre, email, whatsapp, edit_code, edit_uses_remaining, status, slug 
            FROM registraya_vcard_registros 
            WHERE whatsapp LIKE ? OR email = ?
            LIMIT 1
        `;

        const [rows] = await pool.execute(query, [`%${cleanId}%`, identifier]);
        const results = rows as any[];

        if (results.length > 0) {
            return results[0];
        }
        return null;
    } catch (error) {
        console.error("Error looking up user data:", error);
        return null;
    }
}

/**
 * Busca información validando AMBOS datos para mayor seguridad (WhatsApp y Email)
 */
export async function validateUserStrict(whatsapp: string, email: string) {
    try {
        const cleanPhone = whatsapp.replace(/\D/g, '');
        const query = `
            SELECT nombre, email, whatsapp, edit_code, edit_uses_remaining, status, slug 
            FROM registraya_vcard_registros 
            WHERE (whatsapp LIKE ? OR whatsapp = ?) AND email = ?
            LIMIT 1
        `;
        const [rows] = await pool.execute(query, [`%${cleanPhone}%`, whatsapp, email]);
        const results = rows as any[];
        return results.length > 0 ? results[0] : null;
    } catch (error) {
        console.error("Error in strict validation:", error);
        return null;
    }
}

const BOT_PERSONALITY = `
Eres el asistente amable y humano de ActivaQR. 🌟
Tu objetivo es que los usuarios se sientan muy bien atendidos. Usa emojis de forma natural para transmitir calidez y cercanía. ✨

### ESTRUCTURA DE BIENVENIDA (SOLO AL SALUDAR):
Si el usuario dice "Hola", "Buenos días", o inicia la conversación, responde con calidez y presenta estas 2 opciones:

1. *Soporte y Registro QR* 📱 (Ayuda con tu vCard o código de edición).
2. *Información para Revendedores* 🤝 (Gana el 50% de comisión con nuestro sistema SAS).

🚨 IMPORTANTE: NUNCA repitas este menú de opciones si el usuario ya respondió "1" o "2".

---

### REGLAS DE LAS RAMAS (ACCIONES AL RECIBIR '1' O '2'):

**SI EL USUARIO RESPONDE "1" (SOPORTE Y REGISTRO QR):** 
- Responde: "¡Claro que sí! 📱 ¿En qué te puedo ayudar con tu vCard hoy? (Por ejemplo: consultar el estado de tu registro, obtener tu código de edición, etc.)"
- Tu prioridad de ahí en adelante es ayudar con los QR y vCards. 
- Puedes informar sobre: Estado del registro, Código de Edición e Intentos restantes.
- **SEGURIDAD PARA DATOS SENSIBLES**: 
  - Si pide el **Código de Edición** o datos privados, por seguridad DEBES PEDIRLE su **número de WhatsApp y el Correo Electrónico** de registro.
  - Una vez te dé ambos datos, si coinciden en el sistema (ver {{VALIDATED_USER}}), entrégale la información.
  - Si ya te dio sus datos antes, ¡no se los pidas de nuevo!
- Si no puedes resolver su duda, ofrécele pasarle con un *humano*.

**SI EL USUARIO RESPONDE "2" (REVENDEDORES):** 🤝
- Responde: "¡Excelente! 🤝 Con nuestro sistema SAS puedes ganar un 50% de comisión. Te comento que un humano se pondrá en contacto pronto contigo para darte todos los detalles y habilitarte. ¿Tienes alguna pregunta rápida mientras tanto?"

---

### REGLAS DE ORO:
- **Humanidad**: Saluda siempre con alegría. 😊
- **No repitas**: Si el usuario elige "1" o "2", NO le des el menú de nuevo, interactúa directamente con su elección.
- **Validación**: Para dar el Código de Edición, es obligatorio que el usuario proporcione su WhatsApp y Email de registro.
- **Limitaciones**: No puedes modificar la base de datos.
- **Silencio**: Si un humano interviene, tú te quedas en silencio por 24h.

### DATOS DEL SISTEMA:
- **Usuario detectado por WhatsApp**: {{DETECTED_BY_WHATSAPP}}
- **Usuario validado (WhatsApp + Email)**: {{VALIDATED_USER}}
`;

/**
 * Recupera los últimos 10 mensajes de la conversación para dar memoria al bot
 */
export async function getChatHistory(jid: string, limit: number = 10) {
    try {
        const [rows] = await pool.execute(
            'SELECT role, content FROM registraya_whatsapp_history WHERE jid = ? ORDER BY created_at DESC LIMIT ?',
            [jid, limit]
        );
        // Invertir para que estén en orden cronológico
        return (rows as any[]).reverse();
    } catch (error) {
        console.error("Error retrieving chat history:", error);
        return [];
    }
}

/**
 * Guarda un mensaje en el historial
 */
export async function saveMessage(jid: string, role: 'user' | 'assistant' | 'system', content: string) {
    try {
        await pool.execute(
            'INSERT INTO registraya_whatsapp_history (jid, role, content) VALUES (?, ?, ?)',
            [jid, role, content]
        );
    } catch (error) {
        console.error("Error saving message to history:", error);
    }
}

export async function getBotResponse(userMessage: string, remoteJid?: string, history: any[] = []) {
    try {
        let detectedUserStr = "No identificado aún.";
        let validatedUserStr = "Aún no se han validado ambos datos (WhatsApp + Email).";

        // 1. Identificación básica por el número que escribe (auto-identificación)
        if (remoteJid) {
            const userData = await lookupUserData(remoteJid);
            if (userData) {
                detectedUserStr = `${userData.nombre} (${userData.email})`;
            }
        }

        // 2. Obtener historial si no se proporciona (Memoria)
        let chatHistory = history;
        if (chatHistory.length === 0 && remoteJid) {
            chatHistory = await getChatHistory(remoteJid);
        }

        // 3. Intentar validación estricta si el usuario proporcionó un email en la conversación
        const allText = chatHistory.map((h: any) => h.content).join(" ") + " " + userMessage;
        const emailMatch = allText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);

        if (emailMatch && remoteJid) {
            const email = emailMatch[0];
            const validatedData = await validateUserStrict(remoteJid, email);
            if (validatedData) {
                validatedUserStr = `✓ VALIDADO: 
- Nombre: ${validatedData.nombre}
- Código: ${validatedData.edit_code}
- Email: ${validatedData.email}
- WhatsApp: ${validatedData.whatsapp}
- Estado: ${validatedData.status}
- Intentos: ${validatedData.edit_uses_remaining}
- URL: https://activaqr.com/p/${validatedData.slug}`;
            }
        }

        const personality = BOT_PERSONALITY
            .replace('{{DETECTED_BY_WHATSAPP}}', detectedUserStr)
            .replace('{{VALIDATED_USER}}', validatedUserStr);

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: personality },
                ...chatHistory,
                { role: 'user', content: userMessage },
            ],
            temperature: 0.7,
            max_tokens: 600,
        });

        return response.choices[0]?.message?.content || "¡Hola! 😊 ¿Cómo puedo ayudarte?";
    } catch (error) {
        console.error("Error in OpenAI Bot Logic:", error);
        return "¡Hola! 😊 Gracias por escribirnos. Un humano te ayudará pronto.";
    }
}
