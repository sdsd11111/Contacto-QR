"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Globe, ShieldCheck, Zap, Laptop, Monitor, Smartphone, Layout, PenTool, Database, BarChart3, Lock, Rocket, Play, ChevronRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { AdvancedFAQ, FAQItem } from "@/components/AdvancedFAQ/AdvancedFAQ";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
    </div>
  </div>
);

const FadeInUp = ({ children, delay = 0, className = "" }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
    className={className}
  >
    {children}
  </motion.div>
);

const WEB_TABS = [
  {
      id: 'diseno',
      label: 'Diseño de Autoridad',
      icon: Layout,
      description: 'Una presencia web que proyecta la grandeza de tu marca',
      features: [
          { icon: PenTool, title: 'Branding Personalizado', desc: 'Respetamos tus colores, tipografías y manual de marca al 100%.', image: 'https://cesarweb.b-cdn.net/contacto-digital/Tu%20Contacto/activaqr_v2_1_identidad.webp' },
          { icon: Monitor, title: 'Multi-sección Pro', desc: 'Páginas dedicadas para Nosotros, Servicios y Proyectos.', image: 'https://cesarweb.b-cdn.net/contacto-digital/Tu%20Contacto/activaqr_v2_2_nombre.webp' },
          { icon: Smartphone, title: 'Mobile First Optimizer', desc: 'Diseñado para verse impecable en cualquier tamaño de pantalla.', image: 'https://cesarweb.b-cdn.net/contacto-digital/Tu%20Contacto/activaqr_v2_3_foto.webp' },
      ]
  },
  {
      id: 'tecnologia',
      label: 'Infraestructura VIP',
      icon: Database,
      description: 'Velocidad de carga y seguridad de nivel bancario',
      features: [
          { icon: Rocket, title: 'Hosting en la Nube', desc: 'Servidores ultra rápidos para una carga instantánea.', image: 'https://cesarweb.b-cdn.net/contacto-digital/codigo-qr/activaqr_qr_1_dinamico.webp' },
          { icon: Lock, title: 'Certificado SSL Incluido', desc: 'Tu sitio marcado como seguro para generar confianza inmediata.', image: 'https://cesarweb.b-cdn.net/contacto-digital/codigo-qr/activaqr_qr_2_actualizacion.webp' },
          { icon: BarChart3, title: 'Analytics Avanzado', desc: 'Mide cada clic, visita y conversión con precisión quirúrgica.', image: 'https://cesarweb.b-cdn.net/contacto-digital/Redes%20y%20Perfil/redes_sociales_activaqr.webp' },
      ]
  }
];

const WEB_FAQS: FAQItem[] = [
  {
      id: "faq-time-web",
      tag: "TIEMPOS",
      q: "¿Cuánto tardan en entregar mi sitio?",
      bullets: [
          "Entre 7 a 15 días hábiles después de recibir la información.",
          "Incluimos una fase de revisión para asegurar que te encanta.",
          "Nos encargamos de toda la configuración técnica."
      ],
      videoSourceType: "bunny",
      videoUrl: "b473d784-04bc-47f4-bcae-c2bd51752b31"
  },
  {
      id: "faq-dom-web",
      tag: "DOMINIOS",
      q: "¿El dominio está incluido?",
      bullets: [
          "Sí, incluimos el registro de tu dominio .com por el primer año.",
          "Si ya tienes uno, nos encargamos de la migración sin costo.",
          "Correos corporativos profesionales incluidos."
      ],
      videoSourceType: "bunny",
      videoUrl: "9278c314-648f-4220-b1d4-b2c94535ffa8"
  }
];

