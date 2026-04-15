"use client";

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { PLANES_DATA, Plan } from '@/constants/planes';

interface PricingSectionProps {
    initialPlanId?: string;
    onQuoteClick?: () => void;
}

export function PricingSection({ initialPlanId, onQuoteClick }: PricingSectionProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Encontrar el índice del plan inicial si se provee
    useEffect(() => {
        if (initialPlanId) {
            const index = PLANES_DATA.findIndex(p => p.id === initialPlanId);
            if (index !== -1) {
                setActiveIndex(index);
                // En móvil, centrar el scroll
                if (window.innerWidth < 768 && scrollRef.current) {
                    const cardWidth = window.innerWidth * 0.85; // Basado en el width de la card en móvil
                    scrollRef.current.scrollTo({
                        left: index * (cardWidth + 24), // 24 es el gap aproximado
                        behavior: 'smooth'
                    });
                }
            }
        }
    }, [initialPlanId]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const scrollPosition = e.currentTarget.scrollLeft;
        const cardWidth = e.currentTarget.offsetWidth * 0.85;
        const newIndex = Math.round(scrollPosition / cardWidth);
        if (newIndex !== activeIndex && newIndex >= 0 && newIndex < PLANES_DATA.length) {
            setActiveIndex(newIndex);
        }
    };

    return (
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

                {/* DESKTOP GRID / MOBILE CAROUSEL */}
                <div 
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 items-stretch relative overflow-x-auto md:overflow-x-visible snap-x snap-mandatory scrollbar-hide pb-8 md:pb-0"
                >
                    {PLANES_DATA.map((plan, index) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={`group relative min-w-[85vw] md:min-w-0 h-[650px] rounded-[4rem] overflow-hidden border border-white/40 shadow-2xl transition-all duration-700 hover:scale-[1.02] snap-center ${
                                plan.isFeatured ? 'ring-4 ring-primary/30 z-10' : ''
                            }`}
                        >
                            {/* Background Image */}
                            <div className="absolute inset-0 z-0">
                                <Image 
                                    src={plan.image} 
                                    alt={plan.name} 
                                    fill
                                    sizes="(max-width: 768px) 100vw, 25vw"
                                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-80"></div>
                            </div>

                            {/* Content Overlay */}
                            <div className="absolute bottom-0 left-0 w-full p-4 sm:p-6 z-10">
                                <div className="bg-white/10 backdrop-blur-[30px] border border-white/20 p-6 sm:p-8 rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] transform transition-transform duration-500 group-hover:translate-y-[-10px]">
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

                                    <p className="text-white/80 text-[10px] font-medium leading-relaxed mb-4 h-[45px] overflow-hidden">
                                        {plan.description}
                                    </p>

                                    <div className="flex items-start gap-1 mb-6">
                                        <span className="text-xl font-black text-white mt-1">$</span>
                                        <span className="text-5xl font-black text-white tracking-tighter leading-none">{plan.price}</span>
                                        <span className="text-white/40 text-[10px] font-black uppercase tracking-widest self-end pb-1">{plan.period}</span>
                                    </div>

                                    <div className="space-y-3 mb-8">
                                        {plan.features.slice(0, 3).map((feature, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg shrink-0">
                                                    <CheckCircle2 size={12} className="text-white" />
                                                </div>
                                                <span className="text-white/90 font-bold text-[11px] leading-tight">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {plan.link ? (
                                        <Link href={plan.link} className="block w-full bg-white text-navy py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-center transition-all hover:bg-primary hover:text-white shadow-xl">
                                            {plan.cta}
                                        </Link>
                                    ) : (
                                        <button 
                                            onClick={onQuoteClick}
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

                {/* Mobile Navigation Dots / Progress */}
                <div className="flex md:hidden justify-center gap-2 mt-8">
                    {PLANES_DATA.map((_, i) => (
                        <div 
                            key={i} 
                            className={`h-1.5 transition-all duration-300 rounded-full ${
                                i === activeIndex ? 'w-8 bg-primary' : 'w-2 bg-navy/10'
                            }`}
                        />
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
    );
}
