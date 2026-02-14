import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        // Verificación de admin key (defensa en profundidad, el middleware ya valida)
        const adminKey = req.headers.get('x-admin-key');
        if (!adminKey || adminKey !== process.env.ADMIN_API_KEY) {
            return NextResponse.json(
                { error: 'No autorizado. Se requiere clave de administrador.' },
                { status: 401 }
            );
        }

        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            return NextResponse.json({ error: 'Error de configuración: Falta SUPABASE_SERVICE_ROLE_KEY en Vercel' }, { status: 500 });
        }

        const { data, error } = await supabaseAdmin
            .from('registraya_encuesta_respuestas')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching survey responses:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data });
    } catch (err: any) {
        console.error('Unexpected error fetching surveys:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
