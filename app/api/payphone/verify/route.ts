import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const { id, clientTransactionId, email } = await req.json();

        if (!id || !clientTransactionId || !email) {
            return NextResponse.json({ error: 'Datos de transacción incompletos' }, { status: 400 });
        }

        // 1. Verificar el pago con la API oficial de PayPhone (Server-to-Server)
        // Usamos la Clave Secreta de Producción proporcionada
        const PAYPHONE_TOKEN = process.env.PAYPHONE_TOKEN || 'RocCQHd7mUJqaoMNnnQIQ';

        const ppResponse = await fetch('https://pay.payphonetodoesposible.com/api/button/V2/Confirm', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${PAYPHONE_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: parseInt(id),
                clientTransactionId: clientTransactionId
            })
        });

        const ppData = await ppResponse.json();

        // 2. Validar respuesta de PayPhone
        // El estado 'Approved' (3) es el que confirma el pago real
        if (ppResponse.ok && (ppData.transactionStatus === 'Approved' || ppData.status === 'Approved')) {
            console.log(`[PayPhone Verify] Pago verificado para ${email}. ID: ${id}`);

            // 3. Actualizar base de datos
            const [result] = await pool.execute(
                'UPDATE registraya_vcard_registros SET status = ?, paid_at = NOW() WHERE email = ?',
                ['pagado', email]
            );

            // 4. Notificar por WhatsApp
            try {
                const [rows] = await pool.execute(
                    'SELECT nombre, whatsapp FROM registraya_vcard_registros WHERE email = ?',
                    [email]
                );
                const users = rows as any[];

                if (users.length > 0) {
                    const wpNotifyUrl = new URL('/api/notify-whatsapp', req.url).toString();
                    await fetch(wpNotifyUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: users[0].nombre,
                            email: email,
                            whatsapp: users[0].whatsapp,
                            plan: 'PAGO PAYPHONE AUTOMÁTICO CONFIRMADO'
                        })
                    });
                }
            } catch (notifyErr) {
                console.error('[PayPhone Verify] Error al notificar WhatsApp:', notifyErr);
            }

            return NextResponse.json({
                success: true,
                message: 'Pago verificado y procesado con éxito',
                transactionId: id
            });
        } else {
            console.error('[PayPhone Verify] PayPhone rechazó la confirmación:', ppData);
            return NextResponse.json({
                success: false,
                error: 'PayPhone no pudo confirmar el pago. Estado: ' + (ppData.transactionStatus || 'Desconocido')
            }, { status: 402 });
        }

    } catch (error: any) {
        console.error('[PayPhone Verify] Error crítico:', error);
        return NextResponse.json({ error: 'Error del servidor al verificar pago' }, { status: 500 });
    }
}
