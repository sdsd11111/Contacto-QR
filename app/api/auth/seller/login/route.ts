import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 });
        }

        const connection = await pool.getConnection();
        try {
            const [rows]: any = await connection.execute(
                'SELECT id, nombre, email, role, comision_porcentaje, parent_id FROM registraya_vcard_sellers WHERE email = ? AND password = ? AND activo = 1',
                [email, password]
            );

            if (rows.length === 0) {
                return NextResponse.json({ error: 'Credenciales inválidas o cuenta desactivada' }, { status: 401 });
            }

            const seller = rows[0];

            return NextResponse.json({
                success: true,
                seller: {
                    id: seller.id,
                    nombre: seller.nombre,
                    email: seller.email,
                    role: seller.role,
                    comision: seller.comision_porcentaje,
                    parent_id: seller.parent_id
                }
            });

        } finally {
            connection.release();
        }

    } catch (error: any) {
        console.error('Seller Login Error:', error);
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}
