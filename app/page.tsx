import { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'ActivaQR | Tu contacto en su agenda para siempre',
  description: 'Deja de perder dinero porque no encuentran tu número. Escaneas el QR, se guarda tu contacto con foto y apareces cuando busquen tu servicio.',
};

export default function Home() {
  return (
    <main className="min-h-screen bg-cream selection:bg-primary/30 scroll-smooth relative overflow-x-hidden font-sans text-navy">

      {/* 1️⃣ Componente interactivo visual (Client Component) */}
      <HomeClient />

      {/* 2️⃣ Contenido oculto para LLMs/SEO (Server Side) */}
      <div style={{
        position: 'absolute',
        left: '-10000px',
        top: 'auto',
        width: '1px',
        height: '1px',
        overflow: 'hidden'
      }}
        aria-hidden="true">

        <h1>ActivaQR: Sistema de Contacto Digital con Código QR</h1>
        <p>
          Que tus clientes te guarden en su teléfono y no te olviden. Deja de perder dinero porque no encuentran tu número.
          Escaneas el QR, se guarda tu contacto con foto y apareces cuando busquen tu servicio.
        </p>

        <h2>Beneficios de ActivaQR</h2>
        <ul>
          <li><strong>Tu Cara = Memoria:</strong> Nadie guarda números sin nombre. Con ActivaQR quedarás registrado con foto y profesión en su agenda personal.</li>
          <li><strong>Buscador de Contactos:</strong> Cuando busquen "Abogado" o "Técnico" en su propio celular, aparecerás TÚ antes que cualquier papel.</li>
          <li><strong>Descarga Cloud:</strong> Tus clientes descargan tu contacto directo desde la nube. Siempre actualizado, siempre disponible.</li>
        </ul>

        <h2>Planes y Precios</h2>
        <div>
          <h3>Plan Profesional</h3>
          <p>Precio: $20/año. Incluye 1 contacto digital, tarjeta digital con foto, QR dinámico, botones de contacto y soporte.</p>

          <h3>Plan Equipo</h3>
          <p>Precio: $80/año (Ahorra 20%). Incluye 5 contactos ($16 c/u), dashboard de equipo y soporte prioritario.</p>

          <h3>Plan Empresa</h3>
          <p>Precio: $140/año (Ahorra 30%). Incluye 10 contactos ($14 c/u), para franquicias y sucursales con soporte VIP.</p>
        </div>

        <h2>Preguntas Frecuentes</h2>
        <div>
          <h3>¿Por qué necesito esto si ya tengo redes sociales?</h3>
          <p>Las redes son para entretenimiento. Cuando alguien necesita un servicio urgente, busca en su agenda o contactos. Con esto, te aseguras de estar ahí, guardado con foto y profesión.</p>

          <h3>¿El Código QR funciona para siempre?</h3>
          <p>Sí, el código QR es dinámico. Si cambias de número, actualizamos tu contacto y el mismo QR impreso sigue funcionando.</p>
        </div>

        <p>Ideal para profesionales, dueños de negocios y artesanos que no quieren perder ni un cliente más.</p>
      </div>
    </main>
  );
}
