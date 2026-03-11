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
    ShieldAlert
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
    const [showWifiModal, setShowWifiModal] = useState<'none' | 'presave' | 'postsave'>('none');

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
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-4.821 7.354h-.01c-1.282 0-2.54-.345-3.641-1.002l-.261-.155-2.704.711.724-2.636-.17-.271c-.724-1.15-1.104-2.483-1.104-3.852 0-3.992 3.244-7.241 7.243-7.241 1.935 0 3.754.755 5.122 2.124 1.368 1.367 2.122 3.187 2.122 5.12 0 4.001-3.247 7.248-7.248 7.248M19.79 4.204C17.903 2.314 15.389 1.272 12.726 1.272 7.373 1.272 3.007 5.637 3.007 11.002c0 1.714.445 3.388 1.29 4.876L1.87 22.25l6.434-1.688c1.439.785 3.064 1.198 4.717 1.199H13c5.352 0 9.718-4.364 9.718-9.728 0-2.598-1.012-5.042-2.928-6.829z" />
                </svg>
            ),
            label: 'WhatsApp',
            value: data.whatsapp,
            color: 'bg-[#25D366]',
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
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M12.525.02c1.31 0 2.59.34 3.71 1 .28-.21.57-.42.87-.62a9.66 9.66 0 0 0-4.58-1c-5.26 0-9.52 4.25-9.52 9.5 0 5.25 4.26 9.5 9.52 9.5a9.54 9.54 0 0 0 8.07-4.48c.19-.29.35-.59.5-.9-.12.01-.24.01-.36.01-5.12 0-9.28-4.15-9.28-9.26a9.21 9.21 0 0 1 1-4.22c.11-.23.25-.45.39-.67-.11-.06-.23-.11-.35-.16a9.85 9.85 0 0 0-1.42-.42c-.01-.01-.01-.01-.02-.01l.01-.21h.01c-.13-.01-.26-.01-.39-.01zM24 4.81a6.83 6.83 0 0 1-4.27-1.49V17c0 3.86-3.13 7-7 7s-7-3.14-7-7 3.13-7 7-7c.7 0 1.36.1 1.98.3V1.27C17.47 1.27 18.06.01 24 0v4.81z" />
                </svg>
            ),
            label: 'TikTok',
            value: data.tiktok,
            color: 'bg-[#000000]',
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
                                        <button
                                            onClick={() => {
                                                if (data.wifi_ssid) {
                                                    setShowWifiModal('presave');
                                                } else {
                                                    downloadVCF();
                                                }
                                            }}
                                            className="w-full md:w-auto min-w-[220px] bg-[#f66739] text-white px-10 md:px-12 py-4 md:py-6 rounded-2xl font-black text-base md:text-xl shadow-[0_15px_50px_-10px_rgba(246,103,57,0.5)] flex items-center justify-center gap-5 hover:scale-105 transition-all active:scale-95 group relative z-20"
                                        >
                                            <Download size={24} className="group-hover:animate-bounce shrink-0" />
                                            <span id="btn-download-text">GUARDAR CONTACTO</span>
                                        </button>
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

            {/* WiFi Flow Modals */}
            <AnimatePresence>
                {showWifiModal === 'presave' && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001549]/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-[#05509c] text-white p-8 md:p-10 rounded-[40px] shadow-2xl max-w-sm w-full relative border border-white/10 text-center"
                        >
                            <button onClick={() => setShowWifiModal('none')} className="absolute top-4 right-4 text-white/50 hover:text-white">✕</button>
                            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Zap size={40} className="text-[#f66739]" />
                            </div>
                            <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Guárdanos</h2>
                            <p className="text-sm font-medium text-white/80 mb-8">Para tener acceso a Internet VIP local.</p>
                            <button
                                onClick={() => {
                                    downloadVCF();
                                    setShowWifiModal('postsave');
                                }}
                                className="w-full bg-[#f66739] text-white py-4 px-6 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-transform flex items-center justify-center gap-3 relative"
                            >
                                <Download size={20} /> Guardar Contacto
                            </button>
                        </motion.div>
                    </div>
                )}

                {showWifiModal === 'postsave' && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001549]/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-[#05509c] text-white p-8 md:p-10 rounded-[40px] shadow-2xl max-w-sm w-full relative border border-white/10 text-center"
                        >
                            <button onClick={() => setShowWifiModal('none')} className="absolute top-4 right-4 text-white/50 hover:text-white">✕</button>
                            <div className="w-20 h-20 bg-[#66bf19]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle size={40} className="text-[#66bf19]" />
                            </div>
                            <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-2">¡Contacto Guardado!</h2>
                            <p className="text-sm font-medium text-white/80 mb-6">Conéctate a nuestra red WiFi gratis.</p>
                            <div className="bg-[#001549]/50 rounded-2xl p-4 mb-8 text-left border border-white/5 relative">
                                <p className="text-[10px] font-black tracking-widest text-[#f66739] uppercase mb-1">Red WiFi</p>
                                <p className="font-bold text-lg mb-3 break-all">{data.wifi_ssid}</p>
                                {data.wifi_password && (
                                    <>
                                        <p className="text-[10px] font-black tracking-widest text-[#f66739] uppercase mb-1">Contraseña</p>
                                        <p className="font-bold text-lg break-all">{data.wifi_password}</p>
                                    </>
                                )}
                            </div>
                            <button
                                onClick={() => setShowWifiModal('none')}
                                className="w-full bg-white/10 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-white/20 transition-colors flex flex-col items-center justify-center relative overflow-hidden group"
                            >
                                <span>🎉 ¡Obtén Internet Aquí!</span>
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </main>
    );
}
