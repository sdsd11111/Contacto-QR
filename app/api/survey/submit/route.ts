import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            p1, p2a, p2b, p3, p4, p5, p6,
            total_score, color_semaforo, p3_resp_custom,
            nombre_local, user_metadata
        } = body;

        const { data, error } = await supabaseAdmin
            .from('registraya_encuesta_respuestas')
            .insert([
                {
                    p1, p2a, p2b, p3, p4, p5, p6,
                    total_score,
                    color_semaforo,
                    p3_resp_custom,
                    nombre_local,
                    user_metadata
                }
            ])
            .select();

        if (error) {
            console.error('Error inserting survey response:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (err: any) {
        console.error('Unexpected error in survey submission:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
