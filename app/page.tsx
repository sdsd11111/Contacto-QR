import { Metadata } from 'next'
import HomeClient from './HomeClient'

export const metadata: Metadata = {
  title: 'ActivaQR | Tu negocio instalado en la agenda de tu cliente, hoy mismo',
  description: 'Convierte tu contacto en una herramienta de ventas. Digitaliza tu tarjeta de presentación, crea catálogos y automatiza tu atención por WhatsApp.',
  keywords: 'tarjetas digitales, qr dinamico, vcard, contacto digital, catálogo whatsapp, activaqr',
  openGraph: {
    title: 'ActivaQR | Tu Negocio en su Teléfono',
    description: 'La forma más rápida y profesional de compartir tu contacto y vender por WhatsApp.',
    images: ['/images/ActivaQR_hero.webp'],
  }
}

export default function Home() {
  return (
    <div className="relative">
      <HomeClient />
      
      {/* SEO Hidden Text for Search Engines */}
      <div className="sr-only">
        <h1>ActivaQR - El Poder del Contacto Digital</h1>
        <p>
          Deja de usar tarjetas de papel. Con ActivaQR puedes tener una tarjeta de presentación digital 
          profesional con QR dinámico por solo $35 al año. Ideal para profesionales, negocios y empresas 
          que buscan modernizar su atención al cliente y aumentar sus ventas por WhatsApp.
        </p>
        <h2>Nuestros Planes</h2>
        <ul>
          <li>Contacto Digital: $35/año - Lo esencial para profesionales.</li>
          <li>Contacto Business: $100/año - Identidad corporativa y enlaces de venta.</li>
          <li>Business + Catálogo: $200/año - Tu vitrina de ventas interactiva.</li>
          <li>Sitio Web Completo: $1,000 - Tu ecosistema digital profesional a medida.</li>
        </ul>
      </div>
    </div>
  )
}
