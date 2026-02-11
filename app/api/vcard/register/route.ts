
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return NextResponse.json({ error: 'Error de configuración: Falta SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 });
    }

    try {
        const body = await req.json();

        // El cliente envía los nombres de columnas de DB directamente (nombre, email, etc.)
        const {
            nombre, email, whatsapp, profesion, empresa, bio, direccion,
            web, google_business, instagram, linkedin, facebook, tiktok, productos_servicios,
            plan, foto_url, comprobante_url, galeria_urls,
            status, slug, etiquetas
        } = body;

        // Validación básica
        if (!email || !nombre) {
            return NextResponse.json({ error: 'Email y Nombre son requeridos' }, { status: 400 });
        }

        // Upsert usando Service Role (bypass RLS)
        const upsertData = {
            nombre: nombre,
            email: email,
            whatsapp: whatsapp,
            profesion: profesion,
            empresa: empresa,
            bio: bio,
            direccion: direccion,
            web: web,
            google_business: google_business,
            instagram: instagram,
            linkedin: linkedin,
            facebook: facebook,
            tiktok: tiktok,
            productos_servicios: productos_servicios,
            plan: plan,
            foto_url: foto_url,
            comprobante_url: comprobante_url,
            galeria_urls: galeria_urls,
            status: status || 'pendiente',
            slug: slug,
            etiquetas: etiquetas
        };

        const { data, error } = await supabaseAdmin
            .from('registraya_vcard_registros')
            .upsert(upsertData, { onConflict: 'email' })
            .select()
            .single();

        if (error) {
            console.error('Error en upsert de registro:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (err: any) {
        console.error('Error en API de registro:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
