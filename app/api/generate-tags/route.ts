import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const { company, bio, products, plan } = await req.json();

        const tagCount = plan === 'pro' ? 30 : 20;

        const combinedText = `
            Negocio: ${company || ''}
            Descripción: ${bio || ''}
            Productos/Servicios: ${products || ''}
        `.trim();

        if (!combinedText || combinedText.length < 5) {
            return NextResponse.json({ error: 'Falta información para generar etiquetas' }, { status: 400 });
        }

        const prompt = `Actúa como un experto en marketing y SEO en Ecuador. 
Genera una lista de exactamente ${tagCount} etiquetas o palabras clave únicas y efectivas basadas en la siguiente información de un negocio:
---
${combinedText}
---
Las etiquetas deben ser términos que los clientes en Ecuador usarían para buscar estos servicios específicamente.
Usa terminología local ecuatoriana.
Formato: Devuelve SOLO las etiquetas separadas por comas, sin numeración, sin tildes si es posible para SEO, ni texto adicional.`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Eres un asistente ecuatoriano experto en SEO local." },
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
        });

        const tags = response.choices[0].message.content?.trim();

        return NextResponse.json({ tags });
    } catch (error) {
        console.error('Error generating tags:', error);
        return NextResponse.json({ error: 'Error al generar etiquetas' }, { status: 500 });
    }
}
