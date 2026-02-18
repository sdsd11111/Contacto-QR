import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { formatPhoneEcuador } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const {
            nombre, email, profesion, empresa, bio, direccion,
            web, google_business, instagram, linkedin, facebook, tiktok, productos_servicios,
            plan, foto_url, comprobante_url, galeria_urls,
            status, slug, etiquetas, seller_id,
            tipo_perfil, nombres, apellidos, nombre_negocio, contacto_nombre, contacto_apellido
        } = body;

        const whatsapp = formatPhoneEcuador(body.whatsapp || '');

        // Basic validation
        if (!email || !nombre) {
            return NextResponse.json({ error: 'Email y Nombre son requeridos' }, { status: 400 });
        }

        try {
            // Check if user exists (by email) to determine Insert or Update
            const [rows] = await pool.execute(
                'SELECT id, slug FROM registraya_vcard_registros WHERE email = ?',
                [email]
            );

            // Prepare JSON fields
            const galeriaUrlsJson = JSON.stringify(galeria_urls || []);

            // Calculate legacy name for compatibility
            const nombreLegacy = tipo_perfil === 'negocio'
                ? nombre_negocio
                : `${nombres || ''} ${apellidos || ''}`.trim();

            if ((rows as any[]).length > 0) {
                // UPDATE
                const existingUser = (rows as any[])[0];
                const updateQuery = `
                    UPDATE registraya_vcard_registros SET
                        nombre=?, whatsapp=?, profesion=?, empresa=?, bio=?, direccion=?,
                        web=?, google_business=?, instagram=?, linkedin=?, facebook=?, tiktok=?,
                        productos_servicios=?, plan=?, foto_url=?, comprobante_url=?, galeria_urls=?,
                        status=?, slug=?, etiquetas=?, seller_id=?,
                        tipo_perfil=?, nombres=?, apellidos=?, nombre_negocio=?, contacto_nombre=?, contacto_apellido=?
                    WHERE email=?
                `;

                await pool.execute(updateQuery, [
                    nombreLegacy, whatsapp, profesion, empresa, bio, direccion,
                    web, google_business, instagram, linkedin, facebook, tiktok,
                    productos_servicios, plan, foto_url, comprobante_url, galeriaUrlsJson,
                    status || 'pendiente', slug || existingUser.slug, etiquetas, seller_id || null,
                    tipo_perfil || 'persona', nombres || '', apellidos || '', nombre_negocio || '', contacto_nombre || '', contacto_apellido || '',
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
                        commission_status, seller_id,
                        tipo_perfil, nombres, apellidos, nombre_negocio, contacto_nombre, contacto_apellido
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?)
                `;

                await pool.execute(insertQuery, [
                    newId, now, nombreLegacy, email, whatsapp, profesion, empresa, bio, direccion,
                    web, google_business, instagram, linkedin, facebook, tiktok, productos_servicios,
                    plan, foto_url, comprobante_url, galeriaUrlsJson, status || 'pendiente', slug, etiquetas,
                    seller_id || null,
                    tipo_perfil || 'persona', nombres || '', apellidos || '', nombre_negocio || '', contacto_nombre || '', contacto_apellido || ''
                ]);

                return NextResponse.json({ success: true, action: 'created', id: newId });
            }

        } catch (dbErr) {
            throw dbErr;
        }
    } catch (err: any) {
        console.error('Error en API de registro (MySQL):', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
