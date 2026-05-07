"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Smartphone, Globe, RefreshCw, Edit, Download, Star, CheckCircle2, ShieldCheck, QrCode, Tag, MapPin, Phone, Mic, Users, MessageSquare, Mail, Play, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { AdvancedFAQ, FAQItem } from "@/components/AdvancedFAQ/AdvancedFAQ";

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

const INCLUDED_TABS = [
  {
      id: 'contacto',
      label: 'Tu Contacto',
      icon: Download,
      color: 'primary',
      description: 'Archivo profesional que se instala en cualquier teléfono',
      features: [
          { icon: ShieldCheck, title: 'Identidad Profesional Automática', desc: 'Tecnología de integración inteligente que funciona en iPhone, Android y cualquier dispositivo.', image: 'https://cesarweb.b-cdn.net/contacto-digital/Tu%20Contacto/activaqr_v2_1_identidad.webp' },
          { icon: Users, title: 'Nombre y apellido completo', desc: 'Apareces con tu nombre real, no como un número desconocido.', image: 'https://cesarweb.b-cdn.net/contacto-digital/Tu%20Contacto/activaqr_v2_2_nombre.webp' },
          { icon: Smartphone, title: 'Foto de perfil profesional', desc: 'Tu rostro aparece cada vez que llamas o envías un mensaje.', image: 'https://cesarweb.b-cdn.net/contacto-digital/Tu%20Contacto/activaqr_v2_3_foto.webp' },
          { icon: Edit, title: 'Profesión / Cargo', desc: 'Debajo de tu nombre se muestra a qué te dedicas.', image: 'https://cesarweb.b-cdn.net/contacto-digital/Tu%20Contacto/activaqr_v4_4_profesion_mockup.webp' },
          { icon: MessageSquare, title: 'WhatsApp directo', desc: 'Un toque y tu cliente ya te está escribiendo por WhatsApp.', image: 'https://cesarweb.b-cdn.net/contacto-digital/Tu%20Contacto/activaqr_v2_5_whatsapp.webp' },
          { icon: Mail, title: 'Correo electrónico', desc: 'Incluido en la vCard para que te contacten por cualquier vía.', image: 'https://cesarweb.b-cdn.net/contacto-digital/Tu%20Contacto/activaqr_v4_6_email_mockup.webp' },
      ]
  },
  {
      id: 'qr',
      label: 'Código QR',
      icon: QrCode,
      color: 'navy',
      description: 'Tu llave de acceso inteligente a la agenda del cliente',
      features: [
          { icon: QrCode, title: 'QR Dinámico Premium', desc: 'Código exclusivo que apunta a tu contacto profesional.', image: 'https://cesarweb.b-cdn.net/contacto-digital/codigo-qr/activaqr_qr_1_dinamico.webp' },
          { icon: RefreshCw, title: 'Actualización sin reimprimir', desc: 'Si cambias de número o de redes, el QR sigue funcionando igual.', image: 'https://cesarweb.b-cdn.net/contacto-digital/codigo-qr/activaqr_qr_2_actualizacion.webp' },
          { icon: Globe, title: 'Compartible por WhatsApp', desc: 'Envía tu contacto digital como archivo adjunto en cualquier chat.', image: 'https://cesarweb.b-cdn.net/contacto-digital/codigo-qr/activaqr_qr_3_whatsapp.webp' },
          { icon: Download, title: 'Descarga instantánea', desc: 'Tu cliente escanea, toca "Guardar" y listo — estás en su agenda.', image: 'https://cesarweb.b-cdn.net/contacto-digital/codigo-qr/activaqr_qr_4_descarga.webp' },
          { icon: Smartphone, title: 'Compatible universal', desc: 'Funciona en iPhone, Android, tablets y hasta computadoras de escritorio.', image: 'https://cesarweb.b-cdn.net/contacto-digital/codigo-qr/activaqr_qr_5_compatibilidad.webp' },
      ]
  },
  {
      id: 'redes',
      label: 'Redes y Perfil',
      icon: Globe,
      color: 'primary',
      description: 'Todas tus plataformas conectadas en un solo lugar',
      features: [
          { icon: Globe, title: 'Tus redes sociales', desc: 'Instagram, Facebook, TikTok, LinkedIn, YouTube, X — todas incluidas.', image: 'https://cesarweb.b-cdn.net/contacto-digital/Redes%20y%20Perfil/redes_sociales_activaqr.webp' },
          { icon: Edit, title: 'Bio profesional', desc: 'Describe quién eres y qué haces en tu propia sección.', image: 'https://cesarweb.b-cdn.net/contacto-digital/Redes%20y%20Perfil/bio_profesional_activaqr.webp' },
          { icon: Tag, title: 'Productos y servicios', desc: 'Lista detallada de lo que ofreces para que te encuentren fácilmente.', image: 'https://cesarweb.b-cdn.net/contacto-digital/Redes%20y%20Perfil/productos_servicios_activaqr.webp' },
          { icon: Tag, title: 'Etiquetas SEO inteligentes', desc: 'Generadas con IA para que Google y directorios te posicionen mejor.', image: 'https://cesarweb.b-cdn.net/contacto-digital/Redes%20y%20Perfil/seo_tags_activaqr.webp' },
          { icon: MapPin, title: 'Dirección + Google Maps', desc: 'Tu ubicación exacta con enlace directo para que lleguen sin perderse.', image: 'https://cesarweb.b-cdn.net/contacto-digital/Redes%20y%20Perfil/direccion_maps_activaqr.webp' },
          { icon: Globe, title: 'Sitio web y menú digital', desc: 'Enlaza tu web, Google Business o menú digital si lo tienes.', image: 'https://cesarweb.b-cdn.net/contacto-digital/Redes%20y%20Perfil/sitio_web_menu_activaqr.webp' },
      ]
  },
  {
      id: 'gestion',
      label: 'Gestión',
      icon: RefreshCw,
      color: 'navy',
      description: 'Control total desde tu celular, sin depender de nadie',
      features: [
          { icon: Edit, title: 'Panel de edición en línea', desc: 'Actualiza tu información cuando quieras desde cualquier dispositivo.', image: 'https://cesarweb.b-cdn.net/contacto-digital/gestion/panel_edicion_activaqr.webp' },
          { icon: RefreshCw, title: 'Cambios en tiempo real', desc: 'Modificas tu dato y al instante se refleja en tu contacto digital.', image: 'https://cesarweb.b-cdn.net/contacto-digital/gestion/cambios_tiempo_real_activaqr.webp' },
          { icon: Phone, title: 'Soporte 24/7 por WhatsApp', desc: 'Nuestro equipo te ayuda con cualquier duda o ajuste.', image: 'https://cesarweb.b-cdn.net/contacto-digital/gestion/soporte_whatsapp_activaqr.webp' },
          { icon: Mic, title: 'Registro asistido por voz', desc: 'Dicta tu información y nuestra IA llena el formulario por ti.', image: 'https://cesarweb.b-cdn.net/contacto-digital/gestion/registro_voz_activaqr.webp' },
      ]
  },
];

