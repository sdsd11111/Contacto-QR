import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
    try {
        const openai = new OpenAI({
            baseURL: 'https://api.deepseek.com',
            apiKey: process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY,
        });

        const { text } = await req.json();

        if (!text || text.length < 10) {
            return NextResponse.json({ error: 'Texto insuficiente para procesar' }, { status: 400 });
        }

        const prompt = `Actúa como un experto en estructuración de datos para catálogos de servicios. 
Tu tarea es convertir un texto plano que describe los servicios de un negocio en un formato JSON específico para una interfaz de usuario premium.

ESQUEMA REQUERIDO:
Un arreglo de categorías, donde cada categoría tiene un nombre y un arreglo de items.
[
  {
    "name": "Nombre de la Categoría",
    "items": [
      { 
        "name": "Nombre del Servicio", 
        "price": "Precio (o 'Desde $X' o 'Consulta')", 
        "desc": "Breve descripción seductora", 
        "tags": ["Tag1", "Tag2"], 
        "highlight": boolean (true si es un servicio estrella),
        "size": "Opcional (ej: '60 min' o '1 unidad')"
      }
    ]
  }
]

REGLAS:
1. Agrupa los servicios lógicamente en categorías (ej: Peluquería, Spa, Uñas).
2. Si el texto no menciona precios, pon "Consulta" o inventa rangos lógicos basados en el mercado ecuatoriano si parece apropiado (ej: Cortes $10-$20).
3. Asegúrate de que el JSON sea VÁLIDO y no contenga texto adicional fuera del bloque de código.
4. Usa terminología profesional y atractiva.
5. Identifica al menos 2 servicios como 'highlight: true' basándote en la importancia que le de el usuario en el texto.

TEXTO A PROCESAR:
---
${text}
---

RESPUESTA:
Devuelve SOLAMENTE el JSON puro. Sin bloques de markdown (\`\`\`json), solo el contenido.`;

        const response = await openai.chat.completions.create({
            model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
            messages: [
                { role: "system", content: "Eres un experto en estructuración de catálogos y JSON." },
                { role: "user", content: prompt }
            ],
            temperature: 0.3,
            max_tokens: 2000,
        });

        const content = response.choices[0].message.content?.trim();
        
        // Limpiar posible markdown si la IA lo incluyó por error
        const cleanContent = content?.replace(/```json/g, '').replace(/```/g, '').trim();

        return NextResponse.json({ json: cleanContent });
    } catch (error: any) {
        console.error('Error in structure-menu API:', error);
        return NextResponse.json({
            error: 'Error al procesar con IA',
            details: error.message || 'Error desconocido'
        }, { status: 500 });
    }
}
