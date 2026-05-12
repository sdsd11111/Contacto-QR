import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyPassword, generateSellerToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 });
        }

        const connection = await pool.getConnection();
        try {
            const [rows]: any = await connection.execute(
                'SELECT id, nombre, email, password, role, comision_porcentaje, parent_id, codigo, terminos_aceptados_en FROM registraya_vcard_sellers WHERE email = ? AND activo = 1',
                [email]
            );

            if (rows.length === 0) {
                return NextResponse.json({ error: 'Credenciales inválidas o cuenta desactivada' }, { status: 401 });
            }

            const seller = rows[0];

            // Verificar password hasheado (o plaintext legacy)
            const isValid = seller.password.includes(':') 
                ? await verifyPassword(password, seller.password)
                : seller.password === password; // Compatibilidad con passwords viejos sin hashear

            if (!isValid) {
                return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
            }

            // Generar token de sesión
            const token = generateSellerToken({
                id: seller.id,
                email: seller.email,
                nombre: seller.nombre,
                role: seller.role
            });

            return NextResponse.json({
                success: true,
                token,
                seller: {
                    id: seller.id,
                    nombre: seller.nombre,
                    email: seller.email,
                    role: seller.role,
                    comision_porcentaje: seller.comision_porcentaje,
                    parent_id: seller.parent_id,
                    codigo: seller.codigo,
                    terminos_aceptados_en: seller.terminos_aceptados_en
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
