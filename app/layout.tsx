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
  metadataBase: new URL('https://registrameya.com'),
  title: "Regístrame Ya! - Tu Contacto Profesional en 1 Clic",
  description: "Deja de perder trabajos porque olviden cómo te registraron. Configuramos tu contacto estratégico para que siempre aparezcas primero.",
  openGraph: {
    title: "Regístrame Ya! - Tu Contacto Profesional en 1 Clic",
    description: "Deja de ser un número anónimo. Asegura que tus clientes siempre te encuentren con tu foto y profesión.",
    url: "https://registrameya.com",
    siteName: "Regístrame Ya!",
    locale: "es_EC",
    type: "website",
    images: [
      {
        url: '/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Regístrame Ya! Preview',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Regístrame Ya! - Tu Contacto Profesional en 1 Clic",
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
    title: 'Regístrame Ya!',
  },
  formatDetection: {
    telephone: false,
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
        <PWARegistration />
        {children}
      </body>
    </html>
  );
}
