import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await context.params;

        // 1. Buscar usuario por slug
        const { data: user, error } = await supabase
            .from('registraya_vcard_registros')
            .select('*')
            .eq('slug', slug)
            .maybeSingle();

        if (error || !user) {
            return NextResponse.json(
                { error: 'Perfil no encontrado' },
                { status: 404 }
            );
        }

        // 1b. Procesar foto si existe
        let photoBlock = '';
        if (user.foto_url) {
            try {
                const response = await fetch(user.foto_url);
                if (response.ok) {
                    const arrayBuffer = await response.arrayBuffer();
                    const base64 = Buffer.from(arrayBuffer).toString('base64');
                    // RFC 2426: Line folding (75 chars max, then CRLF + space)
                    const folded = base64.match(/.{1,72}/g)?.join('\r\n ') || base64;
                    photoBlock = `PHOTO;ENCODING=b;TYPE=JPEG:\r\n ${folded}`;
                }
            } catch (photoErr) {
                console.error('Error fetching photo for vCard:', photoErr);
                // Si falla la foto, el vCard se genera sin ella para no romper la descarga
            }
        }

        // 1c. Formatear Notas con Galería y Productos
        let noteContent = `${user.bio || ''}`;
        if (user.productos_servicios) {
            noteContent += `\n\nProductos/Servicios:\n${user.productos_servicios}`;
        }
        noteContent += ` - Generado con RegistrameYa`;

        if (user.galeria_urls && user.galeria_urls.length > 0) {
            noteContent += `\n\nMis Trabajos:\n${user.galeria_urls.join('\n')}`;
        }

        // 2. Generar vCard con todos los campos (Version 4.0)
        const vcard = [
            'BEGIN:VCARD',
            'VERSION:4.0',
            `FN;CHARSET=UTF-8:${user.nombre}`,
            `N;CHARSET=UTF-8:${user.nombre.split(' ').reverse().join(';')};;;`,
            `TITLE;CHARSET=UTF-8:${user.profesion || ''}`,
            `ORG;CHARSET=UTF-8:${user.empresa || ''}`,
            `TEL;TYPE=cell,text,voice;VALUE=uri:tel:${user.whatsapp}`,
            `EMAIL;TYPE=work:${user.email}`,
            `ADR;TYPE=work;LABEL="${(user.direccion || '').replace(/"/g, "'")}":;;${user.direccion || ''};;;;`,
            user.web ? `URL:${user.web}` : '',
            `NOTE:${noteContent.replace(/\n/g, '\\n')}`,
            user.etiquetas ? `CATEGORIES:${user.etiquetas}` : '',
            photoBlock,
            user.instagram ? `X-SOCIALPROFILE;TYPE=instagram;LABEL=Instagram:${user.instagram}` : '',
            user.linkedin ? `X-SOCIALPROFILE;TYPE=linkedin;LABEL=LinkedIn:${user.linkedin}` : '',
            user.facebook ? `X-SOCIALPROFILE;TYPE=facebook;LABEL=Facebook:${user.facebook}` : '',
            user.tiktok ? `X-SOCIALPROFILE;TYPE=tiktok;LABEL=TikTok:${user.tiktok}` : '',
            `X-SOCIALPROFILE;TYPE=whatsapp;LABEL=WhatsApp:https://wa.me/${user.whatsapp.replace(/[^0-9]/g, '')}`,
            `REV:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
            'END:VCARD'
        ].filter(Boolean).join('\r\n');

        // 3. Retornar con headers que fuercen descarga
        return new NextResponse(vcard, {
            status: 200,
            headers: {
                'Content-Type': 'text/vcard;charset=utf-8',
                'Content-Disposition': `attachment; filename="${slug}.vcf"`,
                'Cache-Control': 'no-store, max-age=0', // Evitar cache para que cambios en fotos/datos se vean rápido
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