export default function SitioWebPipelineClient() {
  const [activeTab, setActiveTab] = useState('diseno');
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);

  useEffect(() => {
    const currentTab = WEB_TABS.find(t => t.id === activeTab);
    if (currentTab) {
       setActiveFeatureIndex(0);
       const timer = setInterval(() => {
            setActiveFeatureIndex((prev) => {
                const max = currentTab.features.length;
                return (prev + 1) >= max ? 0 : prev + 1;
            });
        }, 5000);
        return () => clearInterval(timer);
    }
  }, [activeTab]);

  return (
    <main className="bg-[#0a0a0a] min-h-screen font-sans text-white selection:bg-[#FF6B2B]/30">
      <Navbar />
      
      {/* HERO */}
      <section className="pt-40 pb-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2000')] bg-cover bg-center opacity-10 grayscale" />
        <RadarPing />
        <div className="container mx-auto max-w-6xl relative z-10">
            <FadeInUp className="text-center">
                <div className="inline-flex items-center gap-2 bg-[#FF6B2B]/10 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-[#FF6B2B] mb-10 border border-[#FF6B2B]/20">
                    <Globe size={14} /> Solución Elite: Sitio Web Completo
                </div>
                <h1 className="text-5xl md:text-8xl font-black mb-10 tracking-tighter leading-[0.9] italic">
                    Domina tu mercado con una <span className="text-[#FF6B2B]">presencia web de élite.</span>
                </h1>
                <p className="text-xl md:text-2xl text-white/50 font-medium mb-16 max-w-3xl mx-auto leading-relaxed">
                    No es una plantilla barata. Es una obra de ingeniería diseñada para convertir visitantes en clientes de alto valor.
                </p>
                <div className="flex flex-col md:flex-row gap-6 justify-center">
                    <Link href="/registro?plan=completo" className="bg-[#FF6B2B] text-white px-12 py-7 rounded-2xl font-black text-2xl shadow-2xl shadow-[#FF6B2B]/30 hover:scale-105 transition-all">
                        Construir mi Sitio - $1000 <ArrowRight size={24} className="inline ml-2" />
                    </Link>
                    <button className="bg-white/5 backdrop-blur-xl border border-white/10 text-white px-12 py-7 rounded-2xl font-black text-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                        <Play fill="white" size={20} /> Ver Casos de Éxito
                    </button>
                </div>
            </FadeInUp>
        </div>
      </section>

      {/* CARACTERÍSTICAS TÉCNICAS */}
      <section className="py-24 bg-[#050505] relative border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-12 gap-16 items-start">
                <div className="lg:col-span-4 sticky top-32">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-8 leading-tight">La ingeniería detrás de tu <span className="text-[#FF6B2B]">éxito digital.</span></h2>
                    <div className="flex flex-col gap-4">
                        {WEB_TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center justify-between p-6 rounded-3xl font-black text-lg transition-all ${
                                    activeTab === tab.id ? 'bg-[#FF6B2B] text-white shadow-xl translate-x-4' : 'bg-[#111111] text-white/40 hover:text-white'
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <tab.icon size={24} />
                                    {tab.label}
                                </div>
                                <ChevronRight size={24} />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-8">
                    <AnimatePresence mode="wait">
                        {WEB_TABS.map((tab) => {
                            if (tab.id !== activeTab) return null;
                            return (
                                <motion.div
                                    key={tab.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-8"
                                >
                                    <div className="aspect-video bg-[#111111] rounded-[3rem] overflow-hidden border border-white/10 mb-12">
                                        <img src={tab.features[activeFeatureIndex].image} className="w-full h-full object-cover grayscale opacity-60" />
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        {tab.features.map((f, i) => (
                                            <div key={i} className="bg-[#111111] p-8 rounded-[2.5rem] border border-white/5 hover:border-[#FF6B2B]/40 transition-colors">
                                                <div className="bg-[#FF6B2B]/20 text-[#FF6B2B] w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
                                                    <f.icon size={28} />
                                                </div>
                                                <h4 className="text-xl font-black mb-3">{f.title}</h4>
                                                <p className="text-white/50 font-medium leading-relaxed">{f.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6">
            <AdvancedFAQ 
                items={WEB_FAQS}
                title="Consultoría Técnica"
                subtitle="Respuestas claras para tu proyecto web"
                variant="dark"
            />
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-32 bg-[#000000] text-center px-6">
        <FadeInUp>
            <div className="max-w-5xl mx-auto bg-gradient-to-br from-[#111111] to-[#0a0a0a] p-12 md:p-24 rounded-[5rem] border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#FF6B2B]/10 blur-[120px] rounded-full" />
                <h2 className="text-5xl md:text-7xl font-black mb-10 tracking-tighter leading-none italic">Escala al siguiente nivel.</h2>
                <p className="text-2xl text-white/40 font-bold mb-16">Inversión única para una autoridad de por vida.</p>
                <div className="flex flex-col items-center gap-8">
                    <div className="flex items-center gap-4">
                        <span className="text-8xl md:text-9xl font-black text-[#FF6B2B]">$1000</span>
                    </div>
                    <Link href="/registro?plan=completo" className="bg-[#FF6B2B] text-white px-16 py-8 rounded-3xl font-black text-3xl hover:scale-105 transition-all shadow-2xl shadow-[#FF6B2B]/40">
                        Comenzar mi Proyecto Elite
                    </Link>
                    <p className="text-white/30 font-black uppercase tracking-widest text-sm flex items-center gap-2">
                        <ShieldCheck size={20} /> Satisfacción Garantizada
                    </p>
                </div>
            </div>
        </FadeInUp>
      </section>

      <Footer />
    </main>
  );
}
