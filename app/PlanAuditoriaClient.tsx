"use client";

import { useState, useEffect } from "react";
import { Smartphone, Zap, CheckCircle2, Star, ShieldCheck, Phone, FileText, Edit, Mic, Trash2, ArrowRight, XCircle, TrendingDown, Users, QrCode, Download, Globe, Share2, Palette, RefreshCw, MapPin, Mail, Tag, MessageSquare, Database, CircleDollarSign, LineChart, Search, Server, ShoppingCart, Layers, Building2, Utensils, Bus, Store, ChevronLeft, ChevronRight, Gavel, Settings, AlertTriangle } from 'lucide-react';
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
import TemplatePreviewModal from "@/components/TemplatePreviewModal";

const INCLUDED_TABS = [
    {
        id: 'ecosistema',
        label: 'Panel de Control',
        icon: Layers,
        color: 'primary',
        description: 'Todo lo que necesita para saber exactamente qué pasa en cada punto de su operación.',
        features: [
            { icon: LineChart, title: 'Panel en Vivo', desc: 'Reportes, urgentes, felicitaciones y sugerencias en tiempo real.', image: '' },
            { icon: Search, title: 'Expediente por Caso', desc: 'Historial completo, estado y canal de resolución.', image: '' },
            { icon: Zap, title: 'Alertas Críticas', desc: 'Notificación inmediata ante emergencias — no mañana, ahora.', image: '' },
            { icon: FileText, title: 'Informe Semanal Automático', desc: 'Cada lunes a las 7:00 AM listo para decidir.', image: '' },
        ]
    },
    {
        id: 'auditoria',
        label: 'Puntos de Control',
        icon: QrCode,
        color: 'navy',
        description: 'Despliegue rápido en cada sucursal o unidad de su negocio.',
        features: [
            { icon: QrCode, title: 'QR por Punto', desc: 'Habitación, mesa, unidad o sucursal con su marca.', image: '' },
            { icon: Mic, title: 'Evidencia Multimedia', desc: 'Foto, audio, video y ubicación exacta del incidente.', image: '' },
            { icon: ShieldCheck, title: 'Imparcialidad Garantizada', desc: 'Tercero independiente. Sus clientes dicen la verdad.', image: '' },
            { icon: Edit, title: 'Gestión desde el Panel', desc: 'Usted agrega o modifica puntos sin depender de nadie.', image: '' },
        ]
    }
];

const COSTO_OCULTO_CARDS = [
    {
        id: 'hotel',
        sector: 'SECTOR TURISMO',
        desc: '¿Cuántas reservas perdió este mes por una reseña de 3 estrellas que nunca entendió por qué llegó? ¿Cuántos huéspedes no volvieron sin decirle nada a recepción?',
        tagline: 'SU REPUTACIÓN BAJO CONTROL — ANTES DE QUE LLEGUE A INTERNET',
        image: '/images/Reingenierìa/slide_activaqr2/costo_oculto_hotel.webp'
    },
    {
        id: 'restaurante',
        sector: 'SECTOR GASTRONOMÍA',
        desc: '¿Cuántas mesas no volvieron sin decirle nada? ¿Cuántos comentarios entre amigos destruyeron su reputación antes de que usted pudiera hacer algo?',
        tagline: 'CADA MESA IMPORTA — ESPECIALMENTE LAS QUE SE VAN EN SILENCIO',
        image: '/images/Reingenierìa/slide_activaqr2/costo_oculto_restaurante.webp'
    },
    {
        id: 'supermercado',
        sector: 'SECTOR VENTAS / RETAIL',
        desc: '¿Cuántos clientes salieron sin decir nada pero juraron no volver? ¿Cuántos productos vencidos, tratos descorteses o colas interminables están destruyendo su reputación en silencio?',
        tagline: 'LO QUE PASA EN SUS GÓNDOLAS DEFINE LO QUE DICEN DE USTED AFUERA',
        image: '/images/Reingenierìa/slide_activaqr2/costo_oculto_retail.webp'
    },
    {
        id: 'transporte',
        sector: 'SECTOR TRANSPORTE',
        desc: '¿Qué le dijo su conductor al pasajero cuando usted no estaba? ¿Cómo llegó el vehículo a la ruta de hoy? ¿Quién responde cuando el incidente ya está en redes sociales?',
        tagline: 'CADA UNIDAD ES SU NOMBRE — PROTÉJALO ANTES DE QUE SEA NOTICIA',
        image: '/images/Reingenierìa/slide_activaqr2/costo_oculto_transporte.webp'
    },
    {
        id: 'educacion',
        sector: 'SECTOR EDUCACIÓN',
        desc: '¿Qué pasa en el aula cuando el director no está? ¿Qué le cuentan los estudiantes a sus padres que nunca llega a sus oídos? ¿Cómo se entera usted antes de que sea una queja formal?',
        tagline: 'LA CONFIANZA DE LOS PADRES SE GANA TODOS LOS DÍAS — O SE PIERDE EN SILENCIO',
        image: '/images/Reingenierìa/slide_activaqr2/costo_oculto_educacion.webp'
    }
];

