"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Smartphone, Globe, RefreshCw, Edit, Download, Star, CheckCircle2, ShieldCheck, QrCode, Tag, MapPin, Phone, Mic, Users, MessageSquare, Mail, Play, ChevronDown, Store, Zap, Megaphone } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { AdvancedFAQ, FAQItem } from "@/components/AdvancedFAQ/AdvancedFAQ";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// --- Radar Ping naranja — anclado a la izquierda ---
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
  { top: "18%", left: "72%", delay: 0,    size: 60  },
  { top: "68%", left: "82%", delay: 1.1,  size: 44  },
  { top: "35%", left: "55%", delay: 2.3,  size: 80  },
  { top: "80%", left: "38%", delay: 0.7,  size: 50  },
  { top: "12%", left: "40%", delay: 1.8,  size: 36  },
  { top: "55%", left: "90%", delay: 3.0,  size: 56  },
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

const FadeInUp = ({ children, delay = 0, className = "" }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

const BUSINESS_TABS = [
  {
      id: 'vitrina',
      label: 'Vitrina Digital',
      icon: Store,
      color: 'primary',
      description: 'Tu local abierto las 24 horas en el celular de tus clientes',
      features: [
          { icon: Zap, title: 'Actualización en Tiempo Real', desc: 'Cambia tus promociones y fotos en segundos desde el panel.', image: 'https://cesarweb.b-cdn.net/contacto-digital/Tu%20Contacto/activaqr_v2_1_identidad.webp' },
          { icon: Megaphone, title: 'Sección de Promociones', desc: 'Destaca tus ofertas del día para que nadie se las pierda.', image: 'https://cesarweb.b-cdn.net/contacto-digital/Tu%20Contacto/activaqr_v2_2_nombre.webp' },
          { icon: Smartphone, title: 'Instalación PWA', desc: 'Tus clientes pueden guardar tu local como un icono en su home.', image: 'https://cesarweb.b-cdn.net/contacto-digital/Tu%20Contacto/activaqr_v2_3_foto.webp' },
          { icon: MessageSquare, title: 'Botón de WhatsApp VIP', desc: 'Contacto directo sin intermediarios ni comisiones.', image: 'https://cesarweb.b-cdn.net/contacto-digital/Tu%20Contacto/activaqr_v2_5_whatsapp.webp' },
      ]
  },
  {
      id: 'identidad',
      label: 'Identidad Pro',
      icon: ShieldCheck,
      color: 'navy',
      description: 'Más que un link, es la autoridad de tu negocio',
      features: [
          { icon: Globe, title: 'Dominio Propio (Opcional)', desc: 'Tu negocio con una dirección web profesional.', image: 'https://cesarweb.b-cdn.net/contacto-digital/Redes%20y%20Perfil/redes_sociales_activaqr.webp' },
          { icon: MapPin, title: 'Ubicación Inteligente', desc: 'Enlace directo a Google Maps y Waze para que lleguen fácil.', image: 'https://cesarweb.b-cdn.net/contacto-digital/Redes%20y%20Perfil/direccion_maps_activaqr.webp' },
          { icon: Users, title: 'Perfil de Colaboradores', desc: 'Presenta a tu equipo y sus contactos individuales.', image: 'https://cesarweb.b-cdn.net/contacto-digital/Redes%20y%20Perfil/bio_profesional_activaqr.webp' },
          { icon: Tag, title: 'Categorización IA', desc: 'Aparece en búsquedas locales gracias a nuestro motor de SEO.', image: 'https://cesarweb.b-cdn.net/contacto-digital/Redes%20y%20Perfil/seo_tags_activaqr.webp' },
      ]
  },
  {
      id: 'qr',
      label: 'QR Business',
      icon: QrCode,
      color: 'primary',
      description: 'El punto de entrada físico a tu ecosistema digital',
      features: [
          { icon: QrCode, title: 'QR Dinámico Infinito', desc: 'Un solo código para siempre, cambia el destino cuando quieras.', image: 'https://cesarweb.b-cdn.net/contacto-digital/codigo-qr/activaqr_qr_1_dinamico.webp' },
          { icon: Download, title: 'Flyers Listos para Imprimir', desc: 'Generamos el diseño para tu local automáticamente.', image: 'https://cesarweb.b-cdn.net/contacto-digital/codigo-qr/activaqr_qr_4_descarga.webp' },
          { icon: RefreshCw, title: 'Sin Re-impresiones', desc: '¿Cambiaste de local? Actualiza el mapa y el QR sigue igual.', image: 'https://cesarweb.b-cdn.net/contacto-digital/codigo-qr/activaqr_qr_2_actualizacion.webp' },
      ]
  },
];

const BUSINESS_FAQS: FAQItem[] = [
  {
      id: "faq-diff-business",
      tag: "DIFERENCIA",
      q: "¿Por qué no usar solo Instagram o Facebook?",
      bullets: [
          "En redes dependes del algoritmo; aquí eres dueño de tu espacio.",
          "Cero distracciones. El cliente solo ve tu marca, no la de tu competencia.",
          "Es una herramienta de venta directa, no solo de 'likes'."
      ],
      videoSourceType: "bunny",
      videoUrl: "b473d784-04bc-47f4-bcae-c2bd51752b31",
      ctaText: "Activar mi Vitrina"
  },
  {
      id: "faq-updates-business",
      tag: "GESTIÓN",
      q: "¿Es difícil actualizar mis promociones?",
      bullets: [
          "Se hace en 3 clics desde tu mismo teléfono.",
          "Sube fotos directamente de tu galería.",
          "Los cambios son instantáneos para cualquier cliente que escanee."
      ],
      videoSourceType: "bunny",
      videoUrl: "9278c314-648f-4220-b1d4-b2c94535ffa8"
  }
];

export default function ContactoBusinessPipelineClient() {
  const [activeTab, setActiveTab] = useState('vitrina');
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);

  useEffect(() => {
    const currentTab = BUSINESS_TABS.find(t => t.id === activeTab);
    if (currentTab) {
       setActiveFeatureIndex(0);
       const timer = setInterval(() => {
            setActiveFeatureIndex((prev) => {
                const max = currentTab.features.length;
                return (prev + 1) >= max ? 0 : prev + 1;
            });
        }, 3500);
        return () => clearInterval(timer);
    }
  }, [activeTab]);

  return (
    <main className="bg-[#0a0a0a] min-h-screen font-sans selection:bg-[#FF6B2B]/30 selection:text-white text-[#FFFFFF]">
      <Navbar />
      
      {/* 1. HERO */}
      <section className="pt-32 pb-20 px-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-cover bg-center opacity-20 grayscale" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000')" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
        <RadarPing />
        <ScatteredPings />
        <div className="container mx-auto max-w-6xl relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
                <FadeInUp>
                    <div className="inline-flex items-center gap-2 bg-[#FF6B2B]/10 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest text-[#FF6B2B] mb-6 border border-[#FF6B2B]/20">
                        <Store size={16} /> Plan Business
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.05] mb-6 tracking-tighter text-[#FFFFFF]">
                        Tu local en el bolsillo de tu cliente con <span className="text-[#FF6B2B] italic">autoridad total.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/60 font-medium leading-relaxed mb-10 max-w-lg">
                        Muchos negocios cierran porque sus clientes no saben dónde están o qué tienen nuevo. Nosotros te instalamos en su teléfono.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <Link href="/registro?plan=business" className="w-full sm:w-auto bg-[#FF6B2B] text-white px-10 py-5 rounded-full font-black text-xl shadow-2xl shadow-[#FF6B2B]/30 hover:scale-105 transition-all flex items-center justify-center gap-3">
                            Activar Business - $100/año <ArrowRight size={24} />
                        </Link>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-white/40 text-center sm:text-left mt-2 sm:mt-0">
                            Garantía de 7 días.<br/>Soporte VIP incluido.
                        </p>
                    </div>
                </FadeInUp>

                <FadeInUp delay={0.2} className="relative">
                    <div className="absolute inset-0 bg-[#FF6B2B]/20 blur-[100px] rounded-full max-w-sm mx-auto" />
                    <div className="relative aspect-[4/3] bg-[#111111] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10">
                        <div className="absolute inset-0 bg-cover bg-center opacity-60 grayscale" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556740734-792f46efeb05?q=80&w=2000')" }} />
                        <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
                            <div className="w-20 h-20 bg-[#FF6B2B] rounded-full flex items-center justify-center pl-1 shadow-lg shadow-[#FF6B2B]/40 cursor-pointer hover:scale-110 transition-transform">
                                <Play fill="white" className="text-white ml-1" />
                            </div>
                            <span className="text-white font-bold uppercase tracking-widest text-sm drop-shadow-md">Video Demostrativo Business</span>
                        </div>
                    </div>
                </FadeInUp>
            </div>
        </div>
      </section>

      {/* 2. TU NEGOCIO NO PUEDE SER ESTÁTICO */}
      <section className="py-24 relative overflow-hidden bg-[#050505]">
        <RadarPing />
        <ScatteredPings />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <FadeInUp>
                    <div className="inline-flex items-center gap-2 bg-[#FF6B2B]/10 border border-[#FF6B2B]/20 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest text-[#FF6B2B] mb-6">
                        <RefreshCw size={16} /> Dinamismo Real
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-white leading-none mb-8 tracking-tighter">Tu negocio es vivo: tu QR <span className="text-[#FF6B2B] italic">también debe serlo.</span></h2>
                    <p className="text-xl text-white/70 font-bold mb-6 leading-relaxed">¿Cambiaste el plato del día? ¿Tienes una oferta relámpago? No esperes a imprimir nada. Con ActivaQR Business, tú tienes el control total de lo que tus clientes ven al instante.</p>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-start gap-4 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                            <div className="bg-[#FF6B2B] text-white p-2 rounded-lg">
                                <Zap size={20} />
                            </div>
                            <div>
                                <h4 className="font-black text-white uppercase text-sm">Agilidad de Venta</h4>
                                <p className="text-sm text-white/60 font-medium">Reacciona a la competencia en segundos, no en días.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                            <div className="bg-[#111111] border border-white/10 text-white p-2 rounded-lg">
                                <MapPin size={20} />
                            </div>
                            <div>
                                <h4 className="font-black text-white uppercase text-sm">Geolocalización Activa</h4>
                                <p className="text-sm text-white/60 font-medium">Asegura que cada cliente que te busque llegue a tu puerta sin perderse.</p>
                            </div>
                        </div>
                    </div>
                </FadeInUp>
                <FadeInUp delay={0.2} className="relative flex justify-center lg:justify-end">
                    <div className="absolute inset-0 bg-[#FF6B2B]/20 blur-[100px] rounded-full max-w-[320px] mx-auto lg:mx-0 lg:ml-auto"></div>
                    <div className="relative aspect-[9/16] w-full max-w-[300px] rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] border-8 border-[#222222] bg-[#0a0a0a] z-10">
                        <img src="https://images.unsplash.com/photo-1556740734-792f46efeb05?q=80&w=2000" className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                    </div>
                </FadeInUp>
            </div>
        </div>
      </section>

      {/* 3. QUÉ INCLUYE (TABS) */}
      <section className="py-24 relative overflow-hidden">
        <RadarPing />
        <ScatteredPings />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
            <FadeInUp className="text-center mb-16">
                <div className="inline-flex items-center gap-2 bg-[#111111] border border-white/10 text-white px-4 py-2 rounded-full shadow-lg mb-8">
                    <span className="flex h-2 w-2 rounded-full bg-[#FF6B2B] animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Plan Business • $100/año</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none mb-6">
                    Infraestructura para <span className="text-[#FF6B2B] italic">Vender Más.</span>
                </h2>
                <p className="text-xl text-white/60 font-medium max-w-2xl mx-auto leading-relaxed">
                    Todo lo que necesitas para que tu negocio sea el primero en la mente (y el teléfono) de tu cliente.
                </p>
            </FadeInUp>

            <FadeInUp delay={0.2} className="flex flex-wrap justify-center gap-3 mb-12">
                {BUSINESS_TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-500 ${
                                isActive
                                    ? 'bg-[#1a1a1a] border border-white/20 text-white shadow-2xl shadow-black scale-105'
                                    : 'bg-[#0a0a0a]/60 backdrop-blur-sm text-white/40 border border-white/5 hover:bg-[#111111] hover:text-white hover:border-white/10'
                            }`}
                        >
                            <Icon size={18} className={isActive ? 'text-[#FF6B2B]' : ''} />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </FadeInUp>

            <AnimatePresence mode="wait">
                {BUSINESS_TABS.map((tab) => {
                    if (tab.id !== activeTab) return null;
                    return (
                        <motion.div
                            key={tab.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                        >
                            <div className="text-center mb-10">
                                <p className="text-white/50 font-bold text-lg italic">{tab.description}</p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-6">
                                <div className="lg:col-span-5 relative w-full aspect-square md:aspect-[4/5] rounded-[3rem] overflow-hidden bg-[#111111] border border-white/5 shadow-inner">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={`biz-img-${activeFeatureIndex}`}
                                            initial={{ opacity: 0, scale: 1.05 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.5 }}
                                            className="absolute inset-0"
                                        >
                                            <img 
                                                src={tab.features[activeFeatureIndex].image} 
                                                alt={tab.features[activeFeatureIndex].title}
                                                className="w-full h-full object-cover grayscale"
                                            />
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                                
                                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {tab.features.map((feature, idx) => {
                                        const FeatureIcon = feature.icon;
                                        const isFeatureActive = idx === activeFeatureIndex;
                                        return (
                                            <motion.div
                                                key={idx}
                                                onClick={() => setActiveFeatureIndex(idx)}
                                                className={`cursor-pointer group flex flex-col justify-center min-h-[140px] backdrop-blur-md p-5 rounded-[2rem] border transition-all duration-500 ${
                                                    isFeatureActive 
                                                    ? 'bg-[#1a1a1a] shadow-xl shadow-black border-white/20 scale-100 ring-1 ring-white/10' 
                                                    : 'bg-[#111111]/40 border-white/5 hover:bg-[#1a1a1a]/80 hover:border-white/10 scale-[0.98] opacity-70 hover:opacity-100'
                                                }`}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className={`p-3 rounded-xl transition-all duration-300 shrink-0 ${
                                                        isFeatureActive ? 'bg-[#FF6B2B] text-white shadow-md shadow-[#FF6B2B]/20 scale-110' : 'bg-white/5 text-white/50'
                                                    }`}>
                                                        <FeatureIcon size={20} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className={`font-black uppercase tracking-tight mb-1.5 text-[13px] ${
                                                            isFeatureActive ? 'text-[#FF6B2B]' : 'text-white/90'
                                                        }`}>
                                                            {feature.title}
                                                        </h4>
                                                        <p className="text-white/50 text-xs font-semibold leading-relaxed">
                                                            {feature.desc}
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
      </section>

      {/* 5. FAQ */}
      <section className="py-24 relative overflow-hidden" id="faq">
        <RadarPing />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
            <FadeInUp className="text-center mb-16">
                <div className="inline-flex items-center gap-2 bg-[#111111] border border-white/5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest text-white mb-6">
                    <Play size={14} className="text-[#FF6B2B]" /> SEGURIDAD TOTAL
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4">Preguntas de <span className="text-[#FF6B2B] italic">autoridad Business.</span></h2>
            </FadeInUp>
            
            <AdvancedFAQ 
                items={BUSINESS_FAQS}
                title=""
                subtitle=""
                sectionTag=""
                variant="dark"
            />
        </div>
      </section>

      {/* 6. CHECKOUT */}
      <section className="py-32 px-6 relative">
        <ScatteredPings />
        <div className="container mx-auto max-w-3xl">
            <FadeInUp>
                <div className="bg-[#111111] rounded-[3rem] p-10 md:p-16 border border-white/10 shadow-2xl shadow-black text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#FF6B2B]/20 blur-[100px] rounded-full pointer-events-none"></div>
                    <h2 className="text-3xl md:text-4xl font-black mb-4 relative z-10">Tu Vitrina Digital Business</h2>
                    <p className="text-lg text-white/60 font-medium mb-10 relative z-10">Escalabilidad y autoridad para tu local.</p>
                    
                    <div className="flex justify-center items-end gap-2 mb-10 relative z-10">
                        <span className="text-6xl md:text-8xl font-black tracking-tighter text-[#FF6B2B]">$100</span>
                        <span className="text-xl font-bold text-white/40 mb-2 uppercase tracking-widest">/ año</span>
                    </div>

                    <Link href="/registro?plan=business" className="block w-full bg-[#FF6B2B] text-white px-8 py-6 rounded-2xl font-black text-2xl hover:bg-[#e05a1f] hover:scale-105 transition-all shadow-xl shadow-[#FF6B2B]/20 relative z-10">
                        Activar mi Local ahora →
                    </Link>
                </div>
            </FadeInUp>
        </div>
      </section>

      <Footer />
    </main>
  );
}
