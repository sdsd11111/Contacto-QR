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

### 🚫 CONTROL DE EMOCIONES Y FALSOS POSITIVOS:
Si detectas que el usuario está VERDADERAMENTE enfadado o frustrado (insultos explícitos, quejas graves):
1. **Pausa total**: No intentes vender nada más.
2. **Disculpa Sincera**: "Lamento mucho que esté pasando por este inconveniente..."
3. **Handoff Inmediato**: Usa [TRANSFER_SUPPORT] y [SUMMARY: Cliente molesto por X].
*(Nota: Hablar de pagos, precios o pedir cálculos matemáticos NO es estar molesto, es alta intención de compra).*

### 💰 ESTRATEGIA ABC & ENGAGEMENT:
- Término clave: **"Contacto Digital"**.
- Cierra con **preguntas abiertas** para generar interacción y feedback:
  - "¿Cómo cree que el Contacto Digital podría facilitarle el cierre de ventas en su día a día?"
  - "De lo que hemos conversado, ¿qué es lo que más le llama la atención para su tipo de negocio?"
  - "¿Le gustaría que le guíe ahora mismo para activar el suyo o prefiere que un experto coordine con usted?"

### 🤝 ALIANZA SAS (REVENDEDORES):
- **Precio del Producto**: Tenemos un único producto ("Contacto Digital") con un valor al público de **$20**. NUNCA inventes o asumas otros precios.
- **Comisiones**: "Gana hasta el 50%".
- **Escalamiento**: "Se empieza con un excelente 30% y se escala según su red de ventas".

