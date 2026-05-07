import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.GOOGLE_AI_API_KEY;

        if (!apiKey) {
            console.error('GOOGLE_AI_API_KEY not configured');
            return NextResponse.json(
                { error: 'Google AI API key not configured' },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Get the audio file from form data
        const formData = await req.formData();
        const audioFile = formData.get('audio') as File;

        if (!audioFile) {
            return NextResponse.json(
                { error: 'No audio file provided' },
                { status: 400 }
            );
        }

        console.log('[Voice Interview] Processing audio with Gemini 1.5 Flash:', audioFile.name, audioFile.size, 'bytes');

        // Convert audio file to base64
        const buffer = Buffer.from(await audioFile.arrayBuffer());
        const base64Audio = buffer.toString('base64');

        const prompt = `Actúa como un experto generador de vCards y entrevistador de negocios. 
Tu tarea es escuchar el audio de la entrevista y extraer la información en formato JSON.
La entrevista cubre la historia del negocio, productos y servicios.

JSON format:
{
  "name": "Nombre completo o nombre del negocio",
  "profession": "Actividad corta (3-4 palabras)",
  "bio": "Bio profesional o historia del negocio. Menciona la propuesta de valor.",
  "products": "Lista detallada de productos y servicios ofrecidos.",
  "etiquetas": "Un solo párrafo con 30+ palabras clave naturales para SEO (variaciones, coloquialismos, etc.)"
}

Reglas: Usa SOLO la información proporcionada. Mantén un tono profesional pero acogedor.`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Audio,
                    mimeType: audioFile.type || "audio/webm"
                }
            }
        ]);

        const response = await result.response;
        const text = response.text();
        
        // Extract JSON from response (Gemini sometimes adds markdown blocks)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const extractedData = JSON.parse(jsonMatch ? jsonMatch[0] : '{}');

        console.log('[Voice Interview] Gemini Extracted data:', extractedData);

        const cleanResult = {
            name: (extractedData.name || '').slice(0, 100).trim(),
            profession: (extractedData.profession || '').slice(0, 100).trim(),
            bio: (extractedData.bio || '').slice(0, 1000).trim(),
            products: (extractedData.products || '').slice(0, 1000).trim(),
            etiquetas: (extractedData.etiquetas || '').slice(0, 2000).trim(),
            transcription: "[Procesado directamente por Gemini]",
        };

        return NextResponse.json({
            success: true,
            data: cleanResult
        });

    } catch (error: any) {
        console.error('[Voice Interview] Gemini Error:', error);

        return NextResponse.json(
            { error: 'Error al procesar la entrevista con IA. Intenta de nuevo.' },
            { status: 500 }
        );
    }
}
