"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ShieldCheck, ChevronLeft, ChevronRight, Play, Globe, Layout, CheckCircle2, Star, RefreshCw, MessageSquare, Zap, Target } from "lucide-react";
import { useState, useEffect } from "react";
import VideoModal from "@/components/VideoModal";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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

// --- Radar Ping naranja ---
const RADAR_RINGS = [0, 1, 2];
const RadarPing = ({ className = "" }: { className?: string }) => (
  <div className={`absolute inset-0 overflow-hidden pointer-events-none z-[5] ${className}`}>
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
  { top: "10%", left: "80%", delay: 0.2,  size: 80  },
  { top: "70%", left: "70%", delay: 1.2,  size: 60  },
  { top: "30%", left: "40%", delay: 2.2,  size: 100 },
  { top: "90%", left: "20%", delay: 0.8,  size: 50  },
  { top: "25%", left: "60%", delay: 1.8,  size: 45  },
];
const ScatteredPings = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-[5]">
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
            border: "1.5px solid rgba(255,255,255,0.6)",
          }}
          animate={{ scale: [0.3, 2.2], opacity: [0.8, 0] }}
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
            backgroundColor: "rgba(255,255,255,1)",
          }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
        />
      </div>
    ))}
  </div>
);

// Datos del Slider "El Espejo" — Sitio Web Completo $1,000
const EL_ESPEJO_SLIDES = [
  {
    img: "/images/slides/imperio_s1_final.webp",
    line1: "Imagina que un cliente",
    line2: "busca tu servicio en Google.",
    line3: "Y no apareces.",
    accent: "Tu competencia, que es la mitad de buena que tú, se llevó la venta porque sí tenía web.",
  },
  {
    img: "/images/slides/imperio_s2_final.webp",
    line1: "Imagina que mandas",
    line2: "tu link y el cliente",
    line3: "se queda sin palabras.",
    accent: "No eres uno más del montón en redes. Eres una marca de autoridad.",
  },
  {
    img: "/images/slides/imperio_s3_final.webp",
    line1: "Imagina tener el control",
    line2: "total de tus datos.",
    line3: "Sin algoritmos.",
    accent: "Tu casa. Tus reglas. Tu base de datos. Nadie te puede apagar el negocio.",
  },
  {
    img: "/images/slides/imperio_s4_final.webp",
    line1: "Imagina que tu negocio",
    line2: "trabaja para ti,",
    line3: "no tú para él.",
    accent: "SEO, Catálogo y Blog centralizados. La infraestructura de los que ganan de verdad.",
  },
];

const ImagineSlider = () => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % EL_ESPEJO_SLIDES.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => setActive((prev) => (prev + 1) % EL_ESPEJO_SLIDES.length);
  const prevSlide = () => setActive((prev) => (prev - 1 + EL_ESPEJO_SLIDES.length) % EL_ESPEJO_SLIDES.length);

  const slide = EL_ESPEJO_SLIDES[active];

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
            <p className="text-[#FFFFFF] font-bold text-3xl md:text-5xl lg:text-6xl leading-[1.2] mb-6 max-w-4xl">
              {slide.line1}<br/>
              {slide.line2}<br/>
              {slide.line3}
            </p>
            <p className="text-[#FF6B2B] font-bold text-2xl md:text-3xl lg:text-4xl leading-[1.3] max-w-3xl">
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
        {EL_ESPEJO_SLIDES.map((_, i) => (
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
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} onViewportEnter={() => { setStep(1); setTimeout(() => setStep(2), 800); setTimeout(() => setStep(3), 1600); }} className="max-w-2xl mx-auto flex flex-col gap-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: step >= 1 ? 1 : 0, y: step >= 1 ? 0 : 10 }} transition={{ duration: 0.4 }} className="self-start bg-[#333333] text-[#FFFFFF] px-6 py-4 rounded-2xl rounded-tl-sm max-w-[85%] text-lg md:text-xl font-medium">
        "¿Cómo sé si son una empresa seria? Solo veo su Instagram."
      </motion.div>
      {step === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="self-end bg-[#1a1a1a] px-5 py-4 rounded-2xl rounded-tr-sm flex gap-1.5 items-center h-[56px]">
          <span className="w-2 h-2 bg-[#FF6B2B] rounded-full animate-bounce"></span>
          <span className="w-2 h-2 bg-[#FF6B2B] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
          <span className="w-2 h-2 bg-[#FF6B2B] rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
        </motion.div>
      )}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: step >= 3 ? 1 : 0, y: step >= 3 ? 0 : 10 }} transition={{ duration: 0.4 }} className="self-end bg-[#FF6B2B] text-[#FFFFFF] font-bold px-6 py-4 rounded-2xl rounded-tr-sm max-w-[85%] text-lg md:text-xl" style={{ display: step >= 3 ? 'block' : 'none' }}>
        La autoridad no se dice, se demuestra. Mira nuestra central de operaciones digital.
      </motion.div>
    </motion.div>
  );
};

