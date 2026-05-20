import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

const ZONE = process.env.BUNNY_STORAGE_ZONE || 'activaqr-archivos';
const API_KEY = process.env.BUNNY_STORAGE_API_KEY || '1aa44b8e-b1f6-40c0-bc1355f1dc27-3f33-496d';
const HOST = process.env.BUNNY_STORAGE_HOST || 'storage.bunnycdn.com';
const PULLZONE_URL = process.env.BUNNY_PULLZONE_URL || 'https://activaqr-archivos.b-cdn.net';

/**
 * API para procesar archivos (imágenes/videos/documentos) y subirlos a BunnyCDN
 * Guarda los archivos ordenadamente en carpetas por cliente usando su 'slug'.
 */
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const rawSlug = formData.get('slug') as string || 'general';

        if (!file) {
            return NextResponse.json({ error: 'No se subió ningún archivo' }, { status: 400 });
        }

        // Limpiar el slug para evitar caracteres extraños en las rutas de BunnyCDN
        const slug = rawSlug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-').replace(/-+/g, '-') || 'general';

        const buffer = Buffer.from(await file.arrayBuffer());
        let uploadBuffer: any = buffer;
        let filename = '';
        let mimeType = file.type || 'application/octet-stream';

        if (file.type.startsWith('image/')) {
            // Procesar imagen con Sharp para optimizar tamaño y convertir a WebP
            uploadBuffer = await sharp(buffer)
                .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 80 })
                .toBuffer();
            
            filename = `${uuidv4()}.webp`;
            mimeType = 'image/webp';
        } else {
            // Para videos y otros archivos (PDF, VCF, etc.), mantenemos su extensión original
            const originalName = file.name || 'file';
            const ext = originalName.includes('.') ? originalName.split('.').pop() : '';
            filename = `${uuidv4()}${ext ? `.${ext.toLowerCase()}` : ''}`;
        }

        // URL del endpoint de almacenamiento de BunnyCDN
        const storageUrl = `https://${HOST}/${ZONE}/uploads/${slug}/${filename}`;

        console.log(`Uploading ${file.name} to BunnyCDN: uploads/${slug}/${filename}`);

        // Subir el archivo a BunnyCDN Storage vía PUT
        const cdnResponse = await fetch(storageUrl, {
            method: 'PUT',
            headers: {
                'AccessKey': API_KEY,
                'Content-Type': mimeType
            },
            body: uploadBuffer
        });

        if (!cdnResponse.ok) {
            const errorText = await cdnResponse.text();
            console.error('Error al subir a BunnyCDN:', cdnResponse.status, errorText);
            throw new Error(`Error en el almacenamiento externo (${cdnResponse.status})`);
        }

        // Generar la URL pública del CDN
        const cdnPublicUrl = `${PULLZONE_URL}/uploads/${slug}/${filename}`;
        console.log(`Upload successful. Public URL: ${cdnPublicUrl}`);

        return NextResponse.json({ url: cdnPublicUrl });

    } catch (error: any) {
        console.error('Error en procesamiento de subida a BunnyCDN:', error);
        return NextResponse.json({ error: error.message || 'Error al procesar y subir el archivo' }, { status: 500 });
    }
}

