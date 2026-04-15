import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Ruta temporal para cron job en Vercel o llamada manual segura
export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const adminKeyParam = url.searchParams.get('key');
        
        // Autorización para cron jobs
        const authHeader = request.headers.get('Authorization');
        const cronSecret = process.env.CRON_SECRET || process.env.ADMIN_API_KEY;

        const isCronAuthorized = 
            (authHeader === `Bearer ${cronSecret}`) || 
            (adminKeyParam === cronSecret);

        if (!isCronAuthorized) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('[CRON EXPIRATIONS] Invocado a las', new Date().toISOString());

        // Buscar registros expirados pero que aún no están cancelados
        // Se cancelan para que no puedan acceder o se marque claramente que caducaron.
        const [rows] = await pool.query(
            "SELECT id, nombre, email, expires_at, status FROM registraya_vcard_registros WHERE expires_at < NOW() AND status != 'cancelado'"
        ) as any[];

        const expiredRecords = rows;

        if (!expiredRecords || expiredRecords.length === 0) {
            return NextResponse.json({ 
                success: true, 
                message: 'No hay registros expirados por procesar.',
                processedCount: 0 
            });
        }

        // Obtener solo los IDs para el update
        const idsToCancel = expiredRecords.map((r: any) => r.id);

        // Update to mark them as 'cancelado'
        await pool.query(
            "UPDATE registraya_vcard_registros SET status = 'cancelado' WHERE id IN (?)",
            [idsToCancel]
        );

        console.log(`[CRON EXPIRATIONS] Ejecución finalizada con éxito. Registros cancelados: ${idsToCancel.length}`);

        return NextResponse.json({ 
            success: true, 
            message: 'Registros expirados procesados correctamente.',
            processedCount: idsToCancel.length,
            records: expiredRecords.map((r: any) => ({ id: r.id, nombre: r.nombre, expirado_en: r.expires_at }))
        });

    } catch (error: any) {
        console.error('[CRON EXPIRATIONS] Error general:', error);
        return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
    }
}
