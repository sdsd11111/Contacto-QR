import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export const dynamic = 'force-dynamic';

/**
 * API para procesar imágenes y devolverlas como Base64 (Data URI)
 * Esto permite guardar "todo en la base de datos" (columnas LONGTEXT) 
 * y evita errores 500 en Vercel por sistema de archivos de solo lectura.
 */
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No se subió ningún archivo' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        
        // Si es un video, lo convertimos directamente a Base64 si pesa menos de 5MB
        if (file.type.startsWith('video/')) {
            if (buffer.length > 5 * 1024 * 1024) { // 5MB limit
                return NextResponse.json({ error: 'El video debe pesar menos de 5MB' }, { status: 400 });
            }
            const base64 = buffer.toString('base64');
            const dataUrl = `data:${file.type};base64,${base64}`;
            return NextResponse.json({ url: dataUrl });
        }

        // Si no es imagen ni video, devolvemos error
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'El archivo debe ser una imagen o un video' }, { status: 400 });
        }
        // Procesar con Sharp para optimizar tamaño y convertir a WebP
        const processedBuffer = await sharp(buffer)
            .resize(1000, 1000, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 75 })
            .toBuffer();

        // Convertir a Base64 Data URI
        const base64 = processedBuffer.toString('base64');
        const dataUrl = `data:image/webp;base64,${base64}`;

        // Devolvemos el Data URI que se guardará directamente en la columna LONGTEXT de la DB
        return NextResponse.json({ url: dataUrl });

    } catch (error: any) {
        console.error('Error en procesamiento de imagen (Base64):', error);
        return NextResponse.json({ error: 'Error al procesar la imagen' }, { status: 500 });
    }
}
