import { Metadata } from 'next';
import PlanSitioWebClient from '@/app/PlanSitioWebClient';

export const metadata: Metadata = {
    title: 'Sitio Web Completo en Next.js | Desarrollo profesional desde $1,000 — OBJETIVO Ecuador',
    description: 'Diseño y desarrollo a medida, SEO técnico desde el día uno, panel de administración propio. Para negocios que necesitan más que una página de contacto. Cotización personalizada en Loja, Ecuador.',
};

export default function SitioWebCompletoPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Service",
                        "name": "Sitio Web Completo — OBJETIVO Ecuador",
                        "description": "Desarrollo web profesional en Next.js con SEO técnico desde el código, panel de administración propio y arquitectura optimizada para buscadores de inteligencia artificial.",
                        "provider": {
                            "@type": "Organization",
                            "name": "OBJETIVO",
                            "url": "https://www.cesarreyesjaramillo.com"
                        },
                        "offers": {
                            "@type": "Offer",
                            "price": "1000",
                            "priceCurrency": "USD",
                            "availability": "https://schema.org/InStock"
                        },
                        "mainEntityOfPage": {
                            "@type": "FAQPage",
                            "mainEntity": [
                                {
                                    "@type": "Question",
                                    "name": "¿El código y el dominio quedan a mi nombre?",
                                    "acceptedAnswer": {
                                        "@type": "Answer",
                                        "text": "Todo queda a tu nombre. El dominio lo registras tú, el hosting lo contratas tú y el código te lo entregamos en un repositorio propio. Si decides trabajar con otro desarrollador puedes hacerlo sin perder nada."
                                    }
                                },
                                {
                                    "@type": "Question",
                                    "name": "¿Cuánto tiempo tarda el desarrollo?",
                                    "acceptedAnswer": {
                                        "@type": "Answer",
                                        "text": "Cuatro semanas. Primera semana diagnóstico y diseño. Segunda y tercera semana desarrollo. Cuarta semana revisiones y lanzamiento. Cada etapa tiene un entregable que apruebas antes de avanzar."
                                    }
                                },
                                {
                                    "@type": "Question",
                                    "name": "¿Por qué Next.js y no WordPress?",
                                    "acceptedAnswer": {
                                        "@type": "Answer",
                                        "text": "Next.js carga más rápido, tiene mejor SEO técnico desde el código y está optimizado para los nuevos buscadores de inteligencia artificial. WordPress con plantillas genéricas carga lento y queda obsoleto en dos años."
                                    }
                                }
                            ]
                        }
                    })
                }}
            />
            <PlanSitioWebClient />
        </>
    );
}
