import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest) {
    try {
        const { id, password } = await req.json();

        if (!id || !password) {
            return NextResponse.json({ error: 'Faltan datos (ID de vendedor o contraseña validos)' }, { status: 400 });
        }

        const query = `
            UPDATE registraya_vcard_sellers 
            SET password = ? 
            WHERE id = ?
        `;

        const [result]: any = await pool.execute(query, [password, id]);

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: 'Vendedor no encontrado' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Perfil actualizado correctamente' });

    } catch (err: any) {
        console.error('Error updating profile:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
