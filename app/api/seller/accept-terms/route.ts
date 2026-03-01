import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { seller_id } = body;

        console.log(`Accept-terms POST: saving acceptance for seller_id ${seller_id}`);

        if (!seller_id) {
            return NextResponse.json({ error: 'Falta el seller_id' }, { status: 400 });
        }

        // Ideally, we'd also check if the user is authenticated via session,
        // but since this is called immediately after login or from the protected dashboard,
        // we trust the client-provided seller_id for now (or validate via header tokens if implemented).

        const query = `
            UPDATE registraya_vcard_sellers 
            SET terminos_aceptados_en = NOW() 
            WHERE id = ?
        `;

        const [result]: any = await pool.execute(query, [seller_id]);

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: 'Vendedor no encontrado' }, { status: 404 });
        }

        // --- Nueva Lógica: Enviar Contrato por Email ---
        try {
            const [sellerRows]: any = await pool.execute(
                'SELECT nombre, email, parent_id FROM registraya_vcard_sellers WHERE id = ?',
                [seller_id]
            );

            if (sellerRows.length > 0) {
                const seller = sellerRows[0];
                const isSubSeller = !!seller.parent_id;
                const { sendMail } = await import('@/lib/mailer');

                const contractHtml = `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
                        <h2 style="color: #FF6B00; border-bottom: 2px solid #FF6B00; padding-bottom: 10px;">Acuerdo de Rendimiento Comercial - ActivaQR</h2>
                        <p>Estimado/a <strong>${seller.nombre}</strong>,</p>
                        <p>Adjunto a este correo recibes los términos y condiciones que has aceptado digitalmente el día de hoy (${new Date().toLocaleDateString()}).</p>
                        
                        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #ddd;">
                            <h3 style="color: #555; margin-top: 0;">Resumen del Acuerdo:</h3>
                            ${isSubSeller ? `
                                <p><strong>Regla N° 1: Rendimiento de Campo (Asesores)</strong></p>
                                <ul>
                                    <li>Cuota Semanal: Registro mínimo de 20 visitas presenciales validadas vía GPS.</li>
                                    <li>Conversión Esperada: Mínimo de 5 ventas directas mensuales para mantener la cuenta activa.</li>
                                </ul>
                            ` : `
                                <p><strong>Regla N° 1: Cuota Mínima Acumulativa (Líderes)</strong></p>
                                <ul>
                                    <li>Mínimo Requerido: 30 vCards vendidas directamente por ti al mes.</li>
                                    <li>Beneficio si cumples: Se suman ventas de tu red para subir rango al 40% o 50%.</li>
                                    <li>Penalidad si no cumples: Rango limitado al 30% basado únicamente en ventas propias.</li>
                                </ul>
                            `}
                            
                            <p><strong>Regla N° 2: Flujo Financiero y Ética</strong></p>
                            <ul>
                                <li>Los pagos deben ingresar íntegramente a las cuentas oficiales de la matriz ("Regístrame Ya" / ActivaQR).</li>
                                <li>Suplantar identidad o alterar localizaciones es causal de eliminación inmediata.</li>
                             </ul>
                        </div>
                        
                        <p style="font-size: 12px; color: #777;">Este es un documento de cumplimiento obligatorio para acceder al panel de gestión de ActivaQR. Tu aceptación digital ha quedado registrada con tu usuario y fecha actual.</p>
                        <p>¡Muchos éxitos en tus ventas!</p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="font-size: 11px; text-align: center; color: #aaa;">ActivaQR Matrix &copy; ${new Date().getFullYear()}</p>
                    </div>
                `;

                await sendMail({
                    to: seller.email,
                    subject: 'Copia de tu Acuerdo de Rendimiento Comercial - ActivaQR',
                    html: contractHtml
                });
            }
        } catch (mailErr) {
            console.error('Error enviando email de contrato:', mailErr);
            // No bloqueamos el flujo principal si el email falla, pero lo logueamos
        }

        // Return success and let the client re-fetch or update local state
        return NextResponse.json({ success: true, timestamp: new Date().toISOString() });
    } catch (err: any) {
        console.error('Error accepting terms:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
