"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ShoppingCart, LayoutGrid, Zap, Phone, CheckCircle2, QrCode, Tag, Database, Smartphone, Globe, List, Package, TrendingUp, Play, MessageSquare, Star } from "lucide-react";
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

// --- Pings blancos ---
const SCATTERED_PINGS = [
  { top: "15%", left: "80%", delay: 0.5, size: 50 },
  { top: "65%", left: "75%", delay: 1.5, size: 70 },
  { top: "40%", left: "60%", delay: 2.5, size: 40 },
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
            border: "1px solid rgba(255,255,255,0.4)",
          }}
          animate={{ scale: [0.5, 2], opacity: [0.6, 0] }}
          transition={{ duration: 4, repeat: Infinity, delay: p.delay }}
        />
      </div>
    ))}
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

const CATALOG_TABS = [
  {
      id: 'catalogo',
      label: 'Catálogo Inteligente',
      icon: LayoutGrid,
      description: 'Toda tu oferta organizada de forma visual y profesional',
      features: [
          { icon: List, title: 'Categorías Ilimitadas', desc: 'Organiza por familias de productos para facilitar la búsqueda.', image: 'https://cesarweb.b-cdn.net/contacto-digital/Tu%20Contacto/activaqr_v2_1_identidad.webp' },
          { icon: Package, title: 'Ficha de Producto Pro', desc: 'Múltiples fotos, descripción detallada y precios claros.', image: 'https://cesarweb.b-cdn.net/contacto-digital/Tu%20Contacto/activaqr_v2_2_nombre.webp' },
          { icon: Tag, title: 'Etiquetas de Estado', desc: 'Marca "Nuevo", "Oferta" o "Agotado" al instante.', image: 'https://cesarweb.b-cdn.net/contacto-digital/Tu%20Contacto/activaqr_v2_3_foto.webp' },
      ]
  },
  {
      id: 'pedidos',
      label: 'Ventas por WhatsApp',
      icon: ShoppingCart,
      description: 'Convierte el interés en pedidos reales sin pagar comisiones',
      features: [
          { icon: ShoppingCart, title: 'Carrito Multi-item', desc: 'Tus clientes seleccionan varios productos y arman su pedido.', image: 'https://cesarweb.b-cdn.net/contacto-digital/Tu%20Contacto/activaqr_v2_5_whatsapp.webp' },
          { icon: MessageSquare, title: 'Pedido Estructurado', desc: 'Recibes el detalle: Nombre, Producto, Cantidad y Total en tu WhatsApp.', image: 'https://cesarweb.b-cdn.net/contacto-digital/Redes%20y%20Perfil/redes_sociales_activaqr.webp' },
          { icon: TrendingUp, title: 'Cero Comisiones', desc: 'A diferencia de las apps, el 100% de la venta es para ti.', image: 'https://cesarweb.b-cdn.net/contacto-digital/Redes%20y%20Perfil/direccion_maps_activaqr.webp' },
      ]
  },
  {
      id: 'gestion',
      label: 'Gestión Cloud',
      icon: Database,
      description: 'El control total de tu inventario en la palma de tu mano',
      features: [
          { icon: Smartphone, title: 'Panel de Control Móvil', desc: 'Gestiona stock y precios desde tu celular en la cocina o almacén.', image: 'https://cesarweb.b-cdn.net/contacto-digital/codigo-qr/activaqr_qr_1_dinamico.webp' },
          { icon: Zap, title: 'Actualización Global', desc: 'Cambia un precio y se actualiza en todos los QR de tus mesas.', image: 'https://cesarweb.b-cdn.net/contacto-digital/codigo-qr/activaqr_qr_2_actualizacion.webp' },
      ]
  }
];

const CATALOG_FAQS: FAQItem[] = [
  {
      id: "faq-comm-catalogo",
      tag: "COSTOS",
      q: "¿Cobran comisión por las ventas?",
      bullets: [
          "No. El pago es anual por la tecnología.",
          "Tus ventas son 100% tuyas, sin porcentajes ocultos.",
          "El cliente te paga directamente a ti."
      ],
      videoSourceType: "bunny",
      videoUrl: "b473d784-04bc-47f4-bcae-c2bd51752b31"
  },
  {
      id: "faq-setup-catalogo",
      tag: "FACILIDAD",
      q: "¿Cómo subo mis 100 productos?",
      bullets: [
          "Contamos con una carga masiva ultra rápida.",
          "Puedes hacerlo tú o pedir soporte a nuestro equipo VIP.",
          "Organizar categorías toma solo unos minutos."
      ],
      videoSourceType: "bunny",
      videoUrl: "9278c314-648f-4220-b1d4-b2c94535ffa8"
  }
];

