import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await context.params;

        // 1. Buscar usuario por slug o ID
        let { data: user, error } = await supabase
            .from('registraya_vcard_registros')
            .select('*')
            .eq('slug', slug)
            .maybeSingle();

        // Si no se encuentra por slug, intentar por ID
        if (!user && !error) {
            const { data: userById, error: errorById } = await supabase
                .from('registraya_vcard_registros')
                .select('*')
                .eq('id', slug)
                .maybeSingle();

            if (userById) {
                user = userById;
            }
        }

        if (error || !user) {
            return NextResponse.json(
                { error: 'Perfil no encontrado' },
                { status: 404 }
            );
        }

        // 1b. Formatear Notas con Galería, Productos y Redes (para redundancia)
        let noteContent = `${user.bio || ''}`;
        if (user.productos_servicios) {
            noteContent += `\n\nProductos/Servicios:\n${user.productos_servicios}`;
        }

        if (user.instagram || user.facebook || user.linkedin || user.tiktok) {
            noteContent += `\n\nRedes Sociales:`;
            if (user.facebook) noteContent += `\nFB: ${user.facebook}`;
            if (user.instagram) noteContent += `\nIG: ${user.instagram}`;
            if (user.tiktok) noteContent += `\nTK: ${user.tiktok}`;
            if (user.linkedin) noteContent += `\nLI: ${user.linkedin}`;
        }

        if (user.galeria_urls && user.galeria_urls.length > 0) {
            noteContent += `\n\nMis Trabajos:\n${user.galeria_urls.join('\n')}`;
        }

        if (user.etiquetas) {
            noteContent += `\n\nEtiquetas: ${user.etiquetas}`;
        }

        noteContent += `\n\n- RegistrameYa`;

        // Limpiar WhatsApp para el campo TEL
        const cleanWhatsApp = user.whatsapp.replace(/\s+/g, '');

        // 2. Generar vCard con todos los campos (Version 2.1 - Máxima compatibilidad móvil)
        const vcardArr = [
            'BEGIN:VCARD',
            'VERSION:2.1',
            `FN:${user.nombre}`,
            `N:${user.nombre.split(' ').reverse().join(';')};;;`,
            user.profesion ? `TITLE:${user.profesion}` : '',
            user.empresa ? `ORG:${user.empresa}` : '',
            `TEL;TYPE=CELL:${cleanWhatsApp}`,
            `EMAIL;TYPE=WORK,INTERNET:${user.email}`,

            // Dirección con etiqueta personalizada para iOS (Ubicación)
            `item1.ADR:;;${user.direccion || ''};;;;`,
            `item1.X-ABLabel:Ubicación`,

            user.web ? `URL:${user.web}` : '',

            // Redes Sociales con etiquetas personalizadas
            user.instagram ? `item2.URL:${user.instagram}` : '',
            user.instagram ? `item2.X-ABLabel:Instagram` : '',

            user.facebook ? `item3.URL:${user.facebook}` : '',
            user.facebook ? `item3.X-ABLabel:Facebook` : '',

            user.linkedin ? `item4.URL:${user.linkedin}` : '',
            user.linkedin ? `item4.X-ABLabel:LinkedIn` : '',

            user.tiktok ? `item5.URL:${user.tiktok}` : '',
            user.tiktok ? `item5.X-ABLabel:TikTok` : '',

            `NOTE:${noteContent.replace(/\n/g, '\\n')}`
        ];

        // Procesar foto de forma síncrona/inline para evitar problemas de flujo
        if (user.foto_url) {
            try {
                const photoResp = await fetch(user.foto_url);
                if (photoResp.ok) {
                    const buffer = await photoResp.arrayBuffer();
                    const b64 = Buffer.from(buffer).toString('base64');
                    // Formato más compatible para PHOTO en vCard 2.1
                    vcardArr.push(`PHOTO;JPEG;ENCODING=BASE64:\r\n${b64}\r\n`);
                }
            } catch (e) {
                console.error("Error inline photo:", e);
            }
        }

        vcardArr.push('END:VCARD');
        const vcard = vcardArr.filter(Boolean).join('\r\n');

        // 3. Retornar con headers estándar
        return new NextResponse(vcard, {
            status: 200,
            headers: {
                'Content-Type': 'text/vcard; charset=UTF-8',
                'Content-Disposition': `inline; filename="${slug}.vcf"`,
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
