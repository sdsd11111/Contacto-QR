"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

// --- Animaciones Globales ---
const FadeInUp = ({ children, delay = 0, className = "" }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

// --- Radar Ping naranja — anclado a la izquierda ---
const RADAR_RINGS = [0, 1, 2];
const RadarPing = ({ className = "" }: { className?: string }) => (
  <div className={`absolute inset-0 overflow-hidden pointer-events-none z-[2] ${className}`}>
    <div style={{ position: "absolute", top: "50%", left: "25%", transform: "translate(-50%, -50%)" }}>
      {RADAR_RINGS.map((i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            width: 160,
            height: 160,
            top: -80,
            left: -80,
            borderRadius: "50%",
            border: "1px solid #FF6B2B",
          }}
          animate={{ scale: [0.2, 3], opacity: [0.5, 0] }}
          transition={{
            duration: 4,
            ease: "easeOut",
            repeat: Infinity,
            delay: i * 1.33,
            repeatDelay: 0,
          }}
        />
      ))}
      <motion.div
        style={{
          position: "absolute",
          width: 10,
          height: 10,
          top: -5,
          left: -5,
          borderRadius: "50%",
          backgroundColor: "#FF6B2B",
        }}
        animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.4, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  </div>
);

// --- Pings blancos dispersos ---
const SCATTERED_PINGS = [
  { top: "18%", left: "72%", delay: 0,    size: 60  },
  { top: "68%", left: "82%", delay: 1.1,  size: 44  },
  { top: "35%", left: "55%", delay: 2.3,  size: 80  },
  { top: "80%", left: "38%", delay: 0.7,  size: 50  },
  { top: "12%", left: "40%", delay: 1.8,  size: 36  },
  { top: "55%", left: "90%", delay: 3.0,  size: 56  },
];
const ScatteredPings = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-[2]">
    {SCATTERED_PINGS.map((p, i) => (
      <div key={i} style={{ position: "absolute", top: p.top, left: p.left }}>
        <motion.div
          style={{
            position: "absolute",
            width: p.size,
            height: p.size,
            top: -(p.size / 2),
            left: -(p.size / 2),
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.4)",
          }}
          animate={{ scale: [0.3, 2.2], opacity: [0.4, 0] }}
          transition={{
            duration: 3.5,
            ease: "easeOut",
            repeat: Infinity,
            delay: p.delay,
            repeatDelay: 1,
          }}
        />
        <motion.div
          style={{
            position: "absolute",
            width: 4,
            height: 4,
            top: -2,
            left: -2,
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.5)",
          }}
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
        />
      </div>
    ))}
  </div>
);

// Datos del Slider "Imagina"
const IMAGINA_SLIDES = [
  {
    tab: "Restaurantes",
    img: "/images/slides/auditoria_s1_final.webp",
    line1: "Imagina que tu mejor mesa",
    line2: "acaba de vivir la peor",
    line3: "experiencia de su vida.",
    accent: "Y no te enteraste.",
  },
  {
    tab: "Educación",
    img: "/images/slides/auditoria_s2_final.webp",
    line1: "Imagina que tu docente",
    line2: "llegó tarde tres veces",
    line3: "esta semana.",
    accent: "Y nadie te dijo nada.",
  },
  {
    tab: "Hoteles",
    img: "/images/slides/auditoria_s3_final.webp",
    line1: "Imagina que en la",
    line2: "habitación 12 hay un problema",
    line3: "siendo fotografiado.",
    accent: "Para subirlo a redes.",
  },
  {
    tab: "Flotas",
    img: "/images/slides/auditoria_s2_final.webp",
    line1: "Imagina que tu chofer",
    line2: "tuvo un incidente grave",
    line3: "y no pudiste verlo.",
    accent: "Y te enteraste por la denuncia.",
  },
  {
    tab: "Retail",
    img: "/images/slides/auditoria_s4_final.webp",
    line1: "Imagina que un cliente",
    line2: "decidió no volver",
    line3: "jamás.",
    accent: "Y nunca sabrás por qué.",
  },
];