const FAQVideoBlock = ({ question, index, onClick }: { question: string, index: number, onClick: () => void }) => {
  return (
    <FadeInUp delay={index * 0.1} className="group cursor-pointer">
      <div onClick={onClick} className="flex flex-col gap-4 p-8 bg-[#111111] border border-[#222222] hover:border-[#FF6B2B] transition-all duration-300 rounded-sm">
        <h3 className="text-xl md:text-2xl font-bold text-[#FFFFFF] group-hover:text-[#FF6B2B] transition-colors">{question}</h3>
        <div className="aspect-video bg-[#0a0a0a] relative flex items-center justify-center overflow-hidden rounded-sm group-hover:scale-[1.02] transition-transform duration-500">
          <div className="absolute inset-0 bg-cover bg-center opacity-[0.65] grayscale group-hover:grayscale-0 transition-all" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=2000&auto=format&fit=crop')` }} />
          <div className="relative z-10 w-16 h-16 rounded-full bg-[#FF6B2B] flex items-center justify-center shadow-2xl shadow-[#FF6B2B]/40 group-hover:scale-110 transition-transform">
            <Play fill="white" className="text-white ml-1" />
          </div>
          <p className="absolute bottom-4 left-4 text-[10px] uppercase tracking-widest font-bold text-white/60">Video respuesta de César</p>
        </div>
      </div>
    </FadeInUp>
  );
};

