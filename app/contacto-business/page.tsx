import { Metadata } from 'next';
import PlanBusinessClient from '@/app/PlanBusinessClient';

export const metadata: Metadata = {
  title: 'Contacto Business ActivaQR | Tus promociones en el celular de tus clientes — $100/año',
  description: 'Cambia promociones, precios y horarios en 10 segundos desde tu celular. Sin diseñadores, sin esperas, sin pagarle a nadie. Tu negocio siempre al día por $0.27 al día.',
};

export default function ContactoBusinessPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "Contacto Business ActivaQR",
            "description": "Página de negocio actualizable desde el celular en 10 segundos. QR dinámico con sección de promociones, ubicación y botones de contacto directo.",
            "brand": { "@type": "Brand", "name": "ActivaQR" },
            "offers": {
              "@type": "Offer",
              "price": "100",
              "priceCurrency": "USD",
              "priceValidUntil": "2026-12-31",
              "availability": "https://schema.org/InStock"
            },
            "mainEntityOfPage": {
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "¿Tengo que saber de tecnología para actualizar mi página?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "No. Si sabes mandar una foto por WhatsApp, sabes actualizar tu Contacto Business. Subes el contenido, guardas y en 10 segundos tus clientes ya lo ven."
                  }
                },
                {
                  "@type": "Question",
                  "name": "¿En qué se diferencia de publicar en Facebook?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "En Facebook el algoritmo decide quién ve tu publicación. Con ActivaQR tu cliente escanea y ve exactamente lo que pusiste, sin filtros, sin competencia."
                  }
                },
                {
                  "@type": "Question",
                  "name": "¿Qué pasa si me equivoco al subir algo?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Entras al panel, lo corriges y guardas. En 10 segundos está actualizado. Control total en cualquier momento."
                  }
                }
              ]
            }
          })
        }}
      />
      <PlanBusinessClient />
    </>
  );
}
