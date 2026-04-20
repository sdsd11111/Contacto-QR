import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await context.params;

        // 1. Buscar usuario por slug o ID usando MySQL
        const connection = await pool.getConnection();
        let user: any = null;

        try {
            const [rows] = await connection.execute(
                'SELECT * FROM registraya_vcard_registros WHERE slug = ? OR id = ?',
                [slug, slug]
            );

            if ((rows as any[]).length > 0) {
                user = (rows as any[])[0];
            }
        } finally {
            connection.release();
        }

        if (!user) {
            console.error("VCF Lookup Error:", { slug });
            return NextResponse.json(
                {
                    error: 'Perfil no encontrado',
                    debug_slug: slug
                },
                { status: 404 }
            );
        }

        // 1a. Verificar estado
        if (user.status === 'cancelado') {
            return NextResponse.redirect(new URL('/card/activaqr-9ag4', request.url));
        }

        // 1b. Formatear Notas con Galería, Productos y Redes
        const escapeVCardValue = (text: string) => {
            if (!text) return '';
            return text
                .replace(/\\/g, '\\\\')
                .replace(/,/g, '\\,')
                .replace(/;/g, '\\;')
                .replace(/\r?\n/g, '\\n');
        };

        const getGalleryArray = (data: any) => {
            if (!data) return [];
            if (Array.isArray(data)) return data;
            if (typeof data === 'string') {
                try {
                    const parsed = JSON.parse(data);
                    return Array.isArray(parsed) ? parsed : [];
                } catch (e) {
                    return data.split(',').map(u => u.trim()).filter(Boolean);
                }
            }
            return [];
        };

        const bio = user.bio || '';
        const whatsapp = user.whatsapp || '';
        const nombre = user.nombre || 'Usuario';

        const isCarlosVIP = slug === 'litos-ink-vape-urban-shop-zg5z' || user.id === '6212fd72-e576-474d-8c60-66d9802826ec';

        let noteContent = bio;
        if (user.productos_servicios) {
            noteContent += `\n\nProductos/Servicios:\n${user.productos_servicios}`;
        }

        const gallery = getGalleryArray(user.galeria_urls);
        if (gallery.length > 0) {
            noteContent += `\n\nMis Trabajos:\n${gallery.join('\n')}`;
        }

        // Solo añadimos etiquetas a las notas si NO es Carlos VIP (Limpieza VIP)
        if (user.etiquetas && !isCarlosVIP) {
            noteContent += `\n\nEtiquetas: ${user.etiquetas}`;
        }

        noteContent += "\n\n- Realizado por www.activaqr.com";

        // Limpiar WhatsApp para el campo TEL (Preservar el + si existe para mejor compatibilidad internacional)
        const cleanWhatsApp = whatsapp.replace(/\D/g, ''); // Solo números para links
        const whatsappWithPlus = whatsapp.trim().startsWith('+') ? `+${cleanWhatsApp}` : cleanWhatsApp;

        // Función para line folding (removida para campos de texto por problemas en Android)

        // 2. Generar vCard con todos los campos (Version 3.0)
        let fullName = '';
        let structuredName = ''; // Campo N:
        let organization = '';   // Campo ORG:

        if (user.tipo_perfil === 'negocio') {
            organization = user.nombre_negocio || nombre;
            if (user.contacto_nombre || user.contacto_apellido) {
                // To display First Name Last Name correctly on phones, it must be: LastName;FirstName;;;
                structuredName = `${escapeVCardValue(user.contacto_apellido || '')};${escapeVCardValue(user.contacto_nombre || '')};;;`;
                // Set Formatted Name (FN) to: Business Name - Contact Name 
                const contactFullName = `${user.contacto_nombre || ''} ${user.contacto_apellido || ''}`.trim();
                fullName = `${organization} - ${contactFullName}`;
            } else {
                structuredName = ';;;;';
                fullName = organization;
            }
        } else {
            // Caso Persona (o legacy)
            const firstName = user.nombres || nombre.split(' ')[0] || '';
            const lastName = user.apellidos || nombre.split(' ').slice(1).join(' ') || '';
            fullName = `${firstName} ${lastName}`.trim() || nombre;
            structuredName = `${escapeVCardValue(lastName)};${escapeVCardValue(firstName)};;;`;
            organization = user.empresa || "";
        }

        const vcardLines = [
            'BEGIN:VCARD',
            'VERSION:3.0',
            `FN:${escapeVCardValue(fullName)}`,
            `N:${structuredName}`, // Ya escapado individualmente
            user.profesion ? `TITLE:${escapeVCardValue(user.profesion)}` : '',
            `TEL;TYPE=CELL,VOICE:${whatsappWithPlus}`,
            `X-ABLabel:Móvil`,
            `EMAIL;TYPE=WORK,INTERNET:${escapeVCardValue(user.email)}`,
            user.direccion ? `ADR;TYPE=WORK:;;${escapeVCardValue(user.direccion)};;;;` : '',
            user.web ? `URL:${escapeVCardValue(user.web)}` : '',
            `NOTE:${escapeVCardValue(noteContent)}`, // Simplified notes
            // Standard generic URLs instead of itemX to guarantee Android support
            user.google_business ? `URL:${escapeVCardValue(user.google_business)}` : '',
            user.review_url ? `URL:${escapeVCardValue(user.review_url)}` : '',
            // Categories (Tags)
            user.etiquetas ? `CATEGORIES:${escapeVCardValue(user.etiquetas)}` : '',
            // Standard URLs (fallback) and explicit X-SOCIALPROFILE for better iOS integration
            user.instagram ? `URL;type=INSTAGRAM:${escapeVCardValue(user.instagram)}` : '',
            user.instagram ? `X-SOCIALPROFILE;type=instagram:${escapeVCardValue(user.instagram)}` : '',
            user.facebook ? `URL;type=FACEBOOK:${escapeVCardValue(user.facebook)}` : '',
            user.facebook ? `X-SOCIALPROFILE;type=facebook:${escapeVCardValue(user.facebook)}` : '',
            user.linkedin ? `URL;type=LINKEDIN:${escapeVCardValue(user.linkedin)}` : '',
            user.linkedin ? `X-SOCIALPROFILE;type=linkedin:${escapeVCardValue(user.linkedin)}` : '',
            user.tiktok ? `URL;type=TIKTOK:${escapeVCardValue(user.tiktok)}` : '',
            user.tiktok ? `X-SOCIALPROFILE;type=tiktok:${escapeVCardValue(user.tiktok)}` : '',
            user.youtube ? `URL;type=YOUTUBE:${escapeVCardValue(user.youtube)}` : '',
            user.x ? `URL;type=X:${escapeVCardValue(user.x)}` : '',
            // Strong WhatsApp discovery tags (using whatsappWithPlus to preserve the crucial '+' prefix for international numbers)
            whatsappWithPlus ? `X-SOCIALPROFILE;TYPE=whatsapp:whatsapp:${whatsappWithPlus}` : '',
            whatsappWithPlus ? `IMPP;X-SERVICE-TYPE=WhatsApp:whatsapp:${whatsappWithPlus}` : '',
            whatsappWithPlus ? `IMPP;SERVICE-TYPE=WhatsApp:whatsapp:${whatsappWithPlus}` : '',
            
            // Native Android Connected Apps tags
            whatsappWithPlus ? `X-ANDROID-CUSTOM:vnd.android.cursor.item/vnd.com.whatsapp.profile;${whatsappWithPlus};;;;;;;;;;;;;;;` : '',
            whatsappWithPlus ? `X-ANDROID-CUSTOM:vnd.android.cursor.item/vnd.com.whatsapp.voip;${whatsappWithPlus};;;;;;;;;;;;;;;` : '',
            whatsappWithPlus ? `X-ANDROID-CUSTOM:vnd.android.cursor.item/vnd.com.whatsapp.w4b.profile;${whatsappWithPlus};;;;;;;;;;;;;;;` : '',
            whatsappWithPlus ? `X-ANDROID-CUSTOM:vnd.android.cursor.item/vnd.com.whatsapp.w4b.voip;${whatsappWithPlus};;;;;;;;;;;;;;;` : '',
            
            user.nombre_negocio ? `X-WA-BIZ-NAME:${escapeVCardValue(user.nombre_negocio)}` : '',
            `X-CUSTOM(WTSAPP);TYPE=pref:whatsapp:${whatsappWithPlus}`,
        ];

        // --- INJERTO VIP PRE-GENERACIÓN (SOLO Carlos Vásquez - litos-ink-vape-urban-shop-zg5z) ---
        if (isCarlosVIP) {
            // 1. Forzar nombre "Litos ink" en iPhone: Sobreescribir FN, N, añadir ORG y X-ABShowAs
            for (let i = vcardLines.length - 1; i >= 0; i--) {
                if (vcardLines[i].startsWith('FN:')) {
                    vcardLines[i] = 'FN:Litos ink';
                }
                if (vcardLines[i].startsWith('N:')) {
                    vcardLines[i] = 'N:;Litos ink;;;';
                }
            }
            // Insertar ORG y X-ABShowAs después de la línea N:
            const nIndex = vcardLines.findIndex(l => l.startsWith('N:'));
            if (nIndex !== -1) {
                vcardLines.splice(nIndex + 1, 0, 'ORG:Litos ink', 'X-ABShowAs:COMPANY');
            }

            // 2. Eliminar X-SOCIALPROFILE genéricos (los que causan duplicados en iPhone)
            //    PERO conservar URL;type= para que el json_override pueda reemplazar los nombres
            const socialProfilesToRemove = ['X-SOCIALPROFILE;type=instagram', 'X-SOCIALPROFILE;type=facebook', 'X-SOCIALPROFILE;type=linkedin', 'X-SOCIALPROFILE;type=tiktok'];
            for (let i = vcardLines.length - 1; i >= 0; i--) {
                if (socialProfilesToRemove.some(tag => vcardLines[i].startsWith(tag))) {
                    vcardLines.splice(i, 1);
                }
            }
        }

        // Procesar foto
        if (user.foto_url) {
            try {
                // Use sharp to convert to JPEG and resize for compatibility
                const photoResp = await fetch(user.foto_url, { next: { revalidate: 3600 } });
                if (photoResp.ok) {
                    const originalBuffer = await photoResp.arrayBuffer();
                    const sharp = require('sharp');
                    
                    const processedBuffer = await sharp(Buffer.from(originalBuffer))
                        .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
                        .jpeg({ quality: 80 })
                        .toBuffer();

                    const b64 = processedBuffer.toString('base64');

                    // Fold base64 string every 74 characters to be safe for vCard specification
                    const foldedB64 = b64.match(/.{1,74}/g)?.join('\r\n ') || b64;
                    vcardLines.push(`PHOTO;ENCODING=b;TYPE=JPEG:${foldedB64}`);
                }
            } catch (e) {
                console.error("Error inline photo:", e);
                // Fallback to original logic if sharp fails
                try {
                    const photoResp = await fetch(user.foto_url);
                    if (photoResp.ok) {
                        const buffer = await photoResp.arrayBuffer();
                        const b64 = Buffer.from(buffer).toString('base64');
                        const foldedB64 = b64.match(/.{1,74}/g)?.join('\r\n ') || b64;
                        vcardLines.push(`PHOTO;ENCODING=b;TYPE=JPEG:${foldedB64}`);
                    }
                } catch (innerE) {
                    console.error("Critical fallback photo error:", innerE);
                }
            }
        }

        vcardLines.push('END:VCARD');

        // Unimos las líneas con \r\n, sin hacer foldLine a los campos de texto
        // porque el corte arbitrario rompe caracteres Unicode y secuencias de escape
        // en analizadores de Android/iOS.
        let vcard = vcardLines
            .filter(Boolean)
            .join('\r\n');

        // --- INICIO INJERTO VIP (VCF OVERRIDE) ---
        if (user.json_override) {
            try {
                const overrides = JSON.parse(user.json_override);
                for (const [key, value] of Object.entries(overrides)) {
                    if (typeof key === 'string' && typeof value === 'string') {
                        // Reemplazar globalmente todas las ocurrencias de la llave
                        // Usamos un escape básico para la llave en la expresión regular
                        const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        vcard = vcard.replace(new RegExp(escapeRegExp(key), 'g'), value);
                    }
                }
            } catch (e) {
                console.warn("Silent Fail: Falló el override VIP (JSON malformado) para:", user.slug || slug);
                // Si falla, el catch se lo traga silenciosamente y la variable vcard sigue conteniendo la data normal
            }
        }
        // --- FIN INJERTO VIP ---

        // 3. Retornar con headers estándar
        return new NextResponse(vcard, {
            status: 200,
            headers: {
                'Content-Type': 'text/vcard; charset=UTF-8',
                'Content-Disposition': `attachment; filename="${user.slug || slug}.vcf"`,
                'Cache-Control': 'no-store, max-age=0',
            },
        });
    } catch (err) {
        console.error('Error generating vCard:', err);
        return NextResponse.json(
            { error: 'Error al generar vCard' },
            { status: 500 }
        );
    }
}
