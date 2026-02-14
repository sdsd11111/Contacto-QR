import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isRateLimited, getClientIP } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
    try {
        // Rate limiting: máximo 5 submits por minuto por IP
        const clientIP = getClientIP(request);
        if (isRateLimited(`survey-submit:${clientIP}`, 5, 60000)) {
            return NextResponse.json(
                { error: 'Demasiadas solicitudes. Intenta en un momento.' },
                { status: 429 }
            );
        }

        const body = await request.json();
        const {
            p1, p2a, p2b, p3, p4, p5, p6,
            total_score, color_semaforo, p3_resp_custom,
            nombre_local, user_metadata
        } = body;

        // Validación de campos requeridos
        if (!p1 || typeof p1 !== 'string') {
            return NextResponse.json(
                { error: 'El campo p1 es requerido' },
                { status: 400 }
            );
        }

        if (total_score !== undefined && (typeof total_score !== 'number' || total_score < 0 || total_score > 100)) {
            return NextResponse.json(
                { error: 'total_score debe ser un número entre 0 y 100' },
                { status: 400 }
            );
        }

        if (color_semaforo && !['rojo', 'amarillo', 'verde'].includes(color_semaforo)) {
            return NextResponse.json(
                { error: 'color_semaforo debe ser rojo, amarillo, o verde' },
                { status: 400 }
            );
        }

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
