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
  Play
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
                transition={{
                  duration: 0.1,
                  delay: index * 0.05,
                }}
              >
                {char}
              </motion.span>
            ))}
          </motion.h1>
        </div>

        {/* Indicador de scroll */}
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

      {/* Navbar sutil */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-cream/80 backdrop-blur-md border-b border-navy/5">
        <div className="max-w-7xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
          <div className="text-xl md:text-2xl font-black tracking-tighter text-navy flex items-center gap-2">
            <span className="text-primary">!</span>Regístrame Ya
          </div>
          <a
            href="/registro"
            className="hidden md:flex bg-primary text-white px-6 py-2.5 rounded-button font-bold text-sm shadow-orange hover:scale-105 transition-transform"
          >
            Empezar ahora
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative pt-24 md:pt-32 pb-16 md:pb-24 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[80%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[60%] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
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

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="/registro"
                className="bg-primary text-white px-10 py-5 rounded-button font-black text-lg shadow-orange flex items-center justify-center gap-3"
              >
                Quiero que me encuentren <ArrowRight size={20} />
              </motion.a>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setIsVideoModalOpen(true)}
                className="bg-white text-navy px-8 py-5 rounded-button font-black text-lg border-2 border-navy/5 shadow-soft flex items-center justify-center gap-3"
              >
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Play size={16} fill="currentColor" className="text-primary ml-1" />
                </div>
                Ver Demo
              </motion.button>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-2 text-navy/50 text-xs font-bold uppercase tracking-widest pt-6">
              <ShieldCheck size={18} className="text-accent" /> Pago único · Sin App
            </div>

            <div className="mt-12 flex items-center justify-center lg:justify-start gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-cream bg-navy/10 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i + 20}`} alt="avatar" />
                  </div>
                ))}
              </div>
              <p className="text-xs md:text-sm text-navy/60 font-black uppercase tracking-widest">
                <span className="text-navy">+200 Profesionales</span> ya registrados
              </p>
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
                <div className="h-6 w-full flex justify-between items-center px-6 pt-2 opacity-30">
                  <span className="text-[10px] font-black">9:41</span>
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full border border-navy" />
                    <div className="w-3 h-3 rounded-full bg-navy/20" />
                  </div>
                </div>
                <div className="px-6 pt-8 text-center">
                  <div className="w-24 h-24 rounded-full bg-primary mx-auto mb-6 border-4 border-white shadow-lg overflow-hidden relative">
                    <img src="https://i.pravatar.cc/300?img=11" alt="pro" className="w-full h-full object-cover" />
                  </div>
                  <h4 className="text-xl font-black text-navy leading-none mb-2">Manuel Pérez</h4>
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest px-3 py-1 bg-primary/10 rounded-full inline-block">Plomero Maestro</p>
                </div>
                <div className="flex-grow flex items-center justify-center p-8">
                  <div className="w-full aspect-square bg-white rounded-3xl p-4 shadow-inner border border-navy/5 flex items-center justify-center relative">
                    <div className="w-full h-full bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=example')] bg-contain bg-no-repeat bg-center opacity-80" />
                  </div>
                </div>
                <div className="px-6 pb-10 space-y-3">
                  <div className="w-full py-4 bg-primary text-white rounded-2xl text-center text-[10px] font-black uppercase tracking-[0.2em] shadow-orange">
                    Guardar Contacto
                  </div>
                  <div className="w-full py-4 bg-navy text-white rounded-2xl text-center text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                    <MessageSquare size={14} className="text-primary" /> WhatsApp
                  </div>
                </div>
              </div>
              <div className="absolute right-[-10px] top-24 w-1.5 h-12 bg-navy rounded-r-lg" />
              <div className="absolute right-[-10px] top-40 w-1.5 h-20 bg-navy rounded-r-lg" />
            </div>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 glass-card p-4 rounded-2xl z-20 flex items-center gap-3 bg-white border border-primary/20 shadow-orange"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs">✨</div>
              <p className="text-[10px] font-black text-navy uppercase tracking-widest whitespace-nowrap">Perfil Premium</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Comparación Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-5xl font-black text-navy mb-6 tracking-tighter uppercase">
              ¿Por qué no te llaman de nuevo?
            </h2>
            <p className="text-lg md:text-xl text-navy/60 max-w-2xl mx-auto font-medium">
              No es por mal servicio. Es porque cuando buscan "Expertos" en su agenda, <span className="text-navy font-bold underline decoration-primary decoration-4">no saben quién eres tú</span>.
            </p>
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
                <div className="h-1.5 w-16 bg-navy/10 rounded-full mx-auto mb-8 shrink-0" />
                <div className="space-y-4 flex-grow overflow-hidden relative opacity-10">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-navy/20" />
                      <div className="space-y-2">
                        <div className="h-2 w-24 bg-navy/20 rounded-full" />
                        <div className="h-1.5 w-16 bg-navy/10 rounded-full" />
                      </div>
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
              <p className="mt-8 text-navy/40 text-center font-black uppercase tracking-widest text-xs">Eres un número más</p>
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
                <div className="h-1.5 w-16 bg-navy/10 rounded-full mx-auto mb-10 shrink-0" />
                <div className="text-center mb-8">
                  <div className="w-24 h-24 rounded-full bg-primary mx-auto mb-6 border-4 border-cream shadow-lg overflow-hidden relative">
                    <img src="https://i.pravatar.cc/300?img=11" alt="pro" className="w-full h-full object-cover" />
                  </div>
                  <h4 className="text-xl font-black text-navy leading-none">Manuel Pérez</h4>
                  <p className="text-[10px] font-black text-primary uppercase mt-2 tracking-widest">Plomero Maestro</p>
                </div>
                <div className="space-y-4 flex-grow">
                  <div className="p-4 bg-cream rounded-2xl flex items-center gap-4 border border-primary/10">
                    <MessageSquare size={16} className="text-primary" />
                    <div className="h-2 w-24 bg-primary/20 rounded-full" />
                  </div>
                  <div className="p-4 bg-cream rounded-2xl flex items-center gap-4 border border-primary/10">
                    <Smartphone size={16} className="text-primary" />
                    <div className="h-2 w-28 bg-primary/20 rounded-full" />
                  </div>
                </div>
                <div className="mt-6 p-5 bg-primary text-white rounded-2xl text-center text-xs font-black uppercase tracking-[0.2em] shadow-orange">
                  Llamar ahora
                </div>
              </div>
              <p className="mt-8 text-primary text-center font-black uppercase tracking-widest text-xs">Imposible de olvidar</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Beneficios Section */}
      <section className="py-24 relative overflow-hidden bg-navy">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&q=80&w=2000"
            alt="Comunidad"
            fill
            className="object-cover opacity-40 grayscale-[30%]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/60 via-navy/40 to-navy" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <motion.div whileHover={{ y: -10 }} className="glass-card p-10 rounded-card bg-white/5 border-white/10 backdrop-blur-xl">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-8 shadow-orange">
                <Search className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-black text-white mb-4 tracking-tighter uppercase italic">Buscan tu oficio y sales tú</h3>
              <p className="text-white/70 leading-relaxed font-medium">
                Configuramos palabras clave estratégicas para que cuando busquen tu especialidad en su teléfono, aparezcas de primero.
              </p>
            </motion.div>

            <motion.div whileHover={{ y: -10 }} className="glass-card p-10 rounded-card bg-white/5 border-white/10 backdrop-blur-xl group overflow-hidden">
              <div className="absolute top-0 right-0 p-4 text-white/5 group-hover:text-primary/10 transition-colors">
                <Camera size={80} />
              </div>
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-8 shadow-orange relative z-10">
                <Camera className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-black text-white mb-4 tracking-tighter uppercase italic relative z-10">Confianza al Instante</h3>
              <p className="text-white/70 leading-relaxed font-medium relative z-10">
                Una foto profesional integrada hace que confíen en ti antes de hablarte. Te ves más pro y más confiable.
              </p>
            </motion.div>

            <motion.div whileHover={{ y: -10 }} className="glass-card p-10 rounded-card bg-white/5 border-white/10 backdrop-blur-xl group overflow-hidden">
              <div className="absolute top-0 right-0 p-4 text-white/5 group-hover:text-primary/10 transition-colors">
                <Zap size={80} />
              </div>
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-8 shadow-orange relative z-10">
                <Zap className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-black text-white mb-4 tracking-tighter uppercase italic relative z-10">Galería Pro Incluida</h3>
              <p className="text-white/70 leading-relaxed font-medium relative z-10">
                Muestra tus mejores 3 trabajos directamente en tu tarjeta. Tus clientes verán la calidad de lo que haces en segundos.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Sectores Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl font-black text-navy uppercase tracking-tighter italic">Especialistas que ya están ganando más</h2>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {["🛠️ Restauración", "🎨 Pintura", "🔧 Mecánica", "🔌 Electricidad", "🚿 Plomería", "🏗️ Albañilería", "🏥 Salud", "🧹 Limpieza"].map((cat) => (
              <div key={cat} className="px-6 py-4 rounded-2xl bg-cream text-navy font-black text-center border border-navy/5 shadow-soft transition-colors cursor-default text-sm flex items-center justify-center gap-2 hover:bg-primary hover:text-white">
                {cat}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Calculadora de Pérdidas */}
      <section className="py-24 bg-cream overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8 md:p-16 rounded-[48px] border-primary/20 bg-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 text-primary opacity-5 rotate-12 hidden lg:block">
              <Zap size={250} />
            </div>

            <div className="max-w-3xl relative z-10">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-4xl lg:text-7xl font-black text-navy mb-8 tracking-tighter uppercase"
              >
                Calcula cuánto estás <span className="text-primary italic">dejando ir</span>
              </motion.h2>
              <p className="text-xl text-navy/60 mb-12 font-medium">
                Si no estás en su agenda con marca personal, ese dinero se lo lleva tu competencia que sí lo está.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-10">
                  <div>
                    <div className="flex justify-between mb-4">
                      <p className="text-xs font-black text-navy/40 uppercase tracking-widest">¿Cuántos Clientes te llaman al mes?</p>
                      <span className="text-primary font-black">{clients}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={clients}
                      onChange={(e) => setClients(parseInt(e.target.value))}
                      className="w-full h-3 bg-navy/5 rounded-full appearance-none accent-primary cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-4">
                      <p className="text-xs font-black text-navy/40 uppercase tracking-widest">Valor de tu servicio (Promedio)</p>
                      <span className="text-primary font-black">${avgValue}</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      value={avgValue}
                      onChange={(e) => setAvgValue(parseInt(e.target.value))}
                      className="w-full h-3 bg-navy/5 rounded-full appearance-none accent-primary cursor-pointer"
                    />
                  </div>
                </div>

                <div className="bg-navy p-12 rounded-[40px] text-center text-white shadow-orange relative overflow-hidden group">
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-4">Pérdida Anual Estimada</p>
                  <p className="text-7xl font-black text-primary mb-6">${annualLoss}</p>
                  <p className="text-xs font-bold opacity-70 leading-relaxed italic border-t border-white/5 pt-6">
                    "Recuperas los $10 de hoy con el primer cliente que sí te encuentre mañana."
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="precios" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl lg:text-7xl font-black text-navy mb-6 tracking-tighter uppercase italic">
              Planes Profesionales
            </h2>
            <p className="text-xl text-navy/60 max-w-2xl mx-auto font-medium">
              Inversión única. Resultados para siempre.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Básico */}
            <motion.div
              whileHover={{ y: -10 }}
              className="bg-white border-4 border-navy/5 p-12 rounded-[40px] flex flex-col shadow-soft"
            >
              <h3 className="text-xl font-black text-navy/30 uppercase tracking-[0.2em] mb-4">Básico</h3>
              <div className="flex items-baseline gap-1 mb-10">
                <span className="text-6xl font-black text-navy">$10</span>
                <span className="text-navy/30 font-black uppercase text-sm tracking-widest">Pago Único</span>
              </div>
              <ul className="space-y-5 mb-12 flex-grow">
                {["vCard Estratégica", "Tu Foto de Perfil", "Categoría de Búsqueda", "Historial de Llamadas", "Entrega en 1 hora"].map((item) => (
                  <li key={item} className="flex items-center gap-4 text-navy/70 font-bold">
                    <CheckCircle className="text-accent" size={20} /> {item}
                  </li>
                ))}
              </ul>
              <a href="/registro" className="w-full py-5 bg-navy/5 text-navy font-black rounded-button text-center hover:bg-navy/10 transition-all uppercase tracking-widest text-sm">
                Elegir Básico
              </a>
            </motion.div>

            {/* Pro */}
            <motion.div
              whileHover={{ y: -10 }}
              className="bg-white border-4 border-primary p-12 rounded-[40px] flex flex-col relative shadow-orange"
            >
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-primary text-white px-8 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">Más Recomendado</div>
              <h3 className="text-xl font-black text-primary uppercase tracking-[0.2em] mb-4">Pro</h3>
              <div className="flex items-baseline gap-1 mb-10">
                <span className="text-6xl font-black text-navy">$20</span>
                <span className="text-navy/30 font-black uppercase text-sm tracking-widest">Pago Único</span>
              </div>
              <ul className="space-y-5 mb-12 flex-grow">
                {["Todo lo del Básico", "Código QR para Imprimir", "Galería de 3 Fotos de Trabajos", "Botón de WhatsApp Directo", "Diseño Premium Personalizado", "Soporte Prioritario"].map((item) => (
                  <li key={item} className="flex items-center gap-4 text-navy font-black">
                    <CheckCircle className="text-primary" size={20} /> {item}
                  </li>
                ))}
              </ul>
              <a href="/registro" className="w-full py-5 bg-primary text-white font-black rounded-button shadow-orange text-center hover:bg-primary-dark transition-all uppercase tracking-widest text-sm">
                Elegir Pro y Crear Mi Contacto
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-cream">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-black text-navy uppercase tracking-tighter italic">Preguntas Comunes</h2>
          </motion.div>

          <div className="space-y-4">
            {[
              { q: "¿Tengo que seguir pagando después?", a: "Absolutamente no. Pagas una vez $10 o $20 y tienes tu contacto profesional para siempre. Sin mensualidades, sin trucos." },
              { q: "¿Cómo lo recibo?", a: "En exactamente 1 hora desde que confirmas tu pago, te enviamos un enlace a tu WhatsApp o correo con tu vCard y tu QR manual. Listo para usar." },
              { q: "¿Y si no sé nada de tecnología?", a: "No necesitas saber nada. Nosotros hacemos todo el trabajo pesado por ti. Tú solo nos pasas tus datos y listo." },
              { q: "¿Sirve para Android y iPhone?", a: "Sí, funciona perfectamente en todos los celulares modernos. Es tecnología nativa." }
            ].map((item, i) => (
              <details key={i} className="group glass-card rounded-3xl p-8 cursor-pointer border-navy/5">
                <summary className="flex items-center justify-between font-black text-navy list-none text-lg">
                  {item.q}
                  <ChevronRight size={24} className="group-open:rotate-90 transition-transform text-primary" />
                </summary>
                <p className="mt-6 text-navy/60 leading-relaxed font-bold">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Compacto */}
      <footer className="py-8 relative overflow-hidden bg-navy border-t border-white/5">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&q=80&w=2000"
            alt="Comunidad"
            fill
            className="object-cover opacity-20 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/80 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="text-xl font-black text-white tracking-tighter">
            <span className="text-primary">!</span>Regístrame Ya
          </div>
          <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em]">© 2026 · Profesionales en Acción</p>
          <div className="flex gap-6 text-[10px] font-black text-white/50 uppercase tracking-[0.3em]">
            <a href="#" className="hover:text-primary transition-colors">Términos</a>
            <a href="#" className="hover:text-primary transition-colors">Privacidad</a>
            <a href="#" className="hover:text-primary transition-colors">Soporte</a>
          </div>
        </div>
      </footer>

      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoId="c1gNsQjKZ_Q"
      />
      <PopupManager />
    </main>
  );
}
