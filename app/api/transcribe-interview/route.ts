import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

// Max file size for audio is handled by the server environment
export const maxDuration = 60; // Increase timeout if needed

export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            console.error('OPENAI_API_KEY not configured');
            return NextResponse.json(
                { error: 'OpenAI API key not configured' },
                { status: 500 }
            );
        }

        const openai = new OpenAI({ apiKey });

        // Get the audio file from form data
        const formData = await req.formData();
        const audioFile = formData.get('audio') as File;

        if (!audioFile) {
            return NextResponse.json(
                { error: 'No audio file provided' },
                { status: 400 }
            );
        }

        console.log('[Voice Interview] Processing audio file:', audioFile.name, audioFile.size, 'bytes');

        // Step 1: Transcribe audio using Whisper
        console.log('[Voice Interview] Transcribing with Whisper...');
        const transcription = await openai.audio.transcriptions.create({
            file: audioFile,
            model: 'whisper-1',
            language: 'es',
        });

        const transcribedText = transcription.text;
        console.log('[Voice Interview] Transcription:', transcribedText);

        // Step 2: Extract structured data using GPT-4
        console.log('[Voice Interview] Extracting fields with GPT-4...');
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `Rol de la IA:
Actúa como un asistente experto en creación de vCards y redacción profesional, con conocimientos de marketing y SEO para negocios y servicios. Tu tarea es transformar la información de una entrevista en datos listos para vCard, incluyendo descripción, productos, servicios y etiquetas naturales.

Contexto adicional:
La entrevista incluirá información sobre: nombre de la empresa o persona, país, servicios, productos, marcas, personal clave y modalidades de servicio. Usa el país para contextualizar la redacción de la descripción y las etiquetas. No inventes información sobre ubicación, contacto, marcas o nombres propios que no estén en la entrevista.

Tareas específicas:
1. Extraer Nombre de la empresa o persona.
2. Extraer Actividad (corta, 3–4 palabras) que resuma el negocio o servicio.
3. Redactar Descripción en primera persona, como si el dueño o la empresa se presentara (“Somos…”, “Brindo servicios de…”) incluyendo contexto geográfico y relevancia de servicios.
4. Listar Productos y servicios de forma clara y detallada, incluyendo modalidades, marcas y especialidades mencionadas en la entrevista.
5. Generar Etiquetas o palabras clave en un solo párrafo, mínimo 30, escritas de manera natural, como lo haría un cliente buscando con su teléfono, incluyendo variaciones, formas coloquiales y palabras clave relacionadas.

Reglas importantes:
- Usa solo la información provista en la entrevista; no inventes marcas, personas ni datos de contacto.
- Organiza la información de forma clara y profesional.
- Las etiquetas deben leerse naturales y reflejar lo que un cliente realmente escribiría en su búsqueda.
- Adapta la redacción según el país y contexto geográfico mencionado en la entrevista.

Formato de salida (JSON):
{
  "name": "Nombre de la empresa o persona",
  "profession": "Actividad corta",
  "bio": "Descripción redactada en primera persona",
  "products": "Listado completo de productos y servicios",
  "etiquetas": "Párrafo con mínimo 30 etiquetas naturales"
}`
                },
                {
                    role: 'user',
                    content: `Transcripción de la entrevista:\n\n"${transcribedText}"\n\nExtrae la información siguiendo el formato JSON especificado.`
                }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" }
        });

        const extractedData = JSON.parse(completion.choices[0].message.content || '{}');
        console.log('[Voice Interview] Extracted data:', extractedData);

        // Validate and clean the data
        const result = {
            name: (extractedData.name || '').slice(0, 100).trim(),
            profession: (extractedData.profession || '').slice(0, 100).trim(),
            bio: (extractedData.bio || '').slice(0, 1000).trim(),
            products: (extractedData.products || '').slice(0, 1000).trim(),
            etiquetas: (extractedData.etiquetas || '').slice(0, 2000).trim(),
            transcription: transcribedText,
        };

        return NextResponse.json({
            success: true,
            data: result
        });

    } catch (error: any) {
        console.error('[Voice Interview] Error:', error);

        // Provide more specific error messages
        if (error.message?.includes('API key')) {
            return NextResponse.json(
                { error: 'Error de configuración de la API. Contacta al administrador.' },
                { status: 500 }
            );
        }

        if (error.message?.includes('audio')) {
            return NextResponse.json(
                { error: 'Error al procesar el audio. Intenta grabar de nuevo.' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Error al procesar la entrevista. Intenta de nuevo.' },
            { status: 500 }
        );
    }
}
