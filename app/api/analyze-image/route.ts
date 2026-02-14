import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const { image, profession } = await req.json();

        if (!image) {
            return NextResponse.json({ error: 'La imagen es requerida' }, { status: 400 });
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text", text: `Eres un asistente experto en digitalización de negocios. 
                        Analiza esta imagen (puede ser un menú, un flyer, una lista de precios o una foto de productos) y extrae una lista limpia y atractiva de los Productos o Servicios que se ofrecen.
                        
                        Contexto del negocio: ${profession || 'Negocio General'}.
                        
                        Tu salida debe ser SOLO el texto listo para poner en el perfil del negocio. 
                        Usa formato de lista o texto seguido, pero que se vea profesional. 
                        No agregues "Aquí tienes la lista", solo el contenido.` },
                        {
                            type: "image_url",
                            image_url: {
                                "url": image, // Base64 data url expected here
                            },
                        },
                    ],
                },
            ],
            max_tokens: 500,
        });

        const text = response.choices[0].message.content?.trim();

        return NextResponse.json({ text });
    } catch (error) {
        console.error('Error analyzing image:', error);
        return NextResponse.json({ error: 'Error al analizar la imagen' }, { status: 500 });
    }
}
