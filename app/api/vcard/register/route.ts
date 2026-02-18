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

        // Calculate legacy name for compatibility and validation
        const finalNombre = nombre || (tipo_perfil === 'negocio'
            ? nombre_negocio
            : `${nombres || ''} ${apellidos || ''}`.trim());

        // Basic validation
        if (!email || !finalNombre) {
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

            if ((rows as any[]).length > 0) {
                // UPDATE
                const existingUser = (rows as any[])[0];
                const updateQuery = `
                    UPDATE registraya_vcard_registros SET
                        nombre=?, whatsapp=?, profesion=?, empresa=?, bio=?, direccion=?,
                        web=?, google_business=?, instagram=?, linkedin=?, facebook=?, tiktok=?,
                        productos_servicios=?, plan=?, foto_url=?, comprobante_url=?, galeria_urls=?,
                        status=?, paid_at = CASE WHEN ? = 'pagado' AND (paid_at IS NULL) THEN NOW() ELSE paid_at END,
                        slug=?, etiquetas=?, seller_id=?,
                        tipo_perfil=?, nombres=?, apellidos=?, nombre_negocio=?, contacto_nombre=?, contacto_apellido=?
                    WHERE email=?
                `;

                await pool.execute(updateQuery, [
                    finalNombre, whatsapp, profesion, empresa, bio, direccion,
                    web, google_business, instagram, linkedin, facebook, tiktok,
                    productos_servicios, plan, foto_url, comprobante_url, galeriaUrlsJson,
                    status || 'pendiente', status, slug || existingUser.slug, etiquetas, seller_id || null,
                    tipo_perfil || 'persona', nombres || '', apellidos || '', nombre_negocio || '', contacto_nombre || '', contacto_apellido || '',
                    email
                ]);

                return NextResponse.json({ success: true, action: 'updated', id: existingUser.id });

            } else {
                // INSERT
                const newId = uuidv4();
                const now = new Date();
                const isPaid = status === 'pagado';

                const insertQuery = `
                    INSERT INTO registraya_vcard_registros (
                        id, created_at, nombre, email, whatsapp, profesion, empresa, bio, direccion,
                        web, google_business, instagram, linkedin, facebook, tiktok, productos_servicios,
                        plan, foto_url, comprobante_url, galeria_urls, status, paid_at, slug, etiquetas,
                        commission_status, seller_id,
                        tipo_perfil, nombres, apellidos, nombre_negocio, contacto_nombre, contacto_apellido
                    ) VALUES (
                        ?, ?, ?, ?, ?, ?, ?, ?, ?, 
                        ?, ?, ?, ?, ?, ?, ?, 
                        ?, ?, ?, ?, ?, ?, ?, ?, 
                        ?, ?, 
                        ?, ?, ?, ?, ?, ?
                    )
                `;

                const values = [
                    newId, now, finalNombre, email, whatsapp, profesion, empresa, bio, direccion,
                    web, google_business, instagram, linkedin, facebook, tiktok, productos_servicios,
                    plan, foto_url, comprobante_url, galeriaUrlsJson, status || 'pendiente', isPaid ? now : null, slug, etiquetas,
                    'pending', // commission_status
                    seller_id || null,
                    tipo_perfil || 'persona', nombres || '', apellidos || '', nombre_negocio || '', contacto_nombre || '', contacto_apellido || ''
                ];

                await pool.execute(insertQuery, values);

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
