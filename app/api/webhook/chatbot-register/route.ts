import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { formatPhoneEcuador } from '@/lib/utils';
import { validateAdminKey } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    // 1. Validar autorización (requiere la clave x-admin-key en cabecera)
    if (!validateAdminKey(req)) {
        return NextResponse.json(
            { error: 'No autorizado. Se requiere x-admin-key válida.' },
            { status: 401 }
        );
    }

    try {
        const body = await req.json();

        const {
            email, whatsapp, tipo_perfil, nombres, apellidos, nombre_negocio,
            contacto_nombre, contacto_apellido, profesion, empresa, bio,
            direccion, web, instagram, facebook, linkedin, tiktok, youtube, x,
            google_business, foto_url, productos_servicios, etiquetas, slug, template_id
        } = body;

        // Validaciones básicas de campos requeridos
        if (!email) {
            return NextResponse.json({ error: 'El campo "email" es requerido.' }, { status: 400 });
        }
        if (!whatsapp) {
            return NextResponse.json({ error: 'El campo "whatsapp" es requerido.' }, { status: 400 });
        }
        if (!tipo_perfil || !['persona', 'negocio'].includes(tipo_perfil)) {
            return NextResponse.json({ error: 'El campo "tipo_perfil" debe ser "persona" o "negocio".' }, { status: 400 });
        }

        // Formatear el teléfono
        const formattedWhatsapp = formatPhoneEcuador(whatsapp);

        // Determinar el nombre final del registro
        const finalNombre = tipo_perfil === 'negocio'
            ? (nombre_negocio || `${contacto_nombre || ''} ${contacto_apellido || ''}`.trim())
            : `${nombres || ''} ${apellidos || ''}`.trim();

        if (!finalNombre) {
            return NextResponse.json({ error: 'No se pudo determinar el nombre del perfil con los datos provistos.' }, { status: 400 });
        }

        // Configurar el estado del pago (por defecto 'pagado' para automatización del plan de $35)
        const finalStatus = body.status === 'pendiente' ? 'pendiente' : 'pagado';
        const paidAtValue = finalStatus === 'pagado' ? new Date() : null;

        // Buscar si el correo ya existe en la base de datos
        const [rows]: any = await pool.execute(
            'SELECT id, slug, edit_code, status, paid_at FROM registraya_vcard_registros WHERE email = ?',
            [email]
        );

        let action = 'created';
        let recordId = '';
        let finalSlug = slug;
        let editCode = '';

        if (rows.length > 0) {
            // --- ACTUALIZAR REGISTRO EXISTENTE (Bypasseando el edit_code porque es una llamada Admin autorizada) ---
            action = 'updated';
            const existingUser = rows[0];
            recordId = existingUser.id;
            editCode = existingUser.edit_code;
            if (!finalSlug) {
                finalSlug = existingUser.slug;
            }

            const updateQuery = `
                UPDATE registraya_vcard_registros SET
                    nombre = ?, whatsapp = ?, profesion = ?, empresa = ?, bio = ?, direccion = ?,
                    web = ?, google_business = ?, instagram = ?, linkedin = ?, facebook = ?, tiktok = ?, youtube = ?, x = ?,
                    productos_servicios = ?, plan = ?, foto_url = ?, status = ?,
                    paid_at = CASE WHEN ? = 'pagado' AND (paid_at IS NULL) THEN NOW() ELSE paid_at END,
                    slug = ?, etiquetas = ?, tipo_perfil = ?, nombres = ?, apellidos = ?,
                    nombre_negocio = ?, contacto_nombre = ?, contacto_apellido = ?, template_id = ?
                WHERE id = ?
            `;

            await pool.execute(updateQuery, [
                finalNombre, formattedWhatsapp, profesion || null, empresa || null, bio || null, direccion || null,
                web || null, google_business || null, instagram || null, linkedin || null, facebook || null, tiktok || null, youtube || null, x || null,
                productos_servicios || null, 'contacto', foto_url || null, finalStatus,
                finalStatus, finalSlug, etiquetas || null, tipo_perfil, nombres || null, apellidos || null,
                nombre_negocio || null, contacto_nombre || null, contacto_apellido || null, template_id || 'classic',
                recordId
            ]);
        } else {
            // --- CREAR NUEVO REGISTRO (INSERT) ---
            recordId = uuidv4();
            editCode = 'RYA-2026-BOT-' + Math.random().toString(36).substring(2, 8).toUpperCase();

            // Generar slug si no se provee
            if (!finalSlug) {
                const cleanName = finalNombre.toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/[^a-z0-9]/g, "-")
                    .replace(/-+/g, "-")
                    .replace(/^-|-$/g, "");
                finalSlug = `${cleanName}-${Math.random().toString(36).substring(2, 6)}`;
            }

            const insertQuery = `
                INSERT INTO registraya_vcard_registros (
                    id, created_at, nombre, email, whatsapp, profesion, empresa, bio, direccion,
                    web, google_business, instagram, linkedin, facebook, tiktok, youtube, x, productos_servicios,
                    plan, foto_url, status, paid_at, slug, etiquetas, edit_code, edit_uses_remaining,
                    tipo_perfil, nombres, apellidos, nombre_negocio, contacto_nombre, contacto_apellido,
                    template_id
                ) VALUES (
                    ?, NOW(), ?, ?, ?, ?, ?, ?, ?, 
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, 
                    ?, ?, ?, ?, ?, ?, ?, 2,
                    ?, ?, ?, ?, ?, ?,
                    ?
                )
            `;

            await pool.execute(insertQuery, [
                recordId, finalNombre, email, formattedWhatsapp, profesion || null, empresa || null, bio || null, direccion || null,
                web || null, google_business || null, instagram || null, linkedin || null, facebook || null, tiktok || null, youtube || null, x || null, productos_servicios || null,
                'contacto', foto_url || null, finalStatus, paidAtValue, finalSlug, etiquetas || null, editCode,
                tipo_perfil, nombres || null, apellidos || null, nombre_negocio || null, contacto_nombre || null, contacto_apellido || null,
                template_id || 'classic'
            ]);
        }

        // Construir URLs de retorno
        const baseUrl = req.nextUrl.origin;
        const vcfUrl = `${baseUrl}/api/vcard/${finalSlug}`;
        const cardUrl = `${baseUrl}/card/${finalSlug}`;

        return NextResponse.json({
            success: true,
            action,
            id: recordId,
            slug: finalSlug,
            edit_code: editCode,
            status: finalStatus,
            vcf_url: vcfUrl,
            card_url: cardUrl
        }, { status: 200 });

    } catch (err: any) {
        console.error('Error en webhook de chatbot (chatbot-register):', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
