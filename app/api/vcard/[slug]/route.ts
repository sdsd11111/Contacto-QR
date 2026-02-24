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
        if (user.status !== 'entregado' && user.status !== 'pagado' && user.status !== 'pendiente') {
            // console.log("Status warning:", user.status);
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

        const sanitize = (text: string) => text ? text.replace(/\r?\n/g, '\\n') : '';

        // Safe JSON parse for gallery
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

        let noteContent = `${sanitize(bio)}`;
        if (user.productos_servicios) {
            noteContent += `\\n\\nProductos/Servicios:\\n${sanitize(user.productos_servicios)}`;
        }

        if (user.instagram || user.facebook || user.linkedin || user.tiktok) {
            noteContent += `\\n\\nRedes Sociales:`;
            if (user.facebook) noteContent += `\\nFB: ${user.facebook}`;
            if (user.instagram) noteContent += `\\nIG: ${user.instagram}`;
            if (user.tiktok) noteContent += `\\nTK: ${user.tiktok}`;
            if (user.linkedin) noteContent += `\\nLI: ${user.linkedin}`;
        }

        const gallery = getGalleryArray(user.galeria_urls);
        if (gallery.length > 0) {
            noteContent += `\\n\\nMis Trabajos:\\n${gallery.join('\\n')}`;
        }

        if (user.etiquetas) {
            noteContent += `\\n\\nEtiquetas: ${sanitize(user.etiquetas)}`;
        }

        noteContent += "\\n\\n- ActivaQR";

        // Limpiar WhatsApp para el campo TEL
        const cleanWhatsApp = whatsapp.replace(/\D/g, ''); // Solo números

        // Función para line folding (obligatorio en vCard para líneas largas)
        // Según RFC 6350: Las líneas no deben exceder 75 octetos. 
        // Si se excede, se debe insertar CRLF seguido de un espacio.
        const foldLine = (line: string) => {
            if (!line) return '';
            const maxLength = 75;
            if (line.length <= maxLength) return line;

            let result = '';
            let currentLine = line.substring(0, maxLength);
            let remaining = line.substring(maxLength);

            result = currentLine;

            while (remaining.length > 0) {
                const chunk = remaining.substring(0, maxLength - 1);
                remaining = remaining.substring(maxLength - 1);
                result += '\r\n ' + chunk;
            }

            return result;
        };

        // 2. Generar vCard con todos los campos (Version 3.0 - Estándar moderno)
        let fullName = '';
        let structuredName = ''; // Campo N:
        let organization = '';   // Campo ORG:

        if (user.tipo_perfil === 'negocio') {
            fullName = user.nombre_negocio || nombre;
            organization = user.nombre_negocio || nombre;
            if (user.contacto_nombre || user.contacto_apellido) {
                structuredName = `${user.contacto_apellido || ''};${user.contacto_nombre || ''};;;`;
            } else {
                structuredName = ';;;;';
            }
        } else {
            // Caso Persona (o legacy)
            const firstName = user.nombres || nombre.split(' ')[0] || '';
            const lastName = user.apellidos || nombre.split(' ').slice(1).join(' ') || '';
            fullName = `${firstName} ${lastName}`.trim() || nombre;
            structuredName = `${lastName};${firstName};;;`;
            organization = user.empresa || "";
        }

        const vcardLines = [
            'BEGIN:VCARD',
            'VERSION:3.0',
            `FN:${escapeVCardValue(fullName)}`,
            `N:${escapeVCardValue(structuredName)}`,
            user.profesion ? `TITLE:${escapeVCardValue(user.profesion)}` : '',
            `ORG:${escapeVCardValue(organization)}`,
            `TEL;TYPE=CELL,VOICE:${cleanWhatsApp}`,
            `EMAIL;TYPE=WORK,INTERNET:${escapeVCardValue(user.email)}`,
            user.direccion ? `ADR;TYPE=WORK:;;${escapeVCardValue(user.direccion)};;;;` : '',
            user.web ? `URL:${escapeVCardValue(user.web)}` : '',
            user.google_business ? `URL;type=GOOGLE_BUSINESS:${escapeVCardValue(user.google_business)}` : '',
            `NOTE:${escapeVCardValue(noteContent + (user.google_business ? '\n\nUbicación/Google Maps: ' + user.google_business : ""))}`,
            // Redes Sociales como URL en vCard 3.0
            user.instagram ? `URL;type=INSTAGRAM:${escapeVCardValue(user.instagram)}` : '',
            user.facebook ? `URL;type=FACEBOOK:${escapeVCardValue(user.facebook)}` : '',
            user.linkedin ? `URL;type=LINKEDIN:${escapeVCardValue(user.linkedin)}` : '',
            user.tiktok ? `URL;type=TIKTOK:${escapeVCardValue(user.tiktok)}` : '',
        ];

        // Procesar foto
        if (user.foto_url) {
            try {
                const photoResp = await fetch(user.foto_url, { next: { revalidate: 3600 } });
                if (photoResp.ok) {
                    const buffer = await photoResp.arrayBuffer();
                    const b64 = Buffer.from(buffer).toString('base64');
                    // vCard 3.0 PHOTO syntax
                    vcardLines.push(`PHOTO;ENCODING=b;TYPE=JPEG:${b64}`);
                }
            } catch (e) {
                console.error("Error inline photo:", e);
                // Si falla la foto, el archivo sigue siendo válido
            }
        }

        vcardLines.push('END:VCARD');

        // Filtramos líneas vacías y aplicamos foldLine a cada una, uniendo con \r\n
        const vcard = vcardLines
            .filter(Boolean)
            .map(line => foldLine(line))
            .join('\r\n');

        // Debug: Check for literal newlines (other than \r\n separators)
        const vcardDEBUG = vcard.replace(/\r\n/g, '[CRLF]');
        if (vcardDEBUG.includes('\n')) {
            console.error("VCard contains literal LF!");
            const pos = vcardDEBUG.indexOf('\n');
            console.log("Context:", vcardDEBUG.substring(pos - 20, pos + 20));
        }
        if (vcardDEBUG.includes('\r')) {
            console.error("VCard contains literal CR!");
        }

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