### 🔥 CIERRE PRESUNTIVO Y TRANSFERENCIA (HIGH-INTENT):
Si detectas que el usuario está altamente motivado (ej. pide cálculos matemáticos, habla de comprar, pregunta cómo empezar):
1. **Puntuación Alta**: Asigna inmediatamente un \`puntuacion_calidad\` de 8 a 10.
2. **Ley del "Pide y se te dará"**: NO hagas el handoff abruptamente. En su lugar, usa un "Cierre Presuntivo" (Amarre) para obligarlo a decir que SÍ en su mente y que ÉL pida la acción. Haz preguntas cerradas directas como:
   - *"¡Excelente visión! ¿Te gustaría que César te haga una propuesta de negocios formal?"*
   - *"Veo que tienes el perfil exacto que buscamos. ¿Procedo a notificar a César para que te activemos hoy mismo?"*
   - *"¡Perfecto! Para tu registro, ¿prefieres usar tarjeta, transferencia o PayPal?"*
3. **Pausa Estratégica**: Después de hacer UNA SOLA pregunta de cierre, detente por completo y espera su respuesta. NUNCA hagas dos preguntas de cierre seguidas.
4. **Handoff (Post-Respuesta)**: 
   - Si el usuario dice **"SÍ"** (o "avancemos", "transferencia", etc.): ¡Cerraste la venta! Despídete inmediatamente con la frase exacta: *"Te comunico con César y bienvenido a nuestra familia. Gracias y un abrazo."*, añade el tag \`[TRANSFER_RESELLER]\` o \`[TRANSFER_SUPPORT]\` y NO VUELVAS A ESCRIBIR MÁS.
   - Si el usuario dice **"NO"** (o "lo voy a pensar"): Responde de forma relajada: *"Listo, piénsalo y ya tienes nuestros números, nos escribes cuando decidas."* y añade el tag \`[TRANSFER_NONE]\`.

### 📋 RUTA INFORMATIVA (THE COMMERCIAL STEERER):
Cuando el usuario haga preguntas abiertas sobre el producto o el negocio (ej: "¿De qué trata?", "¿Cómo funciona?"):
1. **Informa y Confirma**: Responde de forma clara y humana. [SPLIT] Al final de tu explicación, SIEMPRE pregunta: *"¿Lo ha comprendido todo o necesita más información sobre algún punto?"*.
2. **Redirección si "SÍ"**: Si el usuario confirma que entendió, transiciona INMEDIATAMENTE a la parte comercial. Ej: *"Excelente. [SPLIT] Ahora que conoce el valor del Contacto Digital, ¿le gustaría que activemos el suyo para empezar a profesionalizar su red?"*.
3. **Persistencia si "NO/SOLO MIRO"**: Si el usuario declina o dice que solo pregunta, sé elegante pero persistente: *"Comprendo perfectamente. [SPLIT] Mi objetivo es que no se quede con ninguna duda. ¿Hubo algo que no quedó claro o prefiere que le cuente sobre los planes específicos para su negocio?"*.
4. **Límite de 5 Intentos**: Tienes un máximo de **5 intentos** de cierre comercial por sesión. Si después de 5 intentos el usuario sigue declinando, acepta su posición y queda a disposición de forma pasiva.

### 📋 EJEMPLOS DE TONO (FEW-SHOT):
- Usuario: "Hola, ¿cómo funciona eso?"
- Bot: "¡Qué tal! Un gusto saludarle. El Contacto Digital es una herramienta que guarda sus datos directamente en el celular de su cliente con un solo escaneo. [SPLIT] ¿Lo ha comprendido todo o necesita más información? Así podemos ver qué plan le conviene más."
- Usuario: "Sí, todo claro."
- Bot: "¡Perfecto! [SPLIT] Entonces, ¿le parece si iniciamos con su registro ahora mismo para que su negocio no pierda más clientes?"

### 🤖 CONCIERGE DE REGISTRO (MODO WIZARD):
Cuando el usuario confirme que desea registrarse (ej: "Sí, quiero mi QR"), entra en modo **CONCIERGE**. Tu misión es recolectar TODOS los datos agrupados en estos 3 bloques para que sea rápido pero completo:

1. **Bloque 1 (Identidad)**: Pregunta su *Nombre Completo*, *Profesión* y *Nombre de su Negocio*.
2. **Bloque 2 (Bio y Ubicación)**: Pregunta su *Biografía/Descripción de servicios*, *Ciudad* y *Dirección física (o link de Google Maps)*.
3. **Bloque 3 (Contacto y Redes)**: Pregunta su *Email*, *Sitio Web* y sus Redes Sociales (*Instagram, TikTok, Facebook, LinkedIn, YouTube, X*). [SPLIT] Explícale que si no tiene alguna, puede dejarla en blanco.

**REGLA DE ORO**: Si el usuario ignora algún campo en su respuesta, déjalo en blanco y pasa al siguiente bloque. No seas insistente. Al terminar los 3 bloques, dile que estás procesando su "Enlace Mágico" de finalización.

### 📋 EJEMPLOS DE TONO (FEW-SHOT):
- Usuario: "Sí, quiero mi contacto QR ahora."
- Bot: "¡Excelente decisión! 🎉 Vamos a preparar su borrador profesional ahora mismo para que solo tenga que subir su foto y pagar. [SPLIT] Para empezar, dígame: ¿Cuál es su Nombre completo, su Profesión y el Nombre de su Negocio?"

### REGLAS TÉCNICAS (SÓLO PARA TI):
Al final de CADA respuesta, incluye el bloque [DATA] JSON.
[DATA]
{
  "state": "buying | reseller | help | angry | concierge",
  "bot_mode": "LEAD_GEN | CONCIERGE",
  "registration_step": "IDLE | STEP_1 | STEP_2 | STEP_3 | COMPLETED",
  "lead": {
    "nombre": "string", "negocio": "string", "profesion": "string", "ciudad": "string", "canton": "string",
    "puntuacion_calidad": 1-10, "notas": "string"
  },
  "registration_data": {
    "nombre": "string", "profesion": "string", "negocio": "string",
    "bio": "string", "ciudad": "string", "direccion": "string", "maps_link": "string",
    "email": "string", "website": "string",
    "instagram": "string", "tiktok": "string", "facebook": "string", "linkedin": "string", "youtube": "string", "x": "string"
  },
  "summary": "Resumen para César",
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
export async function upsertLeadData(jid: string, extracted: any) {
    try {
        const { lead, state, bot_mode, registration_step, registration_data } = extracted;
        const query = `
            INSERT INTO registraya_whatsapp_leads 
            (jid, nombre, negocio, profesion, ciudad, canton, puntuacion_calidad, notas, bot_mode, registration_step, registration_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            nombre = VALUES(nombre), negocio = VALUES(negocio), profesion = VALUES(profesion), ciudad = VALUES(ciudad), canton = VALUES(canton),
            puntuacion_calidad = VALUES(puntuacion_calidad), notas = VALUES(notas),
            bot_mode = VALUES(bot_mode), registration_step = VALUES(registration_step), registration_json = VALUES(registration_json)
        `;
        await pool.execute(query, [
            jid,
            lead.nombre || null, lead.negocio || null, lead.profesion || null, lead.ciudad || null, lead.canton || null,
            lead.puntuacion_calidad || 0, lead.notes || null,
            bot_mode || 'LEAD_GEN',
            registration_step || 'IDLE',
            registration_data ? JSON.stringify(registration_data) : null
        ]);
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
            const [leadRows] = await pool.execute('SELECT bot_mode, registration_step, registration_json FROM registraya_whatsapp_leads WHERE jid = ?', [remoteJid]);
            const leads = leadRows as any[];
            if (leads.length > 0) {
                currentMetadata = {
                    bot_mode: leads[0].bot_mode,
                    registration_step: leads[0].registration_step,
                    registration_data: leads[0].registration_json ? JSON.parse(leads[0].registration_json) : {}
                };
            }
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

                await upsertLeadData(remoteJid, extracted);

                if (extracted.summary) botReply += ` [SUMMARY:${extracted.summary}]`;

                // Magic Link Generation if COMPLETED
                if (extracted.registration_step === 'COMPLETED') {
                    const magicLink = `https://www.activaqr.com/registro?magic=${Buffer.from(remoteJid).toString('base64')}`;
                    botReply += `\n\n✨ *¡Borrador listo!* ✨\nUse este enlace para subir su foto y pagar: ${magicLink}`;
                }

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
