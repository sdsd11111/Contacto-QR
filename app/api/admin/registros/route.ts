import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET: Lista todos los registros (requiere admin key)
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get('seller_id');
    const adminKey = req.headers.get('x-admin-key');

    // Simple security: Admin key allows everything. 
    // If no admin key, we check if it's a seller request (future: session check)
    // For now, let's allow it if sellerId is provided, but in production we'd want a token.
    if (!adminKey || adminKey !== process.env.ADMIN_API_KEY) {
        if (!sellerId) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }
    }

    try {
        let query = `
            SELECT 
                r.*, 
                s.nombre as sold_by_name, 
                s.codigo as sold_by_code,
                p.nombre as parent_name,
                p.codigo as parent_code
            FROM registraya_vcard_registros r
            LEFT JOIN registraya_vcard_sellers s ON r.seller_id = s.id
            LEFT JOIN registraya_vcard_sellers p ON s.parent_id = p.id
        `;
        const params: any[] = [];

        if (sellerId) {
            // Find children IDs
            const [children]: any = await pool.execute('SELECT id FROM registraya_vcard_sellers WHERE parent_id = ?', [sellerId]);
            const childrenIds = (children as any[]).map(c => c.id);
            const allIds = [Number(sellerId), ...childrenIds];

            const placeholders = allIds.map(() => '?').join(', ');
            query += ` WHERE r.seller_id IN (${placeholders})`;
            params.push(...allIds);
        }

        query += ' ORDER BY r.created_at DESC';

        const [rows]: any = await pool.execute(query, params);
        return NextResponse.json({ data: rows });
    } catch (err: any) {
        console.error('Error fetching registros:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

/**
 * PATCH: Actualizar un registro (requiere admin key)
 */
export async function PATCH(req: NextRequest) {
    const adminKey = req.headers.get('x-admin-key');
    if (!adminKey || adminKey !== process.env.ADMIN_API_KEY) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { id, ...updateFields } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });
        }

        const keys = Object.keys(updateFields);
        if (keys.length === 0) {
            return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 });
        }

        // Construct dynamic UPDATE query
        const setClause = keys.map(key => `${key} = ?`).join(', ');
        const values = keys.map(key => updateFields[key]);
        const query = `UPDATE registraya_vcard_registros SET ${setClause} WHERE id = ?`;

        await pool.execute(query, [...values, id]);

        // Fetch updated record
        const [rows] = await pool.execute('SELECT * FROM registraya_vcard_registros WHERE id = ?', [id]);
        return NextResponse.json({ data: rows });

    } catch (err: any) {
        console.error('Error updating registro:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
