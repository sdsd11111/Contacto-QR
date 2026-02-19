import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { amount, email } = await req.json();
        const apiKey = (process.env.CROSSMINT_SECRET_KEY || "").trim();
        const clientKey = (process.env.NEXT_PUBLIC_CROSSMINT_CLIENT_KEY || "").trim();

        console.log(`[Diagnostic] Iniciando búsqueda exhaustiva para ${email} ($${amount})`);
        console.log(`[Diagnostic] Key check: sk_staging_... (Longitud: ${apiKey.length})`);

        if (!apiKey) {
            return NextResponse.json({ error: "API Key (Secret) no configurada en .env.local" }, { status: 500 });
        }

        const candidates = [
            // Standard V1
            "https://staging.crossmint.com/api/v1/checkouts",
            "https://staging.crossmint.com/api/v1/payment-links",
            "https://staging.crossmint.com/api/v1/pay-links",
            "https://staging.crossmint.com/api/v1/billing/pay-links",
            "https://staging.crossmint.com/api/v1/checkout/orders",

            // Versioned
            "https://staging.crossmint.com/api/2022-06-09/checkouts",
            "https://staging.crossmint.com/api/2022-06-09/payment-links",
            "https://staging.crossmint.com/api/2022-03-01/checkouts",

            // Alpha
            "https://staging.crossmint.com/api/v1-alpha1/checkouts",
            "https://staging.crossmint.com/api/v1-alpha1/payment-links",
            "https://staging.crossmint.com/api/v1-alpha2/checkouts",

            // No /api/ prefix just in case
            "https://staging.crossmint.com/v1/payment-links",
            "https://staging.crossmint.com/v1/checkouts",

            // Potential project-specific
            `https://staging.crossmint.com/api/v1/projects/${clientKey}/checkouts`
        ];

        let lastResult = null;

        for (const url of candidates) {
            console.log(`[Diagnostic] Probando URL: ${url}`);
            try {
                // Probamos con el body más estándar de Crossmint
                const body = {
                    payment: {
                        method: "fiat",
                        currency: "usd",
                        value: amount.toString()
                    },
                    recipient: { email: email },
                    lineItems: [
                        {
                            name: "vCard Pro",
                            description: "Identidad Digital",
                            quantity: 1,
                            amount: amount.toString()
                        }
                    ],
                    redirectUrl: "https://www.activaqr.com/registro"
                };

                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-API-KEY": apiKey,
                        "Authorization": `Bearer ${apiKey}` // Probar ambos formatos
                    },
                    body: JSON.stringify(body),
                });

                const status = response.status;
                const text = await response.text();

                if (status === 201 || status === 200) {
                    console.log(`[Diagnostic] ¡ÉXITO! Encontrado: ${url}`);
                    const data = JSON.parse(text);
                    return NextResponse.json({
                        paymentUrl: data.url || data.hostedUrl || data.paymentUrl || (data.payLinks && data.payLinks[0]?.url) || data.redirectTo,
                        endpoint: url
                    });
                }

                // Si da 401/403, avisar pero seguir
                if (status === 401 || status === 403) {
                    console.log(`[Diagnostic] Auth Failed (401/403) en ${url}`);
                }

                lastResult = { url, status, text: text.substring(0, 150) };
            } catch (e) {
                console.error(`[Diagnostic] Fetch failed for ${url}:`, e);
            }
        }

        return NextResponse.json({
            error: "No se encontró un endpoint válido tras 14 intentos",
            lastResult
        }, { status: 404 });

    } catch (error) {
        console.error("[Diagnostic] Error crítico:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}
