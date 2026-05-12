"use client";

import { useState, useEffect } from "react";
import {
    CheckCircle2,
    Phone,
    ArrowRight,
    Smartphone,
    MessageSquare,
    ShoppingBag,
    Users,
    Star,
    ShieldCheck,
    ChevronRight,
    BarChart3,
    Edit,
    Monitor,
    Layout,
    CheckCircle,
    FileText,
    Headphones
} from "lucide-react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import VideoModal from "@/components/VideoModal";
import PopupManager from "@/components/PopupManager";
import EditPortalModal from "@/components/EditPortalModal";
import FloatingSalesHeader from "@/components/FloatingSalesHeader";
import QuoteModal from "@/components/QuoteModal";
import { ObjectionSection } from "@/components/ObjectionSection";

const PLANES_DATA = [
    {
        id: 'digital',
        name: 'Contacto Digital',
        subtitle: 'Para Profesionales',
        price: '35',
        period: '/año',
        icon: <Smartphone size={28} />,
        description: 'La puerta de entrada al networking moderno. Ideal para profesionales que buscan una presencia digital impecable y funcional sin complicaciones.',
        features: ['Agenda Digital con Foto', 'Redes Sociales Ilimitadas', 'QR Dinámico Premium', 'Actualizaciones en tiempo real'],
        image: '/images/entrega_contacto.webp',
        color: 'primary',
        cta: 'Empezar ahora',
        link: '/registro?plan=digital'
    },
    {
        id: 'business',
        name: 'Contacto Business',
        subtitle: 'Negocios & Marcas',
        price: '100',
        period: '/año',
        badge: '⭐ Opción Inteligente',
        icon: <MessageSquare size={32} />,
        description: 'Diseñado para negocios que no pueden permitirse perder ni un solo cliente. Automatiza tu atención por WhatsApp y gestiona pagos de forma directa.',
        features: ['Todo lo del plan Digital', 'Actualización en 10s', 'Promociones del Día', 'Links de Pago Directo', 'Bot de atención rápida'],
        image: '/images/hombre_inteligente.webp',
        color: 'primary',
        cta: 'Activar Negocio',
        link: '/registro?plan=business',
        isFeatured: true
    },
    {
        id: 'catalogo',
        name: 'Business + Catálogo',
        subtitle: 'Para Ventas Online',
        price: '200',
        period: '/año',
        icon: <ShoppingBag size={28} />,
        description: 'Convierte tu tarjeta en una tienda funcional. Muestra tus productos con fotos, precios y recibe pedidos directos a tu WhatsApp listos para facturar.',
        features: ['Todo lo del plan Business', 'Catálogo con Foto y Precio', 'Pedidos vía WhatsApp', 'Gestión de Inventario simple', 'Botón de compra rápida'],
        image: '/images/clientes_nuevos.webp',
        color: 'primary',
        cta: 'Crear Catálogo',
        link: '/registro?plan=catalogo'
    },
    {
        id: 'web',
        name: 'Sitio Web Completo',
        subtitle: 'White Glove Service',
        price: '1,000',
        period: '/único',
        icon: <Monitor size={28} />,
        description: 'Cuando un QR no es suficiente. Construimos tu ecosistema digital completo con diseño a medida, SEO y herramientas de conversión avanzadas.',
        features: ['Hasta 8 secciones Pro', 'E-commerce & Pasarela', 'SEO & Carga Ultrarrápida', 'Soporte Premium 24/7', 'Integración con CRM'],
        image: '/images/mockup_laptop_automatizacion_activaqr_1772769734997.png',
        color: 'navy',
        cta: 'Solicitar Cotización',
        link: null
    }
];

