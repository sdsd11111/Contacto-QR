
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return NextResponse.json({ error: 'Error de configuración: Falta SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 });
    }

    try {
        const body = await req.json();
        const {
            name, email, whatsapp, profession, company, bio, address,
            web, instagram, linkedin, facebook, tiktok, products,
            plan, photo_url, comprobante_url, galeria_urls,
            status, slug, etiquetas
        } = body;

        // Validación básica
        if (!email || !name) {
            return NextResponse.json({ error: 'Email y Nombre son requeridos' }, { status: 400 });
        }

        // Upsert usando Service Role (bypass RLS)
        const upsertData = {
            nombre: name,
            email: email,
            whatsapp: whatsapp,
            profesion: profession,
            empresa: company,
            bio: bio,
            direccion: address,
            web: web,
            instagram: instagram,
            linkedin: linkedin,
            facebook: facebook,
            tiktok: tiktok,
            productos_servicios: products,
            plan: plan,
            foto_url: photo_url,
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