const CONTACTO_DIGITAL_FAQS: FAQItem[] = [
  {
      id: "faq-diff-digital",
      tag: "DIFERENCIA",
      q: "¿En qué se diferencia de un QR gratuito de internet?",
      bullets: [
          "El QR gratis es un link anónimo; ActivaQR es Identidad vCard 3.0.",
          "Inyecta tu foto, nombre y redes en la agenda en 20 segundos.",
          "No es un enlace muerto, es tu presencia profesional instalada."
      ],
      videoSourceType: "bunny",
      videoUrl: "b473d784-04bc-47f4-bcae-c2bd51752b31",
      ctaText: "Quiero mi Identidad Digital"
  },
  {
      id: "faq-changes-digital",
      tag: "MEJORAS",
      q: "¿Qué pasa si cambio de teléfono o de redes?",
      bullets: [
          "Tu QR físico es eterno, nunca tienes que volver a imprimir.",
          "Actualizas tus datos desde el panel y se refleja al instante.",
          "Tus clientes siempre tienen tu información vigente sin esfuerzo."
      ],
      videoSourceType: "bunny",
      videoUrl: "9278c314-648f-4220-b1d4-b2c94535ffa8"
  }
];


export default function ContactoDigitalPipelineClient() {
  const [activeIncludedTab, setActiveIncludedTab] = useState('contacto');
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);

  useEffect(() => {
    // Auto-play para el carrusel de las pestañas interactivas (3.5 segundos)
    const currentTab = INCLUDED_TABS.find(t => t.id === activeIncludedTab);
    const interactiveTabs = ['contacto', 'qr', 'redes', 'gestion'];
    if (currentTab && interactiveTabs.includes(activeIncludedTab)) {
       setActiveFeatureIndex(0); // Reiniciar el índice al cambiar de pestaña
       const timer = setInterval(() => {
            setActiveFeatureIndex((prev) => {
                const max = currentTab.features.length;
                return (prev + 1) >= max ? 0 : prev + 1;
            });
        }, 3500);
        return () => clearInterval(timer);
    }
  }, [activeIncludedTab]);

  return (
    <main className="bg-[#0a0a0a] min-h-screen font-sans selection:bg-[#FF6B2B]/30 selection:text-white text-[#FFFFFF]">
      
      {/* 1. HERO - ONE LINER & VIDEO DEMO (DARK HYBRID) */}
      <section className="pt-32 pb-20 px-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?q=80&w=2000&auto=format&fit=crop')" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
        <RadarPing />
        <ScatteredPings />
        <div className="container mx-auto max-w-6xl relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
                <FadeInUp>
                    <div className="inline-flex items-center gap-2 bg-[#FF6B2B]/10 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest text-[#FF6B2B] mb-6 border border-[#FF6B2B]/20">
                        <ShieldCheck size={16} /> Identidad Profesional
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.05] mb-6 tracking-tighter text-[#FFFFFF]">
                        Tu identidad profesional instalada en la agenda de tu cliente <span className="text-[#FF6B2B] italic">en 10 segundos.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/60 font-medium leading-relaxed mb-10 max-w-lg">
                        El 90% de los negocios pierden clientes porque los guardan mal o sin foto en el teléfono. Nosotros resolvemos eso. Sin apps. Sin descargas.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <Link href="/registro?plan=digital" className="w-full sm:w-auto bg-[#FF6B2B] text-white px-10 py-5 rounded-full font-black text-xl shadow-2xl shadow-[#FF6B2B]/30 hover:scale-105 transition-all flex items-center justify-center gap-3">
                            Comprar ahora - $35/año <ArrowRight size={24} />
                        </Link>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-white/40 text-center sm:text-left mt-2 sm:mt-0">
                            Garantía de 7 días.<br/>Te devolvemos cada centavo.
                        </p>
                    </div>
                </FadeInUp>

                <FadeInUp delay={0.2} className="relative">
                    <div className="absolute inset-0 bg-[#FF6B2B]/20 blur-[100px] rounded-full max-w-sm mx-auto" />
                    <div className="relative aspect-[4/3] bg-[#111111] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10">
                        <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556742044-3c52d6e88c62?q=80&w=2000')" }} />
                        <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
                            <div className="w-20 h-20 bg-[#FF6B2B] rounded-full flex items-center justify-center pl-1 shadow-lg shadow-[#FF6B2B]/40 cursor-pointer hover:scale-110 transition-transform">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M5 3l14 9-14 9V3z"/></svg>
                            </div>
                            <span className="text-white font-bold uppercase tracking-widest text-sm drop-shadow-md">Ver Demo de 60 Segundos</span>
                        </div>
                    </div>
                </FadeInUp>
            </div>
        </div>
      </section>

      {/* 2. TU CARA ES TU MEMORIA (DARK HYBRID) */}
      <section className="py-24 relative overflow-hidden">
        <RadarPing />
        <ScatteredPings />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FF6B2B]/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <FadeInUp>
                    <div className="inline-flex items-center gap-2 bg-[#FF6B2B]/10 border border-[#FF6B2B]/20 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest text-[#FF6B2B] mb-6">
                        <ShieldCheck size={16} /> Identidad Profesional
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-white leading-none mb-8 tracking-tighter">Tu cara es tu memoria: no seas <span className="text-[#FF6B2B] italic">un número más.</span></h2>
                    <p className="text-xl text-white/70 font-bold mb-6 leading-relaxed">Nadie guarda números sin rostro. Con ActivaQR, el Maestro Jorge aparece con su foto, especialidad y redes sociales directamente en la agenda de sus clientes. Eres reconocible, profesional y, sobre todo, recomendable siempre.</p>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-start gap-4 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                            <div className="bg-[#FF6B2B] text-white p-2 rounded-lg">
                                <Smartphone size={20} />
                            </div>
                            <div>
                                <h4 className="font-black text-white uppercase text-sm">Vives en su Celular</h4>
                                <p className="text-sm text-white/60 font-medium">Permanencia total. Sin depender de algoritmos o redes sociales.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                            <div className="bg-[#111111] border border-white/10 text-white p-2 rounded-lg">
                                <Users size={20} />
                            </div>
                            <div>
                                <h4 className="font-black text-white uppercase text-sm">Recomendación Garantizada</h4>
                                <p className="text-sm text-white/60 font-medium">Tu cara y tu marca aparecen primero cuando alguien pide tu servicio.</p>
                            </div>
                        </div>
                    </div>
                </FadeInUp>
                <FadeInUp delay={0.2} className="relative flex justify-center lg:justify-end">
                    <div className="absolute inset-0 bg-[#FF6B2B]/20 blur-[100px] rounded-full max-w-[320px] mx-auto lg:mx-0 lg:ml-auto"></div>
                    <div className="relative aspect-[9/16] w-full max-w-[300px] rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] border-8 border-[#222222] bg-[#0a0a0a] z-10 group">
                        <iframe src="https://iframe.mediadelivery.net/embed/636136/d214ba40-92d0-4d96-8033-8984302f86d6?autoplay=true&loop=true&muted=true&preload=true&responsive=true" loading="lazy" className="absolute inset-0 w-full h-full border-0 transform transition-transform duration-1000 group-hover:scale-105" allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;" allowFullScreen></iframe>
                        <div className="absolute inset-0 rounded-[2rem] ring-1 ring-inset ring-white/20 pointer-events-none mix-blend-overlay"></div>
                    </div>
                </FadeInUp>
            </div>
        </div>
      </section>

      {/* 3. QUÉ INCLUYE (TABS) - DARK HYBRID GLASSMORPHISM */}
      <section className="py-24 relative overflow-hidden" id="que-incluye">
        <RadarPing />
        <ScatteredPings />
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-30">
            <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#FF6B2B]/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-white/5 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
            <FadeInUp className="text-center mb-16">
                <div className="inline-flex items-center gap-2 bg-[#111111] border border-white/10 text-white px-4 py-2 rounded-full shadow-lg mb-8">
                    <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Todo incluido • Plan $35/año</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none mb-6">
                    Qué incluye tu <span className="text-[#FF6B2B] italic">Contacto Digital.</span>
                </h2>
                <p className="text-xl text-white/60 font-medium max-w-2xl mx-auto leading-relaxed">
                    No es solo un QR. Es un sistema completo de identidad profesional que vive en el bolsillo de tus clientes.
                </p>
            </FadeInUp>

            <FadeInUp delay={0.2} className="flex flex-wrap justify-center gap-3 mb-12">
                {INCLUDED_TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeIncludedTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveIncludedTab(tab.id)}
                            className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-500 ${
                                isActive
                                    ? 'bg-[#1a1a1a] border border-white/20 text-white shadow-2xl shadow-black scale-105'
                                    : 'bg-[#0a0a0a]/60 backdrop-blur-sm text-white/40 border border-white/5 hover:bg-[#111111] hover:text-white hover:border-white/10'
                            }`}
                        >
                            <Icon size={18} className={isActive ? 'text-[#FF6B2B]' : ''} />
                            <span className="hidden sm:inline">{tab.label}</span>
                            <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                        </button>
                    );
                })}
            </FadeInUp>

            <AnimatePresence mode="wait">
                {INCLUDED_TABS.map((tab) => {
                    if (tab.id !== activeIncludedTab) return null;
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
                                <div className="lg:col-span-5 relative w-full aspect-square md:aspect-[4/5] rounded-[3rem] overflow-hidden bg-[#111111] border border-white/5 shadow-inner group">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={`feature-img-${activeFeatureIndex}`}
                                            initial={{ opacity: 0, scale: 1.05 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.5 }}
                                            className="absolute inset-0"
                                        >
                                            {tab.features[activeFeatureIndex].image && (
                                                <img 
                                                    src={tab.features[activeFeatureIndex].image as string} 
                                                    alt={tab.features[activeFeatureIndex].title}
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                        </motion.div>
                                    </AnimatePresence>
                                    <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
                                        {tab.features.map((_, i) => (
                                            <button 
                                                key={i} 
                                                onClick={() => setActiveFeatureIndex(i)}
                                                className={`h-2 rounded-full transition-all duration-300 ${i === activeFeatureIndex ? 'w-8 bg-[#FF6B2B] shadow-lg' : 'w-2 bg-white/30 hover:bg-white/60'}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {tab.features.map((feature, idx) => {
                                        const FeatureIcon = feature.icon;
                                        const isFeatureActive = idx === activeFeatureIndex;
                                        return (
                                            <motion.div
                                                key={idx}
                                                onClick={() => setActiveFeatureIndex(idx)}
                                                className={`cursor-pointer group flex flex-col justify-center min-h-[140px] backdrop-blur-md p-5 rounded-[2rem] border transition-all duration-500 hover:-translate-y-1 ${
                                                    isFeatureActive 
                                                    ? 'bg-[#1a1a1a] shadow-xl shadow-black border-white/20 scale-100 ring-1 ring-white/10' 
                                                    : 'bg-[#111111]/40 border-white/5 hover:bg-[#1a1a1a]/80 hover:border-white/10 scale-[0.98] opacity-70 hover:opacity-100'
                                                }`}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className={`p-3 rounded-xl transition-all duration-300 shrink-0 ${
                                                        isFeatureActive ? 'bg-[#FF6B2B] text-white shadow-md shadow-[#FF6B2B]/20 scale-110' : 'bg-white/5 text-white/50 group-hover:bg-white/10 group-hover:text-white'
                                                    }`}>
                                                        <FeatureIcon size={20} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className={`font-black uppercase tracking-tight mb-1.5 leading-tight text-[13px] ${
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

            <FadeInUp delay={0.4} className="mt-16 flex flex-col items-center gap-8">
                <div className="flex flex-wrap justify-center gap-6">
                    <div className="flex flex-col items-center bg-[#111111] backdrop-blur-sm px-8 py-5 rounded-3xl border border-white/5 shadow-sm">
                        <span className="text-4xl font-black text-[#FF6B2B] tracking-tighter">20+</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40 mt-1">Funciones incluidas</span>
                    </div>
                    <div className="flex flex-col items-center bg-[#111111] backdrop-blur-sm px-8 py-5 rounded-3xl border border-white/5 shadow-sm">
                        <span className="text-4xl font-black text-white tracking-tighter">$35</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40 mt-1">Al año</span>
                    </div>
                    <div className="flex flex-col items-center bg-[#111111] backdrop-blur-sm px-8 py-5 rounded-3xl border border-white/5 shadow-sm">
                        <span className="text-4xl font-black text-white tracking-tighter">1 min</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40 mt-1">Para activarlo</span>
                    </div>
                </div>
            </FadeInUp>
        </div>
      </section>

      {/* 4. RESULTADOS REALES (TESTIMONIOS) DARK HYBRID */}
      <section className="py-24 relative overflow-hidden bg-[#050505]">
        <ScatteredPings />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
            <FadeInUp className="text-center mb-16">
                <div className="inline-flex items-center gap-2 bg-green-500/10 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest text-green-500 border border-green-500/20 mb-6">
                    <Star size={14} fill="currentColor" /> Resultados Reales
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase mb-6">Profesionales que ya <span className="text-[#FF6B2B] italic">están facturando más</span></h2>
                <p className="text-white/60 max-w-2xl mx-auto text-lg font-medium">No es solo un enlace, es la seguridad de que tus clientes te tienen a un toque de distancia cuando más te necesitan.</p>
            </FadeInUp>
            
            <div className="relative">
                <div className="flex md:grid md:grid-cols-3 gap-6 overflow-x-auto md:overflow-visible pb-12 md:pb-0 snap-x snap-mandatory scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
                    
                    {/* Testimonial 1 */}
                    <FadeInUp delay={0.1} className="w-[85vw] md:w-auto shrink-0 snap-center bg-[#111111] p-2 rounded-[2.5rem] shadow-xl border border-white/5 relative group hover:translate-y-[-5px] transition-transform duration-500">
                        <div className="relative aspect-square w-full rounded-[2rem] overflow-hidden mb-6">
                            <img src="/logos_clientes/clientes de Activa QR/Yessy 2026.jpg" alt="Yessy - Enfermería a domicilio" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/90 via-transparent to-transparent"></div>
                            <div className="absolute bottom-6 left-6 right-6">
                                <p className="text-white font-black text-xl uppercase tracking-tighter">Yessy</p>
                                <p className="text-[#FF6B2B] text-xs font-bold uppercase tracking-widest">Enfermería Pro</p>
                            </div>
                        </div>
                        <div className="px-6 pb-8">
                            <div className="flex gap-1 mb-4 text-[#FF6B2B]">
                                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                            </div>
                            <p className="text-white/70 font-medium italic leading-relaxed mb-6">"Muchos pacientes perdían mi número entre sus chats. Ahora, apenas los visito, escanean mi QR y aparezco primero en su agenda con mi foto. ¡Es impresionante la confianza que da!"</p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center text-green-500">
                                        <CheckCircle2 size={16} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Cliente Verificado</span>
                                </div>
                            </div>
                        </div>
                    </FadeInUp>

                    {/* Testimonial 2 */}
                    <FadeInUp delay={0.2} className="w-[85vw] md:w-auto shrink-0 snap-center bg-[#111111] p-2 rounded-[2.5rem] shadow-xl border border-white/5 relative group hover:translate-y-[-5px] transition-transform duration-500">
                        <div className="relative aspect-square w-full rounded-[2rem] overflow-hidden mb-6">
                            <img src="/logos_clientes/clientes de Activa QR/Las costillas del veci.jpg" alt="Las Costillas del Veci - Restaurante" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/90 via-transparent to-transparent"></div>
                            <div className="absolute bottom-6 left-6 right-6">
                                <p className="text-white font-black text-xl uppercase tracking-tighter">Costillas del Veci</p>
                                <p className="text-[#FF6B2B] text-xs font-bold uppercase tracking-widest">Gastronomía</p>
                            </div>
                        </div>
                        <div className="px-6 pb-8">
                            <div className="flex gap-1 mb-4 text-[#FF6B2B]">
                                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                            </div>
                            <p className="text-white/70 font-medium italic leading-relaxed mb-6">"Antes entregábamos volantes que terminaban en el suelo. Ahora, los clientes guardan nuestro contacto directo para pedidos a domicilio. La recurrencia de pedidos ha subido notablemente."</p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center text-green-500">
                                        <CheckCircle2 size={16} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Cliente Verificado</span>
                                </div>
                            </div>
                        </div>
                    </FadeInUp>

                    {/* Testimonial 3 */}
                    <FadeInUp delay={0.3} className="w-[85vw] md:w-auto shrink-0 snap-center bg-[#111111] p-2 rounded-[2.5rem] shadow-xl border border-white/5 relative group hover:translate-y-[-5px] transition-transform duration-500">
                        <div className="relative aspect-square w-full rounded-[2rem] overflow-hidden mb-6">
                            <img src="/logos_clientes/clientes de Activa QR/Loja Garden.jpg" alt="Loja Garden" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/90 via-transparent to-transparent"></div>
                            <div className="absolute bottom-6 left-6 right-6">
                                <p className="text-white font-black text-xl uppercase tracking-tighter">Loja Garden</p>
                                <p className="text-[#FF6B2B] text-xs font-bold uppercase tracking-widest">Servicios / Eventos</p>
                            </div>
                        </div>
                        <div className="px-6 pb-8">
                            <div className="flex gap-1 mb-4 text-[#FF6B2B]">
                                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                            </div>
                            <p className="text-white/70 font-medium italic leading-relaxed mb-6">"La facilidad para enviar mi contacto por WhatsApp con un solo clic es increíble. Mis clientes valoran la rapidez y la presentación profesional. Ha sido clave para nuestra imagen."</p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center text-green-500">
                                        <CheckCircle2 size={16} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Cliente Verificado</span>
                                </div>
                            </div>
                        </div>
                    </FadeInUp>

                </div>
            </div>
        </div>
      </section>

      {/* 5. ADVANCED FAQ - (DARK THEME OVERRIDE INCORPORATED) */}
      <section className="py-24 relative overflow-hidden" id="preguntas-frecuentes">
        <RadarPing />
        <ScatteredPings />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FF6B2B]/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
            <FadeInUp className="text-center mb-16">
                <div className="inline-flex items-center gap-2 bg-[#111111] border border-white/5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest text-white mb-6">
                    <Play size={14} className="text-[#FF6B2B]" /> ⚠️ LECTURA OBLIGATORIA
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4">ANTES DE HACER CLIC EN COMPRAR <span className="text-[#FF6B2B] italic">entiende esto.</span></h2>
                <p className="text-white/60 font-medium md:text-lg">Respuestas directas. Toca cualquier interrogante y destruiremos tus dudas cara a cara.</p>
            </FadeInUp>
            
            {/* The FAQ component from the original page - Now seamlessly matching the dark layout */}
            <div className="flex flex-col gap-4">
                <AdvancedFAQ 
                    items={CONTACTO_DIGITAL_FAQS}
                    title=""
                    subtitle=""
                    sectionTag=""
                    variant="dark"
                />
            </div>
        </div>
      </section>

      {/* 6. CHECKOUT DIRECTO (PIPELINE CLEAN) */}
      <section className="py-32 px-6 relative">
        <ScatteredPings />
        <div className="absolute inset-0 bg-[#050505] -z-10" />
        <div className="container mx-auto max-w-3xl">
            <FadeInUp>
                <div className="bg-[#111111] rounded-[3rem] p-10 md:p-16 border border-white/10 shadow-2xl shadow-black text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#FF6B2B]/20 blur-[100px] rounded-full pointer-events-none"></div>
                    <h2 className="text-3xl md:text-4xl font-black mb-4 relative z-10">Tu Identidad Digital Hoy</h2>
                    <p className="text-lg text-white/60 font-medium mb-10 relative z-10">Sin costos ocultos. Sin depender de terceros.</p>
                    
                    <div className="flex justify-center items-end gap-2 mb-10 relative z-10">
                        <span className="text-6xl md:text-8xl font-black tracking-tighter text-[#FF6B2B]">$35</span>
                        <span className="text-xl font-bold text-white/40 mb-2 uppercase tracking-widest">/ año</span>
                    </div>

                    <ul className="space-y-4 max-w-sm mx-auto mb-12 text-left relative z-10">
                        {[
                            "QR Dinámico Permanente",
                            "Panel de Autogestión 24/7",
                            "Compatibilidad Nativa iPhone/Android",
                            "Soporte por WhatsApp",
                        ].map((feature, i) => (
                            <li key={i} className="flex items-center gap-3">
                                <CheckCircle2 className="text-[#FF6B2B]" size={20} />
                                <span className="font-bold text-white/80">{feature}</span>
                            </li>
                        ))}
                    </ul>

                    <Link href="/registro?plan=digital" className="block w-full bg-[#FF6B2B] text-white px-8 py-6 rounded-2xl font-black text-2xl hover:bg-[#e05a1f] hover:scale-105 transition-all shadow-xl shadow-[#FF6B2B]/20 relative z-10">
                        Completar Compra →
                    </Link>
                    <p className="text-xs font-bold uppercase tracking-widest text-white/30 mt-6 relative z-10">
                        PAGO SEGURO • CANCELA CUANDO QUIERAS
                    </p>
                </div>
            </FadeInUp>
        </div>
      </section>

    </main>
  );
}