const FEATURE_CAROUSEL_DATA = [
    {
        id: 1,
        title: "IMPARCIALIDAD ABSOLUTA",
        subtitle: "NO SEA JUEZ Y PARTE.",
        desc: "Un tercero independiente garantiza la objetividad. Sus clientes dicen la verdad porque no nos temen.",
        extendedDesc: "Cuando usted audita a su propio equipo, existe un sesgo natural. El personal tiende a ocultar fallas y los clientes a menudo callan por no generar conflicto directo. ActivaQR actúa como un mediador neutral: capturamos la opinión honesta del cliente sin filtros corporativos, entregándole a usted una radiografía real y sin adornos de su operación.",
        icon: Gavel,
        image: "/images/Reingenierìa/feature_audit_1.webp",
        btnText: "SOLICITAR AUDITORÍA"
    },
    {
        id: 2,
        title: "CONTINUIDAD OPERATIVA",
        subtitle: "SU EMPRESA SIGUE TRABAJANDO.",
        desc: "Implementación inmediata sin interrumpir su operación. Auditamos en silencio.",
        extendedDesc: "Olvídese de instalaciones complejas de cámaras, cableados o capacitaciones tediosas que detienen su flujo de caja. Nuestro sistema se despliega en menos de 24 horas. Mientras su equipo se enfoca en atender y vender, nosotros nos encargamos de vigilar los estándares de calidad en segundo plano, sin estorbar ni un segundo de su productividad.",
        icon: Settings,
        image: "/images/Reingenierìa/feature_audit_2.webp",
        btnText: "DESPLEGAR AHORA"
    },
    {
        id: 3,
        title: "RECOLECCIÓN DE DATA",
        subtitle: "VOZ REAL EN TIEMPO REAL.",
        desc: "Procesamos el 100% de los reportes y audios para que usted solo reciba hallazgos críticos.",
        extendedDesc: "Escuchar 500 audios de quejas es imposible para un dueño de negocio. Por eso, nosotros recolectamos cada palabra, cada tono de voz y cada imagen, procesándolos para extraer solo los puntos que requieren su atención. Usted no recibe 'datos basura', recibe inteligencia accionable clasificada por urgencia y sector.",
        icon: Mic,
        image: "/images/Reingenierìa/feature_audit_3.webp",
        btnText: "VER TECNOLOGÍA"
    },
    {
        id: 4,
        title: "PROTECCIÓN REPUTACIONAL",
        subtitle: "EVITE EL RIESGO PÚBLICO.",
        desc: "Capturamos el descontento en privado antes de que llegue a redes sociales.",
        extendedDesc: "En la era digital, una sola mala experiencia puede viralizarse en minutos. ActivaQR funciona como un pararrayos de crisis: le damos al cliente un canal de desahogo profesional y directo con la gerencia. Esto evita que el cliente busque 'venganza' en Google Maps o TikTok, permitiéndole a usted resolver el problema antes de que se convierta en una mancha pública.",
        icon: AlertTriangle,
        image: "/images/Reingenierìa/feature_audit_4.webp",
        btnText: "PROTEGER MI MARCA"
    }
];

