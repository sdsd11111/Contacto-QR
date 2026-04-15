import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const magic = searchParams.get('magic');

    if (!magic) {
        return NextResponse.json({ error: 'Magic parameter required' }, { status: 400 });
    }

    try {
        // Decode JID from base64
        const jid = Buffer.from(magic, 'base64').toString('ascii');

        const [rows] = await pool.execute(
            'SELECT registration_json, registration_step FROM registraya_whatsapp_leads WHERE jid = ?',
            [jid]
        );

        const results = rows as any[];
        if (results.length > 0 && results[0].registration_json) {
            // Extract phone number from JID (format: 593967491847@s.whatsapp.net)
            const phoneFromJid = jid.split('@')[0];
            return NextResponse.json({
                success: true,
                data: JSON.parse(results[0].registration_json),
                step: results[0].registration_step,
                whatsapp: phoneFromJid
            });
        } else {
            return NextResponse.json({ success: false, error: 'Draft not found' }, { status: 404 });
        }
    } catch (err: any) {
        console.error('get-draft error:', err);
        return NextResponse.json({ error: 'Invalid magic link' }, { status: 400 });
    }
}
