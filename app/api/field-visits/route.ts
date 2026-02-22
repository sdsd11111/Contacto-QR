import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import OpenAI from 'openai';

const openai = new OpenAI();

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get('seller_id');
    const limitDays = searchParams.get('days') || '7'; // Por defecto últimos 7 días

    if (!sellerId) {
        return NextResponse.json({ error: 'Seller ID requerido' }, { status: 400 });
    }

    try {
        const query = `
            SELECT 
                id,
                business_name as businessName,
                contact_name as contactName,
                result,
                location_sector as sector,
                created_at as date
            FROM registraya_vcard_field_visits 
            WHERE seller_id = ? 
              AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
            ORDER BY created_at DESC
        `;
        const [rows] = await pool.execute(query, [sellerId, limitDays]);

        return NextResponse.json({ success: true, data: rows });
    } catch (err: any) {
        console.error('Error fetching field visits:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
        const body = await req.json();
        const {
            sellerId,
            businessName,
            contactName,
            category,
            sector,
            result,
            objection,
            notes,
            highTicket,
            lat,
            lng,
            followUpDate // From UI
        } = body;

        if (!sellerId || !businessName || !category || !result) {
            return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
        }

        // 1. Insert Field Visit
        const insertVisitQuery = `
            INSERT INTO registraya_vcard_field_visits (
                seller_id, business_name, contact_name, business_category, 
                result, main_objection, notes, high_ticket_signal, 
                location_sector, latitude, longitude
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [visitResult]: any = await connection.execute(insertVisitQuery, [
            sellerId,
            businessName,
            contactName || null,
            category,
            result,
            objection || null,
            notes || null,
            highTicket ? 1 : 0,
            sector || null,
            lat || null,
            lng || null
        ]);

        const visitId = visitResult.insertId;

        // 2. Insert Follow-up if result is 'seguimiento'
        if (result === 'seguimiento') {
            let dateStr = followUpDate || new Date(Date.now() + 86400000).toISOString().split('T')[0];
            let messageStr = `Hola ${contactName || 'que tal'}, soy de ActivaQR. Le visité en ${businessName} y me gustaría retomar nuestra conversación. ¿Tiene un momento esta semana?`;
            let aiReasoning = null;

            try {
                // Fetch seller name for prompt personalization
                const [sellerRows]: any = await connection.execute('SELECT nombre FROM registraya_vcard_sellers WHERE id = ?', [sellerId]);
                const sellerName = sellerRows.length > 0 ? sellerRows[0].nombre.split(' ')[0] : 'un asesor';

                const prompt = `
Eres un asistente experto en ventas B2B para ActivaQR. La fecha y hora actual es: ${new Date().toISOString()}.
Un vendedor llamado "${sellerName}" acaba de registrar una visita de campo:
- Negocio: ${businessName} (categoría: ${category})
- Contacto: ${contactName || 'El encargado'}
- Zona: ${sector || 'No especificada'}
- Objeción principal indicada: ${objection || 'Ninguna objeción fuerte'}
- Señal High-Ticket: ${highTicket ? 'SÍ (cliente de alto valor potencial)' : 'NO'}

Tu misión:
1. Analizar la visita y sugerir la fecha ideal de seguimiento (en formato YYYY-MM-DD). Toma en cuenta la objeción: si dijo "vuelve la otra semana", la fecha debe reflejar eso. Si no hay objeción fuerte, usualmente 1 a 3 días es lo ideal.
2. Escribir un mensaje de WhatsApp rompehielo inicial. Debe sonar sumamente humano, natural, empático y NO corporativo. Mínimo uso de emojis (1 o 2 máximo). NUNCA parezcas un bot automático.

Responde ÚNICAMENTE con este JSON estrictamente válido:
{
  "suggested_date": "YYYY-MM-DD",
  "whatsapp_message": "El mensaje redactado para el vendedor enviar",
  "reasoning": "Breve justificación de por qué elegiste esa fecha y ese enfoque en el mensaje"
}
                `;

                const completion = await openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [{ role: "user", content: prompt }],
                    response_format: { type: "json_object" }
                });

                if (completion.choices[0].message.content) {
                    const aiData = JSON.parse(completion.choices[0].message.content);
                    if (aiData.suggested_date) dateStr = aiData.suggested_date;
                    if (aiData.whatsapp_message) messageStr = aiData.whatsapp_message;
                    if (aiData.reasoning) aiReasoning = aiData.reasoning;
                }
            } catch (aiErr) {
                console.error("OpenAI Fallback error:", aiErr);
            }

            const insertFollowUpQuery = `
                INSERT INTO registraya_vcard_follow_ups (
                    visit_id, seller_id, scheduled_date, ai_suggested_date, ai_reasoning, whatsapp_message, status
                ) VALUES (?, ?, ?, ?, ?, ?, 'pendiente')
            `;

            await connection.execute(insertFollowUpQuery, [
                visitId,
                sellerId,
                dateStr,        // scheduled_date
                dateStr,        // ai_suggested_date (we use the same for now)
                aiReasoning,    // ai_reasoning
                messageStr      // whatsapp_message
            ]);
        }

        await connection.commit();

        return NextResponse.json({
            success: true,
            data: { id: visitId }
        });

    } catch (err: any) {
        await connection.rollback();
        console.error('Error creating field visit:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    } finally {
        connection.release();
    }
}
