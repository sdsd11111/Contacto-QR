"use client";

import { useState, useEffect } from "react";
import { Smartphone, Zap, CheckCircle2, Star, ShieldCheck, Phone, FileText, Edit, Mic, Trash2, ArrowRight, XCircle, TrendingDown, Users, QrCode, Download, Globe, Share2, Palette, RefreshCw, MapPin, Mail, Tag, MessageSquare, Image as ImageIcon, Video, Megaphone } from 'lucide-react';
import { PricingSection } from "@/components/PricingSection/PricingSection";
import { AdvancedFAQ, FAQItem } from "@/components/AdvancedFAQ/AdvancedFAQ";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import VideoModal from "@/components/VideoModal";
import PopupManager from "@/components/PopupManager";
import EditPortalModal from "@/components/EditPortalModal";
import FloatingSalesHeader from "@/components/FloatingSalesHeader";
import QuoteModal from "@/components/QuoteModal";
import BlogRecommendations from "@/components/BlogRecommendations";

const INCLUDED_TABS = [
    {
        id: 'vitrina',
        label: 'Tu Vitrina',
        icon: Globe,
        color: 'primary',
        description: 'Tu propio espacio en la web para que te encuentren siempre',
        features: [
            { icon: CheckCircle2, title: 'Todo el Plan Digital Incluido', desc: 'Recibes todas las funciones (vCard Pro, Redes Sociales, Bio y Foto) integradas en este ecosistema.', image: 'https://cesarweb.b-cdn.net/contacto-bussines/vitrina/plan_digital_incluido_activaqr.webp' },
            { icon: Globe, title: 'Página Digital de Negocio', desc: 'Una landing web profesional alojada con tu marca y servicios.', image: 'https://cesarweb.b-cdn.net/contacto-bussines/vitrina/pagina_digital_activaqr.webp' },
            { icon: MapPin, title: 'Mapa Google Maps', desc: 'Ubicación interactiva para que tus clientes lleguen a tu local con un clic.', image: 'https://cesarweb.b-cdn.net/contacto-bussines/vitrina/google_maps_activaqr.webp' },
            { icon: ImageIcon, title: 'Portada Actualizable', desc: 'Cambia la imagen principal de tu perfil según la temporada o evento.', image: 'https://cesarweb.b-cdn.net/contacto-bussines/vitrina/portada_actualizable_activaqr.webp' },
            { icon: Video, title: 'Video Pro Integrado', desc: 'Muestra un video de tus instalaciones o productos directamente en tu página.', image: 'https://cesarweb.b-cdn.net/contacto-bussines/vitrina/video_pro_activaqr.webp' },
            { icon: Smartphone, title: 'Acceso Directo (Web App)', desc: 'Tus clientes pueden instalar tu página como un icono en su celular.', image: 'https://cesarweb.b-cdn.net/contacto-bussines/vitrina/acceso_directo_activaqr.webp' },
        ]
    },
    {
        id: 'ventas',
        label: 'Ventas Pro',
        icon: Megaphone,
        color: 'navy',
        description: 'Herramientas de conversión directa para captar clientes',
        features: [
            { icon: Megaphone, title: 'Anuncios Cambiantes', desc: 'Banners destacados que puedes rotar para resaltar lo más importante.', image: 'https://cesarweb.b-cdn.net/contacto-bussines/ventas/anuncios_cambiantes.webp' },
            { icon: Tag, title: 'Promociones del Día', desc: 'Espacio dedicado para ofertas exclusivas que incentivan la compra inmediata.', image: 'https://cesarweb.b-cdn.net/contacto-bussines/ventas/promociones_dia.webp' },
            { icon: MessageSquare, title: 'WhatsApp Business Link', desc: 'Botón flotante premium para que te contacten sin guardar tu número.', image: 'https://cesarweb.b-cdn.net/contacto-bussines/ventas/whatsapp_business.webp' },
            { icon: FileText, title: 'Lista de Servicios', desc: 'Detalle textual de lo que ofreces para informar rápidamente a tu cliente.', image: 'https://cesarweb.b-cdn.net/contacto-bussines/ventas/lista_servicios.webp' },
            { icon: Zap, title: 'Botones Internos de Acción', desc: 'Llamadas, correos y redes a un solo toque de distancia.', image: 'https://cesarweb.b-cdn.net/contacto-bussines/ventas/botones_accion.webp' },
        ]
    },
    {
        id: 'identidad',
        label: 'Identidad Pro',
        icon: QrCode,
        color: 'primary',
        description: 'Hereda todas las funciones de Contacto Digital + El poder de tu Marca Business',
        features: [
            { icon: QrCode, title: 'QR Dinámico Premium', desc: 'Mismo QR inteligente del plan Digital, pero apuntando a tu nueva Vitrina de Negocio.', image: 'https://cesarweb.b-cdn.net/contacto-bussines/identidad/qr_dinamico_premium.webp' },
            { icon: Download, title: 'Identidad Digital Automática', desc: 'Descarga de contacto (vCard) con tu foto y datos lista para guardar en la agenda.', image: 'https://cesarweb.b-cdn.net/contacto-bussines/identidad/identidad_digital.webp' },
            { icon: Globe, title: 'Tus redes sociales', desc: 'Instagram, Facebook, TikTok, WhatsApp y más — Todas tus redes del plan digital.', image: 'https://cesarweb.b-cdn.net/contacto-bussines/identidad/redes_sociales.webp' },
            { icon: RefreshCw, title: 'Actualización en 10 segundos', desc: 'Cambias un dato (teléfono, link, promo) y se actualiza al instante.', image: 'https://cesarweb.b-cdn.net/contacto-bussines/identidad/actualizacion_rapida.webp' },
            { icon: Smartphone, title: 'Diseño Mobile-First', desc: 'Tu negocio se verá perfecto en iPhone, Android y cualquier dispositivo.', image: 'https://cesarweb.b-cdn.net/contacto-bussines/identidad/mobile_first.webp' },
            { icon: Palette, title: 'Colores de Marca', desc: 'Personalizamos el entorno visual con los colores de tu logotipo o negocio.', image: 'https://cesarweb.b-cdn.net/contacto-bussines/identidad/colores_marca.webp' },
        ]
    },
    {
        id: 'gestion',
        label: 'Gestión',
        icon: RefreshCw,
        color: 'navy',
        description: 'Control total de tu negocio desde tu propio celular',
        features: [
            { icon: Edit, title: 'Panel de Control ActivaQR', desc: 'Acceso exclusivo para que gestiones tu info sin depender de nadie.', image: 'https://cesarweb.b-cdn.net/contacto-bussines/gestion/panel_control.webp' },
            { icon: RefreshCw, title: 'Control de Promociones', desc: 'Sube y baja ofertas del día en tiempo real según tu stock.', image: 'https://cesarweb.b-cdn.net/contacto-bussines/gestion/control_promociones.webp' },
            { icon: ShieldCheck, title: 'Seguridad y Hosting', desc: 'Alojamiento premium incluido en servidores de alta velocidad.', image: 'https://cesarweb.b-cdn.net/contacto-bussines/gestion/seguridad_hosting.webp' },
            { icon: Phone, title: 'Asesoría VIP 24/7', desc: 'Soporte prioritario por WhatsApp para dueños de negocios.', image: 'https://cesarweb.b-cdn.net/contacto-bussines/gestion/asesoria_vip.webp' },
            { icon: Mic, title: 'Carga por Voz IA', desc: 'Dicta tus nuevas promociones y nuestra IA las organiza por ti.', image: 'https://cesarweb.b-cdn.net/contacto-bussines/gestion/carga_voz_ia.webp' },
            { icon: Tag, title: 'SEO Local para Google', desc: 'Optimizamos tu perfil para que sea más fácil encontrarte en tu ciudad.', image: 'https://cesarweb.b-cdn.net/contacto-bussines/gestion/seo_local.webp' },
        ]
    },
];



