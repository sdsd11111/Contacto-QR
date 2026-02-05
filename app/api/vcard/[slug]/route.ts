import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    try {
        const { slug } = params;

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

        // 2. Generar vCard con CATEGORÍAS
        const vcard = [
            'BEGIN:VCARD',
            'VERSION:3.0',
            `FN;CHARSET=UTF-8:${user.nombre}`,
            `N;CHARSET=UTF-8:${user.nombre.split(' ').reverse().join(';')};;;`,
            `TITLE;CHARSET=UTF-8:${user.profesion}`,
            `ORG;CHARSET=UTF-8:${user.empresa}`,
            `TEL;TYPE=CELL,VOICE:${user.whatsapp}`,
            `EMAIL;TYPE=WORK,INTERNET:${user.email}`,
            `ADR;TYPE=WORK,POSTAL;CHARSET=UTF-8:;;${user.direccion || ''};;;;`,
            user.web ? `URL:${user.web}` : '',
            `NOTE;CHARSET=UTF-8:${user.bio} - Generado con RegistrameYa`,
            user.etiquetas ? `CATEGORIES:${user.etiquetas}` : '', // ← ETIQUETAS AQUÍ
            user.instagram ? `X-SOCIALPROFILE;TYPE=instagram:${user.instagram}` : '',
            user.linkedin ? `X-SOCIALPROFILE;TYPE=linkedin:${user.linkedin}` : '',
            `X-SOCIALPROFILE;TYPE=whatsapp:https://wa.me/${user.whatsapp.replace(/[^0-9]/g, '')}`,
            'END:VCARD'
        ].filter(Boolean).join('\n');

        // 3. Retornar con headers que fuercen descarga
        return new NextResponse(vcard, {
            status: 200,
            headers: {
                'Content-Type': 'text/vcard;charset=utf-8',
                'Content-Disposition': `attachment; filename="${slug}.vcf"`,
                'Cache-Control': 'public, max-age=3600', // Cache por 1 hora
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
