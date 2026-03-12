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
        
        // Compress and convert to WebP
        const processedBuffer = await sharp(buffer)
            .webp({ quality: 80 })
            .toBuffer();

        // Save to filesystem with unique name
        const filename = `${uuidv4()}.webp`;
        const filepath = path.join(UPLOAD_DIR, filename);
        fs.writeFileSync(filepath, processedBuffer);

        // Return the public URL path (not base64!)
        const url = `/uploads/${filename}`;
        return NextResponse.json({ url });

    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
