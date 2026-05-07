import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: Request) {
    const auth = requireAdmin(request);
    if (auth) return auth;

    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!phone) {
        return NextResponse.json({ error: 'Missing phone' }, { status: 400 });
    }

    const jid = `${phone}@s.whatsapp.net`;

    try {
        await pool.execute('DELETE FROM registraya_whatsapp_messages WHERE jid = ?', [jid]);
        await pool.execute('DELETE FROM registraya_whatsapp_leads WHERE jid = ?', [jid]);
        await pool.execute('DELETE FROM registraya_whatsapp_sessions WHERE jid = ?', [jid]);

        return NextResponse.json({ success: true, message: `Memory cleared for ${phone}` });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
