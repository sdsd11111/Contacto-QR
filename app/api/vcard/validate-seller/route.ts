import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const id = searchParams.get('id');

    if (!code && !id) {
        return NextResponse.json({ error: 'Código o ID es requerido' }, { status: 400 });
    }

    try {
        let query = 'SELECT id, nombre FROM registraya_vcard_sellers WHERE activo = 1';
        let params: any[] = [];

        if (code) {
            query += ' AND codigo = ?';
            params.push(code);
        } else if (id) {
            query += ' AND id = ?';
            params.push(id);
        }

        const [rows] = await pool.execute(query, params);

        const sellers = rows as any[];
        if (sellers.length > 0) {
            return NextResponse.json({
                success: true,
                id: sellers[0].id,
                nombre: sellers[0].nombre
            });
        } else {
            return NextResponse.json({
                success: false,
                error: 'Vendedor no encontrado o inactivo'
            }, { status: 200 });
        }
    } catch (err: any) {
        console.error('Error validating seller code:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
