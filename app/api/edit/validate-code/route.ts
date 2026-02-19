import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const { code } = await req.json();

        if (!code) {
            return NextResponse.json({ error: 'Código requerido' }, { status: 400 });
        }

        const connection = await pool.getConnection();

        try {
            const [rows] = await connection.execute(
                `SELECT 
                    id, slug, edit_code, edit_uses_remaining, tipo_perfil,
                    nombres, apellidos, nombre_negocio, contacto_nombre, contacto_apellido,
                    nombre, profesion as profession, empresa as company, whatsapp, email, bio, 
                    direccion as address, web, google_business, instagram, linkedin, 
                    facebook, tiktok, productos_servicios as products, etiquetas as categories, foto_url
                 FROM registraya_vcard_registros 
                 WHERE UPPER(edit_code) = UPPER(?)`,
                [code]
            );

            const users = rows as any[];

            if (users.length === 0) {
                return NextResponse.json({ error: 'Código no encontrado' }, { status: 404 });
            }

            const user = users[0];

            if (user.edit_uses_remaining <= 0) {
                return NextResponse.json({
                    error: 'Has agotado tus 2 ediciones permitidas. Contacta a soporte para solicitar más cambios.'
                }, { status: 403 });
            }

            // Return user data for editing
            return NextResponse.json({
                success: true,
                usesRemaining: user.edit_uses_remaining,
                data: user
            });

        } finally {
            connection.release();
        }

    } catch (error: any) {
        console.error('Error validating edit code:', error);
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}
