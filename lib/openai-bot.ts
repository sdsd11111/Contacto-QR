import OpenAI from 'openai';
import pool from './db';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Busca información de una vCard
 */
export async function lookupUserData(identifier: string) {
    try {
        const cleanId = identifier.replace('@s.whatsapp.net', '').replace(/\D/g, '');
        const query = `
            SELECT nombre, email, whatsapp, edit_code, edit_uses_remaining, status, slug 
            FROM registraya_vcard_registros 
            WHERE whatsapp LIKE ? OR email = ?
            LIMIT 1
        `;
        const [rows] = await pool.execute(query, [`%${cleanId}%`, identifier]);
        const results = rows as any[];
        return results.length > 0 ? results[0] : null;
    } catch (error) {
        console.error("Error lookupUserData:", error);
        return null;
    }
}

/**
 * Validación estricta
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
        console.error("Error validateUserStrict:", error);
        return null;
    }
}

const BOT_PERSONALITY = `
Eres el "Asesor Estratégico" de ActivaQR. 🚀
Tu objetivo: Vender el "Contacto Digital", reclutar socios SAS y brindar un soporte experto y RESPETUOSO.

### 🎭 TONO Y PERSONALIDAD:
- **Semiprofesional y Cercano**: Usa un lenguaje educado pero cálido. Evita el "voseo" excesivo o la confianza exagerada. Trata al usuario con respeto ("Usted" o un "Tú" muy profesional).
- **No seas un robot**: Responde de forma fluida. Si el usuario envía varios mensajes, asúmelo como una sola idea.
- **Ecuador/Loja**: Conoces el contexto local. Eres amable y servicial.

### 📝 REGLAS ESTRICTAS DE FORMATO (¡CRÍTICO PARA WHATSAPP!):
- **PROHIBIDO LOS PÁRRAFOS LARGOS**: Nunca escribas más de 2 o 3 oraciones seguidas.
- **MÚLTIPLES BURBUJAS DE TEXTO (HUMANIZACIÓN)**: Para simular que eres humano, NUNCA envíes un solo bloque gigante de texto. Usa el separador \`[SPLIT]\` en medio de tu respuesta para enviar 2 o 3 globos de mensajes separados. Ejemplo: "¡Hola! Un gusto saludarte. [SPLIT] Te confirmo que las comisiones son..."
- **SALTOS DE LÍNEA**: Además de usar \`[SPLIT]\`, usa saltos de línea dobles (\n\n) entre cada idea dentro de una misma burbuja para darle aire visual.
- **EMOJIS NATURALES**: Usa de 1 a 3 emojis por respuesta para no verse seco, pero no exageres. Úsalos estratégicamente al final de las frases.
- **CONCISIÓN**: Sé directo al punto. No des explicaciones redundantes.

### 🚫 CONTROL DE EMOCIONES:
Si detectas que el usuario está enfadado o frustrado (insultos, desesperación):
1. **Pausa total**: No intentes vender nada más.
2. **Disculpa Sincera**: "Lamento mucho que esté pasando por este inconveniente. No es nuestra intención causarle molestias."
3. **Handoff Inmediato**: "Para solucionarlo de la mejor manera, voy a transferirle ahora mismo con César, nuestro director, para que le atienda personalmente."
4. **Tag**: Incluye [TRANSFER_SUPPORT] y un [SUMMARY: El cliente está muy molesto con X].

### 💰 ESTRATEGIA ABC & ENGAGEMENT:
- Término clave: **"Contacto Digital"**.
- Cierra con **preguntas abiertas** para generar interacción y feedback:
  - "¿Cómo cree que el Contacto Digital podría facilitarle el cierre de ventas en su día a día?"
  - "De lo que hemos conversado, ¿qué es lo que más le llama la atención para su tipo de negocio?"
  - "¿Le gustaría que le guíe ahora mismo para activar el suyo o prefiere que un experto coordine con usted?"

### 🤝 ALIANZA SAS (REVENDEDORES):
- Comisiones: "Gana hasta el 50%".
- Aclara: "Se empieza con un excelente 30% y se escala según su red de ventas".

### 📋 EJEMPLOS DE TONO (FEW-SHOT):
- Usuario: "Hola, ¿cómo funciona eso?"
- Bot: "¡Qué tal! Un gusto saludarle. El Contacto Digital es una herramienta que guarda sus datos directamente en el celular de su cliente con un solo escaneo. ¿En qué área trabaja usted actualmente? Así puedo decirle cómo le sacaría el mayor provecho."

### REGLAS TÉCNICAS (SÓLO PARA TI):
Al final de CADA respuesta, incluye el bloque [DATA] JSON. No lo olvides nunca.
[DATA]
{
  "state": "buying | reseller | help | angry",
  "lead": {
    "nombre": "string", "negocio": "string", "profesion": "string", "ciudad": "string", "canton": "string",
    "edad": "string", "estado_civil": "string", "horarios": "string",
    "potencial_web": boolean, "potencial_auto": boolean, "puntuacion_calidad": 1-10,
    "notas": "string (detalles extra importantes)"
  },
  "summary": "Resumen breve para César",
  "transfer": "SUPPORT | RESELLER | NONE"
}
[/DATA]

### BIENVENIDA:
1. Crear mi Contacto Digital (Registro Rápido) 📱
2. Alianza SAS (Ganar hasta el 50%) 🤝
`;

/**
 * Historial
 */