export default function HomeClient() {
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
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [selectedPlanId, setSelectedPlanId] = useState('business');
    
    const selectedPlan = PLANES_DATA.find(p => p.id === selectedPlanId) || PLANES_DATA[1];


    useEffect(() => {
        // Auto-play para el carrusel (5 segundos)
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev === 2 ? 0 : prev + 1));
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
            <section className="relative min-h-screen w-full overflow-hidden flex items-center bg-cream">
                {/* Background Image Container - Right Aligned & Full Height */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/Reingenierìa/v2_tarjetas_mano.webp"
                        alt="ActivaQR - El poder del contacto digital"
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
                            <span className="text-[10px] font-black uppercase tracking-widest">Sistema Validado • 2024</span>
                        </motion.div>
    
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl lg:text-8xl font-black text-navy leading-[0.9] mb-8 tracking-tighter"
                        >
                            Tu negocio en su agenda, <span className="text-primary italic">hoy mismo.</span>
                        </motion.h1>
    
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl md:text-2xl text-navy/80 mb-12 leading-tight font-bold max-w-xl"
                        >
                            Deja de repartir papeles que terminan en el suelo. Con ActivaQR tu negocio se instala directamente en la agenda de tus clientes.
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
                                Empezar ahora <ArrowRight size={24} />
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
                            <span>Más de 1,000 profesionales ya no usan papel</span>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Sección Separadora con Imagen Fija (Fixed Background) */}
            <section
                className="relative h-screen md:h-[500px] w-full bg-fixed bg-left md:bg-center bg-cover bg-no-repeat"
                style={{ backgroundImage: 'url("/images/ActivaQR_hero.webp")' }}
            >
            </section>

            {/* Sección de Reflexión: Gasto en Publicidad */}
            <section className="bg-navy py-24 px-6 min-h-[600px] flex items-center relative overflow-hidden">
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-white text-4xl md:text-5xl font-black uppercase tracking-tighter mb-10 leading-tight"
                    >
                        ¿Cuánto gastaste el mes pasado en volantes, diseños <span className="text-primary italic">o publicidad?</span>
                    </motion.h2>
                </div>
                
                {/* Decoradores Sutiles */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
            </section>

            {/* Sección: Video Demo */}
            <section id="demo-video" className="py-24 bg-white relative overflow-hidden">
                <div className="max-w-6xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest text-primary border border-primary/20 mb-6"
                        >
                            Obtenlo hoy mismo
                        </motion.div>
                        <h2 className="text-3xl md:text-5xl font-black text-navy tracking-tighter uppercase mb-6">
                            Mira cómo funciona <span className="text-primary italic">en menos de 1 minuto</span>
                        </h2>
                        <p className="text-navy/60 max-w-2xl mx-auto text-lg font-medium">
                            Te mostramos cómo esta herramienta elimina la informalidad al entregar tu contacto y asegura que tus clientes siempre te encuentren.
                        </p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative aspect-video w-full max-w-5xl mx-auto rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white group"
                    >
                        <iframe
                            width="100%"
                            height="100%"
                            src="https://www.youtube.com/embed/Iy69aXd7MFI?autoplay=0&rel=0"
                            title="Cómo funciona ActivaQR"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            className="absolute inset-0 w-full h-full"
                        ></iframe>
                        <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-navy/5 rounded-[2.5rem]"></div>
                    </motion.div>

                    <div className="mt-12 flex justify-center">
                        <div className="flex items-center gap-6 p-4 bg-navy/5 rounded-3xl border border-navy/5 max-w-lg">
                            <div className="bg-primary/20 p-3 rounded-2xl text-primary">
                                <CheckCircle2 size={24} />
                            </div>
                            <p className="text-sm font-bold text-navy/70 uppercase tracking-widest leading-tight">
                                Ideal para <span className="text-primary font-black">profesionales, dueños de negocios y artesanos</span> que no quieren perder ni un cliente más.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-navy/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            </section>


            {/* Sección: Carrusel de Banners de Conversión Estratégica */}
            <section className="py-24 bg-white relative overflow-hidden">
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
                                                "Cuando un cliente te escriba por WhatsApp, no solo le des tu número. Envíale este mensaje junto con tu contacto digital de ActivaQR:"
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
                                                    "Vi tus productos en Instagram, me puedes enviar tu catálogo?"
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
                                            src="/images/estado de whatsapp.png"
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
                                            "Si quieres simplemente ver el resultado y no perder meses y mucho dinero intentándolo tú mismo, lo hacemos por ti."
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
            <section className="py-24 bg-cream relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 bg-green-500/10 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest text-green-600 border border-green-500/20 mb-6"
                        >
                            <Star size={14} fill="currentColor" /> Resultados Reales
                        </motion.div>
                        <h2 className="text-3xl md:text-5xl font-black text-navy tracking-tighter uppercase mb-6">
                            Profesionales que ya <span className="text-primary italic">están facturando más</span>
                        </h2>
                        <p className="text-navy/60 max-w-2xl mx-auto text-lg font-medium">
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
                                        src="/logos_clientes/clientes de Activa QR/Las costillas del veci.jpg"
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
                                        src="/logos_clientes/clientes de Activa QR/Loja Garden.jpg"
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
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-navy/5 rounded-full blur-[150px]"></div>
                </div>
            </section>

            {/* Sección: Beneficios */}
            <section className="py-24 bg-navy text-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <h2 className="text-3xl md:text-5xl font-black mb-16 tracking-tighter">No es una página web.<br /><span className="text-primary italic">Es tu contacto en su agenda.</span></h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white/10 p-8 rounded-3xl backdrop-blur-sm border border-white/5">
                            <div className="bg-primary w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-6 text-2xl">👤</div>
                            <h3 className="text-xl font-bold mb-3">Tu Cara = Memoria</h3>
                            <p className="text-white/60 text-sm leading-relaxed">Nadie guarda números sin nombre. Con ActivaQR quedarás registrado con foto y profesión en su agenda personal.</p>
                        </div>
                        <div className="bg-white/10 p-8 rounded-3xl backdrop-blur-sm border border-white/5">
                            <div className="bg-primary w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-6 text-2xl">🔍</div>
                            <h3 className="text-xl font-bold mb-3">Buscador de Contactos</h3>
                            <p className="text-white/60 text-sm leading-relaxed">Cuando busquen "Abogado" o "Técnico" en su propio celular, aparecerás TÚ antes que cualquier papel.</p>
                        </div>
                        <div className="bg-white/10 p-8 rounded-3xl backdrop-blur-sm border border-white/5">
                            <div className="bg-primary w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-6 text-2xl">🚀</div>
                            <h3 className="text-xl font-bold mb-3">Descarga Cloud</h3>
                            <p className="text-white/60 text-sm leading-relaxed">Ttus clientes descargan tu contacto directo desde nuestro servidor. Siempre actualizado, siempre disponible.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Sección: Logos de Clientes (Confianza Institucional) */}
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
                            className="flex gap-8 whitespace-nowrap py-4"
                        >
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
                            {/* Duplicar para el scroll infinito */}
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
                        </motion.div>
                    </div>

                    {/* Fila 2: Izquierda a Derecha */}
                    <div className="flex overflow-hidden group">
                        <motion.div
                            animate={{ x: ["-50%", "0%"] }}
                            transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                            className="flex gap-8 whitespace-nowrap py-4"
                        >
                            {[
                                "Las costillas del veci.jpg", "Loja Garden.jpg", "Lojanias.jpg", "Maricela.png",
                                "Nelvia Sarmiento.webp", "Sareni.webp", "Sur Bike.jpg", "Tapicería Brito.webp",
                                "camila.webp", "descarga.jfif", "logo-200-millas.png", "punto smart.jfif", "santa petrona.jpg"
                            ].map((logo, i) => (
                                <div key={i} className="w-24 h-24 md:w-32 md:h-32 bg-cream rounded-full p-1 border-2 border-navy/5 shadow-sm hover:border-primary/50 transition-colors flex items-center justify-center overflow-hidden shrink-0 grayscale hover:grayscale-0 transition-all duration-500">
                                    <img
                                        src={`/logos_clientes/clientes%20de%20Activa%20QR/${logo.replaceAll(' ', '%20')}`}
                                        alt={`Cliente ActivaQR ${i}`}
                                        className="w-full h-full object-cover rounded-full"
                                    />
                                </div>
                            ))}
                            {/* Duplicar para el scroll infinito */}
                            {[
                                "Las costillas del veci.jpg", "Loja Garden.jpg", "Lojanias.jpg", "Maricela.png",
                                "Nelvia Sarmiento.webp", "Sareni.webp", "Sur Bike.jpg", "Tapicería Brito.webp",
                                "camila.webp", "descarga.jfif", "logo-200-millas.png", "punto smart.jfif", "santa petrona.jpg"
                            ].map((logo, i) => (
                                <div key={`dub2-${i}`} className="w-24 h-24 md:w-32 md:h-32 bg-cream rounded-full p-1 border-2 border-navy/5 shadow-sm hover:border-primary/50 transition-colors flex items-center justify-center overflow-hidden shrink-0 grayscale hover:grayscale-0 transition-all duration-500">
                                    <img
                                        src={`/logos_clientes/clientes%20de%20Activa%20QR/${logo.replaceAll(' ', '%20')}`}
                                        alt={`Cliente ActivaQR ${i}`}
                                        className="w-full h-full object-cover rounded-full"
                                    />
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Gradientes laterales para suavizar el scroll */}
                    <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
                    <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
                </div>
            </section >
            
            {/* Testimonials Section */}
            <section className="py-24 bg-white relative overflow-hidden" id="testimonios">
                <div className="max-w-6xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest text-primary border border-primary/20 mb-6"
                        >
                            <Star size={14} fill="currentColor" className="text-primary/80" /> Resultados Reales
                        </motion.div>
                        <h2 className="text-4xl md:text-5xl font-black text-navy uppercase tracking-tighter mb-4">
                            Profesionales que ya están <span className="text-primary italic">facturando más</span>
                        </h2>
                        <p className="text-navy/60 font-medium max-w-2xl mx-auto text-lg">
                            No es solo un enlace, es la seguridad de que tus clientes te tienen a un toque de distancia cuando más te necesitan.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mb-16">
                        {/* Yessy */}
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-cream/50 p-8 rounded-[2rem] border border-navy/5 relative"
                        >
                            <div className="text-primary mb-6"><Star size={24} fill="currentColor" /></div>
                            <p className="text-navy/80 font-medium leading-relaxed italic mb-8">
                                "Muchos pacientes perdían mi número entre sus chats. Ahora, apenas los visito, escanean mi QR y aparezco primero en su agenda con mi foto. ¡Es impresionante la confianza que da!"
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-navy/10 rounded-full flex items-center justify-center text-xl">👤</div>
                                <div>
                                    <div className="font-black text-navy text-lg">Yessy</div>
                                    <div className="text-primary text-xs font-bold uppercase tracking-widest">Enfermería a domicilio</div>
                                    <div className="text-green-500 text-[10px] uppercase font-black tracking-widest mt-1 flex items-center gap-1">
                                        <CheckCircle2 size={12} /> Cliente Verificado
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Las Costillas del Veci */}
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="bg-cream/50 p-8 rounded-[2rem] border border-navy/5 relative"
                        >
                            <div className="text-primary mb-6"><Star size={24} fill="currentColor" /></div>
                            <p className="text-navy/80 font-medium leading-relaxed italic mb-8">
                                "Antes entregábamos volantes que terminaban en el suelo. Ahora, los clientes guardan nuestro contacto directo para pedidos a domicilio. La recurrencia de pedidos ha subido notablemente."
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-navy/10 rounded-full flex items-center justify-center text-xl">🍖</div>
                                <div>
                                    <div className="font-black text-navy text-lg">Las Costillas del Veci</div>
                                    <div className="text-primary text-xs font-bold uppercase tracking-widest">Restaurante</div>
                                    <div className="text-green-500 text-[10px] uppercase font-black tracking-widest mt-1 flex items-center gap-1">
                                        <CheckCircle2 size={12} /> Cliente Verificado
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Loja Garden */}
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="bg-cream/50 p-8 rounded-[2rem] border border-navy/5 relative"
                        >
                            <div className="text-primary mb-6"><Star size={24} fill="currentColor" /></div>
                            <p className="text-navy/80 font-medium leading-relaxed italic mb-8">
                                "La facilidad para enviar mi contacto por WhatsApp con un solo clic es increíble. Mis clientes valoran la rapidez y la presentación profesional. Ha sido clave para nuestra imagen."
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-navy/10 rounded-full flex items-center justify-center text-xl">🌱</div>
                                <div>
                                    <div className="font-black text-navy text-lg">Loja Garden</div>
                                    <div className="text-primary text-xs font-bold uppercase tracking-widest">Servicios / Eventos</div>
                                    <div className="text-green-500 text-[10px] uppercase font-black tracking-widest mt-1 flex items-center gap-1">
                                        <CheckCircle2 size={12} /> Cliente Verificado
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <div className="flex flex-col items-center justify-center pt-8 border-t border-navy/5">
                        <div className="flex gap-1 text-yellow-400 mb-2">
                            <Star fill="currentColor" size={24} />
                            <Star fill="currentColor" size={24} />
                            <Star fill="currentColor" size={24} />
                            <Star fill="currentColor" size={24} />
                            <Star fill="currentColor" size={24} />
                        </div>
                        <div className="font-black text-navy text-2xl">4.9 / 5.0 <span className="font-medium text-lg text-navy/50">Rating General</span></div>
                        <div className="text-xs text-navy/40 font-bold uppercase tracking-widest mt-1">Basado en opiniones reales en Google</div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-24 bg-cream relative overflow-hidden" id="precios" style={{ position: 'relative', zIndex: 10 }}>
                {/* Background Decorators */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40">
                    <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[120px]"></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-6 outline outline-1 outline-primary/20 shadow-sm"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            Inversión Inteligente
                        </motion.div>
                        <h2 className="text-4xl md:text-7xl font-black text-navy tracking-tighter uppercase mb-6 leading-none">
                            El sistema que <span className="text-primary italic transition-all duration-700 hover:text-royal">se paga solo</span>
                        </h2>
                        <div className="flex flex-col items-center gap-10">
                            <div className="flex flex-wrap justify-center gap-4 text-navy/40 text-[10px] font-black uppercase tracking-[0.2em]">
                                <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-green-500" /> Sin Contratos</span>
                                <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-green-500" /> 7 Días de Garantía</span>
                                <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-green-500" /> Todas las tarjetas</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch relative">
                        {PLANES_DATA.map((plan, index) => (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className={`group relative h-[650px] rounded-[4rem] overflow-hidden border border-white/40 shadow-2xl transition-all duration-700 hover:scale-[1.02] ${
                                    plan.id === 'business' ? 'ring-4 ring-primary/30 z-10' : ''
                                }`}
                            >
                                {/* Background Image - Naluz Showcase Style */}
                                <div className="absolute inset-0 z-0">
                                    <img 
                                        src={plan.image} 
                                        alt={plan.name} 
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                    />
                                    {/* Gradient Overlay to ensure text readability */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-80"></div>
                                </div>

                                {/* Content Overlay (Glassmorphism) */}
                                <div className="absolute bottom-0 left-0 w-full p-6 z-10">
                                    <div className="bg-white/10 backdrop-blur-[30px] border border-white/20 p-8 rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] transform transition-transform duration-500 group-hover:translate-y-[-10px]">
                                        {plan.badge && (
                                            <div className="bg-primary text-white text-[8px] font-black uppercase tracking-[0.25em] px-5 py-2 rounded-full shadow-2xl absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap z-20">
                                                {plan.badge}
                                            </div>
                                        )}
                                        
                                        <div className="mb-4">
                                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-tight drop-shadow-lg">
                                                {plan.name}
                                            </h3>
                                            <p className="text-primary font-black text-[9px] uppercase tracking-[0.25em] mt-1 italic drop-shadow-md">
                                                {plan.subtitle}
                                            </p>
                                        </div>

                                        <div className="flex items-start gap-1 mb-6">
                                            <span className="text-xl font-black text-white mt-1">$</span>
                                            <span className="text-5xl font-black text-white tracking-tighter leading-none">{plan.price}</span>
                                            <span className="text-white/40 text-[10px] font-black uppercase tracking-widest self-end pb-1">{plan.period}</span>
                                        </div>

                                        <div className="space-y-3 mb-8">
                                            {plan.features.slice(0, 3).map((feature, i) => (
                                                <div key={i} className="flex items-center gap-3">
                                                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg">
                                                        <CheckCircle2 size={12} className="text-white" />
                                                    </div>
                                                    <span className="text-white/90 font-bold text-xs truncate">{feature}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {plan.link ? (
                                            <Link href={plan.link} className="block w-full bg-white text-navy py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-center transition-all hover:bg-primary hover:text-white shadow-xl">
                                                {plan.cta}
                                            </Link>
                                        ) : (
                                            <button 
                                                onClick={() => setIsQuoteModalOpen(true)}
                                                className="block w-full bg-primary text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-center transition-all hover:bg-white hover:text-navy shadow-xl shadow-primary/30"
                                            >
                                                {plan.cta}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-20 flex flex-col items-center justify-center">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            className="flex flex-col sm:flex-row items-center gap-3 bg-white/40 backdrop-blur-xl border border-white/60 px-8 py-4 rounded-3xl sm:rounded-full shadow-lg"
                        >
                            <ShieldCheck size={24} className="text-green-500" />
                            <p className="text-navy font-black text-[10px] uppercase tracking-[0.2em] text-center">
                                Todos los planes incluyen <span className="text-primary">hosting certificado</span> por su primer año.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Before vs After Section */}
            <section className="py-24 bg-navy relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary rounded-full blur-[120px] -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-80 h-80 bg-royal rounded-full blur-[100px] translate-y-1/2"></div>
                </div>

                <div className="max-w-6xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase mb-4">
                            La diferencia entre <span className="text-white/20 italic line-through">ser uno más</span><br />
                            y <span className="text-primary italic">ser recordado.</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 items-stretch">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-white/5 backdrop-blur-sm p-10 rounded-[3rem] border border-white/10 flex flex-col justify-between"
                        >
                            <div>
                                <div className="inline-block bg-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-8">
                                    🔴 Situación Actual
                                </div>
                                <h3 className="text-3xl font-black text-white/40 mb-6 uppercase italic tracking-tighter leading-tight">
                                    Mil tarjetas de presentación cuestan entre $30 y $50...
                                </h3>
                                <p className="text-white/40 font-medium leading-relaxed mb-10 text-sm">
                                    Cuando se acaban, vuelves a imprimir. Cuando cambia tu número, todas quedan obsoletas. Y lo peor: cuando un cliente te pide el contacto y no tienes tarjetas, terminas anotando en un papelito como si fuera 1995.<br/><br/>
                                    <span className="text-white/60 font-bold">Con ActivaQR compartes tu contacto 1.000 veces al día, los 365 días del año</span>, siempre actualizado. Y te cuesta lo mismo aunque lo descarguen un millón de veces.
                                </p>
                            </div>

                            <div className="bg-white/5 border border-white/5 p-6 rounded-2xl opacity-30 grayscale rounded-[2rem]">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-xl">👤</div>
                                    <div className="space-y-2 flex-1">
                                        <div className="h-2 bg-white/20 rounded w-2/3"></div>
                                        <div className="h-2 bg-white/10 rounded w-1/2"></div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-gradient-to-br from-white to-cream p-1 rounded-[3rem] shadow-2xl relative"
                        >
                            <div className="bg-cream h-full w-full rounded-[2.9rem] p-8 md:p-10 relative overflow-hidden">
                                <div className="absolute top-8 right-8 bg-[#66bf19] text-white text-[10px] font-black uppercase px-4 py-2 rounded-full shadow-lg z-20 animate-bounce">
                                    ✅ ACTIVADO
                                </div>

                                <div className="inline-block bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-8">
                                    ⭐ Con ActivaQR
                                </div>

                                <h3 className="text-3xl font-black text-navy mb-8 uppercase italic tracking-tighter leading-none">Tu negocio instalado en su agenda <br /><span className="text-primary">antes que la competencia.</span></h3>

                                <div className="relative">
                                    <div className="bg-white p-6 rounded-[2rem] shadow-2xl border border-navy/5 relative z-10">
                                        <div className="flex items-center gap-5 mb-6">
                                            <div className="w-20 h-20 bg-primary/10 rounded-[2rem] overflow-hidden border-4 border-white shadow-xl flex items-center justify-center p-3 relative">
                                                <img src="/images/logo.png" alt="ActivaQR Logo" className="w-full h-full object-contain" />
                                                <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center">
                                                    <CheckCircle2 size={10} className="text-white" />
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="font-black text-navy text-xl uppercase tracking-tighter">Tu Perfil Pro</h4>
                                                <p className="text-primary text-[10px] font-black uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-md inline-block mt-1">Guardado con éxito</p>
                                                <div className="flex gap-1 mt-2 text-yellow-500">
                                                    <Star size={14} fill="currentColor" />
                                                    <Star size={14} fill="currentColor" />
                                                    <Star size={14} fill="currentColor" />
                                                    <Star size={14} fill="currentColor" />
                                                    <Star size={14} fill="currentColor" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-green-500 text-white text-center py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 hover:scale-105 transition-transform cursor-pointer">
                                                <Phone size={14} fill="currentColor" /> Llamar Ahora
                                            </div>
                                            <div className="bg-navy text-white text-center py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-navy/90 transition-colors cursor-pointer">
                                                Ver Servicios
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-xl animate-pulse z-20">📱</div>
                                    <div className="absolute -top-4 -right-2 w-10 h-10 bg-primary rounded-full shadow-lg flex items-center justify-center text-white text-sm font-black z-20">1</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Objection Audio Section */}
            <section className="py-12 bg-cream/30 border-y border-navy/5">
                <div className="max-w-6xl mx-auto px-6">
                    <ObjectionSection />
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 bg-white">
                <div className="max-w-3xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-black text-navy uppercase tracking-tighter">Preguntas Frecuentes</h2>
                    </div>
                    <div className="space-y-4">
                        {[
                            {
                                tag: "DIFERENCIA",
                                q: "¿Es lo mismo que hacer un QR gratuito en internet?",
                                a: "No. Un código QR gratuito normalmente te lleva a un enlace o deja de funcionar en un mes. Aquí obtienes una plataforma profesional con tu foto, datos organizados y la garantía de que tu cliente guardará tu contacto en su agenda telefónica al instante. Y lo más importante: nunca caduca."
                            },
                            {
                                tag: "PAGOS",
                                q: "¿Tengo que pagar mes a mes?",
                                a: "No, jamás. Adquieres tu contacto digital en un único pago ($35), o el plan catálogo por $120. *Todos nuestros planes tienen el hosting pago por un año.*"
                            },
                            {
                                tag: "RENOVACIÓN",
                                q: "¿Qué pasa después del primer año incluido?",
                                a: "El código QR y el diseño siempre serán tuyos. Lo único que debes renovar es tu 'hosting de identidad', que cuesta solo $35 dólares al año, menos de lo que gastas en tarjetas de presentación que terminan en la basura."
                            },
                            {
                                tag: "ACTUALIZACIONES",
                                q: "¿Y si quiero cambiar mis datos, número o productos, me cobran?",
                                a: "Si adquieres la versión Contacto Business ($60), tú mismo puedes hacer los cambios ilimitados desde tu celular 24/7 de manera gratuita. Si tienes la versión más básica de $35, y necesitas cambiar el número telefónico, nosotros lo actualizamos por solo $5. Así siempre estarás vigente."
                            },
                            {
                                tag: "EMPRESAS",
                                q: "¿Pueden diseñar algo personalizado para mi empresa?",
                                a: "Sí. Para empresas grandes o equipos de ventas con requerimientos específicos, hacemos diseños corporativos desde cero. Puedes solicitar una cotización desde el botón 'Empresas' en la pantalla."
                            },
                            {
                                tag: "GARANTÍA",
                                q: "¿Qué garantía tengo de que funciona?",
                                a: "Revisa nuestros testimonios arriba. Negocios como *Yessy Enfermería* y *Las Costillas del Veci* aumentaron sus pedidos semanales por la facilidad que le dan al cliente de contactarlos."
                            }
                        ].map((item, i) => (
                            <div key={i} className="group overflow-hidden">
                                <button
                                    onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                                    className="w-full text-left bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:bg-gray-100 transition-all flex items-center justify-between group"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 flex-1">
                                        <span className="inline-block bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md w-fit">
                                            {item.tag}
                                        </span>
                                        <span className={`font-black uppercase tracking-tight text-sm md:text-base transition-colors ${openFaqIndex === i ? 'text-primary' : 'text-navy'}`}>
                                            {item.q}
                                        </span>
                                    </div>
                                    <ChevronRight size={18} className={`transform transition-transform duration-300 ml-4 shrink-0 ${openFaqIndex === i ? 'rotate-90 text-primary' : 'text-primary/40'}`} />
                                </button>
                                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaqIndex === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <div className="p-6 pt-0 text-navy/70 leading-relaxed text-sm bg-gray-50 rounded-b-2xl border-x border-b border-gray-100">
                                        <p dangerouslySetInnerHTML={{ __html: item.a.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-primary font-bold underline">$1</a>') }} />
                                    </div>
                                </div>
                            </div>
                        ))}
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

