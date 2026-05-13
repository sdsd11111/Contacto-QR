import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { slug, method = 'profile_button' } = body;

        if (!slug) {
            return NextResponse.json({ error: 'Slug es requerido' }, { status: 400 });
        }

        let ip_address = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
        if (ip_address.includes(',')) ip_address = ip_address.split(',')[0].trim();
        if (ip_address.length > 45) ip_address = ip_address.substring(0, 45);

        const user_agent = (req.headers.get('user-agent') || 'unknown').substring(0, 255);

        // Opcional: Anti-spam básico (evitar múltiples clicks en menos de 10 segundos)
        const [recent]: any = await pool.execute(
            `SELECT id FROM vcard_downloads_log 
             WHERE slug = ? AND ip_address = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 10 SECOND)`,
            [slug, ip_address]
        );

        if (recent.length > 0) {
            // Ignorar el registro si es un click repetido muy rápido, pero retornar éxito para no romper el cliente
            return NextResponse.json({ success: true, ignored: true });
        }

        await pool.execute(
            `INSERT INTO vcard_downloads_log (slug, method, ip_address, user_agent, created_at)
             VALUES (?, ?, ?, ?, NOW())`,
            [slug, method, ip_address, user_agent]
        );

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('[TRACK DOWNLOAD] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
