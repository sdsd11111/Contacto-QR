import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto Digital Profesional | ActivaQR",
  description: "Tu identidad profesional instalada en la agenda de tu cliente en 10 segundos. No seas un número más, sé un contacto profesional con foto y redes sociales.",
  openGraph: {
    title: "Contacto Digital Profesional | ActivaQR",
    description: "La forma más rápida y profesional de ser guardado en el teléfono de tus clientes.",
    url: "https://www.activaqr.com/contacto-digital-producto",
    images: [
      {
        url: "/images/Reingeniería/auditoria-operativa.webp", // Using a professional asset as placeholder if og-preview doesn't exist
        width: 1200,
        height: 630,
        alt: "ActivaQR Contacto Digital",
      },
    ],
  },
};

export default function ContactoDigitalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
