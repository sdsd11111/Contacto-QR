"use client";

import { motion } from "framer-motion";
import { 
    Download, User, Smartphone, CheckCircle, 
    Mail, Settings, ChevronRight,
    Instagram, Linkedin, Facebook, Youtube, Share2,
    Globe, MapPin, MessageCircle, Zap
} from "lucide-react";
import CatalogGallery from '@/components/card/CatalogGallery';
import { safeParse } from '@/lib/jsonUtils';
import type { MinimalTemplateProps } from '@/components/templates/types';

export default function MinimalTemplate({
    data,
    extractedBg,
    themePrimary,
    themeTextOnPrimary,
    setIsEditModalOpen,
    setIsLightboxOpen,
    handleHeroClick,
    downloadVCF,
    isPlaceholderUrl,
}: MinimalTemplateProps) {

    const socialLinks = [
        { id: 'instagram', icon: <Instagram size={20} />, label: 'Instagram', value: data.instagram, url: data.instagram },
        { id: 'linkedin', icon: <Linkedin size={20} />, label: 'LinkedIn', value: data.linkedin, url: data.linkedin },
        { id: 'facebook', icon: <Facebook size={20} />, label: 'Facebook', value: data.facebook, url: data.facebook },
        { id: 'tiktok', icon: <Smartphone size={20} />, label: 'TikTok', value: data.tiktok, url: data.tiktok },
        { id: 'youtube', icon: <Youtube size={20} />, label: 'YouTube', value: data.youtube, url: data.youtube },
        { id: 'web', icon: <Globe size={20} />, label: 'Sitio Web', value: data.web, url: data.web },
    ].filter(s => s.value);

    const getHeroButtonIcon = () => {
        const action = data.hero_action || 'wifi';
        if (action === 'wifi') return <Zap size={18} />;
        if (action === 'file') return <Download size={18} />;
        if (action === 'link') return <Globe size={18} />;
        return <Smartphone size={18} />;
    };

    const getHeroButtonText = () => {
        if (data.hero_button_text) return data.hero_button_text;
        const action = data.hero_action || 'wifi';
        if (action === 'wifi') return "OBTENER OFERTA";
        if (action === 'file') return "DESCARGAR";
        return "CONOCER MÁS";
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-white/20" style={{ 
            '--theme-primary': themePrimary,
            '--theme-text-on-primary': themeTextOnPrimary,
            '--extracted-bg': extractedBg
        } as React.CSSProperties}>
            
            {/* Background Texture */}
            <div className="fixed inset-0 pointer-events-none opacity-20 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--theme-primary)] rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--extracted-bg)] rounded-full blur-[120px]" />
            </div>

            {/* Header / Nav */}
            <div className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-6 bg-neutral-950/50 backdrop-blur-xl border-b border-white/5">
                <div className="text-[10px] font-black tracking-[0.3em] uppercase text-white/40">ActivaQR Luxury</div>
                <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-white/60 hover:text-white"
                >
                    <Settings size={18} />
                </button>
            </div>

            <main className="max-w-2xl mx-auto px-6 pt-32 pb-20 flex flex-col items-center">
                
                {/* Profile Header */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-12 text-center"
                >
                    <div className="relative mb-8 mx-auto">
                        <div className="w-36 h-36 rounded-full p-[2px] bg-gradient-to-tr from-[var(--theme-primary)] via-white/20 to-white/5 mx-auto">
                            <div className="w-full h-full rounded-full bg-neutral-950 overflow-hidden border-4 border-neutral-950 shadow-2xl">
                                {data.foto_url && !isPlaceholderUrl(data.foto_url) ? (
                                    <img src={data.foto_url} className="w-full h-full object-cover" alt={data.nombres} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-white/5">
                                        <User size={50} className="text-white/20" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="absolute bottom-1 right-1/2 translate-x-14 w-8 h-8 rounded-full bg-[var(--theme-primary)] border-4 border-neutral-950 flex items-center justify-center shadow-lg"
                        >
                            <CheckCircle size={14} className="text-[var(--theme-text-on-primary)]" />
                        </motion.div>
                    </div>
                    
                    <h1 className="text-4xl font-black tracking-tighter mb-2 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent italic uppercase">
                        {data.tipo_perfil === 'negocio' ? (data.nombre_negocio || data.nombres) : `${data.nombres} ${data.apellidos}`}
                    </h1>
                    <p className="text-sm font-bold text-white/40 uppercase tracking-[0.4em] mb-6">
                        {data.profession || "Business Profile"}
                    </p>
                    
                    <div className="flex flex-wrap justify-center gap-2">
                        {data.company && (
                            <span className="px-4 py-1.5 bg-white/5 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/60">
                                {data.company}
                            </span>
                        )}
                        {data.etiquetas && (data.etiquetas.split(',').map((tag: string, i: number) => (
                            <span key={i} className="px-4 py-1.5 bg-[var(--theme-primary)]/10 rounded-full border border-[var(--theme-primary)]/20 text-[10px] font-black uppercase tracking-widest text-[var(--theme-primary)]">
                                {tag.trim()}
                            </span>
                        )))}
                    </div>
                </motion.div>

                {/* Main Action - Save Contact & Hero */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="w-full mb-12 flex flex-col gap-4"
                >
                    <button
                        onClick={downloadVCF}
                        className="w-full py-6 rounded-[32px] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] bg-white text-neutral-950 shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
                    >
                        <Download size={20} />
                        Guardar Contacto
                    </button>

                    <button
                        onClick={handleHeroClick}
                        className="w-full py-6 rounded-[32px] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] border border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10"
                        style={{
                            boxShadow: '0 20px 40px -10px color-mix(in srgb, var(--theme-primary) 20%, transparent)'
                        }}
                    >
                        {getHeroButtonIcon()}
                        {getHeroButtonText()}
                    </button>
                </motion.div>

                {/* Bio / About */}
                {data.bio && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="w-full mb-12 p-1 bg-gradient-to-br from-white/10 to-transparent rounded-[40px]"
                    >
                        <div className="bg-neutral-900/80 backdrop-blur-3xl rounded-[39px] p-8">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--theme-primary)] mb-6 flex items-center gap-2">
                                <span className="w-4 h-[1px] bg-[var(--theme-primary)]"></span>
                                Historia & Visión
                            </h4>
                            <p className="text-white/70 leading-relaxed text-sm font-medium">
                                {data.bio}
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* Social Grid */}
                <div className="w-full grid grid-cols-1 gap-3 mb-12">
                    {socialLinks.map((social) => (
                        <a
                            key={social.id}
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-5 bg-white/[0.03] backdrop-blur-md rounded-[24px] border border-white/5 hover:bg-white/[0.08] hover:border-white/10 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 group-hover:text-[var(--theme-primary)] group-hover:bg-[var(--theme-primary)]/10 transition-all">
                                    {social.icon}
                                </div>
                                <span className="font-bold text-sm text-white/70 tracking-tight">{social.label}</span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:text-white/60 transition-colors">
                                <ChevronRight size={16} />
                            </div>
                        </a>
                    ))}
                    
                    {data.whatsapp && (
                         <a
                            href={`https://wa.me/${data.whatsapp?.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-6 bg-[#25D366]/10 rounded-[32px] border border-[#25D366]/20 hover:bg-[#25D366]/20 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-[#25D366] flex items-center justify-center text-white shadow-lg shadow-[#25D366]/20">
                                    <MessageCircle size={24} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-[#25D366]/60">Chatear ahora</p>
                                    <p className="text-sm font-black uppercase italic tracking-tight">WhatsApp Directo</p>
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-[#25D366]/40" />
                        </a>
                    )}
                </div>

                {/* Contact Info (Mail, Address) */}
                <div className="w-full space-y-4 mb-12">
                    {data.email && (
                        <a href={`mailto:${data.email}`} className="flex items-center gap-5 p-6 bg-white/5 rounded-[32px] border border-white/10 hover:bg-white/10 transition-all group">
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/40 group-hover:text-[var(--theme-primary)]">
                                <Mail size={20} />
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-white/20">Correo Electrónico</p>
                                <p className="text-sm font-bold text-white/80">{data.email}</p>
                            </div>
                        </a>
                    )}
                    {data.address && (
                        <div className="flex items-center gap-5 p-6 bg-white/5 rounded-[32px] border border-white/10 w-full">
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/40">
                                <MapPin size={20} />
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-white/20">Ubicación</p>
                                <p className="text-sm font-bold text-white/80">{data.address}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Catalog / Products */}
                {(data?.plan === 'catalog' || data?.catalogo_json) && (
                    <div className="w-full mt-12 bg-white/5 p-8 rounded-[40px] border border-white/10">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--theme-primary)] mb-8 text-center italic">Portfolio Premium</h4>
                        <CatalogGallery 
                        data={safeParse(data.catalogo_json, { products: [], categories: [] })} 
                            whatsapp={data.whatsapp}
                            onLightboxToggle={setIsLightboxOpen}
                        />
                    </div>
                )}
            </main>

            {/* Premium Footer */}
            <footer className="py-20 border-t border-white/5 text-center px-6">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-8">
                    <Smartphone className="text-white/20" size={32} />
                </div>
                <h5 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40 mb-4">ActivaQR Technology</h5>
                <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest leading-loose max-w-xs mx-auto">
                    Esta tarjeta digital es un activo de identidad verificado por el ecosistema de ActivaQR.
                </p>
                <div className="mt-12 opacity-20 hover:opacity-100 transition-opacity">
                    <p className="text-[8px] font-black uppercase tracking-widest">© 2026 Grupo Empresarial Reyes</p>
                </div>
            </footer>

            {/* Floating Action Button (Share) */}
            <div className="fixed bottom-8 right-8 z-[60]">
                <button 
                    onClick={() => {
                        if (navigator.share) {
                            navigator.share({
                                title: data.nombre_negocio || data.nombres,
                                url: window.location.href
                            });
                        }
                    }}
                    className="w-14 h-14 rounded-full bg-white text-neutral-950 shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                >
                    <Share2 size={24} />
                </button>
            </div>
        </div>
    );
}
