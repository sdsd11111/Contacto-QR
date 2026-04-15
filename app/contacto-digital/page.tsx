import { Metadata } from "next";
import PlanContactoDigitalClient from "@/app/PlanContactoDigitalClient";

export const metadata: Metadata = {
  title: "Contacto Digital con QR | Instálate en la agenda de tus clientes — ActivaQR",
  description: "No permitas que tu contacto sea un número anónimo. Proyecta autoridad y confianza con tu Identidad Digital instalada directamente en la agenda de tu cliente con foto y nombre.",
  openGraph: {
    images: ["/images/Reingenierìa/contacto-digital-portada.webp"],
  },
  twitter: {
    images: ["/images/Reingenierìa/contacto-digital-portada.webp"],
  }
};

export default function ContactoDigitalPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "Contacto Digital ActivaQR",
            "description": "Contacto digital instalable en agenda con foto, QR dinámico y vCard 3.0. Para profesionales independientes en Ecuador.",
            "brand": { "@type": "Brand", "name": "ActivaQR" },
            "offers": {
              "@type": "Offer",
              "price": "35",
              "priceCurrency": "USD",
              "priceValidUntil": "2026-12-31",
              "availability": "https://schema.org/InStock"
            },
            "mainEntityOfPage": {
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "¿Para qué necesito esto si ya tengo WhatsApp?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "WhatsApp funciona cuando el cliente ya te tiene guardado. ActivaQR instala tu nombre, foto y datos completos en su agenda para que aparezcas cuando te busquen."
                  }
                },
                {
                  "@type": "Question",
                  "name": "¿Mis clientes necesitan instalar alguna aplicación?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "No. El 90% de los teléfonos modernos escanean con la cámara nativa. Sin apps, sin descargas."
                  }
                },
                {
                  "@type": "Question",
                  "name": "¿Qué pasa si cambio de número?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "El QR es dinámico. Actualizas tu información en el panel y el mismo QR impreso sigue funcionando con los datos nuevos."
                  }
                }
              ]
            }
          })
        }}
      />
      <PlanContactoDigitalClient />
    </>
  );
}
