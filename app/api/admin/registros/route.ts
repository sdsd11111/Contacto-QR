import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET: Lista todos los registros (requiere admin key)
 */
export async function GET(req: NextRequest) {
    const adminKey = req.headers.get('x-admin-key');
    if (!adminKey || adminKey !== process.env.ADMIN_API_KEY) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.execute(
                'SELECT * FROM registraya_vcard_registros ORDER BY created_at DESC'
            );
            return NextResponse.json({ data: rows });
        } finally {
            connection.release();
        }
    } catch (err: any) {
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

        const connection = await pool.getConnection();
        try {
            const [result] = await connection.execute(query, [...values, id]);

            // Fetch updated record
            const [rows] = await connection.execute('SELECT * FROM registraya_vcard_registros WHERE id = ?', [id]);
            return NextResponse.json({ data: rows });

        } finally {
            connection.release();
        }

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