export default function ContactoCatalogoPipelineClient() {
  const [activeTab, setActiveTab] = useState('catalogo');
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);

  useEffect(() => {
    const currentTab = CATALOG_TABS.find(t => t.id === activeTab);
    if (currentTab) {
       setActiveFeatureIndex(0);
       const timer = setInterval(() => {
            setActiveFeatureIndex((prev) => {
                const max = currentTab.features.length;
                return (prev + 1) >= max ? 0 : prev + 1;
            });
        }, 4000);
        return () => clearInterval(timer);
    }
  }, [activeTab]);

  return (
    <main className="bg-[#0a0a0a] min-h-screen font-sans text-[#FFFFFF] selection:bg-[#FF6B2B]/30">
      <Navbar />
      
      {/* HERO */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2000')] bg-cover bg-center opacity-10 grayscale" />
        <RadarPing />
        <ScatteredPings />
        <div className="container mx-auto max-w-6xl relative z-10 text-center lg:text-left">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
                <FadeInUp>
                    <div className="inline-flex items-center gap-2 bg-[#FF6B2B]/10 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest text-[#FF6B2B] mb-8 border border-[#FF6B2B]/20">
                        <ShoppingCart size={16} /> Business + Catálogo
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black leading-tight mb-8 tracking-tighter">
                        Vende sin parar con tu <span className="text-[#FF6B2B] italic">Catálogo de Alto Desempeño.</span>
                    </h1>
                    <p className="text-xl text-white/60 font-medium mb-12 max-w-lg leading-relaxed">
                        Transforma tu QR en una máquina de pedidos. Carrito de compras, gestión de stock y ventas por WhatsApp en un solo lugar.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-5 items-center justify-center lg:justify-start">
                        <Link href="/registro?plan=catalogo" className="w-full sm:w-auto bg-[#FF6B2B] text-white px-10 py-6 rounded-2xl font-black text-2xl shadow-xl shadow-[#FF6B2B]/20 hover:scale-105 transition-all flex items-center justify-center gap-3">
                            Vender con Catálogo - $200/año <ArrowRight size={24} />
                        </Link>
                    </div>
                </FadeInUp>
                <FadeInUp delay={0.2} className="hidden lg:block relative">
                    <div className="bg-[#111111] rounded-[3rem] p-4 border-4 border-white/10 shadow-2xl overflow-hidden aspect-[9/16] max-w-[320px] mx-auto">
                        <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2000" className="w-full h-full object-cover rounded-[2.5rem] grayscale opacity-50" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-20 bg-[#FF6B2B] rounded-full flex items-center justify-center pl-1 shadow-2xl">
                                <Play fill="white" className="text-white" />
                            </div>
                        </div>
                    </div>
                </FadeInUp>
            </div>
        </div>
      </section>

      {/* TABS DE PRODUCTO */}
      <section className="py-24 bg-[#050505] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
            <FadeInUp className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">Tu Tienda Digital <span className="text-[#FF6B2B] italic">en Piloto Automático.</span></h2>
            </FadeInUp>

            <div className="flex flex-wrap justify-center gap-3 mb-16">
                {CATALOG_TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                                isActive ? 'bg-[#FF6B2B] text-white shadow-xl' : 'bg-[#111111] text-white/40 hover:text-white border border-white/5'
                            }`}
                        >
                            <Icon size={20} /> {tab.label}
                        </button>
                    );
                })}
            </div>

            <AnimatePresence mode="wait">
                {CATALOG_TABS.map((tab) => {
                    if (tab.id !== activeTab) return null;
                    return (
                        <motion.div
                            key={tab.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="grid lg:grid-cols-2 gap-12 items-center"
                        >
                            <div className="relative aspect-video lg:aspect-square bg-[#111111] rounded-[3rem] overflow-hidden border border-white/10">
                                <img src={tab.features[activeFeatureIndex].image} className="w-full h-full object-cover grayscale" />
                            </div>
                            <div className="flex flex-col gap-6">
                                {tab.features.map((f, i) => (
                                    <div key={i} className={`p-6 rounded-[2rem] border transition-all ${i === activeFeatureIndex ? 'bg-[#1a1a1a] border-[#FF6B2B]/40' : 'bg-transparent border-white/5 opacity-50'}`}>
                                        <div className="flex items-start gap-4">
                                            <div className="bg-[#FF6B2B] text-white p-3 rounded-xl"><f.icon size={24} /></div>
                                            <div>
                                                <h4 className="font-black text-white uppercase text-lg mb-2">{f.title}</h4>
                                                <p className="text-white/60 font-medium">{f.desc}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6">
            <AdvancedFAQ 
                items={CATALOG_FAQS}
                title="Soporte y Dudas"
                subtitle="Todo sobre tu nuevo Catálogo Digital"
                variant="dark"
            />
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-32 bg-gradient-to-b from-[#0a0a0a] to-[#000000] text-center px-6">
        <FadeInUp>
            <div className="max-w-4xl mx-auto bg-[#111111] p-12 md:p-20 rounded-[4rem] border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-[#FF6B2B]" />
                <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter italic">¿Listo para vender con Catálogo?</h2>
                <div className="flex justify-center items-center gap-4 mb-12">
                    <span className="text-7xl md:text-9xl font-black text-[#FF6B2B]">$200</span>
                    <div className="text-left">
                        <p className="text-xl font-black text-white uppercase leading-none">al año</p>
                        <p className="text-sm text-white/40 font-bold uppercase tracking-widest mt-1">Sin Comisiones</p>
                    </div>
                </div>
                <Link href="/registro?plan=catalogo" className="inline-flex items-center gap-4 bg-[#FF6B2B] text-white px-12 py-7 rounded-2xl font-black text-2xl hover:scale-105 transition-all shadow-2xl shadow-[#FF6B2B]/20">
                    Activar Catálogo Ahora <ArrowRight size={28} />
                </Link>
            </div>
        </FadeInUp>
      </section>

      <Footer />
    </main>
  );
}
