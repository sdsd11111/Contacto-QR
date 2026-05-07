import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireSellerAuth } from '@/lib/auth';

/**
 * GET /api/seller/me
 * Verifica el token de vendedor (Authorization: Bearer <token>)
 * y retorna sus datos frescos desde la BD.
 */
export async function GET(request: NextRequest) {
    const sellerAuth = requireSellerAuth(request);
    if (!sellerAuth) {
        return NextResponse.json(
            { error: 'Token inválido o expirado' },
            { status: 401 }
        );
    }

    try {
        const [rows]: any = await pool.execute(
            `SELECT id, nombre, email, role, comision_porcentaje, parent_id, codigo,
                    terminos_aceptados_en, banco_nombre, banco_beneficiario,
                    banco_numero_cuenta, banco_cedula, banco_correo,
                    datos_bancarios_completados
             FROM registraya_vcard_sellers
             WHERE id = ? AND activo = 1`,
            [sellerAuth.id]
        );

        if (rows.length === 0) {
            return NextResponse.json(
                { error: 'Vendedor no encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            seller: rows[0]
        });

    } catch (err: any) {
        console.error('[Seller Me] Error:', err.message);
        return NextResponse.json(
            { error: 'Error del servidor' },
            { status: 500 }
        );
    }
}
