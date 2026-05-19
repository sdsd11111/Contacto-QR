import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

function repairTruncatedJsonExhaustive(str: string | null | undefined): any[] | null {
    if (!str) return null;
    const trimmed = str.trim();
    
    // Intentar parsing estándar primero
    try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed;
    } catch (e) {
        // Continuar con reparación
    }

    const candidates = [
        '',
        ']',
        '}',
        '}]',
        '}}]',
        ']}]',
        '}]}]',
        '"}]',
        '"}',
        ',""}]',
        ',[]}]',
        '}]}',
        ']}'
    ];

    for (let i = trimmed.length; i > 0; i--) {
        const sub = trimmed.substring(0, i);
        for (const cand of candidates) {
            try {
                const repaired = sub + cand;
                const parsed = JSON.parse(repaired);
                if (Array.isArray(parsed)) {
                    return parsed;
                }
            } catch (err) {
                // ignorar
            }
        }
    }
    return null;
}

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
        "price": "Precio (ej: '15.00', 'Desde $10' o 'Consulta')", 
        "desc": "Descripción muy breve (máximo 8 palabras)"
      }
    ]
  }
]

REGLAS STRICT:
1. Agrupa los servicios lógicamente en categorías basadas en el texto (ej: Peluquería Profesional, Nail Spa & Estética, Maquillaje & Eventos).
2. Si el texto no menciona precios, pon "Consulta" o inventa un precio lógico coherente (ej: "15.00", "20.00").
3. NO agregues campos extras como "tags", "highlight", "size" o "image" que no estén en el esquema. Esto es sumamente importante para reducir tamaño.
4. Mantén las descripciones extremadamente cortas (máximo 8 palabras) para conservar tokens y acelerar el tiempo de respuesta.
5. Asegúrate de que el JSON sea válido. Devuelve SOLAMENTE el JSON puro, sin bloques markdown (\`\`\`json).

TEXTO A PROCESAR:
---
${text}
---

RESPUESTA:`;

        const response = await openai.chat.completions.create({
            model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
            messages: [
                { role: "system", content: "Eres un experto en estructuración de catálogos que responde únicamente con arreglos JSON válidos y limpios." },
                { role: "user", content: prompt }
            ],
            temperature: 0.3,
            max_tokens: 4000,
        });

        const content = response.choices[0].message.content?.trim() || '';
        
        // Limpiar posible markdown si la IA lo incluyó por error
        const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();

        // Aplicar auto-reparación preventiva si el JSON está truncado o malformado
        const repairedArray = repairTruncatedJsonExhaustive(cleanContent);
        if (repairedArray) {
            return NextResponse.json({ json: JSON.stringify(repairedArray) });
        }

        return NextResponse.json({ json: cleanContent });
    } catch (error: any) {
        console.error('Error in structure-menu API:', error);
        return NextResponse.json({
            error: 'Error al procesar con IA',
            details: error.message || 'Error desconocido'
        }, { status: 500 });
    }
}
