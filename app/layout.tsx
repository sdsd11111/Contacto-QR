import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import PWARegistration from "@/components/PWARegistration";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["800"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.activaqr.com'),
  title: "ActivaQR - Tu Contacto Profesional en 1 Clic",
  description: "Deja de perder trabajos porque olviden cómo te registraron. Configuramos tu contacto estratégico para que siempre aparezcas primero.",
  openGraph: {
    title: "ActivaQR - Tu Contacto Profesional en 1 Clic",
    description: "Deja de ser un número anónimo. Asegura que tus clientes siempre te encuentren con tu foto y profesión.",
    url: "https://www.activaqr.com",
    siteName: "ActivaQR",
    locale: "es_EC",
    type: "website",
    images: [
      {
        url: '/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'ActivaQR Preview',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ActivaQR - Tu Contacto Profesional en 1 Clic",
    description: "Deja de perder trabajos porque olviden cómo te registraron.",
    images: ['/images/logo.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/images/logo.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ActivaQR',
  },
  formatDetection: {
    telephone: false,
  },
  alternates: {
    canonical: 'https://www.activaqr.com',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body
        className={`${inter.variable} ${montserrat.variable} font-sans antialiased bg-cream text-navy`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "ActivaQR",
              "url": "https://www.activaqr.com",
              "applicationCategory": "BusinessApplication",
              "offers": {
                "@type": "Offer",
                "price": "20",
                "priceCurrency": "USD"
              },
              "description": "Tu contacto profesional en 1 clic. Siempre aparece primero en el teléfono de tus clientes.",
              "operatingSystem": "Web",
              "brand": {
                "@type": "Brand",
                "name": "ActivaQR"
              }
            })
          }}
        />
        <PWARegistration />
        {children}
      </body>
    </html>
  );
}
