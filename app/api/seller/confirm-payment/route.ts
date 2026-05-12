import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const { registroId, sellerId } = await req.json();

        if (!registroId || !sellerId) {
            return NextResponse.json({ error: 'ID de registro y vendedor son requeridos' }, { status: 400 });
        }

        // 1. Verificar que el registro existe, pertenece al vendedor (o su equipo) 
        // y está en estado 'paid_to_leader'
        const [rows]: any = await pool.execute(`
            SELECT r.id, r.commission_status, s.parent_id 
            FROM registraya_vcard_registros r
            JOIN registraya_vcard_sellers s ON r.seller_id = s.id
            WHERE r.id = ? AND (r.seller_id = ? OR s.parent_id = ?)
        `, [registroId, sellerId, sellerId]);

        if (rows.length === 0) {
            return NextResponse.json({ error: 'Registro no encontrado o no pertenece a este vendedor' }, { status: 404 });
        }

        const registro = rows[0];

        if (registro.commission_status !== 'paid_to_leader') {
            return NextResponse.json({
                error: 'El pago aún no ha sido marcado como enviado al líder por el administrador'
            }, { status: 400 });
        }

        // 2. Actualizar a 'completed' y registrar fecha de confirmación
        await pool.execute(`
            UPDATE registraya_vcard_registros 
            SET commission_status = 'completed', 
                seller_confirmed_at = NOW() 
            WHERE id = ?
        `, [registroId]);

        return NextResponse.json({
            success: true,
            message: 'Comisión confirmada como recibida. ¡Gracias!'
        });

    } catch (err: any) {
        console.error('Error confirming payment:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