const TEMPLATES_LIST = [
    { id: 'classic', name: 'Activa Clásico', desc: 'Funcional y Directo' },
    { id: 'hedkandi', name: 'Hedkandi', desc: 'Premium & Visual' },
    { id: 'nexus-logistics', name: 'Logística', desc: 'Flotas y Transporte' },
    { id: 'grand-horizon', name: 'Hotel', desc: 'Hospitalidad y Reservas' },
    { id: 'elite-taxi', name: 'Taxis', desc: 'Transporte VIP' },
    { id: 'industrial', name: 'Industrial', desc: 'Operaciones B2B' },
    { id: 'carrocerias', name: 'Carrocerías', desc: 'Talleres Automotrices' }
];

const Layouts = Globe; // Fallback helper

export default function PlanAuditoriaClient() {
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
    const [activeIncludedTab, setActiveIncludedTab] = useState('ecosistema');
    const [activeCostoSlide, setActiveCostoSlide] = useState(0);
    const [activeFeatureSlide, setActiveFeatureSlide] = useState(0);
    const [activeTemplateSlide, setActiveTemplateSlide] = useState(0);
    const [selectedTemplateForPreview, setSelectedTemplateForPreview] = useState<{id: string, name: string} | null>(null);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

    const AUDITORIA_FAQS: FAQItem[] = [
        {
            id: "faq-formulario",
            tag: "OBJECIONES",
            q: "¿No podría hacerlo yo mismo con un formulario de Google?",
            bullets: [
                "Puede. Pero su equipo sabe que usted lo revisa — y eso cambia las respuestas.",
                "ActivaQR es un tercero independiente. Sus clientes dicen lo que realmente piensan.",
                "Usted no puede ser juez y parte."
            ],
            videoSourceType: "bunny",
            videoUrl: "b473d784-04bc-47f4-bcae-c2bd51752b31",
            ctaText: "Agendar Consultoría Pro"
        },
        {
            id: "faq-2am",
            tag: "ALERTAS",
            q: "¿Qué pasa si un reporte es urgente a las 2 AM?",
            bullets: [
                "Recibe la alerta en el momento al número que designe.",
                "El sistema no duerme. Usted sí puede."
            ],
            videoSourceType: "bunny",
            videoUrl: "9278c314-648f-4220-b1d4-b2c94535ffa8"
        },
        {
            id: "faq-soporte",
            tag: "OPERACIÓN",
            q: "¿Necesito contratar a alguien para operarlo?",
            bullets: [
                "No. El setup inicial lo configuramos nosotros.",
                "Desde ahí usted gestiona todo desde el panel — sin soporte técnico permanente."
            ],
            videoSourceType: "bunny",
            videoUrl: "9278c314-648f-4220-b1d4-b2c94535ffa8"
        }
    ];
    // Removed unused carrusel state
    const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);

    useEffect(() => {
        // Auto-play para el carrusel de las pestañas interactivas (3.5 segundos)
        const currentTab = INCLUDED_TABS.find(t => t.id === activeIncludedTab);
        const interactiveTabs = ['ecosistema', 'auditoria'];
        if (currentTab && interactiveTabs.includes(activeIncludedTab)) {
           setActiveFeatureIndex(0);
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
        // Auto-play para el slider de Costo Oculto (8 segundos - narración profunda)
        const timer = setInterval(() => {
            setActiveCostoSlide((prev) => (prev + 1) % COSTO_OCULTO_CARDS.length);
        }, 8000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        // Auto-play para el carrusel de Funcionalidades Premium (5 segundos)
        const timer = setInterval(() => {
            setActiveFeatureSlide((prev) => (prev + 1) % FEATURE_CAROUSEL_DATA.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

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
        <main className="min-h-screen bg-cream selection:bg-primary/30 scroll-smooth relative overflow-x-hidden font-sans text-navy">

            {/* Hero Section: Premium Horizontal Split */}
            <section className="relative min-h-screen w-full overflow-hidden flex items-center bg-surface section-light">
                {/* Background Image Container - Right Aligned & Full Height */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/Reingenierìa/portada_laptop_supermercado.webp"
                        alt="OBJETIVO - Motor Digital E-commerce"
                        className="w-full h-full object-cover"
                    />
                    {/* Subtle Overlay to ensure overall branding consistency */}
                    <div className="absolute inset-0 bg-cream/20 lg:bg-transparent"></div>
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
                            <span className="text-[10px] font-black uppercase tracking-widest">HOTELES • RESTAURANTES • FLOTAS • SUCURSALES</span>
                        </motion.div>
    
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-3xl md:text-5xl lg:text-7xl font-black text-navy leading-[0.95] mb-8 tracking-tighter uppercase italic"
                        >
                            Auditamos su negocio para que sepa qué pasa cuando <span className="text-primary">usted no está presente.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg md:text-2xl text-navy/70 mb-10 leading-tight font-bold max-w-2xl"
                        >
                            Deje de adivinar. Obtenga ojos en cada rincón de su operación con auditoría en tiempo real impulsada por sus propios clientes.
                        </motion.p>
    
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-col sm:flex-row gap-5 justify-start items-center"
                        >
                            <a
                                href="/registro?plan=auditoria"
                                className="w-full sm:w-auto bg-primary text-white px-10 py-6 rounded-full font-black text-xl shadow-2xl shadow-primary/30 hover:translate-y-[-4px] active:translate-y-0 transition-all flex items-center justify-center gap-3 group"
                            >
                                Auditar mi Negocio ahora <ArrowRight size={24} />
                            </a>
                            <a
                                href="#demo-video"
                                className="w-full sm:w-auto bg-navy/5 backdrop-blur-sm text-navy px-10 py-6 rounded-full font-bold text-xl border border-navy/10 hover:bg-white transition-all flex items-center justify-center gap-3"
                            >
                                <Phone size={24} className="text-primary" /> Ver demo
                            </a>
                        </motion.div>
    
                        {/* Social Proof Text */}
                        <div className="mt-12 flex items-center gap-4 text-navy/40 font-black uppercase tracking-tighter text-[10px]">
                            <div className="flex text-primary">
                                <Star size={14} fill="currentColor" />
                                <Star size={14} fill="currentColor" />
                                <Star size={14} fill="currentColor" />
                                <Star size={14} fill="currentColor" />
                                <Star size={14} fill="currentColor" />
                            </div>
                            <span>Más de 500 empresas ya saben exactamente dónde están ganando y perdiendo</span>
                        </div>
                    </motion.div>
                </div>
            </section>
            
            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* SECCIÓN: FUNCIONALIDADES PREMIUM (Carousel 3D)                */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <section className="py-24 bg-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest text-primary border border-primary/20 mb-6"
                        >
                            <Zap size={14} /> FUNCIONALIDADES PREMIUM
                        </motion.div>
                        <h2 className="text-3xl md:text-6xl font-black text-navy tracking-tighter uppercase mb-6 leading-none">
                            TOME EL CONTROL <span className="text-primary italic">TOTAL</span>
                        </h2>
                        <p className="text-navy/60 max-w-2xl mx-auto text-xl font-medium">
                            Nuestra tecnología está diseñada para darle ojos en cada rincón de su negocio.
                        </p>
                    </div>

                    <div className="relative h-[700px] flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center justify-between z-20 pointer-events-none px-4">
                            <button 
                                onClick={() => setActiveFeatureSlide((prev) => (prev > 0 ? prev - 1 : FEATURE_CAROUSEL_DATA.length - 1))}
                                className="w-14 h-14 bg-white/90 backdrop-blur-md rounded-full shadow-2xl flex items-center justify-center text-navy hover:bg-primary hover:text-white transition-all pointer-events-auto border border-navy/5"
                            >
                                <ChevronLeft size={28} />
                            </button>
                            <button 
                                onClick={() => setActiveFeatureSlide((prev) => (prev < FEATURE_CAROUSEL_DATA.length - 1 ? prev + 1 : 0))}
                                className="w-14 h-14 bg-white/90 backdrop-blur-md rounded-full shadow-2xl flex items-center justify-center text-navy hover:bg-primary hover:text-white transition-all pointer-events-auto border border-navy/5"
                            >
                                <ChevronRight size={28} />
                            </button>
                        </div>

                        <div className="relative w-full h-full flex items-center justify-center perspective-[2000px]">
                            <AnimatePresence mode="popLayout">
                                {FEATURE_CAROUSEL_DATA.map((item, index) => {
                                    const offset = index - activeFeatureSlide;
                                    const absOffset = Math.abs(offset);
                                    const isActive = index === activeFeatureSlide;
                                    
                                    // Solo mostrar las 3 cartas centrales por rendimiento y limpieza visual
                                    if (absOffset > 1) return null;

                                    return (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, scale: 0.8, x: offset * 400 }}
                                            animate={{
                                                x: offset * 320, // Distancia entre cartas
                                                scale: isActive ? 1 : 0.85,
                                                zIndex: 10 - absOffset,
                                                opacity: 1,
                                                rotateY: offset * -25, // Efecto 3D
                                                filter: isActive ? 'blur(0px)' : 'blur(2px)',
                                            }}
                                            exit={{ opacity: 0, scale: 0.5 }}
                                            transition={{ type: "spring", stiffness: 200, damping: 25 }}
                                            className="absolute w-[350px] sm:w-[450px] h-[650px] cursor-pointer"
                                            onClick={() => setActiveFeatureSlide(index)}
                                        >
                                            <div className="relative w-full h-full rounded-[3.5rem] overflow-hidden border-2 border-white/10 shadow-[0_0_40px_rgba(255,107,0,0.15)] bg-navy group">
                                                {/* Imagen de Fondo */}
                                                <img 
                                                    src={item.image} 
                                                    alt={item.title}
                                                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000"
                                                />
                                                
                                                {/* Gradiente Overlay */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/20 to-transparent"></div>

                                                {/* Contenido Central (Estilo Ultra-Conciso con Expandible) */}
                                                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 sm:p-10 text-center">
                                                    <div className="w-full bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[3.5rem] p-8 py-12 shadow-2xl relative overflow-hidden group/card max-h-[600px] flex flex-col items-center justify-center">
                                                        {/* Icono Visual Gigante */}
                                                        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-8 border border-primary/30 group-hover/card:scale-110 transition-transform duration-500 shadow-[0_0_50px_rgba(246,103,57,0.2)]">
                                                            <item.icon size={40} className="text-primary" />
                                                        </div>

                                                        {/* Brillo dinámico superior */}
                                                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
                                                        
                                                        <h3 className="text-2xl sm:text-4xl font-black text-white mb-2 leading-none tracking-tighter uppercase italic">{item.title}</h3>
                                                        <p className="text-primary font-black text-[11px] tracking-[0.3em] mb-8 uppercase italic leading-none">{item.subtitle}</p>
                                                        
                                                        <div className="relative transition-all duration-500 max-w-[320px] mx-auto">
                                                            <p className="text-white/90 text-[16px] font-bold mb-4 leading-tight tracking-tight">
                                                                {item.desc}
                                                            </p>
                                                            
                                                            <p className="text-white/60 text-[13px] font-medium leading-relaxed mb-8 pt-4 border-t border-white/10">
                                                                {item.extendedDesc}
                                                            </p>
                                                        </div>

                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                // Si ya es la slide activa, el click en el botón podría hacer scroll o CTA
                                                                // El texto ya se expande automáticamente si es la slide activa en este diseño
                                                            }}
                                                            className="w-full py-4 bg-white text-navy font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-2xl hover:bg-primary hover:text-white transition-all duration-300 mt-auto"
                                                        >
                                                            {item.btnText}
                                                        </motion.button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                        
                        {/* Dots */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 z-30">
                            {FEATURE_CAROUSEL_DATA.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveFeatureSlide(i)}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${i === activeFeatureSlide ? 'w-10 bg-primary' : 'w-4 bg-navy/20 hover:bg-navy/40'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>



            {/* Sección Separadora con Imagen Fija (Fixed Background) */}
            <section
                className="relative h-[70vh] w-full bg-fixed bg-center bg-cover bg-no-repeat section-dark"
                style={{ backgroundImage: 'url("/images/Reingenierìa/slide_activaqr2/parallax.webp")' }}
            >
                <div className="absolute inset-0 bg-navy/30 backdrop-blur-[2px]"></div>
                
                {/* Texto Aspiracional (Opcional pero recomendado para el Pipeline) */}
                <div className="absolute inset-0 flex items-center justify-center text-center px-6">
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-white text-3xl md:text-5xl font-black uppercase italic tracking-tighter drop-shadow-2xl"
                    >
                        El control total no es un lujo. <br/>
                        <span className="text-primary italic">Es su ventaja competitiva.</span>
                    </motion.h2>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* SECCIÓN 2: EL COSTO OCULTO (Full-Width Immersive Experience)  */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <section className="relative w-full min-h-screen bg-navy overflow-hidden flex items-center justify-center section-dark">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeCostoSlide}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        className="absolute inset-0 w-full h-full"
                    >
                        {/* Imagen de Fondo Full-Screen */}
                        <div className="absolute inset-0 w-full h-full">
                            <img 
                                src={COSTO_OCULTO_CARDS[activeCostoSlide].image} 
                                alt={COSTO_OCULTO_CARDS[activeCostoSlide].sector}
                                className="w-full h-full object-cover opacity-70"
                            />
                            {/* Overlay de profundidad optimizado */}
                            <div className="absolute inset-0 bg-gradient-to-b from-navy/40 via-transparent to-navy/60"></div>
                        </div>

                        {/* Contenedor de la Card Glassmórfica (Estilo Compacto y Enfocado) */}
                        <div className="relative z-10 w-full h-full flex items-center justify-center px-6">
                            <motion.div
                                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: 0.2, duration: 0.6 }}
                                className="w-full max-w-[850px] bg-white/[0.03] backdrop-blur-[40px] border border-white/10 rounded-[3rem] p-8 md:p-16 shadow-[0_0_120px_rgba(0,0,0,0.6)] border-t-white/20 relative overflow-hidden text-center"
                            >
                                {/* Resplandor interior */}
                                <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/20 blur-[80px] rounded-full"></div>
                                
                                {/* Etiqueta Superior */}
                                <div className="inline-flex items-center gap-2 bg-primary px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white mb-8 shadow-lg shadow-primary/20">
                                    <TrendingDown size={14} /> EL COSTO DE NO SABER
                                </div>
                                
                                <h2 className="text-4xl md:text-5xl font-black text-white leading-[1] mb-4 tracking-tighter uppercase italic">
                                    {COSTO_OCULTO_CARDS[activeCostoSlide].sector}
                                </h2>
                                
                                <p className="text-primary font-black text-[10px] tracking-[0.4em] mb-10 uppercase italic leading-none opacity-90">
                                    {COSTO_OCULTO_CARDS[activeCostoSlide].tagline.split(' — ')[0]}
                                </p>
                                
                                <p className="text-lg md:text-xl text-white/90 font-medium mb-8 leading-relaxed max-w-2xl mx-auto">
                                    {COSTO_OCULTO_CARDS[activeCostoSlide].desc}
                                </p>

                                {/* Botón CTA integrado en la card */}
                                <motion.div className="mt-12">
                                    <Link 
                                        href="/registro?plan=auditoria"
                                        className="inline-flex w-full items-center justify-center gap-3 bg-white text-navy px-8 py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-xl hover:bg-primary hover:text-white transition-all duration-500"
                                    >
                                        AUDITAR MI NEGOCIO AHORA
                                    </Link>
                                </motion.div>
                            </motion.div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Navegación del Slider (Estilo Premium Floating) */}
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex items-center gap-12">
                    <button 
                        onClick={() => setActiveCostoSlide(prev => (prev - 1 + COSTO_OCULTO_CARDS.length) % COSTO_OCULTO_CARDS.length)}
                        className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-navy hover:scale-110 transition-all duration-300 backdrop-blur-md bg-white/5"
                    >
                        <ChevronLeft size={28} />
                    </button>
                    
                    <div className="flex gap-4">
                        {COSTO_OCULTO_CARDS.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveCostoSlide(i)}
                                className={`h-2 rounded-full transition-all duration-500 ${activeCostoSlide === i ? 'w-16 bg-primary' : 'w-4 bg-white/20 hover:bg-white/40'}`}
                            />
                        ))}
                    </div>

                    <button 
                        onClick={() => setActiveCostoSlide(prev => (prev + 1) % COSTO_OCULTO_CARDS.length)}
                        className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-navy hover:scale-110 transition-all duration-300 backdrop-blur-md bg-white/5"
                    >
                        <ChevronRight size={28} />
                    </button>
                </div>
            </section>




            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* Sección: Qué incluye tu Plan Sitio Web (NUEVA)              */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <section className="py-24 bg-surface relative overflow-hidden section-light" id="que-incluye">
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
                            <span className="text-[10px] font-black uppercase tracking-widest">ECOSISTEMA COMPLETO • AUDITORÍA PRO</span>
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-black text-navy tracking-tighter leading-none mb-6"
                        >
                            Lo que incluye su <span className="text-primary italic">Auditoría ActivaQR.</span>
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-navy/60 font-medium max-w-2xl mx-auto leading-relaxed"
                        >
                            Todo lo que necesita para saber exactamente qué pasa en cada punto de su operación.
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
                                            ? 'bg-navy text-white shadow-2xl shadow-navy/20 scale-105'
                                            : 'bg-white/60 backdrop-blur-sm text-navy/50 border border-navy/10 hover:bg-white hover:text-navy hover:border-navy/20'
                                    }`}
                                >
                                    <Icon size={18} className={isActive ? 'text-primary' : ''} />
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
                                    {['dashboard', 'control', 'alertas', 'historico'].includes(activeIncludedTab) ? (
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
                                                            <div className="w-full h-full flex flex-col items-center justify-center bg-navy/5 text-navy/20 p-10 text-center">
                                                                <tab.icon size={64} strokeWidth={1} className="mb-4 opacity-20" />
                                                                <p className="font-bold text-sm uppercase tracking-widest">{tab.label}</p>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                </AnimatePresence>
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
                                                                : 'bg-white/40 border-navy/5 hover:bg-white/80 hover:border-navy/10 scale-[0.98] opacity-70 hover:opacity-100'
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
                                                                        isFeatureActive ? 'text-primary' : 'text-navy'
                                                                    }`}>
                                                                        {feature.title}
                                                                    </h4>
                                                                    <p className="text-navy/60 text-xs font-semibold leading-relaxed">
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
                                                                        <p className="text-navy/60 text-xs font-semibold leading-relaxed">
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
                        </div>
                    </section>

                    {/* SECCIÓN: Logos de Clientes (Confianza Institucional) */}
                    <section className="py-20 bg-white overflow-hidden border-y border-navy/5 section-light">
                        <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
                            <h3 className="text-xl md:text-2xl font-black text-navy uppercase tracking-tighter italic">
                                <span className="text-primary italic">Decenas de negocios y profesionales</span> ya usan ActivaQR
                            </h3>
                        </div>

                        <div className="flex flex-col gap-8 relative">
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
                                            <div key={i} className="w-24 h-24 md:w-32 md:h-32 bg-cream rounded-full p-1 border-2 border-navy/5 shadow-sm hover:border-primary/50 transition-colors flex items-center justify-center overflow-hidden shrink-0 grayscale hover:grayscale-0 transition-all duration-500">
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
                                            <div key={`dub1-${i}`} className="w-24 h-24 md:w-32 md:h-32 bg-cream rounded-full p-1 border-2 border-navy/5 shadow-sm hover:border-primary/50 transition-colors flex items-center justify-center overflow-hidden shrink-0 grayscale hover:grayscale-0 transition-all duration-500">
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
                            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
                            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
                        </div>
                    </section>

                    <PricingSection />
                    <AdvancedFAQ items={AUDITORIA_FAQS} />

            <FloatingSalesHeader />

            <VideoModal isOpen={isVideoModalOpen} onClose={() => setIsVideoModalOpen(false)} videoId="Iy69aXd7MFI" />
            <PopupManager />
            <EditPortalModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
            <QuoteModal isOpen={isQuoteModalOpen} onClose={() => setIsQuoteModalOpen(false)} />

            {/* Modal de Vista Previa de Plantillas */}
            {selectedTemplateForPreview && (
                <TemplatePreviewModal 
                    isOpen={isPreviewModalOpen}
                    onClose={() => setIsPreviewModalOpen(false)}
                    templateId={selectedTemplateForPreview.id}
                    templateName={selectedTemplateForPreview.name}
                />
            )}

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
                    'guia-codigo-qr-negocios',
                    'por-que-los-negocios-exitosos-pierden-clientes',
                    'marca-personal-profesionales-independientes'
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


