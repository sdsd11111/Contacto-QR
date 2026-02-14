import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';


export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        // Verificación de admin key (defensa en profundidad, el middleware ya valida)
        const adminKey = req.headers.get('x-admin-key');
        if (!adminKey || adminKey !== process.env.ADMIN_API_KEY) {
            return NextResponse.json(
                { error: 'No autorizado. Se requiere clave de administrador.' },
                { status: 401 }
            );
        }

        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.execute(
                'SELECT * FROM registraya_encuesta_respuestas ORDER BY created_at DESC'
            );
            return NextResponse.json({ data: rows });
        } finally {
            connection.release();
        }
    } catch (err: any) {
        console.error('Unexpected error fetching surveys:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
