"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { motion, AnimatePresence } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import {
    Download,
    User,
    Smartphone,
    Zap,
    CheckCircle,
    Phone,
    Mail,
    Briefcase,
    Clock,
    ShieldAlert,
    ChevronDown
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function VCardClient() {
    const { slug } = useParams();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isAccordionOpen, setIsAccordionOpen] = useState(false);
    const [wifiStep, setWifiStep] = useState(1);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`/api/profile/${slug}`);
                if (response.ok) {
                    const record = await response.json();
                    setData(record);
                } else {
                    console.error("Profile fetch error:", response.status);
                    // Handle 404 or error state if needed
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };
        if (slug) fetchData();
    }, [slug]);

    const downloadVCF = async () => {
        if (!data || data.status === 'pendiente') return;

        const originalText = document.getElementById('btn-download-text')?.innerText;
        if (originalText) document.getElementById('btn-download-text')!.innerText = "Generando...";

        try {
            // Usar la ruta servidor que YA genera VCFs correctos con tags de WhatsApp,
            // foto embebida, y escapado correcto. Esto garantiza que el archivo descargado
            // sea idéntico al que fue verificado y funciona con "Apps conectadas".
            const response = await fetch(`/api/vcard/${slug}`);
            if (!response.ok) throw new Error('Error al generar vCard');

            const vcfBlob = await response.blob();
            const url = window.URL.createObjectURL(vcfBlob);
            const a = document.createElement("a");
            a.href = url;
            const filename = `${data.nombre.replace(/[^a-zA-Z0-9]/g, '_')}.vcf`;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            setWifiStep(2);
        } catch (error) {
            console.error("Error descargando VCF:", error);
        }

        if (originalText) document.getElementById('btn-download-text')!.innerText = originalText;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-navy flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-navy flex flex-col items-center justify-center text-white p-6 text-center">
                <h1 className="text-4xl font-black mb-4 uppercase italic">404</h1>
                <p className="text-white/60 mb-8 font-medium">No hemos encontrado este perfil estratégico.</p>
                <a href="/" className="bg-primary px-8 py-4 rounded-button font-black uppercase tracking-widest shadow-orange">Volver al Inicio</a>
            </div>
        );
    }

    // PANTALLA DE VALIDACIÓN SI ES PENDIENTE
    if (data.status === 'pendiente') {
        return (
            <main className="min-h-screen bg-navy text-white flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full glass-card p-12 text-center rounded-[48px]"
                >
                    <div className="w-20 h-20 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                        <Clock size={40} />
                    </div>
                    <h1 className="text-3xl font-black uppercase italic tracking-tighter mb-4">Perfil en Validación</h1>
                    <p className="text-white/60 font-medium leading-relaxed mb-8">
                        Hola <span className="text-white font-bold">{data.nombre}</span>, estamos verificando tu comprobante de pago.
                    </p>
                    <div className="space-y-4">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-left">
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Estado de Orden</p>
                            <p className="text-sm font-bold uppercase italic">⏳ Pendiente de Aprobación</p>
                        </div>
                        <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">
                            Tiempo estimado: 60 minutos
                        </p>
                    </div>
                </motion.div>
            </main>
        );
    }

    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

    const socialLinks = [
        {
            id: 'whatsapp',
            icon: (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M19.057 4.298c-1.883-1.884-4.386-2.922-7.05-2.922-5.495 0-9.968 4.471-9.968 9.966 0 1.756.459 3.468 1.328 4.975l-1.41 5.148 5.266-1.381c1.455.794 3.09 1.211 4.78 1.212h.004c5.493 0 9.964-4.471 9.964-9.966 0-2.662-1.036-5.166-2.921-7.052zm-7.05 15.393h-.003c-1.488 0-2.946-.4-4.23-1.155l-.304-.18-3.146.825.839-3.067-.197-.314c-.829-1.321-1.267-2.854-1.267-4.43 0-4.43 3.605-8.036 8.04-8.036 2.148 0 4.167.837 5.684 2.355 1.517 1.518 2.352 3.538 2.352 5.686-.002 4.434-3.609 8.041-8.043 8.041zm4.412-6.03c-.242-.121-1.431-.707-1.652-.788-.221-.081-.383-.121-.544.121-.161.242-.625.787-.766.949-.141.161-.282.181-.524.061-.242-.121-1.02-.376-1.943-1.199-.718-.641-1.203-1.433-1.344-1.675-.141-.242-.015-.373.106-.493.109-.108.242-.282.363-.423.121-.141.161-.242.242-.403.081-.161.04-.303-.02-.424-.061-.121-.544-1.312-.746-1.796-.196-.472-.397-.407-.544-.415-.141-.007-.302-.008-.463-.008-.161 0-.423.061-.644.303-.221.242-.846.827-.846 2.018 0 1.191.866 2.336.987 2.5.121.164 1.706 2.605 4.133 3.651.577.249 1.027.397 1.378.508.579.185 1.107.158 1.523.096.465-.069 1.431-.585 1.632-1.15.201-.564.201-1.049.141-1.15-.06-.101-.221-.161-.463-.282z"/>
                </svg>
            ),
            label: 'WhatsApp',
            value: data.whatsapp,
            color: 'bg-[#25D366] text-white shadow-[#25D366]/30',
            url: `https://wa.me/${data.whatsapp?.replace(/\D/g, '')}`
        },
        {
            id: 'instagram',
            icon: (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.054 1.805.249 2.227.412.56.216.96.474 1.38.894.42.42.678.82.894 1.38.163.422.358 1.057.412 2.227.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.054 1.17-.249 1.805-.412 2.227-.216.56-.474.96-.894 1.38-.42.42-.82.678-1.38.894-.422.163-1.057.358-2.227.412-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.054-1.805-.249-2.227-.412-.56-.216-.96-.474-1.38-.894-.42-.42-.678-.82-.894-1.38-.163-.422-.358-1.057-.412-2.227-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.054-1.17.249-1.805.412-2.227.216-.56.474-.96.894-1.38.42-.42.82-.678 1.38-.894.422-.163 1.057-.358 2.227-.412 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-1.277.059-2.148.262-2.911.558-.788.306-1.457.715-2.123 1.381s-1.075 1.335-1.381 2.123c-.296.763-.499 1.634-.558 2.911-.059 1.28-.073 1.688-.073 4.947s.014 3.667.072 4.947c.059 1.277.262 2.148.558 2.911.306.788.715 1.457 1.381 2.123s1.335 1.075 2.123 1.381c.763.296 1.634.499 2.911.558 1.28.059 1.688.073 4.947.073s3.667-.014 4.947-.072c1.277-.059 2.148-.262 2.911-.558.788-.306 1.457-.715 2.123-1.381s1.075-1.335 1.381-2.123c.296-.763.499-1.634.558-2.911.059-1.28.073-1.688.073-4.947s-.014-3.667-.072-4.947c-.059-1.277-.262-2.148-.558-2.911-.306-.788-.715-1.457-1.381-2.123s-1.335-1.075-2.123-1.381c-.763-.296-1.634-.499-2.911-.558-1.28-.059-1.688-.073-4.947-.073z" /><path d="M12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
            ),
            label: 'Instagram',
            value: data.instagram,
            color: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]',
            url: data.instagram
        },
        {
            id: 'linkedin',
            icon: (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z" />
                </svg>
            ),
            label: 'LinkedIn',
            value: data.linkedin,
            color: 'bg-[#0077B5]',
            url: data.linkedin
        },
        {
            id: 'facebook',
            icon: (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
            ),
            label: 'Facebook',
            value: data.facebook,
            color: 'bg-[#1877F2]',
            url: data.facebook
        },
        {
            id: 'tiktok',
            icon: (
                <svg viewBox="0 0 448 512" fill="currentColor" className="w-5 h-5">
                    <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"/>
                </svg>
            ),
            label: 'TikTok',
            value: data.tiktok,
            color: 'bg-black text-white shadow-black/30',
            url: data.tiktok
        },
        {
            id: 'youtube',
            icon: (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.082 0 12 0 12s0 3.918.501 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.918 24 12 24 12s0-3.918-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
            ),
            label: 'YouTube',
            value: data.youtube,
            color: 'bg-[#FF0000]',
            url: data.youtube
        },
        {
            id: 'x',
            icon: (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                </svg>
            ),
            label: 'X (Twitter)',
            value: data.x,
            color: 'bg-[#000000]',
            url: data.x
        },
    ].filter(s => s.value);

    return (
        <main className="min-h-screen bg-[#001549] text-white selection:bg-[#f66739]/30 py-8 px-4 md:py-12 md:px-6 relative overflow-hidden font-sans">
            {/* Premium Background Effects */}
            <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[50%] bg-[#f66739]/20 blur-[120px] rounded-full pointer-events-none animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#05509c]/20 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10 pt-4 md:pt-8 px-2 md:px-4">
                <div className="grid lg:grid-cols-12 gap-6 md:gap-8 items-stretch">
                    {/* Left Column: Profile & Main Info (Banner Style) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-12 xl:col-span-9 flex flex-col w-full min-w-0"
                    >
                        <div className="flex-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] md:rounded-[40px] p-6 md:p-10 lg:p-14 shadow-2xl relative overflow-hidden group min-w-0 w-full">
                            {/* Decorative accent */}
                            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-[#f66739] to-transparent opacity-10 rounded-bl-full shrink-0" />

                            <div className="flex flex-col md:flex-row gap-8 md:gap-14 items-center md:items-start relative z-10 w-full">
                                {/* Profile Image */}
                                <div className="relative shrink-0">
                                    <div className="w-32 h-32 md:w-36 lg:w-48 rounded-3xl bg-gradient-to-br from-[#f66739] to-[#05509c] p-1 shadow-2xl">
                                        <div className="w-full h-full aspect-square rounded-[20px] bg-[#001549] overflow-hidden flex items-center justify-center">
                                            {data.foto_url ? (
                                                <img src={data.foto_url} className="w-full h-full object-cover" alt={data.nombre} />
                                            ) : (
                                                <User className="text-white/10" size={80} />
                                            )}
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-[#66bf19] p-2 rounded-full shadow-lg border-2 border-[#001549]">
                                        <CheckCircle size={20} className="text-white" />
                                    </div>
                                </div>

                                {/* Name & Profession */}
                                <div className="text-center md:text-left flex-1 min-w-0 w-full">
                                    <h1 className="text-2xl md:text-3xl lg:text-5xl xl:text-5xl font-black tracking-tighter leading-[1.05] mb-4 uppercase italic text-white break-words drop-shadow-md">
                                        {data.tipo_perfil === 'negocio' ? (data.nombre_negocio || data.nombre) : data.nombre}
                                    </h1>
                                    <p className="text-sm md:text-lg lg:text-xl font-black text-[#f66739] uppercase tracking-[0.2em] mb-8 drop-shadow-sm break-words opacity-90">
                                        {data.profesion || "Profesional Estratégico"}
                                    </p>

                                    {data.empresa && (
                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 mb-8 max-w-full">
                                            <Briefcase size={14} className="text-[#f66739] shrink-0" />
                                            <span className="text-[10px] md:text-xs lg:text-sm font-bold uppercase tracking-wider text-white/50 truncate text-ellipsis">{data.empresa}</span>
                                        </div>
                                    )}

                                    {/* Action Button Container */}
                                    <div className="w-full flex justify-center md:justify-start">
                                        {data.wifi_ssid ? (
                                            <div className="w-full md:w-auto w-full max-w-sm relative z-20">
                                                <button
                                                    onClick={() => {
                                                        const newState = !isAccordionOpen;
                                                        setIsAccordionOpen(newState);
                                                        if (!newState) setWifiStep(1); // Reset when closing
                                                    }}
                                                    className="w-full bg-[#f66739] text-white px-8 md:px-10 py-4 md:py-5 rounded-2xl font-black text-base md:text-lg shadow-[0_15px_50px_-10px_rgba(246,103,57,0.5)] flex items-center justify-center gap-4 hover:scale-105 transition-all active:scale-95 group"
                                                >
                                                    <Zap size={24} className="group-hover:animate-pulse shrink-0" />
                                                    <span>ACCEDE A NUESTRO INTERNET</span>
                                                    <motion.div
                                                        animate={{ rotate: isAccordionOpen ? 180 : 0 }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <ChevronDown size={20} />
                                                    </motion.div>
                                                </button>

                                                <AnimatePresence>
                                                    {isAccordionOpen && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                                            animate={{ height: "auto", opacity: 1, marginTop: 16 }}
                                                            exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                                            className="overflow-hidden bg-[#05509c] text-white rounded-3xl border border-white/10 shadow-2xl relative"
                                                        >
                                                            <div className="p-5 md:p-6 flex flex-col gap-6 text-left bg-gradient-to-b from-transparent to-[#001549]/30">
                                                                {/* Step 1 */}
                                                                <motion.div 
                                                                    initial={false}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    className={cn("flex flex-col gap-2 transition-all duration-500", wifiStep > 1 && "opacity-50 grayscale-[0.5]")}
                                                                >
                                                                    <div className="flex items-center justify-between">
                                                                        <h3 className="text-xs md:text-sm font-black uppercase tracking-wider text-[#f66739] flex items-center gap-2">
                                                                            <span className="bg-[#f66739] text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">1</span> 
                                                                            Descarga Nuestro Contacto
                                                                        </h3>
                                                                        {wifiStep > 1 && <CheckCircle size={16} className="text-[#25D366]" />}
                                                                    </div>
                                                                    <button 
                                                                        onClick={downloadVCF}
                                                                        className={cn(
                                                                            "w-full px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all mt-1",
                                                                            wifiStep === 1 ? "bg-white text-[#05509c] shadow-lg scale-[1.02]" : "bg-white/5 text-white/40 border border-white/10"
                                                                        )}
                                                                        disabled={wifiStep > 1}
                                                                    >
                                                                        <Download size={18} />
                                                                        <span id="btn-download-text">Descargar .vcf</span>
                                                                    </button>
                                                                </motion.div>
                                                                
                                                                {/* Step 2 */}
                                                                <AnimatePresence>
                                                                    {wifiStep >= 2 && (
                                                                        <motion.div 
                                                                            initial={{ height: 0, opacity: 0 }}
                                                                            animate={{ height: "auto", opacity: 1 }}
                                                                            className={cn("flex flex-col gap-2 transition-all duration-500", wifiStep > 2 && "opacity-50 grayscale-[0.5]")}
                                                                        >
                                                                            <div className="flex items-center justify-between">
                                                                                <h3 className="text-xs md:text-sm font-black uppercase tracking-wider text-[#f66739] flex items-center gap-2">
                                                                                    <span className="bg-[#f66739] text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">2</span> 
                                                                                    Asegurate de importar el contacto
                                                                                </h3>
                                                                                {wifiStep > 2 && <CheckCircle size={16} className="text-[#25D366]" />}
                                                                            </div>
                                                                            <p className="text-xs md:text-sm font-medium text-white/80 bg-white/5 p-3 rounded-xl border border-white/5 leading-relaxed mt-1">
                                                                                Abre el archivo descargado y guárdanos en tu agenda para activar la conexión.
                                                                            </p>
                                                                            {wifiStep === 2 && (
                                                                                <button 
                                                                                    onClick={() => setWifiStep(3)}
                                                                                    className="w-full bg-[#f66739] text-white px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all mt-2 animate-bounce-subtle"
                                                                                >
                                                                                    Ya guardé el contacto
                                                                                </button>
                                                                            )}
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>

                                                                {/* Step 3 */}
                                                                <AnimatePresence>
                                                                    {wifiStep >= 3 && (
                                                                        <motion.div 
                                                                            initial={{ height: 0, opacity: 0 }}
                                                                            animate={{ height: "auto", opacity: 1 }}
                                                                            className="flex flex-col gap-2"
                                                                        >
                                                                            <h3 className="text-xs md:text-sm font-black uppercase tracking-wider text-[#f66739] flex items-center gap-2">
                                                                                <span className="bg-[#f66739] text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">3</span> 
                                                                                Conéctate a la Red
                                                                            </h3>
                                                                            <div className="bg-[#001549]/50 p-4 rounded-xl border border-[#f66739]/30 space-y-3 mt-1 relative overflow-hidden shadow-[0_0_20px_rgba(246,103,57,0.1)]">
                                                                                <div className="absolute top-0 right-0 text-[#f66739]/10 -mt-2 -mr-2">
                                                                                    <Zap size={60} />
                                                                                </div>
                                                                                <div className="relative z-10">
                                                                                    <p className="text-[10px] uppercase font-bold text-white/40 mb-1">Nombre del WiFi</p>
                                                                                    <p className="font-bold text-sm md:text-base break-all bg-white/5 py-1 px-2 rounded-md inline-block text-white selection:bg-[#f66739]">{data.wifi_ssid}</p>
                                                                                </div>
                                                                                {data.wifi_password && (
                                                                                    <div className="relative z-10">
                                                                                        <p className="text-[10px] uppercase font-bold text-white/40 mb-1">Contraseña</p>
                                                                                        <div className="flex items-center gap-2">
                                                                                            <p className="font-bold text-sm md:text-base break-all bg-white/5 py-1 px-2 rounded-md inline-block text-[#f66739] selection:bg-white">{data.wifi_password}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={downloadVCF}
                                                className="w-full md:w-auto min-w-[220px] bg-[#f66739] text-white px-10 md:px-12 py-4 md:py-6 rounded-2xl font-black text-base md:text-xl shadow-[0_15px_50px_-10px_rgba(246,103,57,0.5)] flex items-center justify-center gap-5 hover:scale-105 transition-all active:scale-95 group relative z-20"
                                            >
                                                <Download size={24} className="group-hover:animate-bounce shrink-0" />
                                                <span id="btn-download-text">GUARDAR CONTACTO</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Bio / Description */}
                            {data.bio && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="mt-12 md:mt-16 pt-10 border-t border-white/10"
                                >
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#f66739] mb-4 flex items-center gap-2">
                                        <Zap size={12} /> SOBRE MÍ
                                    </h4>
                                    <p className="text-sm md:text-lg font-medium leading-relaxed text-white/70 italic break-words max-w-4xl">
                                        "{data.bio}"
                                    </p>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>

                    {/* Right Column: Contact Details (Adjusted spans) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-12 xl:col-span-3 flex flex-col gap-6 w-full"
                    >
                        {/* Social & Contact Grid */}
                        <div className="flex-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] md:rounded-[40px] p-6 md:p-10 shadow-2xl w-full">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#f66739] mb-8">CANALES</h4>

                            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-1 gap-4">
                                {socialLinks.map((social) => (
                                    <a
                                        key={social.id}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group flex flex-col xl:flex-row items-center xl:gap-4 p-4 md:p-6 bg-white/10 rounded-[28px] md:rounded-[32px] border border-white/5 hover:border-[#f66739]/50 transition-all hover:bg-white/20"
                                    >
                                        <div className={cn("w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center mb-3 xl:mb-0 shadow-lg group-hover:scale-110 transition-transform shrink-0", social.color)}>
                                            {social.icon}
                                        </div>
                                        <span className="text-[8px] md:text-[10px] font-black uppercase tracking-wider text-white/40 group-hover:text-white transition-colors text-center xl:text-left">{social.label}</span>
                                    </a>
                                ))}

                                {data.email && (
                                    <a href={`mailto:${data.email}`} className="col-span-2 md:col-span-4 xl:col-span-1 flex items-center gap-4 p-4 md:p-5 bg-white/10 rounded-[24px] border border-white/5 hover:border-[#f66739]/50 transition-all group overflow-hidden">
                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 text-[#f66739] group-hover:scale-110 transition-transform shrink-0">
                                            <Mail size={18} />
                                        </div>
                                        <div className="text-left min-w-0">
                                            <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Email</p>
                                            <p className="font-bold text-[10px] md:text-xs truncate text-white/80">{data.email}</p>
                                        </div>
                                    </a>
                                )}

                                {data.direccion && (
                                    <div className="col-span-2 md:col-span-4 xl:col-span-1 flex items-center gap-4 p-4 md:p-5 bg-white/10 rounded-[24px] border border-white/5 overflow-hidden">
                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 text-[#68d3fe] shrink-0">
                                            <Smartphone size={18} />
                                        </div>
                                        <div className="text-left min-w-0">
                                            <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Ubicación</p>
                                            <p className="font-bold text-[10px] md:text-xs text-white/70 break-words line-clamp-3">{data.direccion}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {data.web && (
                                <a href={data.web} target="_blank" rel="noopener noreferrer" className="mt-6 flex items-center justify-between p-5 md:p-6 bg-gradient-to-r from-[#05509c] to-[#001549] rounded-[24px] border border-white/10 group">
                                    <div className="flex items-center gap-4">
                                        <div className="text-xl">🌐</div>
                                        <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">Web Oficial</span>
                                    </div>
                                    <Zap size={16} className="text-[#f66739] group-hover:scale-125 transition-transform" />
                                </a>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Footer Branding */}
                <footer className="mt-16 md:mt-24 text-center pb-20 md:pb-12 px-2">
                    <div className="inline-flex flex-col md:flex-row items-center gap-4 md:gap-10 py-6 px-10 bg-white/5 backdrop-blur-md rounded-3xl md:rounded-full border border-white/10 shadow-xl">
                        <div className="flex items-center gap-4 opacity-100">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Impulsado por</span>
                            <img src="/images/logo_header.png" alt="ActivaQR" className="h-4 brightness-0 invert opacity-40" />
                        </div>
                        <div className="hidden md:block w-px h-6 bg-white/10" />
                        <a href="https://www.activaqr.com" target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase tracking-widest text-[#f66739] hover:text-white transition-all hover:scale-105">
                            Crea tu Red de Contactos Ahora →
                        </a>
                    </div>
                </footer>
            </div>
        </main>
    );
}
