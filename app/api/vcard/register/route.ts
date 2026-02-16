import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const {
            nombre, email, whatsapp, profesion, empresa, bio, direccion,
            web, google_business, instagram, linkedin, facebook, tiktok, productos_servicios,
            plan, foto_url, comprobante_url, galeria_urls,
            status, slug, etiquetas, seller_id
        } = body;

        // Basic validation
        if (!email || !nombre) {
            return NextResponse.json({ error: 'Email y Nombre son requeridos' }, { status: 400 });
        }

        const connection = await pool.getConnection();

        try {
            // Check if user exists (by email) to determine Insert or Update
            const [rows] = await connection.execute(
                'SELECT id, slug FROM registraya_vcard_registros WHERE email = ?',
                [email]
            );

            // Prepare JSON fields
            const galeriaUrlsJson = JSON.stringify(galeria_urls || []);

            if ((rows as any[]).length > 0) {
                // UPDATE
                const existingUser = (rows as any[])[0];
                const updateQuery = `
                    UPDATE registraya_vcard_registros SET
                        nombre=?, whatsapp=?, profesion=?, empresa=?, bio=?, direccion=?,
                        web=?, google_business=?, instagram=?, linkedin=?, facebook=?, tiktok=?,
                        productos_servicios=?, plan=?, foto_url=?, comprobante_url=?, galeria_urls=?,
                        status=?, slug=?, etiquetas=?, seller_id=?
                    WHERE email=?
                `;

                // Use existing slug if not provided/changed, or update it. 
                // Logic mostly keeps existing slug unless strictly needed.
                // Here we update everything as requested.

                await connection.execute(updateQuery, [
                    nombre, whatsapp, profesion, empresa, bio, direccion,
                    web, google_business, instagram, linkedin, facebook, tiktok,
                    productos_servicios, plan, foto_url, comprobante_url, galeriaUrlsJson,
                    status || 'pendiente', slug || existingUser.slug, etiquetas, seller_id || null,
                    email
                ]);

                return NextResponse.json({ success: true, action: 'updated', id: existingUser.id });

            } else {
                // INSERT
                const newId = uuidv4();
                const now = new Date();

                const insertQuery = `
                    INSERT INTO registraya_vcard_registros (
                        id, created_at, nombre, email, whatsapp, profesion, empresa, bio, direccion,
                        web, google_business, instagram, linkedin, facebook, tiktok, productos_servicios,
                        plan, foto_url, comprobante_url, galeria_urls, status, slug, etiquetas,
                        commission_status, seller_id
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
                `;

                await connection.execute(insertQuery, [
                    newId, now, nombre, email, whatsapp, profesion, empresa, bio, direccion,
                    web, google_business, instagram, linkedin, facebook, tiktok, productos_servicios,
                    plan, foto_url, comprobante_url, galeriaUrlsJson, status || 'pendiente', slug, etiquetas,
                    seller_id || null
                ]);

                return NextResponse.json({ success: true, action: 'created', id: newId });
            }

        } finally {
            connection.release();
        }

    } catch (err: any) {
        console.error('Error en API de registro (MySQL):', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
