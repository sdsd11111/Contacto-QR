import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET /api/seller/me?id=X
// Verifica que el ID del vendedor sea válido y devuelve sus datos frescos desde la DB
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
        }

        const connection = await pool.getConnection();
        try {
            const [rows]: any = await connection.execute(
                'SELECT id, nombre, email, role, comision_porcentaje, parent_id, codigo, terminos_aceptados_en, banco_nombre, banco_beneficiario, banco_numero_cuenta, banco_cedula, banco_correo, datos_bancarios_completados FROM registraya_vcard_sellers WHERE id = ? AND activo = 1',
                [id]
            );

            if (rows.length === 0) {
                return NextResponse.json({ error: 'Sesión inválida o cuenta desactivada' }, { status: 401 });
            }

            const seller = rows[0];

            return NextResponse.json({
                success: true,
                seller: {
                    id: seller.id,
                    nombre: seller.nombre,
                    email: seller.email,
                    role: seller.role,
                    comision_porcentaje: seller.comision_porcentaje,
                    parent_id: seller.parent_id,
                    codigo: seller.codigo,
                    terminos_aceptados_en: seller.terminos_aceptados_en,
                    banco_nombre: seller.banco_nombre,
                    banco_beneficiario: seller.banco_beneficiario,
                    banco_numero_cuenta: seller.banco_numero_cuenta,
                    banco_cedula: seller.banco_cedula,
                    banco_correo: seller.banco_correo,
                    datos_bancarios_completados: seller.datos_bancarios_completados
                }
            });

        } finally {
            connection.release();
        }

    } catch (error: any) {
        console.error('Seller /me Error:', error);
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}
