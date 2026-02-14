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
        // Compress and convert to WebP Buffer
        const processedBuffer = await sharp(buffer)
            .webp({ quality: 80 })
            .toBuffer();

        // Convert to Base64 string
        const base64String = `data:image/webp;base64,${processedBuffer.toString('base64')}`;

        // Return the Base64 string directly (to be saved in DB by the client)
        // We don't save to file system anymore.
        return NextResponse.json({ url: base64String });

    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
