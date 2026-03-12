import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        
        let finalBuffer = buffer;
        let mimeType = file.type;

        // Compress, resize and convert to WebP only if it's an image
        if (file.type.startsWith('image/')) {
            try {
                const processed = await sharp(buffer)
                    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
                    .webp({ quality: 80 }) // Calidad al 80% como solicitó el usuario
                    .toBuffer();
                finalBuffer = Buffer.from(processed);
                mimeType = 'image/webp';
            } catch (e) {
                console.error('Sharp processing failed, using original buffer', e);
            }
        }

        // Return the Base64 string instead of a filename
        const base64 = `data:${mimeType};base64,${finalBuffer.toString('base64')}`;
        return NextResponse.json({ url: base64 });

    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
