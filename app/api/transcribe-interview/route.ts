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
                    content: `Expert vCard generator. Extract interview data into JSON.
JSON format:
{
  "name": "Full name or Business name",
  "profession": "Short activity (3-4 words)",
  "bio": "First-person professional description (include location if mentioned)",
  "products": "Clear list of products/services",
  "etiquetas": "Single paragraph, 30+ natural search keywords (variations, colloquial, SEO)"
}
Rules: Use ONLY provided info. No invented data. Professional tone.`
                },
                {
                    role: 'user',
                    content: `Interview transcription: "${transcribedText}"`
                }
            ],
            temperature: 0.5,
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
