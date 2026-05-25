import { NextResponse } from 'next/server';
import crypto from 'crypto';
import pool from '@/lib/db';
import { saveToGoogleContacts } from '@/lib/google-contacts';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { telefono, nombre, email, acepta_comercial, acepta_exito } = body;

        if (!telefono || !nombre) {
            return NextResponse.json({ error: "Teléfono y nombre son requeridos" }, { status: 400 });
        }

        const audit_id = crypto.randomUUID();
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown IP';
        const user_agent = request.headers.get('user-agent') || 'Unknown UA';
        
        // TODO(TEMPORAL): Actualmente el sistema acepta correos repetidos.
        // Se deja así temporalmente hasta terminar de afinar al 100% el proceso, 
        // luego se deberá implementar la validación para correos únicos.
        
        // 1. Insertar en tabla consentimientos
        await pool.execute(
            `INSERT INTO consentimientos 
             (telefono, nombre, email, acepta_comercial, acepta_exito, ip, user_agent, version_politica, url_origen, audit_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                telefono, 
                nombre, 
                email || null, 
                acepta_comercial ? 1 : 0, 
                acepta_exito ? 1 : 0, 
                ip, 
                user_agent, 
                'v2.0', 
                request.url, 
                audit_id
            ]
        );

        // 2. Enviar webhook al bot (consentimiento)
        const botConsentimientoUrl = process.env.BOT_CONSENTIMIENTO_URL;
        
        if (botConsentimientoUrl) {
            try {
                const webhookPayload = {
                    numero: telefono,
                    nombre: nombre,
                    email: email || null,
                    acepta_comercial: acepta_comercial ? true : false,
                    version: 'v2.0-ADN',
                    url_origen: request.url
                };

                const botResponse = await fetch(botConsentimientoUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(webhookPayload)
                });

                if (botResponse.ok) {
                    console.log(`[Privacidad API] Webhook enviado al bot exitosamente`);
                } else {
                    console.warn(`[Privacidad API] Bot respondió con error: ${botResponse.status} ${botResponse.statusText}`);
                }
            } catch (botErr) {
                console.error(`[Privacidad API] Error enviando webhook al bot:`, botErr);
            }
        } else {
            console.warn(`[Privacidad API] BOT_CONSENTIMIENTO_URL no configurada, no se envió webhook`);
        }

        // 3. Notificar al bot (activaqr-harness) para Google Contacts
        const botUrl = process.env.BOT_URL || 'http://localhost:4000';
        const botToken = process.env.BOT_INTERNAL_TOKEN || 'activaqr-internal-2026';
        
        let botSuccess = false;
        try {
            const botResponse = await fetch(`${botUrl}/internal/autorizar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-internal-token': botToken
                },
                body: JSON.stringify({ telefono, nombre })
            });

            if (botResponse.ok) {
                botSuccess = true;
            } else {
                console.warn(`[Privacidad API] Bot respondió con error: ${botResponse.status} ${botResponse.statusText}`);
            }
        } catch (botErr) {
            console.error(`[Privacidad API] Error conectando al bot en ${botUrl}:`, botErr);
        }

        // 3. Condición para Google Contacts
        if (botSuccess) {
            try {
                const cleanPhone = telefono.replace(/\\D/g, '');
                await saveToGoogleContacts(nombre, cleanPhone);
                console.log(`[Privacidad API] Sincronizado Lead con Google Contacts: ${nombre}`);
            } catch (gcErr) {
                console.error(`[Privacidad API] Error al guardar en Google Contacts:`, gcErr);
            }
        } else {
            console.log(`[Privacidad API] No se guardó en Google Contacts porque falló la conexión al bot o respondió error.`);
        }

        return NextResponse.json({ success: true, auditId: audit_id, botSuccess });

    } catch (error: any) {
        console.error("Privacidad API Error:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
