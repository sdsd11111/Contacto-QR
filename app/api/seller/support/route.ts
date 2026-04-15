import { NextResponse } from 'next/server';
import { sendMail } from '@/lib/mailer';



export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const audio = formData.get('audio') as Blob;
        const sellerId = formData.get('sellerId') as string;
        const sellerName = formData.get('sellerName') as string;
        const sellerEmail = formData.get('sellerEmail') as string;

        if (!audio) {
            return NextResponse.json({ success: false, error: 'Audio file is required' }, { status: 400 });
        }

        // Convert Blob to Buffer
        const arrayBuffer = await audio.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // In a real scenario, we might upload this to S3/Supabase Storage.
        // For MVP, we'll attach it to an email if it's small enough, or ideally transcribe it using the same existing logic.
        // Let's send an email with the attached audio file to the platform administrator.

        const emailOptions = {
            to: "cesar@innovacode.tech", // Admin support email
            subject: `🎧 Nuevo Mensaje de Soporte de Vendedor: ${sellerName}`,
            text: `Vendedor: ${sellerName} (ID: ${sellerId})\nEmail: ${sellerEmail}\n\nHa enviado una nota de voz pidiendo soporte adjunta a este correo.`,
            html: `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h2 style="color: #001549;">Nuevo Mensaje de Soporte</h2>
                    <p><strong>Vendedor:</strong> ${sellerName} (ID: ${sellerId})</p>
                    <p><strong>Email:</strong> ${sellerEmail}</p>
                    <p>Escucha el archivo de audio adjunto (.webm) para conocer su consulta.</p>
                </div>
            `,
            attachments: [
                {
                    filename: `support_audio_${sellerId}_${Date.now()}.webm`,
                    content: buffer,
                    contentType: 'audio/webm',
                }
            ]
        };

        await sendMail(emailOptions);

        return NextResponse.json({ success: true, message: 'Support audio sent successfully' });

    } catch (error: any) {
        console.error('Error processing support audio:', error);
        return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
