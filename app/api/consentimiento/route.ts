import { NextResponse } from 'next/server';
import crypto from 'crypto';
import pool from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { numero, nombre, email, acepta_comercial, version, url_origen } = body;

        if (!numero || !nombre) {
            return NextResponse.json({ error: "Número y nombre son requeridos" }, { status: 400 });
        }

        const audit_id = `REG-${crypto.randomUUID().split('-')[0].toUpperCase()}`;
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown IP';
        const user_agent = request.headers.get('user-agent') || 'Unknown UA';
        
        // Insertar en tabla consentimientos
        await pool.execute(
            `INSERT INTO consentimientos 
             (telefono, nombre, email, acepta_comercial, acepta_exito, ip, user_agent, version_politica, url_origen, audit_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                numero, 
                nombre, 
                email || null, 
                acepta_comercial ? 1 : 0, 
                0, // acepta_exito default false
                ip, 
                user_agent, 
                version || 'v2.0-ADN', 
                url_origen || request.url, 
                audit_id
            ]
        );

        return NextResponse.json({ 
            success: true, 
            audit_id: audit_id 
        });

    } catch (error: any) {
        console.error("Consentimiento API Error:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
