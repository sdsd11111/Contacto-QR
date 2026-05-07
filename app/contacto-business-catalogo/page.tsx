"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ShieldCheck, ChevronLeft, ChevronRight, Play, ShoppingCart, ShoppingBag, CheckCircle2, Star, Globe, RefreshCw, MessageSquare } from "lucide-react";
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
  { top: "15%", left: "75%", delay: 0.5,  size: 70  },
  { top: "60%", left: "85%", delay: 1.5,  size: 50  },
  { top: "40%", left: "50%", delay: 2.5,  size: 90  },
  { top: "85%", left: "40%", delay: 1.0,  size: 60  },
  { top: "20%", left: "30%", delay: 2.0,  size: 40  },
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

// Datos del Slider "El Espejo" - Adaptado para Catálogo
const EL_ESPEJO_SLIDES = [
  {
    img: "https://images.unsplash.com/photo-1556740734-792f46efeb05?q=80&w=2000&auto=format&fit=crop",
    line1: "Imagina que 5 personas",
    line2: "te preguntan lo mismo",
    line3: "al mismo tiempo.",
    accent: "Pasas la tarde enviando fotos y precios en lugar de preparar pedidos.",
  },
  {
    img: "https://images.unsplash.com/photo-1556742031-c6961e8560b0?q=80&w=2000&auto=format&fit=crop",
    line1: "Imagina que un cliente",
    line2: "quiere comprarte ahora.",
    line3: "Pero tú estás ocupado...",
    accent: "No le respondes en 5 minutos. Se va con el que sí tiene un catálogo automático.",
  },
  {
    img: "https://images.unsplash.com/photo-1556742049-052b12392a1d?q=80&w=2000&auto=format&fit=crop",
    line1: "Imagina anotar un pedido",
    line2: "mal porque el chat",
    line3: "era un desorden.",
    accent: "Producto equivocado. Cliente enojado. Dinero perdido por un error de tipeo.",
  },
  {
    img: "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?q=80&w=2000&auto=format&fit=crop",
    line1: "Imagina recibir el pedido",
    line2: "listo: Nombre, Cantidad",
    line3: "y Total sumado.",
    accent: "Tú solo dices: \"Recibido, sale en camino\". Así escala un negocio real.",
  },
];