export default function PlanBusinessClient() {
    useEffect(() => {
        // Estilos para ocultar scrollbars pero mantener funcionalidad
        const style = document.createElement('style');
        style.textContent = `
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `;
        document.head.append(style);
        return () => style.remove();
    }, []);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
    const [isFloatingVisible, setIsFloatingVisible] = useState(true);
    const [activeIncludedTab, setActiveIncludedTab] = useState('vitrina');

    const CONTACTO_BUSINESS_FAQS: FAQItem[] = [
        {
            id: "faq-social-business",
            tag: "VISIBILIDAD",
            q: "¿Para qué necesito esto si ya publico en Facebook?",
            bullets: [
                "En redes compites con el algoritmo; aquí la atención es 100% tuya.",
                "Garantiza que el cliente que escanea vea tu oferta del día sin filtros.",
                "Publicidad directa y efectiva al que ya está en tu local o contacto."
            ],
            videoSourceType: "bunny",
            videoUrl: "b473d784-04bc-47f4-bcae-c2bd51752b31",
            ctaText: "Activar mi Plan Business"
        },
        {
            id: "faq-speed-business",
            tag: "GESTIÓN",
            q: "¿Es difícil actualizar mis promociones?",
            bullets: [
                "Si sabes subir una foto a WhatsApp, sabes usar ActivaQR.",
                "Tarda exactamente 10 segundos desde tu propio celular.",
                "Tu negocio nunca vuelve a estar desactualizado ni depende de terceros."
            ],
            videoSourceType: "bunny",
            videoUrl: "9278c314-648f-4220-b1d4-b2c94535ffa8"
        }
    ];
    const [currentSlide, setCurrentSlide] = useState(0);
    const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
    
    useEffect(() => {
        // Auto-play para el carrusel (5 segundos)
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev === 2 ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        // Auto-play para el carrusel de las pestañas interactivas (3.5 segundos)
        const currentTab = INCLUDED_TABS.find(t => t.id === activeIncludedTab);
        const interactiveTabs = ['vitrina', 'ventas', 'identidad', 'gestion'];
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

    useEffect(() => {
        // Check if URL has #editar and open modal
        if (typeof window !== 'undefined' && window.location.hash === '#editar') {
            setIsEditModalOpen(true);
        }
    }, []);
    
    useEffect(() => {
        let scrollTimeout: NodeJS.Timeout;
        const handleScroll = () => {
            setIsFloatingVisible(false);
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                setIsFloatingVisible(true);
            }, 800); 
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(scrollTimeout);
        };
    }, []);

    return (
        <main className="min-h-screen bg-background selection:bg-primary/30 scroll-smooth relative overflow-x-hidden font-sans">

            {/* Hero Section: Premium Horizontal Split */}
            <section className="section-dark relative min-h-screen w-full overflow-hidden flex items-center bg-background">
                {/* Background Image Container - Right Aligned & Full Height */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/Reingenierìa/v2_plan_business_indiferencia.webp"
                        alt="ActivaQR - Contacto Business"
                        className="w-full h-full object-cover opacity-60"
                    />
                    {/* Subtle Overlay to ensure overall branding consistency */}
                    <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent"></div>
                </div>

                <div className="container mx-auto relative z-20 px-6 md:px-12 py-20 lg:py-32">
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="max-w-3xl bg-white/40 backdrop-blur-xl p-8 md:p-12 rounded-[3.5rem] border border-white/40 shadow-2xl shadow-navy/5"
                    >
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 bg-navy text-white px-4 py-2 rounded-full shadow-lg mb-8"
                        >
                            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest">NEGOCIOS Y MARCAS • ECO-SISTEMA ACTUALIZABLE</span>
                        </motion.div>
    
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-[1.05] mb-6 tracking-tighter"
                        >
                          <span style={{
                            fontSize: '0.7rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.12em',
                            opacity: 0.55,
                            display: 'block',
                            marginBottom: '0.5rem'
                          }}>
                            Página de negocio actualizable — QR dinámico para negocios locales
                          </span>
                            Tus clientes viendo tus promociones en <span className="text-primary italic">tiempo real.</span>
                        </motion.h1>
    
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-base md:text-lg text-white/70 mb-10 leading-relaxed font-medium max-w-xl"
                        >
                            Sin hablar con el diseñador ni pagar pautas falsas. Subes una promoción desde tu teléfono y en 10 segundos tus clientes ya la ven cuando escanean el QR de tu local.
                        </motion.p>
    
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-col sm:flex-row gap-5 justify-start items-center"
                        >
                            <a
                                href="/registro"
                                className="w-full sm:w-auto bg-primary text-white px-10 py-6 rounded-full font-black text-xl shadow-2xl shadow-primary/30 hover:translate-y-[-4px] active:translate-y-0 transition-all flex items-center justify-center gap-3 group"
                            >
                                Activar mi Negocio ahora <ArrowRight size={24} />
                            </a>
                             <a
                                 href="#demo-video"
                                 className="w-full sm:w-auto bg-white/10 backdrop-blur-md text-white px-10 py-6 rounded-full font-bold text-xl border border-white/20 hover:bg-white/20 transition-all flex items-center justify-center gap-3"
                             >
                                 <Phone size={24} className="text-primary" /> Ver demo
                             </a>
                        </motion.div>
    
                        {/* Social Proof Text */}
                        <div className="mt-12 flex items-center gap-4 text-white/40 font-black uppercase tracking-tighter text-[10px]">
                            <div className="flex text-primary">
                                <Star size={14} fill="currentColor" />
                                <Star size={14} fill="currentColor" />
                                <Star size={14} fill="currentColor" />
                                <Star size={14} fill="currentColor" />
                                <Star size={14} fill="currentColor" />
                            </div>
                            <span>Más de 1,000 profesionales ya no usan papel</span>
                        </div>
                    </motion.div>
                </div>
            </section>
            
            {/* Sección: Confianza y Profesionalismo */}
            <section className="section-light py-24 bg-surface relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest text-primary mb-6">
                                <ShieldCheck size={16} /> Identidad Profesional
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-navy leading-none mb-8 tracking-tighter">
                                Prestigio para tu tienda en <span className="text-primary italic">todo momento.</span>
                            </h2>
                            <p className="text-xl text-navy/70 font-bold mb-6 leading-relaxed">
                                Tu negocio no es solo un local, es una marca que merece respeto. Al instalar tu perfil profesional, aseguras que tus promociones vivan en el celular de tus clientes. Generas autoridad inmediata y te diferencias de la informalidad.
                            </p>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                    <div className="bg-primary text-white p-2 rounded-lg">
                                        <Smartphone size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-navy uppercase text-sm">Vives en su Celular</h4>
                                        <p className="text-sm text-navy/60 font-medium">Permanencia total. Sin depender de algoritmos o redes sociales.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-4 bg-navy/5 rounded-2xl border border-navy/10">
                                    <div className="bg-navy text-white p-2 rounded-lg">
                                        <Users size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-navy uppercase text-sm">Recomendación Garantizada</h4>
                                        <p className="text-sm text-navy/60 font-medium">Tu cara y tu marca aparecen primero cuando alguien pide tu servicio.</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative flex justify-center lg:justify-end"
                        >
                            <div className="absolute inset-0 bg-primary/30 blur-[100px] rounded-full max-w-[320px] mx-auto lg:mx-0 lg:ml-auto" />
                            
                            {/* Formato Historia / Mockup de Celular Virtual */}
                            <div className="relative aspect-[9/16] w-full max-w-[300px] rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)] border-8 border-white bg-navy z-10 group">
                                <iframe
                                    src="https://iframe.mediadelivery.net/embed/636136/707ab058-a740-4cd7-bc43-b3fdb93a35cb?autoplay=true&loop=true&muted=true&preload=true&responsive=true"
                                    loading="lazy"
                                    title="Demostración Plan Business ActivaQR"
                                    className="absolute inset-0 w-full h-full border-0 transform transition-transform duration-1000 group-hover:scale-105"
                                    allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
                                    allowFullScreen
                                ></iframe>
                                {/* Overlay sutil para brillo estético del cristal */}
                                <div className="absolute inset-0 rounded-[2rem] ring-1 ring-inset ring-white/10 pointer-events-none mix-blend-overlay"></div>
                            </div>
                        </motion.div>
                    </div>
                </div>
                </section>



            {/* Sección Separadora con Imagen Fija (Fixed Background) */}
            <section
                className="relative h-[60vh] w-full bg-fixed bg-center bg-cover bg-no-repeat"
                style={{ backgroundImage: 'url("/images/Reingenierìa/v2_plan_web_abismo.webp")' }}
            >
                <div className="absolute inset-0 bg-navy/20"></div>
            </section>

            {/* Sección: El costo de que te olviden */}
            <div className="section-dark">
                <section className="py-24 bg-navy text-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 relative z-20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="relative">
                            <div className="absolute -inset-4 bg-primary/30 blur-3xl rounded-full opacity-20"></div>
                            <img 
                                src="/images/Reingenierìa/video_horizontal_4_resultado.webp" 
                                alt="La confianza de un contacto con foto" 
                                className="relative w-full h-auto rounded-[3rem] shadow-2xl border border-white/10"
                            />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-2 bg-primary px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest text-white mb-6">
                                <TrendingDown size={16} /> El costo oculto
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-white leading-none mb-8 tracking-tighter">
                                El costo de <span className="text-primary italic">no ser visible.</span>
                            </h2>
                            <p className="text-xl text-white/70 font-bold mb-8 leading-relaxed">
                                ¿Cuánto dinero dejas sobre la mesa cada día porque tus clientes no ven lo que ofreces hoy? Seguir usando herramientas viejas te sale caro. Te mereces un sistema que trabaje por la visibilidad de tu local hoy.
                            </p>
                            <div className="space-y-6">
                                <div className="p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
                                    <p className="text-lg font-bold leading-snug">
                                        "Imagina que tus promociones no llegan a nadie por culpa de un algoritmo. En un año son miles de dólares en ventas perdidas por no tener contacto directo."
                                    </p>
                                </div>
                                <p className="text-primary font-black uppercase text-xs tracking-[0.2em] italic">Tu vitrina digital vendiendo las 24 horas.</p>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Decoradores Sutiles */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
                </section>
            </div>


            {/* Sección: Qué incluye tu Contacto Business (NUEVA) */}
            <section className="section-dark py-24 bg-background relative overflow-hidden" id="que-incluye">
                {/* Background decorators */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-30">
                    <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-navy/10 rounded-full blur-[100px]"></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 bg-navy text-white px-4 py-2 rounded-full shadow-lg mb-8"
                        >
                            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Ecosistema Completo • Negocios Pro</span>
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none mb-6"
                        >
                            Lo que lleva tu <span className="text-primary italic">Contacto Business.</span>
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-white/60 font-medium max-w-2xl mx-auto leading-relaxed"
                        >
                            Todo lo que un local comercial o marca personal necesita para ser visible, relevante y fácil de comprar.
                        </motion.p>
                    </div>

                    {/* Tabs Navigation */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-wrap justify-center gap-3 mb-12"
                    >
                        {INCLUDED_TABS.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeIncludedTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveIncludedTab(tab.id)}
                                    className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-500 ${
                                        isActive
                                            ? 'bg-primary text-white shadow-2xl shadow-primary/20 scale-105'
                                            : 'bg-white/5 backdrop-blur-sm text-white/40 border border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20'
                                    }`}
                                >
                                    <Icon size={18} className={isActive ? 'text-white' : ''} />
                                    <span className="hidden sm:inline">{tab.label}</span>
                                    <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                                </button>
                            );
                        })}
                    </motion.div>

                    {/* Tab Content */}
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
                                    {/* Tab Description */}
                                    <div className="text-center mb-10">
                                        <p className="text-navy/50 font-bold text-lg italic">{tab.description}</p>
                                    </div>

                                    {/* Features Grid or Carousel */}
                                    {['vitrina', 'ventas', 'identidad', 'gestion'].includes(activeIncludedTab) ? (
                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-6">
                                            {/* Carrusel de Imágenes */}
                                            <div className="lg:col-span-5 relative w-full aspect-square md:aspect-[4/5] rounded-[3rem] overflow-hidden bg-navy/5 border border-navy/10 shadow-inner group">
                                                <AnimatePresence mode="wait">
                                                    <motion.div
                                                        key={`feature-img-${activeIncludedTab}-${activeFeatureIndex}`}
                                                        initial={{ opacity: 0, scale: 1.05 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        transition={{ duration: 0.5 }}
                                                        className="absolute inset-0"
                                                    >
                                                        {tab.features[activeFeatureIndex].image ? (
                                                            <img 
                                                                src={tab.features[activeFeatureIndex].image as string} 
                                                                alt={tab.features[activeFeatureIndex].title}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex flex-col items-center justify-center bg-white/5 text-white/20 p-10 text-center">
                                                                <tab.icon size={64} strokeWidth={1} className="mb-4 opacity-20" />
                                                                <p className="font-bold text-sm uppercase tracking-widest">{tab.label}</p>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                </AnimatePresence>
                                                {/* Indicadores */}
                                                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
                                                    {tab.features.map((_, i) => (
                                                        <button 
                                                            key={i} 
                                                            onClick={() => setActiveFeatureIndex(i)}
                                                            className={`h-2 rounded-full transition-all duration-300 ${i === activeFeatureIndex ? 'w-8 bg-primary shadow-lg' : 'w-2 bg-white/50 hover:bg-white/80'}`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            
                                            {/* Lista de Features interactiva */}
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
                                                                ? 'bg-white shadow-xl shadow-primary/5 border-primary/40 scale-100 ring-2 ring-primary/10' 
                                                                : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 scale-[0.98] opacity-70 hover:opacity-100'
                                                            }`}
                                                        >
                                                            <div className="flex items-start gap-4">
                                                                <div className={`p-3 rounded-xl transition-all duration-300 shrink-0 ${
                                                                    isFeatureActive ? 'bg-primary text-white shadow-md shadow-primary/20 scale-110' : 'bg-primary/10 text-primary group-hover:bg-primary/20'
                                                                }`}>
                                                                    <FeatureIcon size={20} />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <h4 className={`font-black uppercase tracking-tight mb-1.5 leading-tight text-[13px] ${
                                                                        isFeatureActive ? 'text-primary' : 'text-white'
                                                                    }`}>
                                                                        {feature.title}
                                                                    </h4>
                                                                    <p className={`text-xs font-semibold leading-relaxed ${isFeatureActive ? 'text-navy/60' : 'text-white/60'}`}>
                                                                        {feature.desc}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                            {tab.features.map((feature, idx) => {
                                                const FeatureIcon = feature.icon;
                                                return (
                                                    <motion.div
                                                        key={idx}
                                                        initial={{ opacity: 0, y: 15 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: idx * 0.08 }}
                                                        className="group bg-white/70 backdrop-blur-md p-6 rounded-[2rem] border border-navy/5 shadow-sm hover:shadow-xl hover:border-primary/20 hover:translate-y-[-4px] transition-all duration-500"
                                                    >
                                                        <div className="flex items-start gap-4">
                                                            <div className="bg-primary/10 text-primary p-3 rounded-xl group-hover:bg-primary group-hover:text-white transition-colors duration-300 shrink-0">
                                                                <FeatureIcon size={22} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-black text-navy text-sm uppercase tracking-tight mb-1.5 leading-tight">
                                                                    {feature.title}
                                                                </h4>
                                                                <p className="text-navy/50 text-sm font-medium leading-relaxed">
                                                                    {feature.desc}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {/* Bottom Counter + CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mt-16 flex flex-col items-center gap-8"
                    >
                        <div className="flex flex-wrap justify-center gap-6">
                            <div className="flex flex-col items-center bg-white/5 backdrop-blur-sm px-8 py-5 rounded-3xl border border-white/10 shadow-sm">
                                <span className="text-4xl font-black text-primary tracking-tighter">30+</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/40 mt-1">Funciones avanzadas</span>
                            </div>
                            <div className="flex flex-col items-center bg-white/5 backdrop-blur-sm px-8 py-5 rounded-3xl border border-white/10 shadow-sm">
                                <span className="text-4xl font-black text-white tracking-tighter">$100</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/40 mt-1">Al año</span>
                            </div>
                            <div className="flex flex-col items-center bg-white/5 backdrop-blur-sm px-8 py-5 rounded-3xl border border-white/10 shadow-sm">
                                <span className="text-4xl font-black text-white tracking-tighter">10s</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/40 mt-1">Para actualizar</span>
                            </div>
                        </div>

                        <a
                            href="/registro"
                            className="bg-primary text-white px-12 py-6 rounded-full font-black text-xl shadow-2xl shadow-primary/30 hover:translate-y-[-4px] active:translate-y-0 transition-all flex items-center gap-3 group"
                        >
                            Activar Contacto Business por $100 <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                        </a>

                         <p className="text-white/30 text-xs font-bold uppercase tracking-widest">Pago anual • Sin comisiones de venta • Soporte prioritario</p>
                    </motion.div>
                </div>
            </section>

            {/* Pricing Section - El sistema que se paga solo */}
            <PricingSection 
                initialPlanId="business" 
                onQuoteClick={() => setIsQuoteModalOpen(true)} 
            />

            {/* FAQ Section Movida debajo del video como solicitó C. Reyes */}
            <AdvancedFAQ 
                items={CONTACTO_BUSINESS_FAQS}
                title={<>ANTES DE HACER CLIC EN COMPRAR <span className="text-primary italic">entiende esto.</span></>}
                subtitle="Respuestas directas. Toca cualquier interrogante y destruiremos tus dudas cara a cara."
                sectionTag="⚠️ LECTURA OBLIGATORIA"
            />



            {/* Sección: Carrusel de Banners de Conversión Estratégica */}
            <section className="section-light py-24 bg-surface relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="relative">
                        <AnimatePresence mode="wait">
                            {currentSlide === 0 && (
                                <motion.div
                                    key="slide-whatsapp-pro"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center text-center lg:text-left"
                                >
                                    {/* Slide 1: WhatsApp Pro-Tip */}
                                    <div className="relative z-10">
                                        <div className="inline-block bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-6">
                                            ✨ MÉTODO PRO
                                        </div>
                                        <h2 className="text-4xl md:text-5xl font-black text-navy uppercase tracking-tighter leading-none mb-6">
                                            COMPÁRTELO POR <span className="text-primary italic">WHATSAPP</span>
                                        </h2>
                                        <div className="relative mb-8 text-left">
                                            <div className="absolute left-0 top-0 w-1.5 h-full bg-primary rounded-full hidden lg:block"></div>
                                            <p className="text-xl text-navy/70 font-bold italic lg:pl-8">
                                                &quot;Cuando un cliente te escriba por WhatsApp, no solo le des tu número. Envíale este mensaje junto con tu contacto digital de ActivaQR:&quot;
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                                            <div className="flex items-center gap-2 text-navy/80 font-black uppercase text-[10px] tracking-widest bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 italic">
                                                <div className="w-5 h-5 bg-[#66bf19] text-white rounded-full flex items-center justify-center text-[10px] shadow-sm">✓</div>
                                                Ideal para clientes de Instagram
                                            </div>
                                            <div className="flex items-center gap-2 text-navy/80 font-black uppercase text-[10px] tracking-widest bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                                                <div className="w-5 h-5 bg-[#66bf19] text-white rounded-full flex items-center justify-center text-[10px] shadow-sm">✓</div>
                                                Profesionalismo
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <div className="absolute -inset-10 bg-gradient-to-tr from-primary/20 to-green-500/10 blur-3xl opacity-30"></div>
                                        <div className="relative bg-[#efeae2] rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border-[10px] border-navy overflow-hidden aspect-[9/12] max-w-[380px] mx-auto group">
                                            <div className="bg-[#075e54] p-5 flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white text-xl">👤</div>
                                                <div className="text-left">
                                                    <div className="text-white font-black text-sm uppercase tracking-tight">Interesado de IG</div>
                                                    <div className="text-[#25d366] text-[10px] font-bold animate-pulse">en línea</div>
                                                </div>
                                            </div>
                                            <div className="p-4 space-y-4 text-left">
                                                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                                                    className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[75%] text-xs font-bold text-navy/80"
                                                >
                                                    &quot;Vi tus productos en Instagram, me puedes enviar tu catálogo?&quot;
                                                </motion.div>
                                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}
                                                    className="bg-[#dcf8c6] p-4 rounded-2xl rounded-tr-none shadow-md border border-navy/5 ml-auto max-w-[90%] relative"
                                                >
                                                    <p className="text-[11px] leading-relaxed text-navy font-medium whitespace-pre-line">
                                                        ✨ ¡Hola! Gracias por escribir a <span className="font-black">[Tu Negocio]</span> 🎀
                                                        {"\n\n"}
                                                        Antes de comenzar, para que puedas conocer mejor nuestro trabajo y mantenerte al día con nuestras novedades, te compartimos nuestra información de contacto.
                                                        {"\n\n"}
                                                        👉 <span className="font-black text-primary underline decoration-primary/30">Solo sigue estos pasos:</span>
                                                        {"\n"}
                                                        📎 1. Haz clic en el archivo que te enviamos
                                                        {"\n"}
                                                        📲 2. Guárdalo o impórtalo en tu teléfono
                                                        {"\n"}
                                                        🌐 3. Así tendrás nuestro contacto completo y acceso a nuestras redes.
                                                    </p>
                                                    <div className="text-[8px] text-navy/30 text-right mt-1 font-bold">11:15 p.m. ✓✓</div>
                                                </motion.div>
                                                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.2 }}
                                                    className="bg-[#dcf8c6] p-2 rounded-2xl rounded-tr-none shadow-lg ml-auto max-w-[85%] border-2 border-primary/20"
                                                >
                                                    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 flex items-center gap-3">
                                                        <div className="w-12 h-12 bg-navy rounded-xl flex items-center justify-center text-white shrink-0 shadow-inner">
                                                            <div className="flex flex-col items-center"><span className="text-[8px] font-black opacity-50">FILE</span><span className="text-xs font-black text-primary">VCF</span></div>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-[11px] font-black text-navy truncate">tu-contacto.vcf</div>
                                                            <div className="text-[9px] font-bold text-navy/40">VCF • 28 kB</div>
                                                        </div>
                                                        <div className="w-8 h-8 rounded-full bg-navy/5 flex items-center justify-center text-navy/60">↓</div>
                                                    </div>
                                                </motion.div>
                                            </div>
                                            <div className="absolute bottom-0 left-0 w-full bg-[#f0f2f5] p-3 flex items-center gap-3">
                                                <div className="w-full bg-white rounded-full py-2.5 px-5 text-[11px] text-navy/20 font-bold border border-navy/5 shadow-inner">Escribe un mensaje...</div>
                                                <div className="w-10 h-10 bg-[#075e54] rounded-full flex items-center justify-center text-white shadow-lg shrink-0">➤</div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {currentSlide === 1 && (
                                <motion.div
                                    key="slide-estados"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center text-center lg:text-left"
                                >
                                    {/* Slide 2: Vende por Estados */}
                                    <div className="relative z-10">
                                        <div className="inline-block bg-green-500/10 text-green-600 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-6">
                                            📈 ENGAGEMENT MÁXIMO
                                        </div>
                                        <h2 className="text-4xl md:text-5xl font-black text-navy uppercase tracking-tighter leading-none mb-6">
                                            VENDE POR <span className="text-primary italic">ESTADOS DE WHATSAPP</span>
                                        </h2>
                                        <ul className="space-y-4 mb-8 text-left">
                                            <li className="flex items-start gap-4">
                                                <div className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-1">1</div>
                                                <p className="text-lg text-navy/70 font-bold">Si ellos te agregan y tu los agregas podrán ver tus estados. ¡Mayor engagement y ventas!</p>
                                            </li>
                                            <li className="flex items-start gap-4">
                                                <div className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-1">2</div>
                                                <p className="text-lg text-navy/70 font-bold">Si también los etiquetas, podrán crear difusiones y será más fácil enviar campañas o mensajes personalizados.</p>
                                            </li>
                                        </ul>
                                        <div className="flex gap-4 justify-center lg:justify-start">
                                            <Link href="/registro" className="bg-navy text-white font-black px-8 py-4 rounded-2xl hover:bg-primary transition-all shadow-xl uppercase tracking-widest text-xs">
                                                Probar ahora
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute -inset-10 bg-primary/10 blur-3xl rounded-full"></div>
                                        <img
                                            src="/images/estado%20de%20whatsapp.png"
                                            alt="Estados de WhatsApp"
                                            className="relative rounded-[2rem] shadow-2xl border-4 border-white transform rotate-2 max-w-md mx-auto"
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {currentSlide === 2 && (
                                <motion.div
                                    key="slide-automatizacion"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center text-center lg:text-left"
                                >
                                    {/* Slide 3: Automatización */}
                                    <div className="relative z-10">
                                        <div className="inline-block bg-navy/10 text-navy text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-6">
                                            🚀 PARA NEGOCIOS ESCALABLES
                                        </div>
                                        <h2 className="text-4xl md:text-5xl font-black text-navy uppercase tracking-tighter leading-none mb-6">
                                            LO HACEMOS <span className="text-primary italic">POR TI</span>
                                        </h2>
                                        <p className="text-xl text-navy/70 font-bold mb-8 italic leading-relaxed">
                                            &quot;Si quieres simplemente ver el resultado y no perder meses y mucho dinero intentándolo tú mismo, lo hacemos por ti.&quot;
                                        </p>
                                        <div className="flex gap-4 justify-center lg:justify-start">
                                            <Link href="/registro" className="bg-primary text-white font-black px-10 py-5 rounded-2xl hover:scale-105 transition-all shadow-2xl uppercase tracking-widest text-sm">
                                                QUIERO AUTOMATIZAR
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute -inset-10 bg-navy/5 blur-3xl rounded-full"></div>
                                        <img
                                            src="/images/mockup_laptop_automatizacion_activaqr_1772769734997.png"
                                            alt="Automatización ActivaQR"
                                            className="relative rounded-[2rem] shadow-2xl border-4 border-navy/10 max-w-lg mx-auto"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Controles del Carrusel */}
                        <div className="flex justify-center lg:justify-start items-center gap-6 mt-16">
                            {[0, 1, 2].map((idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentSlide(idx)}
                                    className={`h-3 rounded-full transition-all duration-500 ${currentSlide === idx ? 'w-12 bg-primary' : 'w-3 bg-navy/10 hover:bg-navy/30'}`}
                                    aria-label={`Go to slide ${idx + 1}`}
                                />
                            ))}
                            <div className="ml-4 flex gap-3">
                                <button
                                    onClick={() => setCurrentSlide((prev) => (prev === 0 ? 2 : prev - 1))}
                                    className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-md border border-navy/10 flex items-center justify-center text-navy shadow-lg hover:bg-navy hover:text-white transition-all group active:scale-95"
                                    title="Anterior"
                                >
                                    <span className="group-hover:-translate-x-0.5 transition-transform font-bold">←</span>
                                </button>
                                <button
                                    onClick={() => setCurrentSlide((prev) => (prev === 2 ? 0 : prev + 1))}
                                    className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-md border border-navy/10 flex items-center justify-center text-navy shadow-lg hover:bg-navy hover:text-white transition-all group active:scale-95"
                                    title="Siguiente"
                                >
                                    <span className="group-hover:translate-x-0.5 transition-transform font-bold">→</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                </section>



            {/* Sección: Casos de Éxito (Social Proof Dinámico) */}
            <section className="section-dark py-24 bg-background relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 bg-green-500/10 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest text-green-400 border border-green-500/20 mb-6"
                        >
                            <Star size={14} fill="currentColor" /> Resultados Reales
                        </motion.div>
                        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase mb-6">
                            Profesionales que ya <span className="text-primary italic">están facturando más</span>
                        </h2>
                        <p className="text-white/60 max-w-2xl mx-auto text-lg font-medium">
                            No es solo un enlace, es la seguridad de que tus clientes te tienen a un toque de distancia cuando más te necesitan.
                        </p>
                    </div>

                    {/* Desktop: Grid | Mobile: Carousel (Slide Horizontal) */}
                    <div className="relative">
                        <motion.div
                            className="flex md:grid md:grid-cols-3 gap-6 overflow-x-auto md:overflow-visible pb-12 md:pb-0 snap-x snap-mandatory scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0"
                            animate={{ x: [0, -20, 0] }}
                            transition={{
                                duration: 10,
                                repeat: Infinity,
                                ease: "easeInOut",
                                repeatType: "reverse"
                            }}
                        >
                            {/* Caso 1: Yessy (Enfermería) */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="w-[85vw] md:w-auto shrink-0 snap-center bg-white p-2 rounded-[2.5rem] shadow-xl border border-navy/5 relative group hover:translate-y-[-5px] transition-transform duration-500"
                            >
                                <div className="relative aspect-square w-full rounded-[2rem] overflow-hidden mb-6">
                                    <img
                                        src="/logos_clientes/clientes%20de%20Activa%20QR/Yessy%202026.jpg"
                                        alt="Yessy - Enfermería a domicilio"
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent"></div>
                                    <div className="absolute bottom-6 left-6 right-6">
                                        <p className="text-white font-black text-xl uppercase tracking-tighter">Yessy</p>
                                        <p className="text-primary text-xs font-bold uppercase tracking-widest">Enfermería Pro</p>
                                    </div>
                                </div>
                                <div className="px-6 pb-8">
                                    <div className="flex gap-1 mb-4 text-yellow-500">
                                        <Star size={16} fill="currentColor" />
                                        <Star size={16} fill="currentColor" />
                                        <Star size={16} fill="currentColor" />
                                        <Star size={16} fill="currentColor" />
                                        <Star size={16} fill="currentColor" />
                                    </div>
                                    <p className="text-navy/80 font-medium italic leading-relaxed mb-6">
                                        &quot;Muchos pacientes perdían mi número entre sus chats. Ahora, apenas los visito, escanean mi QR y aparezco primero en su agenda con mi foto. ¡Es impresionante la confianza que da!&quot;
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center text-green-500">
                                                <CheckCircle2 size={16} />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-navy/40">Cliente Verificado</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Caso 2: Las Costillas del Veci (Restaurante) */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="w-[85vw] md:w-auto shrink-0 snap-center bg-white p-2 rounded-[2.5rem] shadow-xl border border-navy/5 relative group hover:translate-y-[-5px] transition-transform duration-500"
                            >
                                <div className="relative aspect-square w-full rounded-[2rem] overflow-hidden mb-6">
                                    <img
                                        src="/logos_clientes/clientes%20de%20Activa%20QR/Las%20costillas%20del%20veci.jpg"
                                        alt="Las Costillas del Veci - Restaurante"
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent"></div>
                                    <div className="absolute bottom-6 left-6 right-6">
                                        <p className="text-white font-black text-xl uppercase tracking-tighter">Costillas del Veci</p>
                                        <p className="text-primary text-xs font-bold uppercase tracking-widest">Gastronomía</p>
                                    </div>
                                </div>
                                <div className="px-6 pb-8">
                                    <div className="flex gap-1 mb-4 text-yellow-500">
                                        <Star size={16} fill="currentColor" />
                                        <Star size={16} fill="currentColor" />
                                        <Star size={16} fill="currentColor" />
                                        <Star size={16} fill="currentColor" />
                                        <Star size={16} fill="currentColor" />
                                    </div>
                                    <p className="text-navy/80 font-medium italic leading-relaxed mb-6">
                                        &quot;Antes entregábamos volantes que terminaban en el suelo. Ahora, los clientes guardan nuestro contacto directo para pedidos a domicilio. La recurrencia de pedidos ha subido notablemente.&quot;
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center text-green-500">
                                                <CheckCircle2 size={16} />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-navy/40">Cliente Verificado</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Caso 3: Loja Garden (Servicios) */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="w-[85vw] md:w-auto shrink-0 snap-center bg-white p-2 rounded-[2.5rem] shadow-xl border border-navy/5 relative group hover:translate-y-[-5px] transition-transform duration-500"
                            >
                                <div className="relative aspect-square w-full rounded-[2rem] overflow-hidden mb-6">
                                    <img
                                        src="/logos_clientes/clientes%20de%20Activa%20QR/Loja%20Garden.jpg"
                                        alt="Loja Garden"
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent"></div>
                                    <div className="absolute bottom-6 left-6 right-6">
                                        <p className="text-white font-black text-xl uppercase tracking-tighter">Loja Garden</p>
                                        <p className="text-primary text-xs font-bold uppercase tracking-widest">Servicios / Eventos</p>
                                    </div>
                                </div>
                                <div className="px-6 pb-8">
                                    <div className="flex gap-1 mb-4 text-yellow-500">
                                        <Star size={16} fill="currentColor" />
                                        <Star size={16} fill="currentColor" />
                                        <Star size={16} fill="currentColor" />
                                        <Star size={16} fill="currentColor" />
                                        <Star size={16} fill="currentColor" />
                                    </div>
                                    <p className="text-navy/80 font-medium italic leading-relaxed mb-6">
                                        &quot;La facilidad para enviar mi contacto por WhatsApp con un solo clic es increíble. Mis clientes valoran la rapidez y la presentación profesional. Ha sido clave para nuestra imagen.&quot;
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center text-green-500">
                                                <CheckCircle2 size={16} />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-navy/40">Cliente Verificado</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>

                    <div className="mt-16 text-center">
                        <div className="inline-flex flex-col sm:flex-row items-center gap-6 p-6 bg-white/50 backdrop-blur-md rounded-3xl border border-navy/5 shadow-inner">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <img key={i} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" src={`/images/user-${i < 4 ? i : 1}.jpg`} alt="Reviewer" />
                                ))}
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-black text-navy uppercase tracking-tighter">Basado en opiniones reales en Google</p>
                                <div className="flex items-center gap-2">
                                    <div className="flex text-yellow-500"><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /></div>
                                    <p className="text-xs font-bold text-navy/50">4.9 / 5.0 Rating General</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="absolute top-1/2 left-0 w-full h-full pointer-events-none opacity-50">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px]"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[150px]"></div>
                </div>
                </section>


            {/* Sección: Logos de Clientes (Confianza Institucional) */}
            <div className="section-light">
                <section className="py-20 bg-white overflow-hidden border-y border-navy/5">
                <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
                    <h3 className="text-xl md:text-2xl font-black text-navy uppercase tracking-tighter italic">
                        <span className="text-primary italic">Decenas de negocios y profesionales</span> ya usan ActivaQR
                    </h3>
                </div>

                {/* Contenedor de Carruseles */}
                <div className="flex flex-col gap-8 relative">
                    {/* Fila 1: Derecha a Izquierda */}
                    <div className="flex overflow-hidden group">
                        <motion.div
                            animate={{ x: ["0%", "-50%"] }}
                            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                            className="flex gap-0 whitespace-nowrap py-4"
                        >
                            <div className="flex gap-8 pr-8 shrink-0">
                                {[
                                    "@pily_vanss.webp", "CITY Shoes.jpg", "Calefones Loja.jpg", "Clínica San Bernardo.png",
                                    "Daniel Rojas - Naluz.jpeg", "Dulce Tradición.jpg", "Estetica Mariaelena Cabrera.png",
                                    "Estilista Julita Gallegos.jpeg", "Fahac.jpg", "Gaby Vera.jpg",
                                    "Jose Arevalo - Confecciones Arevalo  Covatex.webp", "Kaweh.jfif", "La Casa de la tia Omaira.jpg",
                                    "Yessy 2026.jpg"
                                ].map((logo, i) => (
                                    <div key={i} className="w-24 h-24 md:w-32 md:h-32 bg-surface rounded-full p-1 border-2 border-white/5 shadow-sm hover:border-primary/50 transition-colors flex items-center justify-center overflow-hidden shrink-0 grayscale hover:grayscale-0 transition-all duration-500">
                                        <img
                                            src={`/logos_clientes/clientes%20de%20Activa%20QR/${logo.replaceAll(' ', '%20')}`}
                                            alt={`Cliente ActivaQR ${i}`}
                                            className="w-full h-full object-cover rounded-full"
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-8 pr-8 shrink-0" aria-hidden="true">
                                {[
                                    "@pily_vanss.webp", "CITY Shoes.jpg", "Calefones Loja.jpg", "Clínica San Bernardo.png",
                                    "Daniel Rojas - Naluz.jpeg", "Dulce Tradición.jpg", "Estetica Mariaelena Cabrera.png",
                                    "Estilista Julita Gallegos.jpeg", "Fahac.jpg", "Gaby Vera.jpg",
                                    "Jose Arevalo - Confecciones Arevalo  Covatex.webp", "Kaweh.jfif", "La Casa de la tia Omaira.jpg",
                                    "Yessy 2026.jpg"
                                ].map((logo, i) => (
                                    <div key={`dub1-${i}`} className="w-24 h-24 md:w-32 md:h-32 bg-surface rounded-full p-1 border-2 border-white/5 shadow-sm hover:border-primary/50 transition-colors flex items-center justify-center overflow-hidden shrink-0 grayscale hover:grayscale-0 transition-all duration-500">
                                        <img
                                            src={`/logos_clientes/clientes%20de%20Activa%20QR/${logo.replaceAll(' ', '%20')}`}
                                            alt={`Cliente ActivaQR ${i}`}
                                            className="w-full h-full object-cover rounded-full"
                                        />
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Fila 2: Izquierda a Derecha */}
                    <div className="flex overflow-hidden group">
                        <motion.div
                            animate={{ x: ["-50%", "0%"] }}
                            transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                            className="flex gap-0 whitespace-nowrap py-4"
                        >
                            <div className="flex gap-8 pr-8 shrink-0">
                                {[
                                    "Las costillas del veci.jpg", "Loja Garden.jpg", "Lojanias.jpg", "Maricela.png",
                                    "Nelvia Sarmiento.webp", "Sareni.webp", "Sur Bike.jpg", "Tapicería Brito.webp",
                                    "camila.webp", "descarga.jfif", "logo-200-millas.png", "punto smart.jfif", "santa petrona.jpg"
                                ].map((logo, i) => (
                                    <div key={i} className="w-24 h-24 md:w-32 md:h-32 bg-surface rounded-full p-1 border-2 border-white/5 shadow-sm hover:border-primary/50 transition-colors flex items-center justify-center overflow-hidden shrink-0 grayscale hover:grayscale-0 transition-all duration-500">
                                        <img
                                            src={`/logos_clientes/clientes%20de%20Activa%20QR/${logo.replaceAll(' ', '%20')}`}
                                            alt={`Cliente ActivaQR ${i}`}
                                            className="w-full h-full object-cover rounded-full"
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-8 pr-8 shrink-0" aria-hidden="true">
                                {[
                                    "Las costillas del veci.jpg", "Loja Garden.jpg", "Lojanias.jpg", "Maricela.png",
                                    "Nelvia Sarmiento.webp", "Sareni.webp", "Sur Bike.jpg", "Tapicería Brito.webp",
                                    "camila.webp", "descarga.jfif", "logo-200-millas.png", "punto smart.jfif", "santa petrona.jpg"
                                ].map((logo, i) => (
                                    <div key={`dub2-${i}`} className="w-24 h-24 md:w-32 md:h-32 bg-surface rounded-full p-1 border-2 border-white/5 shadow-sm hover:border-primary/50 transition-colors flex items-center justify-center overflow-hidden shrink-0 grayscale hover:grayscale-0 transition-all duration-500">
                                        <img
                                            src={`/logos_clientes/clientes%20de%20Activa%20QR/${logo.replaceAll(' ', '%20')}`}
                                            alt={`Cliente ActivaQR ${i}`}
                                            className="w-full h-full object-cover rounded-full"
                                        />
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Gradientes laterales para suavizar el scroll */}
                    <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
                    <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>
                </div>
            </section>
            </div>





            {/* Sección: La comparación que duele (Movida cerca del Footer) */}
            <section className="section-dark py-24 bg-background relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-4xl md:text-5xl font-black text-white leading-none mb-6 tracking-tighter">
                            La comparación que <span className="text-primary italic">duele.</span>
                        </h2>
                        <p className="text-xl text-white/70 font-medium">
                            Imprimir tarjetas es tirar dinero al tacho. Compara el pasado con el futuro de tu negocio.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Tarjetas Físicas */}
                        <div className="bg-white/5 backdrop-blur-md p-10 rounded-[3rem] border border-white/10 relative group">
                            <div className="absolute top-6 right-8 text-white/10 group-hover:text-red-500/20 transition-colors">
                                <Trash2 size={80} />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-tighter">Tarjetas de Papel</h3>
                            <ul className="space-y-4">
                                {[
                                    "Cuestan $30-$50 cada mil impresiones.",
                                    "Se acaban y debes volver a gastar.",
                                    "Si cambia tu número, todas van a la basura.",
                                    "Si no tienes una a la mano, pierdes la venta.",
                                    "Nadie las guarda; se pierden en cajones."
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-white/60 font-bold">
                                        <XCircle className="text-red-500 shrink-0" size={20} />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* ActivaQR */}
                        <div className="bg-navy p-10 rounded-[3rem] border border-white/10 relative overflow-hidden group shadow-2xl">
                            <div className="absolute -right-10 -bottom-10 bg-primary/20 w-64 h-64 blur-[100px] rounded-full group-hover:bg-primary/40 transition-all" />
                            <div className="absolute top-6 right-8 text-white/5 group-hover:text-primary/20 transition-colors">
                                <Zap size={80} />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-tighter flex items-center gap-3">
                                ActivaQR <span className="bg-primary text-[10px] px-2 py-1 rounded-md tracking-widest">Recomendado</span>
                            </h3>
                            <ul className="space-y-4 text-white/80">
                                {[
                                    "Compartes tu contacto ILIMITADO.",
                                    "Siempre actualizado en tiempo real.",
                                    "Tu foto y marca te hacen reconocible.",
                                    "Instalado directamente en su agenda.",
                                    "Te cuesta solo $0.09 centavos al día."
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 font-bold">
                                        <CheckCircle2 className="text-primary shrink-0" size={20} />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
                </section>



            <FloatingSalesHeader />

            <VideoModal isOpen={isVideoModalOpen} onClose={() => setIsVideoModalOpen(false)} videoId="Iy69aXd7MFI" />
            <PopupManager />
            <EditPortalModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
            <QuoteModal isOpen={isQuoteModalOpen} onClose={() => setIsQuoteModalOpen(false)} />

            {/* Floating Support Button */}
            <motion.a
                href="https://wa.me/593983237491?text=Hola,%20necesito%20soporte%20con%20ActivaQR"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                    opacity: isFloatingVisible ? 1 : 0, 
                    x: isFloatingVisible ? 0 : -20,
                    pointerEvents: isFloatingVisible ? 'auto' : 'none'
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="fixed top-20 left-6 z-40 bg-white/90 backdrop-blur-md border border-navy/10 text-navy px-3 py-2 rounded-xl shadow-2xl flex items-center gap-2 group hover:bg-white transition-all"
            >
                <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center shrink-0 group-hover:bg-green-500 group-hover:text-white transition-colors">
                    <Phone size={16} className="text-green-500 group-hover:text-white transition-colors" />
                </div>
                <div className="text-left hidden sm:block">
                    <p className="text-[9px] font-black text-navy uppercase leading-tight">Soporte</p>
                </div>
            </motion.a>

            <BlogRecommendations 
                recommendedSlugs={[
                    'vivimos-enganados-tarjeta-presentacion-digital-no-vende',
                    'codigo-qr-whatsapp-business',
                    'qr-pago-vs-qr-contacto'
                ]}
            />

            {/* Floating Buttons Container (Responsive) */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                    opacity: isFloatingVisible ? 1 : 0, 
                    y: isFloatingVisible ? 0 : 20,
                    pointerEvents: isFloatingVisible ? 'auto' : 'none'
                }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-40 flex flex-row gap-2 sm:left-6 sm:translate-x-0 sm:w-auto sm:flex-col sm:bottom-6 transition-all"
            >
                {/* Floating Quote Button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsQuoteModalOpen(true)}
                    className="flex-1 sm:flex-none bg-[#0a1124] backdrop-blur-md border border-white/10 text-white px-3 py-2.5 rounded-2xl shadow-2xl flex items-center justify-center sm:justify-start gap-2 group transition-all"
                    style={{ boxShadow: '0 10px 30px -5px rgba(255, 107, 0, 0.3)' }}
                >
                    <div className="w-8 h-8 bg-primary/20 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
                        <FileText size={16} className="text-primary group-hover:text-white transition-colors" />
                    </div>
                    <div className="text-left">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 hidden sm:block">Empresas</p>
                        <p className="text-[11px] font-black text-white uppercase leading-tight">Cotizar</p>
                    </div>
                </motion.button>

                {/* Floating Edit Button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex-1 sm:flex-none bg-white/95 backdrop-blur-md border border-navy/5 text-navy px-3 py-2.5 rounded-2xl shadow-xl flex items-center justify-center sm:justify-start gap-2 group transition-all"
                >
                    <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                        <Edit size={16} className="text-primary group-hover:text-white transition-colors" />
                    </div>
                    <div className="text-left">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-navy/40 hidden sm:block">Actualizar</p>
                        <p className="text-[11px] font-black text-navy uppercase leading-tight">Editar</p>
                    </div>
                </motion.button>
            </motion.div>
        </main>
    );
}


