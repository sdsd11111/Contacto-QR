import { Metadata } from 'next';
import PlanCatalogoClient from '@/app/PlanCatalogoClient';

export const metadata: Metadata = {
    title: 'Business + Catálogo ActivaQR | Recibe pedidos listos para despachar — $200/año',
    description: 'Catálogo interactivo de hasta 50 productos. Tus clientes ven, eligen y el pedido llega ordenado a tu WhatsApp. Sin comisiones, sin apps, sin complicaciones. $0.54 al día.',
};

export default function ContactoBusinessCatalogoPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Product",
                        "name": "Business + Catálogo ActivaQR",
                        "description": "Catálogo digital interactivo con hasta 50 productos, pedidos estructurados por WhatsApp y panel de actualización desde el celular. Sin comisiones por venta.",
                        "brand": { "@type": "Brand", "name": "ActivaQR" },
                        "offers": {
                            "@type": "Offer",
                            "price": "200",
                            "priceCurrency": "USD",
                            "priceValidUntil": "2026-12-31",
                            "availability": "https://schema.org/InStock"
                        },
                        "mainEntityOfPage": {
                            "@type": "FAQPage",
                            "mainEntity": [
                                {
                                    "@type": "Question",
                                    "name": "¿En qué se diferencia de un grupo de WhatsApp con mis productos?",
                                    "acceptedAnswer": {
                                        "@type": "Answer",
                                        "text": "Un grupo muestra lo que tú mandas cuando tú lo mandas. Tu catálogo muestra todos tus productos organizados con foto y precio las 24 horas. El pedido llega ordenado directo a tu WhatsApp."
                                    }
                                },
                                {
                                    "@type": "Question",
                                    "name": "¿Cuántos productos puedo subir?",
                                    "acceptedAnswer": {
                                        "@type": "Answer",
                                        "text": "Hasta 50 productos organizados por categorías. Puedes activar o desactivar productos, marcar ofertas del día y actualizar precios cuando quieras desde tu celular."
                                    }
                                },
                                {
                                    "@type": "Question",
                                    "name": "¿Mis clientes pueden pagar dentro del catálogo?",
                                    "acceptedAnswer": {
                                        "@type": "Answer",
                                        "text": "Sí. El catálogo puede integrarse con pasarela de pago para que el cliente pague antes de que confirmes el pedido. Es opcional y se activa cuando quieras."
                                    }
                                }
                            ]
                        }
                    })
                }}
            />
            <PlanCatalogoClient />
        </>
    );
}
