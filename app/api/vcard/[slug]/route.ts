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

        noteContent += `\\n\\n- RegistrameYa`;

        // Limpiar WhatsApp para el campo TEL
        const cleanWhatsApp = whatsapp.replace(/\D/g, ''); // Solo números

        // Función para line folding (obligatorio en vCard para líneas largas)
        const foldLine = (line: string) => {
            const maxLength = 75;
            if (line.length <= maxLength) return line;
            let folded = '';
            for (let i = 0; i < line.length; i += maxLength) {
                folded += (i > 0 ? ' ' : '') + line.substring(i, i + maxLength) + '\r\n';
            }
            return folded.trim();
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
            `FN:${fullName}`,
            `N:${structuredName}`,
            user.profesion ? `TITLE:${user.profesion}` : '',
            `ORG:${organization}`,
            `TEL;TYPE=CELL,VOICE:${cleanWhatsApp}`,
            `EMAIL;TYPE=WORK,INTERNET:${user.email}`,
            user.direccion ? `ADR;TYPE=WORK:;;${user.direccion};;;;` : '',
            user.web ? `URL:${user.web}` : '',
            user.google_business ? `URL;type=GOOGLE_BUSINESS:${user.google_business}` : '',
            `NOTE:${noteContent}${user.google_business ? '\\n\\nUbicación/Google Maps: ' + user.google_business : ''}`,
            // Redes Sociales como URL en vCard 3.0
            user.instagram ? `URL;type=INSTAGRAM:${user.instagram}` : '',
            user.facebook ? `URL;type=FACEBOOK:${user.facebook}` : '',
            user.linkedin ? `URL;type=LINKEDIN:${user.linkedin}` : '',
            user.tiktok ? `URL;type=TIKTOK:${user.tiktok}` : '',
        ];

        // Procesar foto
        if (user.foto_url) {
            try {
                const photoResp = await fetch(user.foto_url, { next: { revalidate: 3600 } });
                if (photoResp.ok) {
                    const buffer = await photoResp.arrayBuffer();
                    const b64 = Buffer.from(buffer).toString('base64');
                    // vCard 3.0 PHOTO syntax
                    vcardLines.push(foldLine(`PHOTO;ENCODING=b;TYPE=JPEG:${b64}`));
                }
            } catch (e) {
                console.error("Error inline photo:", e);
                // Si falla la foto, el archivo sigue siendo válido
            }
        }

        vcardLines.push('END:VCARD');

        // Filtramos líneas vacías y unimos con \r\n
        const vcard = vcardLines.filter(Boolean).join('\r\n');

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
