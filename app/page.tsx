"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Phone,
  ArrowRight,
  Smartphone,
  Users,
  Star,
  ShieldCheck,
  ChevronRight,
  QrCode
} from "lucide-react";
import VideoModal from "@/components/VideoModal";
import PopupManager from "@/components/PopupManager";

export default function Home() {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-cream selection:bg-primary/30 scroll-smooth relative overflow-x-hidden font-sans text-navy">

      {/* Navbar Minimalista */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-navy/5">
        <div className="max-w-7xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
          <div className="text-xl md:text-2xl font-black tracking-tighter text-navy flex items-center gap-2">
            <span className="text-primary">!</span>Regístrame Ya
          </div>
          <a href="/registro" className="bg-primary text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-orange hover:scale-105 transition-transform">
            Crear mi Contacto
          </a>
        </div>
      </nav>

      {/* Hero Section: Full Screen Video (Alternative) */}
      <section className="relative h-screen min-h-[800px] w-full overflow-hidden flex items-center justify-center">
        {/* Video Background Full Screen */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="https://cdn.coverr.co/videos/coverr-people-scanning-qr-code-in-meeting-5264/1080p.mp4" type="video/mp4" />
          </video>
          {/* Gradiente sutil inferior para legibilidad del texto si es necesario, pero respetando "sin opacidad" general */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/40 to-transparent z-10"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-20 px-6 pt-20">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-navy/10 shadow-sm mb-8"
          >
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-navy/60">Sistema Validado</span>
          </motion.div>

          {/* Social Proof Avatars */}
          <div className="flex justify-center -space-x-4 mb-8">
            <img className="w-10 h-10 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" alt="Cliente" />
            <img className="w-10 h-10 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop" alt="Cliente" />
            <img className="w-10 h-10 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" alt="Cliente" />
            <div className="w-10 h-10 rounded-full border-2 border-white bg-navy text-white flex items-center justify-center text-xs font-bold">+500</div>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-navy leading-[1.1] mb-8 tracking-tighter drop-shadow-sm"
          >
            Que tus clientes te guarden en su teléfono <span className="text-primary italic">y no te olviden.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-navy/80 mb-12 leading-relaxed max-w-2xl mx-auto font-bold"
          >
            Deja de perder dinero porque no encuentran tu número. Cuando busquen tu servicio, <span className="text-navy font-black bg-white/50 backdrop-blur-sm px-2 rounded">aparecerás TÚ con tu foto</span>.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <a
              href="/registro"
              className="w-full sm:w-auto bg-primary text-white px-8 py-5 rounded-full font-black text-xl shadow-orange hover:translate-y-[-2px] transition-transform flex items-center justify-center gap-3"
            >
              Crear mi Contacto Digital ($10) <ArrowRight size={24} />
            </a>
            <button
              onClick={() => setIsVideoModalOpen(true)}
              className="w-full sm:w-auto bg-white/90 backdrop-blur-md text-navy px-8 py-5 rounded-full font-bold text-xl border border-navy/10 shadow-lg hover:bg-white transition-colors flex items-center justify-center gap-3"
            >
              <Phone size={24} className="text-primary" /> Ver cómo funciona
            </button>
          </motion.div>

          {/* Social Proof Text */}
          <p className="mt-8 text-sm text-navy/60 font-black uppercase tracking-widest bg-white/30 inline-block px-4 py-1 rounded-full backdrop-blur-sm">
            <span className="text-primary">★</span> Únete a cientos de profesionales
          </p>
        </div>
      </section>

      {/* Demo Visual: Antes vs Después (Simplificado) */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Antes */}
            <div className="bg-gray-100 p-8 rounded-3xl opacity-50 border border-gray-200">
              <div className="text-center mb-6">
                <span className="text-xs font-black uppercase tracking-widest text-red-500">Lo que pasa hoy</span>
                <h3 className="text-2xl font-bold text-gray-400 mt-2">"¿Cuál era el número?"</h3>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm max-w-xs mx-auto flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-2xl">?</div>
                <div className="space-y-2 w-full">
                  <div className="h-2 bg-gray-100 rounded w-3/4"></div>
                  <div className="h-2 bg-gray-100 rounded w-1/2"></div>
                </div>
              </div>
            </div>

            {/* Después */}
            <div className="bg-primary/5 p-8 rounded-3xl border-2 border-primary/20 relative">
              <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-lg">TU SOLUCIÓN</div>
              <div className="text-center mb-6">
                <span className="text-xs font-black uppercase tracking-widest text-primary">Lo que tendrás</span>
                <h3 className="text-2xl font-bold text-navy mt-2">Te encuentran al instante</h3>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg max-w-xs mx-auto border border-primary/10">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary rounded-full overflow-hidden border-2 border-primary">
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop" alt="Foto Pro" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-navy text-lg">Manuel Pérez</h4>
                    <p className="text-primary text-xs font-black uppercase tracking-wider">Plomero Maestro</p>
                    <div className="flex gap-1 mt-1 text-yellow-400">
                      <Star size={12} fill="currentColor" />
                      <Star size={12} fill="currentColor" />
                      <Star size={12} fill="currentColor" />
                      <Star size={12} fill="currentColor" />
                      <Star size={12} fill="currentColor" />
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <div className="flex-1 bg-green-500 text-white text-center py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1">
                    <Phone size={12} /> Llamar
                  </div>
                  <div className="flex-1 bg-navy text-white text-center py-2 rounded-lg text-xs font-bold">
                    Ver Fotos
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof + Beneficios */}
      <section className="py-24 bg-navy text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-16 tracking-tighter">¿Por qué funciona?</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 p-8 rounded-3xl backdrop-blur-sm border border-white/5">
              <div className="bg-primary w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-6 text-2xl">📸</div>
              <h3 className="text-xl font-bold mb-3">Foto = Confianza</h3>
              <p className="text-white/60 text-sm leading-relaxed">Nadie guarda números sin nombre. Al ver tu cara y profesión, te guardan como un contacto VIP.</p>
            </div>
            <div className="bg-white/10 p-8 rounded-3xl backdrop-blur-sm border border-white/5">
              <div className="bg-primary w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-6 text-2xl">🔍</div>
              <h3 className="text-xl font-bold mb-3">Búsqueda Fácil</h3>
              <p className="text-white/60 text-sm leading-relaxed">Cuando busquen "Plomero" o "Abogado" en su celular, apareces TÚ primero.</p>
            </div>
            <div className="bg-white/10 p-8 rounded-3xl backdrop-blur-sm border border-white/5">
              <div className="bg-primary w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-6 text-2xl">🚀</div>
              <h3 className="text-xl font-bold mb-3">Descarga Cloud</h3>
              <p className="text-white/60 text-sm leading-relaxed">Tus clientes descargan tu contacto directo desde la nube. Siempre actualizado, siempre disponible.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Restaurado y Mejorado */}
      <section className="py-24 bg-cream" id="precios">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-navy tracking-tighter uppercase">Elige tu Plan</h2>
            <p className="text-navy/60 mt-4 text-lg">Inversión única que se paga con tu primer cliente nuevo.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-start">
            {/* Plan Básico $10 */}
            <div className="bg-white p-8 rounded-[30px] shadow-lg border border-navy/5 flex flex-col relative overflow-hidden h-full">
              <h3 className="text-xl font-black text-navy uppercase tracking-widest mb-2">Contacto Digital</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-5xl font-black text-navy">$10</span>
                <span className="text-navy/40 text-xs font-bold uppercase tracking-widest">Pago Único</span>
              </div>

              <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex items-center gap-3 text-navy font-medium text-sm">
                  <CheckCircle2 size={18} className="text-navy/40 shrink-0" /> Diseño Profesional con Foto
                </li>
                <li className="flex items-center gap-3 text-navy font-medium text-sm">
                  <CheckCircle2 size={18} className="text-navy/40 shrink-0" /> Botones de Llamada y WhatsApp
                </li>
                <li className="flex items-center gap-3 text-navy font-medium text-sm">
                  <CheckCircle2 size={18} className="text-navy/40 shrink-0" /> Enlace para compartir
                </li>
              </ul>

              <a href="/registro?plan=basic" className="block w-full bg-navy/5 text-navy py-4 rounded-full font-black text-lg hover:bg-navy/10 transition-colors text-center mt-auto">
                Elegir Básico
              </a>
            </div>

            {/* Plan Negocio $20 */}
            <div className="bg-white p-8 rounded-[30px] shadow-xl border-4 border-primary flex flex-col relative overflow-hidden h-full">
              <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-lg">Más Vendido</div>

              <h3 className="text-xl font-black text-navy uppercase tracking-widest mb-2">Negocio Pro</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-5xl font-black text-primary">$20</span>
                <span className="text-navy/40 text-xs font-bold uppercase tracking-widest">Pago Único*</span>
              </div>

              <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex items-center gap-3 text-navy font-bold text-sm">
                  <CheckCircle2 size={18} className="text-primary shrink-0" /> Todo lo del Plan Básico
                </li>
                <li className="flex items-center gap-3 text-navy font-bold text-sm">
                  <QrCode size={18} className="text-primary shrink-0" /> Código QR para Imprimir
                </li>
                <li className="flex items-center gap-3 text-navy font-bold text-sm">
                  <CheckCircle2 size={18} className="text-primary shrink-0" /> Galería de 3 Fotos
                </li>
                <li className="flex items-center gap-3 text-navy font-bold text-sm">
                  <ShieldCheck size={18} className="text-primary shrink-0" /> Soporte Prioritario
                </li>
              </ul>

              <a href="/registro?plan=pro" className="block w-full bg-primary text-white py-4 rounded-full font-black text-lg shadow-orange hover:scale-105 transition-transform text-center mb-3 mt-auto">
                QUIERO ESTE
              </a>
              <p className="text-[9px] text-center text-navy/30 leading-tight">
                *Incluye QR y Edición. Renovación opcional de $10/año para mantener el hosting del QR y cambios ilimitados.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section Restaurada (Vital para SEO y Confianza) */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-navy uppercase tracking-tighter">Preguntas Frecuentes</h2>
          </div>
          <div className="space-y-4">
            {[
              {
                q: "¿Por qué necesito esto si ya tengo redes sociales?",
                a: "Las redes son para entretenimiento. Cuando alguien necesita un servicio urgente, busca en su agenda o contactos. Con esto, te aseguras de estar ahí, guardado con foto y profesión, listo para que te llamen."
              },
              {
                q: "¿El Código QR funciona para siempre?",
                a: "Sí. En el Plan de $20, el código QR es dinámico. Si cambias de número, actualizamos tu contacto y el mismo QR impreso sigue funcionando. Este servicio tiene un costo de mantenimiento anual de $10 a partir del segundo año."
              },
              {
                q: "¿Cómo recibo mi contacto?",
                a: "Es automático. Llenas tus datos, realizas el pago y recibes en tu correo el enlace a tu contacto y tus archivos listos para usar."
              },
              {
                q: "¿Tengo que pagar mensualidades?",
                a: "No. El plan de $10 es un único pago de por vida. El plan de $20 tiene una renovación anual opcional de $10 solo si quieres mantener el QR dinámico activo y la posibilidad de editar tu contacto."
              }
            ].map((item, i) => (
              <details key={i} className="group bg-gray-50 rounded-2xl p-6 cursor-pointer border border-gray-100 hover:bg-gray-100 transition-colors">
                <summary className="flex items-center justify-between font-bold text-navy list-none text-base md:text-lg">
                  {item.q}<ChevronRight size={20} className="group-open:rotate-90 transition-transform text-primary" />
                </summary>
                <p className="mt-4 text-navy/70 leading-relaxed text-sm">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Mejorado */}
      <footer className="py-12 text-center text-white/60 text-xs font-bold uppercase tracking-widest bg-navy border-t border-white/10">
        <p className="mb-2">© 2026 · Regístrame Ya</p>
        <p className="text-[10px] opacity-50 hover:opacity-100 transition-opacity">
          Diseñado por <a href="https://www.cesarreyesjaramillo.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">César Reyes Jaramillo</a>
        </p>
      </footer>

      <VideoModal isOpen={isVideoModalOpen} onClose={() => setIsVideoModalOpen(false)} videoId="c1gNsQjKZ_Q" />
      <PopupManager />
    </main>
  );
}
