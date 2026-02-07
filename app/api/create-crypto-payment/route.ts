import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { amount, currency, orderId, email } = await req.json();

        // Placeholder for NOWPayments API Key - User will need to add this to .env.local
        const apiKey = process.env.NOWPAYMENTS_API_KEY;

        if (!apiKey) {
            console.error("NOWPayments API Key missing");
            return NextResponse.json({ error: "Configuración de pagos cripto incompleta" }, { status: 500 });
        }

        const response = await fetch('https://api.nowpayments.io/v1/payment', {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                price_amount: amount,
                price_currency: 'usd',
                pay_currency: currency || 'usdttrc20', // Default to USDT on TRC20
                ipn_callback_url: 'https://registrameya.com/api/webhooks/nowpayments',
                order_id: orderId,
                order_description: `VCard Registro - ${email}`,
            }),
        });

        const data = await response.json();

        if (data.payment_id) {
            return NextResponse.json({
                paymentId: data.payment_id,
                payAddress: data.pay_address,
                payAmount: data.pay_amount,
                payCurrency: data.pay_currency
            });
        } else {
            console.error("NOWPayments Error:", data);
            return NextResponse.json({ error: "Error al crear el pago cripto" }, { status: 400 });
        }
    } catch (error) {
        console.error("Crypto Payment Route Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
