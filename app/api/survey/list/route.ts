import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
    try {
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
