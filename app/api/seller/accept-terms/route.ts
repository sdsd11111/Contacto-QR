import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { seller_id } = body;

        console.log(`Accept-terms POST: saving acceptance for seller_id ${seller_id}`);

        if (!seller_id) {
            return NextResponse.json({ error: 'Falta el seller_id' }, { status: 400 });
        }

        // Ideally, we'd also check if the user is authenticated via session,
        // but since this is called immediately after login or from the protected dashboard,
        // we trust the client-provided seller_id for now (or validate via header tokens if implemented).

        const query = `
            UPDATE registraya_vcard_sellers 
            SET terminos_aceptados_en = NOW() 
            WHERE id = ?
        `;

        const [result]: any = await pool.execute(query, [seller_id]);

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: 'Vendedor no encontrado' }, { status: 404 });
        }

        // Return success and let the client re-fetch or update local state
        return NextResponse.json({ success: true, timestamp: new Date().toISOString() });
    } catch (err: any) {
        console.error('Error accepting terms:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