const ImagineSlider = () => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % IMAGINA_SLIDES.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => setActive((prev) => (prev + 1) % IMAGINA_SLIDES.length);
  const prevSlide = () => setActive((prev) => (prev - 1 + IMAGINA_SLIDES.length) % IMAGINA_SLIDES.length);

  const slide = IMAGINA_SLIDES[active];

  return (
    <div className="relative w-full h-screen min-h-[600px] overflow-hidden group">
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${slide.img})` }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 z-10 pb-28 md:pb-36 px-8 md:px-16 max-w-5xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-[#FFFFFF] font-bold text-4xl md:text-5xl lg:text-6xl leading-[1.2] mb-4 max-w-4xl">
              {slide.line1}<br/>
              {slide.line2}<br/>
              {slide.line3}
            </p>
            <p className="text-[#FF6B2B] font-bold text-4xl md:text-5xl lg:text-6xl leading-[1.2]">
              {slide.accent}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
      <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 text-white/30 hover:text-white transition-colors duration-300 opacity-0 group-hover:opacity-100">
        <ChevronLeft size={48} strokeWidth={1} />
      </button>
      <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 text-white/30 hover:text-white transition-colors duration-300 opacity-0 group-hover:opacity-100">
        <ChevronRight size={48} strokeWidth={1} />
      </button>
      {/* Dots de navegación */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        {IMAGINA_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`transition-all duration-300 rounded-full ${
              i === active
                ? "w-10 h-2.5 bg-[#FF6B2B] shadow-lg shadow-[#FF6B2B]/40"
                : "w-2.5 h-2.5 bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

const ChatSequence = () => {
  const [step, setStep] = useState(0);
  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} onViewportEnter={() => { setStep(1); setTimeout(() => setStep(2), 600); setTimeout(() => setStep(3), 1400); }} className="max-w-2xl mx-auto flex flex-col gap-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: step >= 1 ? 1 : 0, y: step >= 1 ? 0 : 10 }} transition={{ duration: 0.4 }} className="self-start bg-[#1a1a1a] text-[#FFFFFF] px-6 py-4 rounded-2xl rounded-tl-sm max-w-[85%] text-lg md:text-xl font-medium">
        "Yo ya tengo cómo recibir quejas."
      </motion.div>
      {step === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="self-end bg-[#1a1a1a] px-5 py-4 rounded-2xl rounded-tr-sm flex gap-1.5 items-center h-[56px]">
          <span className="w-2 h-2 bg-[#888888] rounded-full animate-bounce"></span>
          <span className="w-2 h-2 bg-[#888888] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
          <span className="w-2 h-2 bg-[#888888] rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
        </motion.div>
      )}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: step >= 3 ? 1 : 0, y: step >= 3 ? 0 : 10 }} transition={{ duration: 0.4 }} className="self-end bg-[#FF6B2B] text-[#FFFFFF] font-bold px-6 py-4 rounded-2xl rounded-tr-sm max-w-[85%] text-lg md:text-xl" style={{ display: step >= 3 ? 'block' : 'none' }}>
        ¿Te enteraste antes o después de que pasó?
      </motion.div>
    </motion.div>
  );
};

