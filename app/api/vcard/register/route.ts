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
            web, google_business, instagram, linkedin, facebook, tiktok, youtube, x, productos_servicios,
            plan, foto_url, comprobante_url, galeria_urls,
            slug, etiquetas, seller_id, edit_code, // Added edit_code for verification
            tipo_perfil, nombres, apellidos, nombre_negocio, contacto_nombre, contacto_apellido,
            menu_digital
        } = body;

        // SECURITY: Never accept 'pagado' status from client. 
        // Only webhooks or admin can change status to paid.
        let finalStatus = body.status;
        if (finalStatus === 'pagado') {
            console.warn(`SECURITY: Attempted status bypass for ${email}`);
            finalStatus = 'pendiente';
        }

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
                'SELECT id, slug, edit_code FROM registraya_vcard_registros WHERE email = ?',
                [email]
            );

            // Prepare JSON fields
            const galeriaUrlsJson = JSON.stringify(galeria_urls || []);

            if ((rows as any[]).length > 0) {
                // UPDATE - Requires validation
                const existingUser = (rows as any[])[0];

                // SECURITY: If updating existing record, must provide correct edit_code
                if (!edit_code || edit_code.toUpperCase() !== existingUser.edit_code.toUpperCase()) {
                    return NextResponse.json({
                        error: 'Este correo ya está registrado. Para actualizar tus datos, por favor usa tu Código de Edición o ve a la sección de edición.',
                        is_existing: true
                    }, { status: 403 });
                }

                const updateQuery = `
                    UPDATE registraya_vcard_registros SET
                        nombre=?, whatsapp=?, profesion=?, empresa=?, bio=?, direccion=?,
                        web=?, google_business=?, instagram=?, linkedin=?, facebook=?, tiktok=?, youtube=?, x=?,
                        productos_servicios=?, plan=?, foto_url=?, comprobante_url=?, galeria_urls=?,
                        status=?, paid_at = CASE WHEN ? = 'pagado' AND (paid_at IS NULL) THEN NOW() ELSE paid_at END,
                        slug=?, etiquetas=?, seller_id=?,
                        tipo_perfil=?, nombres=?, apellidos=?, nombre_negocio=?, contacto_nombre=?, contacto_apellido=?,
                        menu_digital=?
                    WHERE email=?
                `;

                await pool.execute(updateQuery, [
                    finalNombre, whatsapp, profesion || null, empresa || null, bio || null, direccion || null,
                    web || null, google_business || null, instagram || null, linkedin || null, facebook || null, tiktok || null, youtube || null, x || null,
                    productos_servicios || null, plan || null, foto_url || null, comprobante_url || null, galeriaUrlsJson,
                    finalStatus || 'pendiente', finalStatus, slug || existingUser.slug, etiquetas || null, seller_id || null,
                    tipo_perfil || 'persona', nombres || null, apellidos || null, nombre_negocio || null, contacto_nombre || null, contacto_apellido || null,
                    menu_digital || null,
                    email
                ]);

                return NextResponse.json({ success: true, action: 'updated', id: existingUser.id });

            } else {
                // INSERT
                const newId = uuidv4();
                const now = new Date();
                const serverGeneratedEditCode = 'RYA-2026-' + Math.random().toString(36).substring(2, 8).toUpperCase();

                // Server-side slug generation if not provided
                let finalSlug = slug;
                if (!finalSlug) {
                    const cleanName = finalNombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
                    finalSlug = `${cleanName}-${Math.random().toString(36).substring(2, 6)}`;
                }

                // --- FOOTPRINT ATTRIBUTION LOGIC ---
                let finalSellerId = seller_id || null;
                let isFootprintAttributed = 0;

                try {
                    // Search for a visit in the last 30 days with a matching phone or email
                    // Priority: Footprint overrides manual seller_id
                    const [footprintRows]: any = await pool.execute(`
                        SELECT seller_id 
                        FROM registraya_vcard_field_visits 
                        WHERE (contact_phone = ? OR (contact_email IS NOT NULL AND contact_email = ?))
                          AND created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
                        ORDER BY created_at DESC 
                        LIMIT 1
                    `, [whatsapp, email]);

                    if (footprintRows.length > 0) {
                        finalSellerId = footprintRows[0].seller_id;
                        isFootprintAttributed = 1;
                        console.log(`ATTRIBUTION: Footprint found for ${email}. Attributed to seller ${finalSellerId}`);
                    }
                } catch (attributionErr) {
                    console.error("Error checking footprint attribution:", attributionErr);
                }
                // -----------------------------------

                const insertQuery = `
                    INSERT INTO registraya_vcard_registros (
                        id, created_at, nombre, email, whatsapp, profesion, empresa, bio, direccion,
                        web, google_business, instagram, linkedin, facebook, tiktok, youtube, x, productos_servicios,
                        plan, foto_url, comprobante_url, galeria_urls, status, paid_at, slug, etiquetas,
                        commission_status, seller_id, attributed_by_footprint, edit_code, edit_uses_remaining,
                        tipo_perfil, nombres, apellidos, nombre_negocio, contacto_nombre, contacto_apellido,
                        menu_digital
                    ) VALUES (
                        ?, ?, ?, ?, ?, ?, ?, ?, ?, 
                        ?, ?, ?, ?, ?, ?, ?, ?, ?, 
                        ?, ?, ?, ?, ?, ?, ?, ?, 
                        ?, ?, ?, ?, ?,
                        ?, ?, ?, ?, ?, ?,
                        ?
                    )
                `;

                const values = [
                    newId, now, finalNombre, email, whatsapp, profesion || null, empresa || null, bio || null, direccion || null,
                    web || null, google_business || null, instagram || null, linkedin || null, facebook || null, tiktok || null, youtube || null, x || null, productos_servicios || null,
                    plan || null, foto_url || null, comprobante_url || null, galeriaUrlsJson, finalStatus || 'pendiente', null, finalSlug, etiquetas || null,
                    'pending', // commission_status
                    finalSellerId,
                    isFootprintAttributed,
                    serverGeneratedEditCode, 2, // edit_code and uses
                    tipo_perfil || 'persona', nombres || null, apellidos || null, nombre_negocio || null, contacto_nombre || null, contacto_apellido || null,
                    menu_digital || null
                ];

                await pool.execute(insertQuery, values);

                return NextResponse.json({ success: true, action: 'created', id: newId, edit_code: serverGeneratedEditCode });
            }

        } catch (dbErr) {
            throw dbErr;
        }
    } catch (err: any) {
        console.error('Error en API de registro (MySQL):', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