const ImagineSlider = () => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % EL_ESPEJO_SLIDES.length);
    }, 5000);
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
          animate={{ opacity: 0.65 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${slide.img})` }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 z-10 pb-24 md:pb-32 px-8 md:px-16 max-w-5xl">
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
    </div>
  );
};

const ChatSequence = () => {
  const [step, setStep] = useState(0);
  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} onViewportEnter={() => { setStep(1); setTimeout(() => setStep(2), 800); setTimeout(() => setStep(3), 1600); }} className="max-w-2xl mx-auto flex flex-col gap-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: step >= 1 ? 1 : 0, y: step >= 1 ? 0 : 10 }} transition={{ duration: 0.4 }} className="self-start bg-[#333333] text-[#FFFFFF] px-6 py-4 rounded-2xl rounded-tl-sm max-w-[85%] text-lg md:text-xl font-medium">
        "¿Precio? ¿Tienes fotos? ¿Qué sabores hay?"
      </motion.div>
      {step === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="self-end bg-[#1a1a1a] px-5 py-4 rounded-2xl rounded-tr-sm flex gap-1.5 items-center h-[56px]">
          <span className="w-2 h-2 bg-[#FF6B2B] rounded-full animate-bounce"></span>
          <span className="w-2 h-2 bg-[#FF6B2B] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
          <span className="w-2 h-2 bg-[#FF6B2B] rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
        </motion.div>
      )}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: step >= 3 ? 1 : 0, y: step >= 3 ? 0 : 10 }} transition={{ duration: 0.4 }} className="self-end bg-[#FF6B2B] text-[#FFFFFF] font-bold px-6 py-4 rounded-2xl rounded-tr-sm max-w-[85%] text-lg md:text-xl" style={{ display: step >= 3 ? 'block' : 'none' }}>
        Ahorra 15 minutos de chat. Aquí tienes todo para elegir y pedir en un clic.
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
  const words = ['"pedidos"', '"ventas"', '"orden"', '"dinero"', '"clientes"'];
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

export default function ContactoBusinessCatalogoPage() {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState("");

  return (
    <main className="bg-[#0a0a0a] min-h-screen font-sans selection:bg-[#FF6B2B] selection:text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      {/* BLOQUE 1 — HERO */}
      <section className="relative h-screen flex items-center justify-center bg-[#0a0a0a] overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-[0.65] grayscale" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556740749-887f6717d7e4?q=80&w=2000&auto=format&fit=crop')" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/50 to-[#0a0a0a]" />
        
        <RadarPing />
        <ScatteredPings />
        <div className="relative z-10 container mx-auto px-6 flex flex-col items-center text-center mt-20">
          <FadeInUp>
            <h1 className="text-[#FFFFFF] font-black tracking-tighter uppercase mb-8" style={{ fontSize: "clamp(2.4rem, 6vw, 4.5rem)", lineHeight: 1.05 }}>
              Deja de ser el<br/>
              "Catálogo Humano"<br/>
              <span className="text-[#FF6B2B]">de tu negocio.</span>
            </h1>
          </FadeInUp>
          <FadeInUp delay={0.2}>
            <p className="text-[#888888] text-xl md:text-2xl font-normal leading-[1.7] max-w-3xl mx-auto mb-12">
              Responder "¿precio?" y enviar fotos por WhatsApp no es vender, es perder el tiempo. <span className="text-[#FFFFFF]">Transforma tu chat en una terminal de pedidos lista para despachar.</span>
            </p>
            <a href="#oferta" className="bg-[#FF6B2B] text-white px-10 py-5 rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-2xl shadow-[#FF6B2B]/20">
              Quiero automatizar mis pedidos →
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
        <div className="absolute inset-0 bg-cover bg-center opacity-[0.65] grayscale" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1556742049-052b12392a1d?q=80&w=2000&auto=format&fit=crop')` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a]" />
        
        <div className="relative z-10 container mx-auto px-6 text-center">
          <FadeInUp>
            <p className="text-[#FFFFFF] text-xl md:text-2xl font-bold mb-6">
              El cansancio mata la paciencia.
            </p>
            <h2 className="text-4xl md:text-6xl font-black text-[#FFFFFF] mb-6 tracking-tighter leading-[1.1] uppercase">
              Y UN CLIENTE QUE <br/> <span className="text-[#FF6B2B]">TIENE QUE ESPERAR</span> <br/> ES UNA VENTA QUE SE VA.
            </h2>
          </FadeInUp>
        </div>
      </section>

      {/* BLOQUE 3.2 — EL COSTO REAL */}
      <section className="relative py-32 bg-[#000000] overflow-hidden border-t border-[#111111]">
        <ScatteredPings />
        <div className="absolute inset-0 bg-cover bg-center opacity-[0.65] grayscale" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1556740734-792f46efeb05?q=80&w=2000&auto=format&fit=crop')` }} />
        <div className="absolute inset-0 bg-[#000000]/80" />
        
        <div className="relative z-10 container mx-auto px-6">
          <FadeInUp className="max-w-4xl">
            <div className="flex flex-col gap-2 mb-12">
              <span className="text-[#FFFFFF] text-2xl md:text-4xl font-light italic">¿Cuántas ventas perdiste anoche</span>
              <span className="text-[#666666] text-xl md:text-3xl font-light">porque no podías contestar el teléfono?</span>
            </div>
            
            <h3 className="text-[#FFFFFF] text-3xl md:text-5xl font-black mb-12 leading-tight uppercase tracking-tighter">
              TU CATÁLOGO VENDE <br/> MIENTRAS TÚ DESPANSAS.
            </h3>

            <div className="pl-8 border-l-4 border-[#FF6B2B]">
              <p className="text-[#888888] text-xl md:text-2xl font-bold italic">
                El cliente elige, suma y envía. Tú solo confirmas.
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
              LA EFICIENCIA DEL CATÁLOGO PRO
            </p>
          </FadeInUp>
          <ChatSequence />
          <FadeInUp delay={0.4}>
            <div className="text-[#888888] text-center mt-16 text-lg md:text-xl leading-[1.7] max-w-2xl mx-auto space-y-6">
              <p>
                WhatsApp es para cerrar, no para explicar 50 veces lo mismo.
              </p>
              <p className="text-[#FFFFFF] font-bold">
                Muestra fotos, precios y stock en tiempo real. Recibe el pedido listo para enviar.
              </p>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* BLOQUE 5 — LA PROMESA */}
      <section className="relative py-32 md:py-48 flex items-end bg-[#0a0a0a]">
        <ScatteredPings />
        <div className="absolute inset-0 bg-cover bg-center opacity-40 bg-fixed grayscale" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556742044-3c52d6e88c62?q=80&w=2000&auto=format&fit=crop')" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" />
        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <FadeInUp>
            <h2 className="text-4xl md:text-6xl font-bold text-[#FFFFFF] leading-[1.1] mb-6 max-w-4xl">
              El cliente elige, suma al carrito<br/>
              y te envía la orden lista.
            </h2>
            <p className="text-[#888888] text-xl mb-16">
              Sin errores humanos. Sin comisiones de delivery.
            </p>
            
            <div className="grid md:grid-cols-2 gap-12 max-w-4xl border-t border-[#333333] pt-12">
              <div>
                <h3 className="text-[#FFFFFF] text-xl font-bold mb-2">Pedidos Estructurados.</h3>
                <p className="text-[#888888] leading-relaxed">
                  Recibe un mensaje con: Producto, Cantidad, Subtotal y Total calculado automáticamente.
                </p>
              </div>
              <div>
                <h3 className="text-[#FFFFFF] text-xl font-bold mb-2">Margen Íntegro.</h3>
                <p className="text-[#888888] leading-relaxed">
                  No pagas el 30% a apps externas. El 100% de la venta va a tu bolsillo.
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
                <h2 className="text-3xl md:text-5xl font-bold text-[#FFFFFF] text-center mb-24">Vende más en 3 clics.</h2>
            </FadeInUp>
            <div className="grid md:grid-cols-3 gap-12 md:gap-8">
                {[
                    { step: 1, text: "Tu cliente entra a tu catálogo desde el QR o link." },
                    { step: 2, text: "Elige sus productos y suma al carrito interactivo." },
                    { step: 3, text: "Envía el pedido y te llega listo a tu WhatsApp." }
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
            <h2 className="text-3xl md:text-5xl font-bold text-[#FFFFFF] text-center mb-4">Negocios que optimizaron sus ventas.</h2>
            <div className="flex justify-center items-center gap-1 mb-20">
                {[...Array(5)].map((_, i) => <span key={i} className="text-[#FF6B2B] text-xl">★</span>)}
                <span className="text-[#888888] ml-2 font-bold tracking-widest text-xs uppercase">4.8 / 5.0 Basado en Ventas Reales</span>
            </div>
          </FadeInUp>
          <div className="grid md:grid-cols-3 gap-8">
            {[
                { name: "Jorge", biz: "Hamburguesas Pro", quote: "Antes era un lío tomar pedidos por WhatsApp en hora pico. Ahora los clientes me mandan el pedido listo y solo tengo que cocinar." },
                { name: "Lucía", biz: "Repostería Artesanal", quote: "Poder mostrar las fotos de mis pasteles con el precio actualizado me ha ahorrado horas de explicaciones por chat." },
                { name: "Pedro", biz: "Ferretería Express", quote: "Mis clientes ya no preguntan 'qué tienes'. Escanean el QR y ven todo el stock disponible al instante." }
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
                    { q: "¿En qué se diferencia de un grupo de WhatsApp?", vId: "b473d784-04bc-47f4-bcae-c2bd51752b31" },
                    { q: "¿Cuántos productos puedo subir?", vId: "9278c314-648f-4220-b1d4-b2c94535ffa8" },
                    { q: "¿Mis clientes pueden pagar online?", vId: "191c563b-d77d-4620-b775-0d5b659e28fe" },
                    { q: "¿Cómo recibo los pedidos?", vId: "516952e4-63b3-4a20-8327-c6b8656d6456" },
                    { q: "¿Es difícil subir los productos?", vId: "d33fc8ea-f301-42ac-89e3-60b3b3ee56fb" },
                    { q: "¿Vale la pena si tengo pocos productos?", vId: "4b1d000d-878e-417a-871a-0a45192f2cd9" }
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
              $200 al año.
            </h2>
            <p className="text-[#FF6B2B] text-xl md:text-3xl font-bold mb-12">
                Recupera tu tiempo. Recupera tus ventas.
            </p>
            <div className="bg-[#111111] border border-[#222222] p-8 mb-16 rounded-sm">
                <p className="text-lg md:text-xl text-[#888888] leading-relaxed">
                    Sin comisiones por venta. Sin apps de terceros. <br className="hidden md:block"/>
                    Toda la potencia de un e-commerce directo en tu WhatsApp.
                </p>
            </div>
            <a href="/registro?plan=catalogo" className="inline-flex items-center justify-center gap-3 bg-[#FF6B2B] text-[#FFFFFF] font-bold text-2xl px-16 py-6 w-full md:w-auto hover:bg-[#e05a1f] transition-all hover:scale-105 shadow-2xl shadow-[#FF6B2B]/20">
              Quiero automatizar mis pedidos →
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
