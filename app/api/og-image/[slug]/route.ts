import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug: rawSlug } = await context.params;
        // Strip out common image extensions if appended (e.g., .jpg, .png)
        const slug = rawSlug.replace(/\.(jpg|jpeg|png)$/i, '');
        
        const [rows]: any = await pool.execute(
            'SELECT foto_url FROM registraya_vcard_registros WHERE slug = ?',
            [slug]
        );

        if (rows && rows.length > 0) {
            const fotoUrl = rows[0].foto_url;
            
            if (fotoUrl && fotoUrl.startsWith('data:image/')) {
                // Extract base64 data and mime type
                const matches = fotoUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
                
                if (matches && matches.length === 3) {
                    let mimeType = matches[1];
                    const base64Data = matches[2];
                    let buffer = Buffer.from(base64Data, 'base64');
                    
                    // Convert webp to jpeg because Facebook/WhatsApp OG does not support WebP reliably
                    if (mimeType === 'image/webp') {
                        try {
                            const sharp = (await import('sharp')).default;
                            buffer = await sharp(buffer).jpeg({ quality: 85 }).toBuffer() as any;
                            mimeType = 'image/jpeg';
                        } catch (e) {
                            console.error('Sharp conversion failed, serving original', e);
                        }
                    }

                    return new Response(buffer, {
                        headers: {
                            'Content-Type': mimeType,
                            'Content-Length': buffer.length.toString(),
                            'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
                            'X-OG-Type': 'processed-jpeg',
                        },
                    });
                }
            } else if (fotoUrl && fotoUrl.startsWith('http')) {
                // If it's already an external HTTP URL, just fetch and return or redirect
                return Response.redirect(fotoUrl);
            }
        }

        // If no image found or unsupported format, redirect to default OG image
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.activaqr.com';
        return Response.redirect(`${appUrl}/og-default.png`);
        
    } catch (error) {
        console.error('Error serving OG image:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