export default function AuditoriaOperativaPage() {
  return (
    <main className="bg-[#0a0a0a] min-h-screen font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Botón flotante de Home */}
      <a href="/" aria-label="Volver al inicio" className="fixed top-5 left-5 z-50 flex items-center justify-center w-10 h-10 bg-[#111111] border border-[#333333] hover:border-[#FF6B2B] hover:text-[#FF6B2B] text-[#888888] transition-all duration-300 rounded-sm">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </a>

      {/* BLOQUE 1 — HERO */}
      <section className="relative h-screen min-h-[600px] flex flex-col justify-center items-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60" style={{ backgroundImage: "url('/images/Reingenierìa/portada_laptop_supermercado.webp')" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />
        <RadarPing />
        <ScatteredPings />
        <div className="relative z-10 container mx-auto px-6 flex flex-col items-center text-center mt-20">
          <FadeInUp>
            <h1 className="text-[#FFFFFF] font-black tracking-tighter uppercase mb-8" style={{ fontSize: "clamp(2.4rem, 6.5vw, 5rem)", lineHeight: 1.05 }}>
              ¿Qué está pasando<br/>
              en tu negocio<br/>
              <span className="text-[#FF6B2B] italic">ahora mismo?</span>
            </h1>
          </FadeInUp>
          <FadeInUp delay={0.2}>
            <p className="text-[#888888] text-xl md:text-2xl font-normal leading-[1.7] max-w-2xl mx-auto">
              No lo sabes. <span className="text-[#FFFFFF]">Y ese es exactamente el problema.</span>
            </p>
          </FadeInUp>
        </div>
      </section>

      {/* BLOQUE 2 — EL ESPEJO "IMAGINA" */}
      <section className="w-full bg-[#0a0a0a]">
        <ImagineSlider />
      </section>

      {/* FRANJA DE IMPACTO */}
      <section className="relative w-full bg-[#1a1a1a] py-24 md:py-32 px-6 flex items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 grayscale" style={{ backgroundImage: "url('/images/Reingenierìa/parallax.webp')" }} />
        <div className="absolute inset-0 bg-[#1a1a1a]/70" />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#0a0a0a] to-transparent pointer-events-none z-10" />
        <div className="max-w-5xl mx-auto flex flex-col items-center justify-center text-center gap-6 md:gap-8 relative z-20">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6 }}>
            <p className="text-[#FFFFFF] text-2xl md:text-4xl font-bold">El problema no es que pase.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, margin: "-50px" }} transition={{ delay: 0.3, duration: 0.6 }}>
            <h2 className="text-[#FFFFFF] font-black tracking-tighter uppercase" style={{ fontSize: "clamp(2.5rem, 6.5vw, 5rem)", lineHeight: 1.05 }}>
              Es que siempre te enteras <br className="md:hidden"/><span className="text-[#FFFFFF]">después.</span>
            </h2>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, margin: "-50px" }} transition={{ delay: 0.6, duration: 0.6 }}>
            <p className="text-[#FFFFFF] text-2xl md:text-4xl font-bold">Siempre tarde. Siempre sin pruebas.</p>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
      </section>

      {/* BLOQUE 3 — EL COSTO REAL */}
      <section className="relative h-screen min-h-[700px] flex items-center">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed opacity-50 grayscale" style={{ backgroundImage: "url('/images/Reingenierìa/bg_messy_desk_vs_digital.webp')" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />
        <div className="container relative z-10 mx-auto px-6 max-w-4xl mt-32">
          <FadeInUp>
            <h2 className="text-4xl md:text-6xl font-bold text-[#FFFFFF] leading-[1.1] mb-12">
              No te cuesta dinero.<br/>
              <span className="text-[#888888]">Te cuesta algo peor.</span>
            </h2>
            <div className="text-[#888888] text-xl md:text-2xl leading-[1.7] space-y-8 max-w-2xl">
              <p>Cada problema no gestionado: <span className="text-[#FFFFFF] font-bold">tu tiempo. El de tu familia.</span></p>
              <p className="italic border-l-2 border-[#888888] pl-6 text-[#FFFFFF]">
                Y tú en el medio, respondiendo por algo que no viste.
              </p>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* BLOQUE 4 — EL ESCUDO FALSO */}
      <section className="relative py-32 bg-[#0a0a0a] px-6">
        <ScatteredPings />
        <div className="container mx-auto max-w-3xl relative z-10">
          <FadeInUp>
            <p className="text-[11px] md:text-xs font-bold uppercase tracking-[0.2em] text-[#888888] text-center mb-16">
              LA TRAMPA DEL BUZÓN DE QUEJAS
            </p>
          </FadeInUp>
          <ChatSequence />
          <FadeInUp delay={0.4}>
            <p className="text-[#888888] text-center mt-16 text-lg md:text-xl leading-[1.7] max-w-2xl mx-auto">
              Sí. Tienes un WhatsApp, un formulario, un número de teléfono. <br className="hidden md:block"/>
              <span className="text-[#FFFFFF]">Pero tu cliente no los usa.</span> Se lo guarda. Llega a casa. Y lo publica donde más duele.
            </p>
          </FadeInUp>
        </div>
      </section>

      {/* BLOQUE 5 — LA PROMESA */}
      <section className="relative py-32 md:py-48 flex items-center bg-[#0a0a0a]">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60 bg-fixed" style={{ backgroundImage: "url('/images/Reingenierìa/feature_audit_1.webp')" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-[#0a0a0a]/30" />
        <div className="container relative z-10 mx-auto px-6 max-w-5xl">
          <FadeInUp>
            <h2 className="text-4xl md:text-6xl font-bold text-[#FFFFFF] leading-[1.1] mb-16 max-w-3xl">
              La próxima vez que suene ese teléfono,<br/>
              <span className="text-[#FFFFFF]">ya sabes qué pasó.</span>
            </h2>
            <p className="text-xl md:text-2xl text-[#888888] mb-20 max-w-2xl leading-[1.7]">
              Antes de contestar. Con evidencia. Con el momento exacto.
            </p>
          </FadeInUp>
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 pt-16 border-t border-[#222222]">
            <FadeInUp delay={0.1}>
              <p className="text-[#888888] text-sm font-bold uppercase tracking-widest mb-6">ANTES</p>
              <p className="text-[#FFFFFF] text-xl md:text-2xl leading-[1.7]">
                Ya tienes el reporte. Quién estaba. Qué pasó. Con foto, audio o video.
              </p>
            </FadeInUp>
            <FadeInUp delay={0.2}>
              <p className="text-[#888888] text-sm font-bold uppercase tracking-widest mb-6">TU NUEVO ROL</p>
              <p className="text-[#FFFFFF] text-xl md:text-2xl leading-[1.7]">
                No gestionas el problema.<br/>
                <span className="font-bold text-[#FFFFFF]">Gestionas la solución.</span>
              </p>
            </FadeInUp>
          </div>
        </div>
      </section>

      {/* BLOQUE 6 — PRESENTACIÓN ACTIVAQR2 */}
      <section className="relative py-24 bg-[#0a0a0a] overflow-hidden">
        <ScatteredPings />
        <div className="container mx-auto px-6 mb-16 relative z-10">
          <FadeInUp>
            <h2 className="text-3xl md:text-5xl font-bold text-[#FFFFFF]">ActivaQR2 se adapta a tu sector</h2>
          </FadeInUp>
        </div>
        <div className="container mx-auto px-6">
          <div className="flex overflow-x-auto md:grid md:grid-cols-3 gap-6 snap-x snap-mandatory pb-8 hide-scrollbar" style={{ scrollbarWidth: "none" }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="min-w-[85vw] md:min-w-0 snap-center rounded-sm bg-[#111111] border border-[#222222] overflow-hidden group">
              <div className="h-48 bg-cover bg-center opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700" style={{ backgroundImage: "url('/images/Reingenierìa/slide_activaqr2/costo_oculto_hotel.webp')" }}></div>
              <div className="p-8">
                <p className="text-[#888888] text-xs font-bold uppercase tracking-widest mb-3">HOTELES</p>
                <p className="text-[#FFFFFF] text-lg leading-[1.7]">Una mancha en la alfombra reportada por el huésped, resuelta antes del checkout.</p>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }} className="min-w-[85vw] md:min-w-0 snap-center rounded-sm bg-[#111111] border border-[#222222] overflow-hidden group">
              <div className="h-48 bg-cover bg-center opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700" style={{ backgroundImage: "url('/images/Reingenierìa/slide_activaqr2/costo_oculto_restaurante.webp')" }}></div>
              <div className="p-8">
                <p className="text-[#888888] text-xs font-bold uppercase tracking-widest mb-3">RESTAURANTES</p>
                <p className="text-[#FFFFFF] text-lg leading-[1.7]">El plato llegó frío. Lo sabes al instante, no en las reseñas de Google mañana.</p>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }} className="min-w-[85vw] md:min-w-0 snap-center rounded-sm bg-[#111111] border border-[#222222] overflow-hidden group">
              <div className="h-48 bg-cover bg-center opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700" style={{ backgroundImage: "url('/images/Reingenierìa/slide_activaqr2/costo_oculto_transporte.webp')" }}></div>
              <div className="p-8">
                <p className="text-[#888888] text-xs font-bold uppercase tracking-widest mb-3">FLOTAS</p>
                <p className="text-[#FFFFFF] text-lg leading-[1.7]">Unidad detenida. Tienes la foto y ubicación enviada por el chofer en un clic.</p>
              </div>
            </motion.div>
          </div>
          <div className="flex flex-wrap gap-3 mt-8 opacity-60">
            {["Retail", "Transporte Escolar", "Franquicias", "Seguridad"].map(b => (
              <span key={b} className="px-4 py-1.5 border border-[#333] text-[#888] text-xs font-bold uppercase tracking-widest rounded-sm">{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* BLOQUE 7 — PRUEBA SOCIAL */}
      <section className="relative py-32 bg-[#000000] px-6">
        <ScatteredPings />
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <FadeInUp>
            <h2 className="text-3xl md:text-5xl font-bold text-[#FFFFFF] mb-20">No es promesa. Es evidencia.</h2>
          </FadeInUp>
          <div className="max-w-3xl mx-auto text-center mt-12 md:mt-20">
            <FadeInUp delay={0.2}>
              <p className="text-[#FFFFFF] text-2xl md:text-4xl font-bold mb-4">1 cooperativa. 3 meses.</p>
              <p className="text-[#FFFFFF] text-6xl md:text-8xl font-black tracking-tighter mb-6">47</p>
              <p className="text-[#888888] text-xl md:text-2xl leading-[1.7]">
                reportes gestionados antes de llegar a Google.<br/>
                <span className="text-sm uppercase tracking-widest mt-8 block italic">El primer caso real está documentado. Más evidencia disponible bajo solicitud.</span>
              </p>
            </FadeInUp>
          </div>
        </div>
      </section>

      {/* BLOQUE 8 — PRECIOS */}
      <section id="oferta" className="relative py-32 bg-[#0a0a0a] px-6">
        <ScatteredPings />
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-10 bg-[#111111] border border-[#222222] flex flex-col justify-between h-full">
              <div><h3 className="text-2xl font-bold text-[#FFFFFF] mb-2">Starter</h3><p className="text-[#888888] text-sm mb-8">Hasta 10 puntos operativos.</p></div>
              <div><p className="text-3xl font-bold text-[#FFFFFF] mb-1">$13<span className="text-lg text-[#888888] font-normal">/punto/mes</span></p><p className="text-[#888888] text-xs uppercase tracking-widest">+ $100 Setup</p></div>
            </div>
            <div className="p-10 bg-[#111111] border border-[#222222] flex flex-col justify-between h-full">
              <div><h3 className="text-2xl font-bold text-[#FFFFFF] mb-2">Business</h3><p className="text-[#888888] text-sm mb-8">Hasta 50 puntos operativos.</p></div>
              <div><p className="text-3xl font-bold text-[#FFFFFF] mb-1">Desde $200<span className="text-lg text-[#888888] font-normal">/mes</span></p><p className="text-[#888888] text-xs uppercase tracking-widest">+ $300 Setup</p></div>
            </div>
            <div className="p-10 bg-[#111111] border border-[#222222] flex flex-col justify-between h-full">
              <div><h3 className="text-2xl font-bold text-[#FFFFFF] mb-2">Enterprise</h3><p className="text-[#888888] text-sm mb-8">Redes, franquicias o flotas grandes.</p></div>
              <div><p className="text-3xl font-bold text-[#FFFFFF] mb-1">Cotización</p><p className="text-[#888888] text-xs uppercase tracking-widest">Personalizada</p></div>
            </div>
            <div className="p-10 bg-[#FF6B2B] flex flex-col justify-between h-full relative overflow-hidden">
              <div className="absolute -right-10 -top-10 opacity-10"><ShieldCheck size={200} /></div>
              <div className="relative z-10"><h3 className="text-2xl font-bold text-[#FFFFFF] mb-2">Lifetime</h3><p className="text-[#FFFFFF]/80 text-sm mb-8">Pago único. Licencia de por vida.</p></div>
              <div className="relative z-10"><p className="text-3xl font-bold text-[#FFFFFF] mb-1">Desde $2,400</p><p className="text-[#FFFFFF]/80 text-xs uppercase tracking-widest">Sin pagos mensuales</p></div>
            </div>
          </div>
          <div className="mt-16 text-center">
            <a href="/registro?plan=auditoria" className="inline-flex items-center justify-center gap-3 bg-[#FF6B2B] text-[#FFFFFF] font-bold text-xl px-12 py-5 w-full md:w-auto hover:bg-[#e05a1f] transition-colors duration-300">
              Activar mi acceso <ArrowRight size={24} />
            </a>
          </div>
        </div>
      </section>

      {/* BLOQUE 9 — GARANTÍA Y CIERRE */}
      <section className="relative py-32 bg-[#000000] border-t border-[#222222] text-center px-6">
        <ScatteredPings />
        <div className="container mx-auto max-w-2xl relative z-10">
          <FadeInUp>
            <h2 className="text-3xl md:text-5xl font-bold text-[#FFFFFF] mb-8 leading-[1.3]">
              30 días de garantía incondicional.
            </h2>
            <p className="text-xl md:text-2xl text-[#888888] leading-[1.7] mb-16">
              Si no ves el valor, te devolvemos cada centavo.
            </p>
            <a href="/registro?plan=auditoria" className="inline-flex items-center justify-center gap-3 bg-[#FF6B2B] text-[#FFFFFF] font-bold text-xl px-12 py-6 w-full md:w-auto hover:bg-[#e05a1f] transition-colors duration-300">
              Activar mi acceso ahora <ArrowRight size={24} />
            </a>
          </FadeInUp>
        </div>
      </section>
    </main>
  );
}
