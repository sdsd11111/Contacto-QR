"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ChevronDown, CheckCircle2, ShoppingBag, Mic } from 'lucide-react';

export interface FAQItem {
    id: string;
    tag: string;
    q: string;
    bullets: string[];
    videoSourceType?: 'bunny' | 'youtube';
    videoUrl?: string;
    audioUrl?: string; // New field for audio support
    ctaText?: string;
}

interface AdvancedFAQProps {
    items: FAQItem[];
    title?: React.ReactNode;
    subtitle?: string;
    sectionTag?: string;
    variant?: 'light' | 'dark';
}

// Configuración para BunnyNet Stream
const STREAM_LIBRARY_ID = "636136";
const STREAM_BASE_URL = `https://iframe.mediadelivery.net/embed/${STREAM_LIBRARY_ID}`;

export function AdvancedFAQ({ 
    items, 
    title = <>Preguntas <span className="text-primary italic">Frecuentes</span></>,
    subtitle = "Cero rodeos. Abre cualquier interrogante y destruiremos la duda cara a cara.",
    sectionTag = "Sin textos aburridos",
    variant = 'light'
}: AdvancedFAQProps) {
    const [activeId, setActiveId] = useState<string | null>(items[0]?.id || null);

    const toggleFaq = (id: string) => {
        setActiveId(prev => (prev === id ? null : id));
    };

    const isDark = variant === 'dark';

    return (
        <section className={`py-12 relative overflow-hidden ${isDark ? 'bg-transparent' : 'bg-white'}`} id="preguntas-frecuentes">
            {/* Elementos decorativos */}
            {!isDark && <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>}

            <div className="max-w-4xl mx-auto px-6 relative z-10">
                {/* Cabecera */}
                <div className={`text-center mb-16 ${title === "" ? "hidden" : ""}`}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6 ${isDark ? 'bg-white/5 text-white' : 'bg-navy/5 text-navy'}`}
                    >
                        <Play size={14} fill="currentColor" className="text-primary" /> {sectionTag}
                    </motion.div>
                    <h2 className={`text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 ${isDark ? 'text-white' : 'text-navy'}`}>
                        {title}
                    </h2>
                    <p className={`font-medium md:text-lg ${isDark ? 'text-white/60' : 'text-navy/60'}`}>
                        {subtitle}
                    </p>
                </div>

                <div className="flex flex-col gap-4">
                    {items.map((faq) => {
                        const isActive = activeId === faq.id;

                        return (
                            <motion.div
                                layout
                                key={faq.id}
                                className={`rounded-[2rem] border transition-colors overflow-hidden ${
                                    isActive 
                                        ? (isDark ? 'bg-white/5 border-white/20 shadow-2xl' : 'bg-cream/50 border-navy/10 shadow-lg shadow-navy/5') 
                                        : (isDark ? 'bg-[#111111] border-white/5 hover:border-white/10 hover:bg-[#1a1a1a]' : 'bg-gray-50 border-gray-100 hover:border-navy/10 hover:bg-gray-100')
                                }`}
                            >
                                <button
                                    onClick={() => toggleFaq(faq.id)}
                                    className="w-full text-left p-6 sm:p-8 flex items-center justify-between outline-none gap-4"
                                >
                                    <div className="flex items-center gap-4 md:gap-6">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all ${
                                            isActive ? 'bg-primary text-white shadow-md' : (isDark ? 'bg-white/5 text-gray-500 border border-white/10' : 'bg-white text-gray-400 border border-gray-200')
                                        }`}>
                                            <Play size={18} fill={isActive ? "currentColor" : "none"} className={isActive ? "ml-1" : "ml-0.5 opacity-50"} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full transition-colors ${
                                                    isActive ? 'bg-primary/10 text-primary' : (isDark ? 'bg-white/10 text-white/40' : 'bg-gray-200 text-gray-500')
                                                }`}>
                                                    {faq.tag}
                                                </span>
                                            </div>
                                            <h3 className={`font-black uppercase tracking-tight text-base sm:text-xl transition-colors pr-4 ${
                                                isActive ? (isDark ? 'text-white' : 'text-navy') : (isDark ? 'text-white/40' : 'text-navy/60')
                                            }`}>
                                                {faq.q}
                                            </h3>
                                        </div>
                                    </div>
                                    <div className="shrink-0 text-gray-400 hidden sm:block">
                                        <ChevronDown size={24} className={`transform transition-transform duration-300 ${isActive ? 'rotate-180' : ''}`} />
                                    </div>
                                </button>

                                {/* ACORDEÓN: Contenido */}
                                <AnimatePresence initial={false}>
                                    {isActive && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                                            className="overflow-hidden"
                                        >
                                            <div className={`pb-8 px-6 sm:px-8 border-t pt-6 mx-2 sm:mx-4 flex flex-col md:flex-row gap-8 items-center md:items-start ${isDark ? 'border-white/5' : 'border-navy/5'}`}>
                                                
                                                {/* Textos de Alto Impacto con viñetas */}
                                                <div className="flex-1 order-2 md:order-1 pt-2 w-full">
                                                    <ul className="space-y-4 mb-8">
                                                        {faq.bullets.map((bullet, idx) => (
                                                            <li key={idx} className="flex gap-3 items-start">
                                                                <span className="text-primary mt-1 shrink-0">
                                                                    <CheckCircle2 size={18} />
                                                                </span>
                                                                <span className={`text-[15px] md:text-base font-medium leading-relaxed ${isDark ? 'text-white/80' : 'text-navy/80'}`}>
                                                                    {bullet}
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    
                                                    {/* Audio Wave Placeholder if audioUrl exists */}
                                                    {faq.audioUrl && (
                                                        <div className="mb-8 p-4 bg-navy/5 rounded-2xl border border-navy/10 flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0 animate-pulse">
                                                                <Mic size={18} className="text-white" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-[10px] font-black text-navy/40 uppercase tracking-widest mb-1">Escuchar respuesta de voz</p>
                                                                <div className="h-1.5 w-full bg-navy/10 rounded-full overflow-hidden">
                                                                    <div className="h-full w-1/3 bg-primary/40 rounded-full"></div>
                                                                </div>
                                                            </div>
                                                            <span className="text-[10px] font-black text-primary uppercase">Pendiente</span>
                                                        </div>
                                                    )}

                                                    {/* Botón de CTA */}
                                                    {faq.ctaText && (
                                                        <div>
                                                            <a 
                                                                href="https://wa.me/593983237491?text=Hola,%20acabo%20de%20ver%20los%20videos%20y%20quiero%20crear%20mi%20trajeta%20ActivaQR" 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="inline-flex w-full md:w-auto items-center justify-center gap-2 bg-primary text-white font-black uppercase tracking-widest px-8 py-3.5 rounded-xl hover:bg-navy hover:text-white hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 text-sm"
                                                            >
                                                                {faq.ctaText} <ShoppingBag size={18} />
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Video Player */}
                                                {(faq.videoUrl) && (
                                                    <div className="w-full max-w-[220px] aspect-[9/16] shrink-0 bg-black rounded-[2.5rem] p-2 sm:p-2.5 shadow-xl border-[3px] border-[#1a1a2e] relative order-1 md:order-2 mx-auto">
                                                        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-b-xl z-20 flex justify-center items-center">
                                                            <div className="w-10 h-3 bg-white/5 rounded-full"></div>
                                                        </div>

                                                        <div className="w-full h-full bg-navy rounded-[2rem] overflow-hidden relative">
                                                            {faq.videoSourceType === 'bunny' ? (
                                                                <iframe
                                                                    src={`${STREAM_BASE_URL}/${faq.videoUrl}?autoplay=false&loop=false&muted=false&preload=true&responsive=true`}
                                                                    loading="lazy"
                                                                    title={`Explicación de: ${faq.q}`}
                                                                    className="w-full h-full border-none"
                                                                    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                                                                    allowFullScreen
                                                                ></iframe>
                                                            ) : (
                                                                <iframe
                                                                    className="w-full h-full object-cover scale-[1.05]"
                                                                    src={`https://www.youtube.com/embed/${faq.videoUrl}?autoplay=0&controls=1&modestbranding=1&rel=0`}
                                                                    title={`FAQ Video - ${faq.tag}`}
                                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                    allowFullScreen
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                                
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
