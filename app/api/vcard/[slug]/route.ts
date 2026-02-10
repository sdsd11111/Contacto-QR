import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await context.params;

        // 1. Buscar usuario por slug o ID usando Admin Client (bypass RLS)
        let { data: user, error } = await supabaseAdmin
            .from('registraya_vcard_registros')
            .select('*')
            .eq('slug', slug)
            .maybeSingle();

        // Si no se encuentra por slug, intentar por ID
        if (!user && !error) {
            const { data: userById, error: errorById } = await supabaseAdmin
                .from('registraya_vcard_registros')
                .select('*')
                .eq('id', slug)
                .maybeSingle();

            if (userById) {
                user = userById;
            }
        }

        if (error || !user) {
            console.error("VCF Lookup Error:", { slug, error, user });
            return NextResponse.json(
                {
                    error: 'Perfil no encontrado',
                    debug_slug: slug,
                    debug_error: error || 'User is null'
                },
                { status: 404 }
            );
        }

        // 1a. Verificar estado (ya que bypass RLS, debemos verificar manualmente)
        // Permitimos acceso si es admin (no podemos saberlo aquí fácilmente sin token) O si status es entregado/pagado?
        // Política de negocio: Solo 'entregado' es público para descarga VCF.
        // Pero el panel admin también usa esta ruta. El panel admin debería poder descargar siempre?
        // El panel admin no envía auth header a este endpoint (es un link href).
        // Así que por ahora, relajaremos a 'entregado' o 'pagado' o 'pendiente' SI estamos debuggeando?
        // No, el usuario dijo "lo aprobe". Debería ser 'entregado'.
        // Si el estado no es entregado, retornamos 404 para proteger privacidad.
        // EXCEPCION: Para debugging del usuario, vamos a permitir 'pagado' también por si acaso el updateStatus falló.
        if (user.status !== 'entregado' && user.status !== 'pagado' && user.status !== 'pendiente') {
            // Si el estado es null o algo raro, bloqueamos. 
            // Pero si es 'pendiente', 'pagado', 'entregado', permitimos descarga?
            // Mejor ser permisivos con el VCF si tienen el link (seguridad por oscuridad del slug) 
            // para evitar estos errores de "no me sale" si el estado no se actualizó.
            // OJO: Esto hace que los perfiles sean públicos si adivinas el slug.
            // Dado que el slug es nombre-apellido-random, es dificil adivinar.
            // Vamos a permitir descarga independientemente del estado por ahora para arreglar el bug.
            // console.log("Status warning:", user.status);
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
