import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { amount, email } = await req.json();

        console.log(`[Crossmint] Iniciando creación de pago para ${email} por $${amount}`);

        const response = await fetch(
            "https://staging.crossmint.com/api/v1/payment-links",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-API-KEY": process.env.CROSSMINT_SECRET_KEY!,
                },
                body: JSON.stringify({
                    amount: amount.toString(),
                    currency: "usd",
                    recipient: {
                        email: email
                    },
                    title: "vCard Pro - RegistrameYa",
                    description: "Pago por generación de vCard profesional y código QR",
                    redirectUrl: process.env.PAYPHONE_RESPONSE_URL || "https://registrameya.vercel.app/registro"
                }),
            }
        );

        const data = await response.json();
        console.log(`[Crossmint] Respuesta Status: ${response.status}`);

        if (!response.ok) {
            console.error("[Crossmint] Error de API:", JSON.stringify(data, null, 2));
            return NextResponse.json(
                { error: "Error de Crossmint API", details: data },
                { status: response.status }
            );
        }

        // El endpoint payment-links devuelve la URL en 'url'
        return NextResponse.json({
            ...data,
            paymentUrl: data.url || data.paymentUrl
        });
    } catch (error) {
        console.error("[Crossmint] Excepción en create-payment:", error);
        return NextResponse.json(
            { error: "Error creating payment" },
            { status: 500 }
        );
    }
}
