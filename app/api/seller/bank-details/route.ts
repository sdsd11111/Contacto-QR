import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            seller_id,
            banco_nombre,
            banco_beneficiario,
            banco_numero_cuenta,
            banco_cedula,
            banco_correo
        } = body;

        if (!seller_id || !banco_nombre || !banco_beneficiario || !banco_numero_cuenta || !banco_cedula || !banco_correo) {
            return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
        }

        const query = `
            UPDATE registraya_vcard_sellers 
            SET 
                banco_nombre = ?, 
                banco_beneficiario = ?, 
                banco_numero_cuenta = ?, 
                banco_cedula = ?, 
                banco_correo = ?, 
                datos_bancarios_completados = 1 
            WHERE id = ?
        `;

        const [result]: any = await pool.execute(query, [
            banco_nombre,
            banco_beneficiario,
            banco_numero_cuenta,
            banco_cedula,
            banco_correo,
            seller_id
        ]);

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: 'Vendedor no encontrado' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Datos bancarios actualizados correctamente' });
    } catch (err: any) {
        console.error('Error updating bank details:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