const AnimatedWord = () => {
  const words = ['"casa"', '"imperio"', '"identidad"', '"futuro"', '"autoridad"'];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="inline-block relative overflow-hidden align-bottom" style={{ height: "1em", verticalAlign: "top" }}>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: "0%" }}
          exit={{ opacity: 0, y: "-100%" }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="inline-block text-[#FF6B2B]"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

export default function SitioWebCompletoV2Page() {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState("");

  return (
    <main className="bg-[#0a0a0a] min-h-screen font-sans selection:bg-[#FF6B2B] selection:text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      {/* BLOQUE 1 — HERO */}
      <section className="relative h-screen flex items-center justify-center bg-[#0a0a0a] overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-[0.65] grayscale" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2000&auto=format&fit=crop')" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/50 to-[#0a0a0a]" />
        
        <RadarPing />
        <ScatteredPings />
        <div className="relative z-10 container mx-auto px-6 flex flex-col items-center text-center mt-20">
          <FadeInUp>
            <h1 className="text-[#FFFFFF] font-black tracking-tighter uppercase mb-8" style={{ fontSize: "clamp(2.4rem, 6vw, 4.5rem)", lineHeight: 1.05 }}>
              Si no eres el<br/>
              primero en Google,<br/>
              <span className="text-[#FF6B2B]">eres el último.</span>
            </h1>
          </FadeInUp>
          <FadeInUp delay={0.2}>
            <p className="text-[#888888] text-xl md:text-2xl font-normal leading-[1.7] max-w-3xl mx-auto mb-12">
              Tener una web "bonita" no sirve de nada si no proyecta autoridad. <span className="text-[#FFFFFF]">Construye tu propia casa digital y deja de depender de redes sociales prestadas para existir.</span>
            </p>
            <a href="#oferta" className="bg-[#FF6B2B] text-white px-10 py-5 rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-2xl shadow-[#FF6B2B]/20">
              Quiero construir mi imperio digital →
            </a>
          </FadeInUp>
        </div>
      </section>

      {/* BLOQUE 2 — EL ESPEJO */}
      <section className="w-full bg-[#0a0a0a]">
        <ImagineSlider />
      </section>

      {/* BLOQUE 3.1 — PROBLEMA */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center bg-[#000000] overflow-hidden">
        <RadarPing />
        <ScatteredPings />
        <div className="absolute inset-0 bg-cover bg-center opacity-[0.65] grayscale" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2000&auto=format&fit=crop')` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a]" />
        
        <div className="relative z-10 container mx-auto px-6 text-center">
          <FadeInUp>
            <p className="text-[#FFFFFF] text-xl md:text-2xl font-bold mb-6">
              La invisibilidad es el fin del negocio.
            </p>
            <h2 className="text-4xl md:text-6xl font-black text-[#FFFFFF] mb-6 tracking-tighter leading-[1.1] uppercase">
              SI NO TIENES TU PROPIA WEB, <br/> <span className="text-[#FF6B2B]">ERES UN INQUILINO</span> <br/> DE TU PROPIO ÉXITO.
            </h2>
          </FadeInUp>
        </div>
      </section>

      {/* BLOQUE 3.2 — EL COSTO REAL */}
      <section className="relative py-32 bg-[#000000] overflow-hidden border-t border-[#111111]">
        <ScatteredPings />
        <div className="absolute inset-0 bg-cover bg-center opacity-[0.65] grayscale" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2000&auto=format&fit=crop')` }} />
        <div className="absolute inset-0 bg-[#000000]/80" />
        
        <div className="relative z-10 container mx-auto px-6">
          <FadeInUp className="max-w-4xl">
            <div className="flex flex-col gap-2 mb-12">
              <span className="text-[#FFFFFF] text-2xl md:text-4xl font-light italic">¿Cuánto confía un CEO</span>
              <span className="text-[#666666] text-xl md:text-3xl font-light">en un negocio que no tiene presencia web de élite?</span>
            </div>
            
            <h3 className="text-[#FFFFFF] text-3xl md:text-5xl font-black mb-12 leading-tight uppercase tracking-tighter">
              DOMINA TU NICHO <br/> CON INFRAESTRUCTURA REAL.
            </h3>

            <div className="pl-8 border-l-4 border-[#FF6B2B]">
              <p className="text-[#888888] text-xl md:text-2xl font-bold italic">
                La autoridad se construye, no se improvisa.
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
              CENTRALIZACIÓN ESTRATÉGICA
            </p>
          </FadeInUp>
          <ChatSequence />
          <FadeInUp delay={0.4}>
            <div className="text-[#888888] text-center mt-16 text-lg md:text-xl leading-[1.7] max-w-2xl mx-auto space-y-6">
              <p>
                Tu sitio web es tu activo más valioso. Es lo único que Google puede indexar para que te encuentren primero.
              </p>
              <p className="text-[#FFFFFF] font-bold">
                Centraliza tu autoridad. Muestra tus casos de éxito y domina el mercado local.
              </p>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* BLOQUE 5 — LA PROMESA */}
      <section className="relative py-32 md:py-48 flex items-end bg-[#0a0a0a]">
        <ScatteredPings />
        <div className="absolute inset-0 bg-cover bg-center opacity-40 bg-fixed grayscale" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2000&auto=format&fit=crop')" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" />
        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <FadeInUp>
            <h2 className="text-4xl md:text-6xl font-bold text-[#FFFFFF] leading-[1.1] mb-6 max-w-4xl">
              Una central de mando diseñada<br/>
              para proyectar poder.
            </h2>
            <p className="text-[#888888] text-xl mb-16">
              Ingeniería de software al servicio de tu marca.
            </p>
            
            <div className="grid md:grid-cols-2 gap-12 max-w-4xl border-t border-[#333333] pt-12">
              <div>
                <h3 className="text-[#FFFFFF] text-xl font-bold mb-2">SEO de Élite.</h3>
                <p className="text-[#888888] leading-relaxed">
                  Aparece en los primeros resultados cuando tus clientes buscan soluciones reales.
                </p>
              </div>
              <div>
                <h3 className="text-[#FFFFFF] text-xl font-bold mb-2">Soporte VIP.</h3>
                <p className="text-[#888888] leading-relaxed">
                  Atención prioritaria y consultoría estratégica para el crecimiento de tu imperio digital.
                </p>
              </div>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* BLOQUE 6 — CÓMO FUNCIONA */}
      <section className="relative py-32 bg-[#0a0a0a] px-6">
        <ScatteredPings />
        <div className="container mx-auto max-w-6xl">
            <FadeInUp>
                <h2 className="text-3xl md:text-5xl font-bold text-[#FFFFFF] text-center mb-24">Tu imperio en 3 niveles.</h2>
            </FadeInUp>
            <div className="grid md:grid-cols-3 gap-12 md:gap-8">
                {[
                    { step: 1, text: "Estructuramos tu contenido con narrativa de autoridad." },
                    { step: 2, text: "Diseñamos tu interfaz bajo el estándar Midnight Obsidian." },
                    { step: 3, text: "Lanzamos tu sitio web y empiezas a dominar tu nicho." }
                ].map((p, i) => (
                    <FadeInUp key={i} delay={i * 0.1} className="flex flex-col items-center text-center">
                        <span className="text-7xl md:text-9xl font-black text-[#FF6B2B] opacity-40 mb-6">{p.step}</span>
                        <p className="text-xl md:text-2xl text-[#FFFFFF] font-bold leading-tight px-4">{p.text}</p>
                    </FadeInUp>
                ))}
            </div>
        </div>
      </section>

      {/* BLOQUE 7 — PRUEBA SOCIAL */}
      <section className="relative py-32 bg-[#111111] px-6 overflow-hidden">
        <ScatteredPings />
        <div className="container mx-auto px-6 relative z-10">
          <FadeInUp>
            <h2 className="text-3xl md:text-5xl font-bold text-[#FFFFFF] text-center mb-4">Marcas que elevaron su estatus.</h2>
            <div className="flex justify-center items-center gap-1 mb-20">
                {[...Array(5)].map((_, i) => <span key={i} className="text-[#FF6B2B] text-xl">★</span>)}
                <span className="text-[#888888] ml-2 font-bold tracking-widest text-xs uppercase">5.0 / 5.0 Basado en Proyectos Corporativos</span>
            </div>
          </FadeInUp>
          <div className="grid md:grid-cols-3 gap-8">
            {[
                { name: "Carlos", biz: "Constructora Horizonte", quote: "Tener un sitio web profesional ha cambiado la forma en que los grandes clientes nos ven. Ahora proyectamos la solvencia que realmente tenemos." },
                { name: "Elena", biz: "Clínica Dental Pro", quote: "Mis pacientes ahora pueden agendar citas y ver todos nuestros servicios en un solo lugar. La autoridad que ganamos es increíble." },
                { name: "David", biz: "Agencia Inmobiliaria", quote: "Antes dependíamos solo de portales externos. Ahora tenemos nuestra propia vitrina de propiedades y los leads son de mucha mayor calidad." }
            ].map((t, i) => (
                <FadeInUp key={i} delay={i * 0.1} className="bg-[#0a0a0a] p-8 border border-[#222222] rounded-sm">
                    <p className="text-[#FFFFFF] text-lg leading-relaxed mb-8 italic">"{t.quote}"</p>
                    <div className="flex flex-col">
                        <span className="text-[#FF6B2B] font-bold text-sm uppercase tracking-widest">{t.name}</span>
                        <span className="text-[#888888] text-xs font-medium">{t.biz}</span>
                    </div>
                </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* BLOQUE 8 — FAQ */}
      <section className="relative py-32 bg-[#0a0a0a] px-6">
        <RadarPing />
        <ScatteredPings />
        <div className="container mx-auto max-w-5xl">
            <FadeInUp>
                <h2 className="text-3xl md:text-5xl font-bold text-[#FFFFFF] mb-20 text-center">Cero rodeos.</h2>
            </FadeInUp>
            <div className="grid md:grid-cols-2 gap-8">
                {[
                    { q: "¿Incluye mi propio dominio personalizado?", vId: "b473d784-04bc-47f4-bcae-c2bd51752b31" },
                    { q: "¿Puedo tener un blog de noticias?", vId: "9278c314-648f-4220-b1d4-b2c94535ffa8" },
                    { q: "¿Apareceré en las búsquedas de Google?", vId: "191c563b-d77d-4620-b775-0d5b659e28fe" },
                    { q: "¿Es autogestionable o dependo de ustedes?", vId: "516952e4-63b3-4a20-8327-c6b8656d6456" },
                    { q: "¿Cuánto tiempo tarda el desarrollo?", vId: "d33fc8ea-f301-42ac-89e3-60b3b3ee56fb" },
                    { q: "¿Qué pasa si ya tengo un dominio?", vId: "4b1d000d-878e-417a-871a-0a45192f2cd9" }
                ].map((item, i) => (
                    <FAQVideoBlock 
                      key={i} 
                      question={item.q} 
                      index={i} 
                      onClick={() => {
                        setActiveVideoId(item.vId);
                        setIsVideoModalOpen(true);
                      }}
                    />
                ))}
            </div>
        </div>
      </section>

      {/* BLOQUE 9 — OFERTA Y CIERRE */}
      <section id="oferta" className="relative py-32 bg-[#0a0a0a] px-6 border-t border-[#1a1a1a]">
        <ScatteredPings />
        <div className="container mx-auto max-w-3xl text-center relative z-10">
          <FadeInUp>
            <h2 className="text-4xl md:text-7xl font-black text-[#FFFFFF] mb-6 leading-tight">
              $1,000 anuales.
            </h2>
            <p className="text-[#FF6B2B] text-xl md:text-3xl font-bold mb-12">
                La diferencia entre tener un negocio y tener un imperio.
            </p>
            <div className="bg-[#111111] border border-[#222222] p-8 mb-16 rounded-sm">
                <p className="text-lg md:text-xl text-[#888888] leading-relaxed">
                    Incluye Catálogo, Blog, SEO Local y Soporte VIP de por vida. <br className="hidden md:block"/>
                    La inversión más rentable para la autoridad de tu marca.
                </p>
            </div>
            <a href="/registro?plan=completo" className="inline-flex items-center justify-center gap-3 bg-[#FF6B2B] text-[#FFFFFF] font-bold text-2xl px-16 py-6 w-full md:w-auto hover:bg-[#e05a1f] transition-all hover:scale-105 shadow-2xl shadow-[#FF6B2B]/20">
              Quiero construir mi imperio digital →
            </a>
          </FadeInUp>
        </div>
      </section>

      <Footer />

      {/* Modal de Video */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoId={activeVideoId}
        sourceType="bunny"
      />
    </main>
  );
}
