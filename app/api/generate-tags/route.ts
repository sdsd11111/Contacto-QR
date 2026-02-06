import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
    try {
        const { profession, bio } = await req.json();

        if (!profession) {
            return NextResponse.json({ error: 'La profesión es requerida' }, { status: 400 });
        }

        const prompt = `Actúa como un experto en marketing y SEO en Ecuador. 
Genera una lista de exactamente 20 etiquetas o palabras clave relacionadas con la profesión: "${profession}" y la descripción: "${bio || ''}".
Las etiquetas deben ser términos que los clientes en Ecuador usarían para buscar estos servicios.
Usa terminología local (ej. "plomero" en lugar de "fontanero" si aplica, aunque sepamos que se entienden ambos).
Formato: Devuelve solo las etiquetas separadas por comas, sin numeración ni texto adicional.`;

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