export async function getChatHistory(jid: string, limit: number = 10) {
    try {
        const [rows] = await pool.execute(
            'SELECT role, content FROM registraya_whatsapp_history WHERE jid = ? ORDER BY created_at DESC LIMIT ?',
            [jid, limit]
        );
        return (rows as any[]).reverse();
    } catch (e) { return []; }
}

/**
 * Guardar mensaje
 */
export async function saveMessage(jid: string, role: string, content: string) {
    try {
        await pool.execute('INSERT INTO registraya_whatsapp_history (jid, role, content) VALUES (?, ?, ?)', [jid, role, content]);
    } catch (e) { }
}

/**
 * Upsert Lead
 */
export async function upsertLeadData(jid: string, leadData: any, state: string) {
    try {
        const query = `
            INSERT INTO registraya_whatsapp_leads 
            (jid, nombre, negocio, profesion, ciudad, canton, edad_propietario, estado_civil, horarios, potencial_web, potencial_auto, interes, estado_conversacion, puntuacion_calidad, deep_profile, notas)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            nombre = VALUES(nombre), negocio = VALUES(negocio), profesion = VALUES(profesion), ciudad = VALUES(ciudad), canton = VALUES(canton),
            edad_propietario = VALUES(edad_propietario), estado_civil = VALUES(estado_civil), horarios = VALUES(horarios),
            potencial_web = VALUES(potencial_web), potencial_auto = VALUES(potencial_auto), interes = VALUES(interes),
            estado_conversacion = VALUES(estado_conversacion), puntuacion_calidad = VALUES(puntuacion_calidad), deep_profile = VALUES(deep_profile), notas = VALUES(notas)
        `;
        const interesMap: any = { buying: 'VENTA_DIRECTA', reseller: 'RESELLER' };
        await pool.execute(query, [jid, leadData.nombre || null, leadData.negocio || null, leadData.profesion || null, leadData.ciudad || null, leadData.canton || null, leadData.edad || null, leadData.estado_civil || null, leadData.horarios || null, leadData.potencial_web ? 1 : 0, leadData.potencial_auto ? 1 : 0, interesMap[state] || 'UNKNOWN', state || null, leadData.puntuacion_calidad || 0, JSON.stringify(leadData), leadData.notas || null]);
    } catch (e) { console.error("upsertLeadData error", e); }
}

/**
 * Metadata Sesión
 */
export async function updateSessionMetadata(jid: string, state: string, metadata: any) {
    try {
        await pool.execute('UPDATE registraya_whatsapp_sessions SET bot_state = ?, bot_metadata = ? WHERE jid = ?', [state, JSON.stringify(metadata), jid]);
    } catch (e) { }
}

export async function getBotResponse(userMessage: string, remoteJid?: string, history: any[] = []) {
    try {
        let validatedUserStr = "No validado.";
        let currentMetadata = {};

        if (remoteJid) {
            const [sessionRows] = await pool.execute('SELECT bot_state, bot_metadata FROM registraya_whatsapp_sessions WHERE jid = ?', [remoteJid]);
            const sessions = sessionRows as any[];
            if (sessions.length > 0) currentMetadata = sessions[0].bot_metadata || {};
        }

        let chatHistory = history;
        if (chatHistory.length === 0 && remoteJid) chatHistory = await getChatHistory(remoteJid);

        const allText = chatHistory.map((h: any) => h.content).join(" ") + " " + userMessage;
        const emailMatch = allText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        if (emailMatch && remoteJid) {
            const validatedData = await validateUserStrict(remoteJid, emailMatch[0]);
            if (validatedData) validatedUserStr = `✓ ${validatedData.nombre} (${validatedData.email})`;
        }

        const aiResponse = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{ role: 'system', content: BOT_PERSONALITY.replace('{{METADATA}}', JSON.stringify(currentMetadata)).replace('{{VALIDATED_USER}}', validatedUserStr) }, ...chatHistory, { role: 'user', content: userMessage }],
            temperature: 0.7,
            max_tokens: 1000,
        });

        let botReply = aiResponse.choices[0]?.message?.content || "";
        const dataMatch = botReply.match(/\[DATA\]([\s\S]*?)\[\/DATA\]/);

        if (dataMatch && remoteJid) {
            try {
                const extracted = JSON.parse(dataMatch[1]);
                botReply = botReply.replace(/\[DATA\][\s\S]*?\[\/DATA\]/, "").trim();
                await updateSessionMetadata(remoteJid, extracted.state, extracted.lead);
                await upsertLeadData(remoteJid, extracted.lead, extracted.state);

                if (extracted.summary) botReply += ` [SUMMARY:${extracted.summary}]`;

                // FAIL-SAFE: Si el estado es 'angry' o 'help' o incluye palabras clave de handoff
                const lowerReply = botReply.toLowerCase();
                const needsHuman = ["cesar", "director", "asesor personal", "experto", "solucionar personalmente"].some(k => lowerReply.includes(k));

                if (extracted.transfer === "SUPPORT" || extracted.state === "angry" || needsHuman) {
                    botReply += " [TRANSFER_SUPPORT]";
                }
                if (extracted.transfer === "RESELLER") {
                    botReply += " [TRANSFER_RESELLER]";
                }
            } catch (err) { }
        }

        return botReply || "¡Hola! ¿Cómo puedo ayudarle hoy?";
    } catch (e) { return "Un asesor le ayudará pronto."; }
}
