import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Mapeo de planes Contacto-QR → ActivaQR2
const PLAN_MAP: Record<string, { plan: string; monthlyPrice: number }> = {
    digital:   { plan: 'solo',         monthlyPrice: 0 },    // $35/año, sin mensualidad
    business:  { plan: 'empresa_10',   monthlyPrice: 0 },    // $100/año
    catalogo:  { plan: 'empresa_50',   monthlyPrice: 0 },    // $200/año
    auditoria: { plan: 'pro_fleet',    monthlyPrice: 13 },   // Auditoría $100/mes → $13/mes?
    completo:  { plan: 'empresa_50',   monthlyPrice: 0 },    // $1,000 único
};

function generatePassword(): string {
    // Contraseña temporal segura: 16 caracteres alfanuméricos
    return crypto.randomBytes(12).toString('base64').replace(/[/+=]/g, '').slice(0, 16);
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { lead } = body;

        const bridgeSecret = process.env.EXTERNAL_API_SECRET;
        if (!bridgeSecret) {
            console.error('EXTERNAL_API_SECRET no está configurada');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const planConfig = PLAN_MAP[lead.plan] || { plan: 'solo', monthlyPrice: 0 };
        const tempPassword = generatePassword();

        // Payload completo para ActivaQR2
        const payload = {
            name: lead.name,
            email: lead.email,
            password: tempPassword,
            whatsapp: lead.whatsapp,
            companyName: lead.companyName || lead.name,
            slug: lead.slug,
            plan: planConfig.plan,
            monthlyPrice: planConfig.monthlyPrice,
            orderId: `EXT_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            paymentStatus: 'paid',
            source: lead.source || 'wizard_contacto_qr'
        };

        // Calculate HMAC signature to match ActivaQR2 verification
        const signature = crypto
            .createHmac('sha256', bridgeSecret)
            .update(JSON.stringify(payload))
            .digest('hex');

        const targetUrl = process.env.ACTIVAQR2_URL || 'http://localhost:3001/api/external/register-lead';

        console.log('[Bridge] Forwarding lead to ActivaQR2:', payload.email, '→', targetUrl);

        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-signature': signature
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        return NextResponse.json({
            success: response.ok,
            activaqr2_response: data
        });

    } catch (error: any) {
        console.error('[Bridge] Error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
