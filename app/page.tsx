"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  MessageSquare,
  ShieldCheck,
  Zap,
  ArrowRight,
  Smartphone,
  Search,
  Camera,
  ChevronRight,
  Play,
  CheckCircle2
} from "lucide-react";
import Image from "next/image";
import VideoModal from "@/components/VideoModal";
import PopupManager from "@/components/PopupManager";

export default function Home() {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [clients, setClients] = useState(10);
  const [avgValue, setAvgValue] = useState(30);

  // Cálculo: Clientes * 12 meses * Valor * 0.4 (40% de pérdida por olvido)
  const annualLoss = Math.round(clients * 12 * avgValue * 0.4).toLocaleString();
  const typingText = "Esto es lo que necesitas para no volver a perder un trabajo";

  return (
    <main className="min-h-screen bg-background selection:bg-primary/30 scroll-smooth relative overflow-hidden">

      {/* 1. Video Pre-Hero (Ante-sala) */}
      <section className="relative w-full h-screen flex items-center justify-center bg-black overflow-hidden z-[60]">
        <div className="absolute inset-0 z-0">
          <iframe
            className="w-full h-full scale-[1.5] pointer-events-none opacity-30 grayscale-[50%]"
            src="https://www.youtube.com/embed/c1gNsQjKZ_Q?autoplay=1&mute=1&controls=0&loop=1&playlist=c1gNsQjKZ_Q&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1"
            allow="autoplay; encrypted-media"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />
        </div>

        <div className="relative z-10 text-center px-6">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-4xl md:text-7xl font-black text-white uppercase italic tracking-tighter mb-12 drop-shadow-2xl"
          >
            {typingText.split("").map((char, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.1, delay: index * 0.05 }}
              >
                {char}
              </motion.span>
            ))}
          </motion.h1>
        </div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50"
        >
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center p-1">
            <div className="w-1 h-2 bg-primary rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Decorative BG */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[60%] bg-primary/30 blur-[150px] rounded-full" />
        <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] bg-royal/20 blur-[120px] rounded-full" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-cream/80 backdrop-blur-md border-b border-navy/5">
        <div className="max-w-7xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
          <div className="text-xl md:text-2xl font-black tracking-tighter text-navy flex items-center gap-2">
            <span className="text-primary">!</span>Regístrame Ya
          </div>
          <a href="/registro" className="hidden md:flex bg-primary text-white px-6 py-2.5 rounded-button font-bold text-sm shadow-orange hover:scale-105 transition-transform">
            Empezar ahora
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative pt-24 md:pt-32 pb-16 md:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="z-10 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-navy/5 shadow-soft mb-8">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-navy/60">Disponible en Ecuador</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-navy leading-[1.1] mb-8 tracking-tighter uppercase">
              Pierdes <span className="text-primary italic">4 de cada 10</span> trabajos solo porque te olvidan.
            </h1>

            <p className="text-lg md:text-xl text-navy/70 mb-10 leading-relaxed max-w-xl mx-auto lg:ml-0 font-medium">
              Eres excelente en lo que haces. Deja de ser un desconocido en la agenda de tus clientes. Aparece <span className="text-navy font-bold">con tu foto y especialidad</span> de inmediato.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="/registro"
                className="w-full sm:w-auto bg-primary text-white px-10 py-5 rounded-button font-black text-lg shadow-orange flex items-center justify-center gap-3"
              >
                Quiero que me encuentren <ArrowRight size={20} />
              </motion.a>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setIsVideoModalOpen(true)}
                className="w-full sm:w-auto bg-white text-navy px-8 py-5 rounded-button font-black text-lg border-2 border-navy/5 shadow-soft flex items-center justify-center gap-3 group"
              >
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary transition-colors">
                  <Play size={16} fill="currentColor" className="text-primary group-hover:text-white ml-1" />
                </div>
                Ver Demo
              </motion.button>
            </div>
          </motion.div>

          {/* Samsung Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative flex justify-center lg:justify-end w-full"
          >
            <div className="relative z-10 w-full max-w-[320px] aspect-[9/19.5] bg-navy rounded-[3rem] p-3 shadow-2xl border-[8px] border-navy/90 hero-float">
              <div className="w-full h-full bg-cream rounded-[2.2rem] overflow-hidden relative flex flex-col">
                <div className="px-6 pt-10 text-center">
                  <div className="w-24 h-24 rounded-full bg-primary mx-auto mb-6 border-4 border-white shadow-lg overflow-hidden relative">
                    <img src="https://i.pravatar.cc/300?img=11" alt="pro" className="w-full h-full object-cover" />
                  </div>
                  <h4 className="text-xl font-black text-navy mb-2">Manuel Pérez</h4>
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest px-3 py-1 bg-primary/10 rounded-full inline-block">Plomero Maestro</p>
                </div>
                <div className="flex-grow flex items-center justify-center p-8">
                  <div className="w-full aspect-square bg-white rounded-3xl p-4 shadow-inner border border-navy/5 flex items-center justify-center relative">
                    <div className="w-full h-full bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=example')] bg-contain bg-no-repeat bg-center opacity-80" />
                  </div>
                </div>
                <div className="px-6 pb-10 space-y-3">
                  <div className="w-full py-4 bg-primary text-white rounded-2xl text-center text-[10px] font-black uppercase tracking-[0.2em] shadow-orange">Guardar Contacto</div>
                  <div className="w-full py-4 bg-navy text-white rounded-2xl text-center text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                    <MessageSquare size={14} className="text-primary" /> WhatsApp
                  </div>
                </div>
              </div>
            </div>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 glass-card p-4 rounded-2xl z-20 flex items-center gap-3 bg-white border border-primary/20 shadow-orange"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs">✨</div>
              <p className="text-[10px] font-black text-navy uppercase tracking-widest">Perfil Premium</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Comparación Section */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-5xl font-black text-navy mb-6 tracking-tighter uppercase">¿Por qué no te llaman de nuevo?</h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch max-w-5xl mx-auto">
            {/* Antes */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-navy/5 p-10 rounded-[40px] border border-navy/5 flex flex-col items-center"
            >
              <div className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-8">El Olvido (Antes)</div>
              <div className="w-full max-w-[280px] bg-white rounded-[48px] border-[12px] border-navy shadow-xl p-6 min-h-[480px] flex flex-col relative overflow-hidden">
                <div className="space-y-4 flex-grow overflow-hidden relative opacity-10">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-navy/20" />
                      <div className="space-y-2"><div className="h-2 w-24 bg-navy/20" /><div className="h-1.5 w-16 bg-navy/10" /></div>
                    </div>
                  ))}
                </div>
                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex flex-col gap-4">
                  <div className="h-24 w-full bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 flex items-center gap-4 px-4 shadow-sm scale-110 z-10">
                    <div className="w-12 h-12 rounded-full bg-navy/10 flex items-center justify-center text-2xl grayscale">👤</div>
                    <div>
                      <p className="text-xs font-black text-navy/40 italic">"Plomero" o "Juan"</p>
                      <p className="text-[10px] text-navy/20 font-bold uppercase tracking-widest">¿Cúal de todos era?</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Después */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-primary/5 p-10 rounded-[40px] border border-primary/20 flex flex-col items-center relative"
            >
              <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-8">Tu Marca (Después)</div>
              <div className="w-full max-w-[280px] bg-white rounded-[48px] border-[12px] border-navy shadow-orange p-6 min-h-[480px] flex flex-col">
                <div className="text-center mb-8">
                  <div className="w-24 h-24 rounded-full bg-primary mx-auto mb-6 border-4 border-cream shadow-lg overflow-hidden relative">
                    <img src="https://i.pravatar.cc/300?img=11" alt="pro" className="w-full h-full object-cover" />
                  </div>
                  <h4 className="text-xl font-black text-navy">Manuel Pérez</h4>
                  <p className="text-[10px] font-black text-primary uppercase mt-2">Plomero Maestro</p>
                </div>
                <div className="space-y-4 flex-grow">
                  <div className="p-4 bg-cream rounded-2xl flex items-center gap-4 border border-primary/10">
                    <MessageSquare size={16} className="text-primary" /><div className="h-2 w-24 bg-primary/20 rounded-full" />
                  </div>
                  <div className="p-4 bg-cream rounded-2xl flex items-center gap-4 border border-primary/10">
                    <Smartphone size={16} className="text-primary" /><div className="h-2 w-28 bg-primary/20 rounded-full" />
                  </div>
                </div>
                <div className="mt-6 p-5 bg-primary text-white rounded-2xl text-center text-xs font-black uppercase tracking-[0.2em] shadow-orange">Llamar ahora</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Beneficios Section */}
      <section className="py-24 relative overflow-hidden bg-navy">
        <div className="absolute inset-0 z-0 text-white flex items-center justify-center text-8xl font-black opacity-5 grayscale pointer-events-none">RESULTADOS</div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { icon: Search, title: "Buscan tu oficio y sales tú", text: "Configuramos palabras clave estratégicas para que cuando busquen tu especialidad en su teléfono aparezcas de primero." },
              { icon: Camera, title: "Confianza al Instante", text: "Una foto profesional integrada hace que confíen en ti antes de hablarte. Te ves más pro y real." },
              { icon: Zap, title: "Galería Pro Incluida", text: "Muestra tus mejores 3 trabajos directamente en tu tarjeta. Tus clientes verán la calidad en segundos." }
            ].map((item, i) => (
              <motion.div key={i} whileHover={{ y: -10 }} className="glass-card p-10 rounded-card bg-white/5 border-white/10 backdrop-blur-xl">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-8 shadow-orange">
                  <item.icon className="text-white" size={32} />
                </div>
                <h3 className="text-2xl font-black text-white mb-4 tracking-tighter uppercase italic">{item.title}</h3>
                <p className="text-white/70 leading-relaxed font-medium">{item.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Sectores Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-black text-navy uppercase tracking-tighter italic mb-16">Especialistas que ya están ganando más</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {["🛠️ Reparación", "🎨 Pintura", "🔧 Mecánica", "🔌 Electricistas", "🚿 Plomería", "🏗️ Albañiles", "🏥 Médicos", "🧹 Limpieza"].map(s => (
              <div key={s} className="p-4 bg-cream rounded-2xl font-black text-navy border border-navy/5 text-sm uppercase tracking-widest">{s}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Calculadora de Pérdidas */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-12 md:p-16 rounded-[48px] border-primary/20 bg-cream/30 shadow-2xl"
          >
            <div className="max-w-5xl mx-auto">
              <h2 className="text-4xl lg:text-7xl font-black text-navy mb-8 tracking-tighter uppercase text-center lg:text-left">
                Calcula cuánto estás <span className="text-primary italic">dejando ir</span>
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-12">
                  <div>
                    <div className="flex justify-between mb-4">
                      <p className="text-[10px] font-black uppercase text-navy/40 tracking-widest">Clientes al mes</p>
                      <span className="text-primary font-black text-xl">{clients}</span>
                    </div>
                    <input type="range" min="1" max="20" value={clients} onChange={(e) => setClients(parseInt(e.target.value))} className="w-full h-3 bg-navy/10 rounded-full appearance-none accent-primary cursor-pointer" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-4">
                      <p className="text-[10px] font-black uppercase text-navy/40 tracking-widest">Valor Servicio promedio</p>
                      <span className="text-primary font-black text-xl">${avgValue}</span>
                    </div>
                    <input type="range" min="5" max="100" value={avgValue} onChange={(e) => setAvgValue(parseInt(e.target.value))} className="w-full h-3 bg-navy/10 rounded-full appearance-none accent-primary cursor-pointer" />
                  </div>
                </div>
                <div className="bg-navy p-12 rounded-[40px] text-center text-white shadow-orange relative group overflow-hidden">
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4">Pérdida Anual Estimada</p>
                  <p className="text-7xl font-black text-primary mb-6">${annualLoss}</p>
                  <p className="text-xs italic opacity-70 leading-relaxed max-w-xs mx-auto">"Recuperas los $10 de hoy con el primer cliente que sí te encuentre mañana."</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="precios" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-20">
            <h2 className="text-4xl lg:text-7xl font-black text-navy uppercase tracking-tighter italic">Planes Profesionales</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              { name: "Básico", price: "10", features: ["vCard Estratégica", "Tu Foto de Perfil", "Categoría de Búsqueda", "Historial de Llamadas", "Entrega en 1 hora"] },
              { name: "Pro", price: "20", featured: true, features: ["Todo el Básico", "Código QR para Imprimir", "Galería de 3 Fotos", "Botón WhatsApp Directo", "Diseño Premium", "Soporte Prioritario"] }
            ].map((plan) => (
              <motion.div key={plan.name} whileHover={{ y: -10 }} className={`bg-white p-12 rounded-[40px] flex flex-col shadow-soft border-4 ${plan.featured ? "border-primary" : "border-navy/5"}`}>
                <h3 className={`text-xl font-black uppercase tracking-widest mb-4 ${plan.featured ? "text-primary" : "opacity-40"}`}>{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-10"><span className="text-6xl font-black text-navy">${plan.price}</span><span className="text-navy/30 font-black uppercase text-xs">Pago Único</span></div>
                <ul className="space-y-5 mb-12 flex-grow">
                  {plan.features.map(f => <li key={f} className="flex items-center gap-4 text-navy/70 font-bold"><CheckCircle2 size={20} className="text-primary" /> {f}</li>)}
                </ul>
                <a href="/registro" className={`w-full py-5 font-black rounded-button text-center uppercase tracking-widest text-xs ${plan.featured ? "bg-primary text-white shadow-orange" : "bg-navy/5 text-navy border-2 border-navy/5"}`}>Elegir {plan.name}</a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 bg-cream">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-navy uppercase tracking-tighter italic">Preguntas Comunes</h2>
          </motion.div>
          <div className="space-y-6">
            {[
              { q: "¿Tengo que seguir pagando después?", a: "Absolutamente no. Pagas una vez $10 o $20 y tienes tu contacto profesional para siempre. Sin mensualidades, sin trucos." },
              { q: "¿Cómo lo recibo?", a: "En exactamente 1 hora desde que confirmas tu pago, te enviamos un enlace a tu WhatsApp o correo con tu vCard y tu QR manual. Listo para usar." },
              { q: "¿Y si no sé nada de tecnología?", a: "No necesitas saber nada. Nosotros hacemos todo el trabajo pesado por ti. Tú solo nos pasas tus datos y listo." },
              { q: "¿Sirve para Android y iPhone?", a: "Sí, funciona perfectamente en todos los celulares modernos. Es tecnología nativa que no requiere descargar apps." },
              { q: "¿Puedo actualizar mis datos después?", a: "¡Claro! Los primeros 3 meses de cambios son gratuitos. Luego tiene un costo mínimo de $5 por actualización." },
              { q: "¿Cómo me ayuda a conseguir más trabajo?", a: "No es magia, es visibilidad. Cuando un cliente necesite un experto y busque en su agenda, aparecerás tú con nombre, foto y profesión, en lugar de un número anónimo." }
            ].map((item, i) => (
              <details key={i} className="group glass-card rounded-3xl p-8 cursor-pointer border-navy/5 bg-white/50 backdrop-blur-sm">
                <summary className="flex items-center justify-between font-black text-navy list-none text-lg">
                  {item.q}<ChevronRight size={24} className="group-open:rotate-90 transition-transform text-primary" />
                </summary>
                <p className="mt-6 text-navy/60 leading-relaxed font-bold">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Compacto */}
      <footer className="py-12 bg-navy border-t border-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left relative z-10">
          <div className="text-xl font-black text-white tracking-tighter"><span className="text-primary">!</span>Regístrame Ya</div>
          <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">© 2026 · Profesionales en Acción</p>
          <div className="flex gap-8 text-[10px] font-black text-white/50 uppercase tracking-widest">
            <a href="#" className="hover:text-primary transition-colors">Términos</a>
            <a href="#" className="hover:text-primary transition-colors">Privacidad</a>
            <a href="#" className="hover:text-primary transition-colors">Soporte</a>
          </div>
        </div>
      </footer>

      <VideoModal isOpen={isVideoModalOpen} onClose={() => setIsVideoModalOpen(false)} videoId="c1gNsQjKZ_Q" />
      <PopupManager />
    </main>
  );
}
