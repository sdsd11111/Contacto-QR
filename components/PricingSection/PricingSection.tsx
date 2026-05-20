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
    const [isPaused, setIsPaused] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-play cada 3 segundos para mayor dinamismo
    useEffect(() => {
        if (isPaused) return;
        
        const interval = setInterval(() => {
            setActiveIndex((current) => (current + 1) % PLANES_DATA.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [isPaused]);

    // Encontrar el índice del plan inicial si se provee
    useEffect(() => {
        if (initialPlanId) {
            const index = PLANES_DATA.findIndex(p => p.id === initialPlanId);
            if (index !== -1) {
                setActiveIndex(index);
            }
        }
    }, [initialPlanId]);

    return (
        <section 
            className="py-24 bg-cream section-dark relative overflow-hidden" 
            id="precios" 
            style={{ position: 'relative', zIndex: 10 }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
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
                    <h2 className="text-4xl md:text-7xl font-black text-foreground tracking-tighter uppercase mb-6 leading-none">
                        El sistema que <span className="text-primary italic transition-all duration-700 hover:text-royal">se paga solo</span>
                    </h2>
                    <div className="flex flex-col items-center gap-10">
                        <div className="flex flex-wrap justify-center gap-4 text-foreground/40 text-[10px] font-black uppercase tracking-[0.2em]">
                            <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-green-500" /> Sin Contratos</span>
                            <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-green-500" /> 7 Días de Garantía</span>
                            <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-green-500" /> Todas las tarjetas</span>
                        </div>
                    </div>
                </div>

                {/* CAROUSEL CONTAINER */}
                <div className="relative h-[750px] flex items-center justify-center overflow-hidden">
                    {/* Navigation Buttons */}
                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-between px-4 z-50 pointer-events-none">
                        <button 
                            onClick={() => {
                                setActiveIndex(prev => (prev === 0 ? PLANES_DATA.length - 1 : prev - 1));
                                setIsPaused(true);
                            }}
                            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white pointer-events-auto transition-all hover:bg-primary hover:border-primary"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                        </button>
                        <button 
                            onClick={() => {
                                setActiveIndex(prev => (prev === PLANES_DATA.length - 1 ? 0 : prev + 1));
                                setIsPaused(true);
                            }}
                            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white pointer-events-auto transition-all hover:bg-primary hover:border-primary"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                        </button>
                    </div>

                    <div className="relative w-full max-w-5xl flex items-center justify-center h-full">
                        <AnimatePresence mode="popLayout">
                            {PLANES_DATA.map((plan, index) => {
                                // Circular position mapping for infinite loop
                                let position = index - activeIndex;
                                const half = PLANES_DATA.length / 2;
                                if (position > half) {
                                    position -= PLANES_DATA.length;
                                } else if (position < -half) {
                                    position += PLANES_DATA.length;
                                }
                                const isActive = index === activeIndex;
                                const isVisible = Math.abs(position) <= 2;

                                if (!isVisible) return null;

                                return (
                                    <motion.div
                                        key={plan.id}
                                        initial={false}
                                        animate={{
                                            x: `calc(-50% + ${position * 340}px)`, // Centrado perfecto + offset
                                            scale: isActive ? 1.05 : (Math.abs(position) === 1 ? 0.85 : 0.7),
                                            zIndex: 30 - Math.abs(position) * 10,
                                            opacity: isActive ? 1 : (Math.abs(position) === 1 ? 0.4 : 0),
                                            filter: isActive ? 'blur(0px)' : (Math.abs(position) === 1 ? 'blur(4px)' : 'blur(8px)'),
                                            left: '50%',
                                            pointerEvents: isActive || Math.abs(position) === 1 ? 'auto' : 'none'
                                        }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 260,
                                            damping: 25
                                        }}
                                        onClick={() => {
                                            setActiveIndex(index);
                                            setIsPaused(true);
                                        }}
                                        className={`absolute cursor-pointer group w-[320px] h-[650px] rounded-[4rem] overflow-hidden border border-white/40 shadow-2xl transition-all duration-700 ${
                                            isActive ? 'ring-4 ring-primary/30' : ''
                                        }`}
                                    >
                                        {/* Background Image / Special Design for Auditoría */}
                                        <div className="absolute inset-0 z-0">
                                            {plan.id === 'auditoria' ? (
                                                <div className="absolute inset-0 bg-[#0a0a0a]">
                                                    {/* Dot Grid */}
                                                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#FF6B2B 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }} />
                                                    
                                                    {/* Top Section with Scanning Image */}
                                                    <div className="absolute top-0 left-0 w-full h-1/2 overflow-hidden">
                                                        <img 
                                                            src={plan.image} 
                                                            alt={plan.name} 
                                                            className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale" 
                                                        />
                                                        <motion.div 
                                                            animate={{ top: ['0%', '100%'] }} 
                                                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                                            className="absolute left-0 w-full h-[2px] bg-[#FF6B2B] shadow-[0_0_15px_#FF6B2B] z-10" 
                                                        />
                                                    </div>

                                                    {/* Bottom Section Gradient for text readability */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
                                                </div>
                                            ) : (
                                                <>
                                                    <img 
                                                        src={plan.image} 
                                                        alt={plan.name} 
                                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                                    />
                                                    <div className={`absolute inset-0 bg-gradient-to-t ${
                                                        plan.color === 'black' ? 'from-black via-black/60' : 
                                                        plan.color === 'navy' ? 'from-navy via-navy/40' : 
                                                        'from-primary via-primary/40'
                                                    } to-transparent opacity-95 transition-opacity duration-500 group-hover:opacity-80`}></div>
                                                </>
                                            )}
                                        </div>

                                        {/* Content Overlay */}
                                        <div className="absolute bottom-0 left-0 w-full p-4 sm:p-6 z-10">
                                            <div className={`${
                                                plan.id === 'auditoria' 
                                                ? 'bg-black/60 backdrop-blur-2xl border border-white/10' 
                                                : 'bg-white/10 backdrop-blur-[30px] border border-white/20'
                                            } p-6 sm:p-8 rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] transform transition-transform duration-500`}>
                                                {plan.badge && (
                                                    <div className="bg-primary text-white text-[8px] font-black uppercase tracking-[0.25em] px-5 py-2 rounded-full shadow-2xl absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap z-20">
                                                        {plan.badge}
                                                    </div>
                                                )}
                                                
                                                <div className="mb-4">
                                                    <h3 className={`font-black text-white uppercase tracking-tighter leading-[0.95] drop-shadow-lg ${
                                                        plan.id === 'auditoria' ? 'text-3xl mb-4' : 'text-xl'
                                                    }`}>
                                                        {plan.name}
                                                    </h3>
                                                    <p className={`font-black uppercase tracking-[0.25em] italic drop-shadow-md ${
                                                        plan.id === 'auditoria' ? 'text-sm text-[#FF6B2B]' : 'text-[9px] text-primary mt-1'
                                                    }`}>
                                                        {plan.subtitle}
                                                    </p>
                                                </div>

                                                <p className={`text-white/80 font-medium leading-relaxed mb-6 overflow-hidden ${
                                                    plan.id === 'auditoria' ? 'text-sm' : 'text-[10px] h-[45px]'
                                                }`}>
                                                    {plan.description}
                                                </p>

                                                {plan.price && (
                                                    <div className="flex items-start gap-1 mb-6">
                                                        <span className="text-xl font-black text-white mt-1">$</span>
                                                        <span className="text-4xl font-black text-white tracking-tighter leading-none">{plan.price}</span>
                                                        <span className="text-white/40 text-[10px] font-black uppercase tracking-widest self-end pb-1">{plan.period}</span>
                                                    </div>
                                                )}

                                                {plan.features.length > 0 && (
                                                    <div className="space-y-3 mb-8">
                                                        {plan.features.slice(0, 4).map((feature, i) => (
                                                            <div key={i} className="flex items-center gap-3">
                                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-lg shrink-0 ${
                                                                    plan.id === 'auditoria' ? 'bg-[#FF6B2B]' : 'bg-primary'
                                                                }`}>
                                                                    <CheckCircle2 size={12} className="text-white" />
                                                                </div>
                                                                <span className="text-white/90 font-bold text-[11px] leading-tight">{feature}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {plan.link ? (
                                                    <Link href={plan.link} className={`block w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-center transition-all shadow-xl ${
                                                        plan.id === 'auditoria' 
                                                        ? 'bg-[#FF6B2B] text-white hover:bg-white hover:text-black' 
                                                        : 'bg-white text-navy hover:bg-primary hover:text-white'
                                                    }`}>
                                                        {plan.cta}
                                                    </Link>
                                                ) : (
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onQuoteClick?.();
                                                        }}
                                                        className="block w-full bg-primary text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-center transition-all hover:bg-white hover:text-navy shadow-xl shadow-primary/30"
                                                    >
                                                        {plan.cta}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Navigation Dots */}
                <div className="flex justify-center gap-3 mt-8">
                    {PLANES_DATA.map((_, i) => (
                        <button 
                            key={i} 
                            onClick={() => {
                                setActiveIndex(i);
                                setIsPaused(true);
                            }}
                            className={`h-2 transition-all duration-300 rounded-full ${
                                i === activeIndex ? 'w-10 bg-primary shadow-[0_0_15px_rgba(255,107,0,0.5)]' : 'w-2 bg-white/20 hover:bg-white/40'
                            }`}
                            aria-label={`Go to slide ${i + 1}`}
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
