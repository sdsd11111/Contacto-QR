"use client";

import React from 'react';
import { motion } from 'framer-motion';
import type { HedkandiTemplateProps } from './types';

/** Imágenes de fallback organizadas por categoría visual para la grilla de experiencia */
const FALLBACK_EXPERIENCE_IMAGES = [
    'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519699047748-de8e457a634e?q=80&w=600&auto=format&fit=crop',
];

export default function HedkandiTemplate(props: HedkandiTemplateProps) {
    // Auto-play for the Hero Slider
    React.useEffect(() => {
        if (props.activeSlides && props.activeSlides.length > 1) {
            const interval = setInterval(() => {
                const nextIndex = ((props.currentSlideIndex || 0) + 1) % props.activeSlides!.length;
                props.setCurrentSlideIndex?.(nextIndex);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [props.activeSlides, props.currentSlideIndex, props.setCurrentSlideIndex]);

    return (
        <div className="w-full min-h-screen bg-white text-[#1A1A1A] overflow-x-hidden selection:bg-[#7292ab] selection:text-white">
            
            {/* INJECT CUSTOM FONTS AND HIDE GLOBAL HEADER/FOOTER */}
            <style dangerouslySetInnerHTML={{__html: `
                @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Montserrat:wght@300;400;500&display=swap');
                
                .font-display-condensed { font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.05em; }
                .font-serif-elegant { font-family: 'Cormorant Garamond', serif; }
                .font-sans-body { font-family: 'Montserrat', sans-serif; }
                
                /* Hide global navigation for this template */
                header, footer, nav { display: none !important; }
            `}} />

            {/* 1. HERO SECTION */}
            <section className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center bg-[#1A1A1A]">
                {/* Dynamic Banner Slider */}
                <div className="absolute inset-0 z-0">
                    {props.activeSlides && props.activeSlides.length > 0 ? (
                        props.activeSlides.map((slide, idx) => (
                            <motion.div
                                key={slide.id || idx}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: props.currentSlideIndex === idx ? 1 : 0 }}
                                transition={{ duration: 1.5, ease: "easeInOut" }}
                                className="absolute inset-0 bg-cover bg-center"
                                style={{ 
                                    backgroundImage: `url(${slide.portada_desktop || slide.portada_movil || props.data?.portada_desktop})`,
                                    display: props.currentSlideIndex === idx ? 'block' : 'none'
                                }}
                            >
                                <div className="absolute inset-0 bg-black/50"></div>
                            </motion.div>
                        ))
                    ) : (
                        <div 
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ 
                                backgroundImage: `url(${props.data?.portada_desktop || props.data?.portada_movil})` 
                            }}
                        >
                            <div className="absolute inset-0 bg-black/50"></div>
                        </div>
                    )}
                </div>

                {/* Main Hero Content */}
                <div className="relative z-10 text-center px-4 max-w-5xl">
                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="flex flex-col items-center"
                    >
                        <h1 className="text-white text-6xl md:text-[9rem] leading-none font-display-condensed uppercase drop-shadow-2xl mb-4">
                            {props.activeSlides && props.activeSlides[props.currentSlideIndex || 0]?.title 
                                ? props.activeSlides[props.currentSlideIndex || 0].title 
                                : (props.data?.nombre_negocio || "FOR THOSE WHO KNOW")}
                        </h1>
                        
                        {(props.activeSlides?.[props.currentSlideIndex || 0]?.description || props.data?.bio) && (
                            <p className="text-white/80 font-sans-body text-xs md:text-sm uppercase tracking-[0.3em] mb-12 max-w-2xl mx-auto leading-relaxed">
                                {props.activeSlides?.[props.currentSlideIndex || 0]?.description || props.data?.bio || "PREMIUM EXPERIENCE"}
                            </p>
                        )}

                        {/* CTA BUTTON */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={props.downloadVCF}
                            className="bg-white text-black px-12 py-4 font-display-condensed text-xl tracking-widest uppercase hover:bg-black hover:text-white transition-colors duration-300"
                        >
                            SAVE CONTACT
                        </motion.button>
                    </motion.div>
                </div>

                {/* Slide Indicators (Dots) */}
                {props.activeSlides && props.activeSlides.length > 1 && (
                    <div className="absolute bottom-16 z-20 flex gap-3">
                        {props.activeSlides.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => props.setCurrentSlideIndex?.(idx)}
                                className={`h-[2px] transition-all duration-500 ${
                                    props.currentSlideIndex === idx ? 'w-12 bg-white' : 'w-6 bg-white/30'
                                }`}
                            />
                        ))}
                    </div>
                )}
                
                {/* Scroll Indicator */}
                <motion.div 
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20"
                >
                    <div className="w-[1px] h-12 bg-gradient-to-b from-white/0 via-white to-white/0"></div>
                </motion.div>
            </section>
            {/* 2. THE EXPERIENCE GRID (3 COLUMNS) — Data-driven con imágenes configurables */}
            {!props.hideExperience && (() => {
                const rawLines = props.data?.productos_servicios
                    ?.split('\n')
                    .filter((l: string) => l.trim().length > 0)
                    .slice(0, 6) || [];

                const columns = rawLines.length >= 1
                    ? rawLines.map((cat: string, i: number) => {
                        // Buscar imagen personalizada por índice
                        const customImg = props.experienceImages?.find(e => e.index === i);
                        
                        // Protocolo VIP: Aplicar reemplazo si existe en los props (spread de json_override)
                        const displayTitle = (props as any)[cat] || cat;
                        
                        return {
                            title: displayTitle.replace(/[^\w\sáéíóúÁÉÍÓÚñÑ]/g, '').trim().toUpperCase(),
                            num: `0${i + 1}`,
                            subtitle: props.experienceSubtitle || 'Especialidad',
                            img: customImg?.url || FALLBACK_EXPERIENCE_IMAGES[i % FALLBACK_EXPERIENCE_IMAGES.length],
                        };
                    })
                    : [
                        { title: 'SERVICES', num: '01', subtitle: 'Premium Care', img: FALLBACK_EXPERIENCE_IMAGES[0] },
                        { title: 'STYLING', num: '02', subtitle: 'Expert Cut', img: FALLBACK_EXPERIENCE_IMAGES[1] },
                        { title: 'BEAUTY', num: '03', subtitle: 'Full Spa', img: FALLBACK_EXPERIENCE_IMAGES[2] },
                    ];

                return (
                    <section className="py-24 px-4 md:px-12 max-w-7xl mx-auto">
                        <h2 className="text-center font-display-condensed text-4xl md:text-5xl mb-16 tracking-widest text-black uppercase">
                            {props.experienceTitle || (props.data?.nombre_negocio ? `THE ${props.data.nombre_negocio} EXPERIENCE` : "THE NEW GUEST EXPERIENCE")}
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-4 lg:gap-8">
                            {columns.map((col: any, idx: number) => (
                                <div key={idx} className="relative group cursor-pointer">
                                    <div className="aspect-[4/5] md:aspect-square overflow-hidden relative">
                                        <img
                                            src={col.img}
                                            alt={col.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="bg-white/80 backdrop-blur-sm px-8 py-3 text-sm font-sans-body tracking-widest uppercase transition-colors group-hover:bg-white text-center">
                                                {col.title}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-end mt-2">
                                        <span className="font-display-condensed text-7xl md:text-8xl leading-none text-black -ml-2">
                                            {col.num}
                                        </span>
                                        <span className="font-sans-body text-xs md:text-sm uppercase tracking-widest pb-2 ml-4">
                                            {col.subtitle}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                );
            })()}

            {/* ─── SLOT 1: Después de Experience Grid (menú, galería, servicios) ─── */}
            {props.afterExperienceSlot}

            {/* 3. BIOGRAPHY SECTION WITH MASK */}
            <section className="bg-[#1A1A1A] text-white py-32 px-4 md:px-12">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
                    <div className="w-full md:w-1/2 font-sans-body text-sm md:text-base leading-relaxed tracking-wide font-light">
                        {/* Logo del cliente */}
                        {props.data?.foto_url && (
                            <div className="mb-10">
                                <img 
                                    src={props.data.foto_url} 
                                    alt={props.data.nombre_negocio}
                                    className="w-20 h-20 md:w-24 md:h-24 object-contain grayscale hover:grayscale-0 transition-all duration-700"
                                />
                            </div>
                        )}
                        
                        <div className="mb-8 max-w-md whitespace-pre-line text-white/80">
                            {props.data?.bio || "Expertos en crear experiencias únicas de belleza y bienestar."}
                        </div>
                        <p 
                            className="max-w-md font-display-condensed text-2xl tracking-widest uppercase opacity-70 italic"
                            style={{ color: props.themePrimary !== '#1A1A1A' ? props.themePrimary : '#dc2626' }}
                        >
                            {props.data?.profesion || "Premium Experience"}
                        </p>
                    </div>
                    <div className="w-full md:w-1/2 flex justify-center">
                        {(props.data?.video_url || props.data?.youtube_url || props.data?.youtube_video_url) ? (
                            <div className="w-full max-w-[320px] rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 bg-black/20 group relative shadow-black/50">
                                <div className="aspect-[9/16] video-container-tiktok bg-black/40">
                                    <iframe 
                                        width="100%" 
                                        height="100%" 
                                        src={(() => {
                                            const url = props.data?.video_url || props.data?.youtube_video_url || props.data?.youtube_url;
                                            if (url?.includes('tiktok')) {
                                                return `https://www.tiktok.com/embed/v2/${url.split('/').pop()?.split('?')[0]}`;
                                            }
                                            return url;
                                        })()} 
                                        title="Video player" 
                                        frameBorder="0" 
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                        allowFullScreen 
                                        className="w-full h-full opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                                    ></iframe>
                                </div>
                            </div>
                        ) : (
                            <div className="relative aspect-square overflow-hidden grayscale hover:grayscale-0 transition-all duration-1000 w-full">
                                <img 
                                    src={props.data?.foto_url || "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800&auto=format&fit=crop"} 
                                    alt="Studio"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* 4. GOOGLE TRUST & SOCIAL SECTION */}
            <section className="bg-[#1A1A1A] py-24 px-4 md:px-12 relative overflow-hidden">
                {/* Background ambient glow */}
                <div 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none opacity-20"
                    style={{ backgroundColor: props.themePrimary !== '#1A1A1A' ? props.themePrimary : '#dc2626' }}
                ></div>

                <div className="max-w-4xl mx-auto relative z-10">
                    <div className="border border-white/10 bg-white/5 backdrop-blur-xl rounded-[3rem] p-8 md:p-16 flex flex-col items-center text-center shadow-2xl">
                        {/* Title with lines */}
                        <div className="flex items-center gap-4 mb-10 w-full justify-center">
                            <div 
                                className="h-[1px] flex-1 opacity-50"
                                style={{ background: `linear-gradient(to right, transparent, ${props.themePrimary !== '#1A1A1A' ? props.themePrimary : '#dc2626'})` }}
                            ></div>
                            <span 
                                className="font-sans-body text-[10px] md:text-xs tracking-[0.3em] uppercase font-bold"
                                style={{ color: props.themePrimary !== '#1A1A1A' ? props.themePrimary : '#dc2626' }}
                            >
                                TESTIMONIO DE NUESTROS CLIENTES
                            </span>
                            <div 
                                className="h-[1px] flex-1 opacity-50"
                                style={{ background: `linear-gradient(to left, transparent, ${props.themePrimary !== '#1A1A1A' ? props.themePrimary : '#dc2626'})` }}
                            ></div>
                        </div>

                        {/* Stars */}
                        <div className="flex gap-2 mb-6">
                            {[...Array(5)].map((_, i) => (
                                <svg 
                                    key={i} 
                                    className="w-6 h-6 md:w-8 md:h-8 fill-current" 
                                    viewBox="0 0 20 20"
                                    style={{ color: props.themePrimary !== '#1A1A1A' ? props.themePrimary : '#dc2626' }}
                                >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>

                        {/* Rating Number */}
                        <div className="font-display-condensed text-8xl md:text-9xl leading-none text-white mb-4">
                            {props.data?.rating || "5.0"}
                        </div>
                        <div className="font-sans-body text-xs md:text-sm tracking-widest uppercase text-white/60 mb-10">
                            {props.data?.reviews || "10+"} RESEÑAS EN <span className="font-bold" style={{ color: props.themePrimary !== '#1A1A1A' ? props.themePrimary : '#dc2626' }}>GOOGLE BUSINESS</span>
                        </div>

                        {/* Quote */}
                        <p className="font-sans-body text-sm md:text-lg text-white/80 italic mb-12 max-w-2xl leading-relaxed">
                            "{props.data?.testimonio_destacado || "Gracias a nuestra comunidad por calificarnos. ¡Tu opinión nos ayuda a crecer!"}"
                        </p>

                        {/* Action Button */}
                        <a 
                            href={props.data?.google_maps_url || props.data?.link_google_maps || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative flex items-center gap-4 bg-white/5 border border-white/10 hover:bg-white/10 px-8 md:px-12 py-5 rounded-2xl transition-all duration-500"
                        >
                            <div 
                                className="w-10 h-10 rounded-lg flex items-center justify-center transition-all"
                                style={{ 
                                    backgroundColor: `${props.themePrimary !== '#1A1A1A' ? props.themePrimary : '#dc2626'}33`,
                                    color: props.themePrimary !== '#1A1A1A' ? props.themePrimary : '#dc2626'
                                }}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <span className="font-display-condensed text-lg md:text-xl tracking-[0.2em] text-white uppercase">
                                VER TODAS LAS RESEÑAS Y CÓMO LLEGAR
                            </span>
                        </a>

                        {/* Social Links Row */}
                        <div className="mt-16 flex flex-wrap justify-center gap-8 md:gap-12">
                            {['instagram', 'whatsapp', 'facebook', 'tiktok_url'].map((social) => {
                                const url = props.data?.[social];
                                if (!url) return null;
                                return (
                                    <a 
                                        key={social}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-white/40 hover:text-red-500 transition-colors duration-300"
                                    >
                                        {social === 'instagram' && <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>}
                                        {social === 'whatsapp' && <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>}
                                        {social === 'facebook' && <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>}
                                        {social === 'tiktok_url' && <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.53.68V17c0 .02 0 .03 0 .05 0 2.25-1.83 4.07-4.08 4.07s-4.08-1.83-4.08-4.07c0-2.25 1.83-4.07 4.08-4.07.43 0 .85.07 1.24.2v-2.6c-.4-.06-.8-.1-1.24-.1-3.69 0-6.68 2.99-6.68 6.68S4.77 23.88 8.45 23.88c3.69 0 6.68-2.99 6.68-6.68V7.1c1.06.78 2.37 1.25 3.77 1.32V5.78c-1.58-.05-3-.79-3.96-2.01-.54-.7-.88-1.55-.94-2.48l-.02-.61h-1.45z"/></svg>}
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── SLOT 2: Antes de Marquee CTA (info secundaria, ubicación, horarios) ─── */}
            {props.beforeMarqueeSlot}

            {/* 5. MARQUEE & CTA SECTION */}
            <section className="bg-white py-24 border-y border-black overflow-hidden relative">
                {/* Custom CSS for Marquee */}
                <style dangerouslySetInnerHTML={{ __html: `
                    @keyframes marquee-scroll {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                    .animate-hedkandi-marquee {
                        display: flex;
                        width: fit-content;
                        animation: marquee-scroll 30s linear infinite;
                    }
                `}} />

                <div className="animate-hedkandi-marquee whitespace-nowrap mb-12">
                    {[...Array(10)].map((_, i) => (
                        <span key={i} className="font-display-condensed text-[10rem] md:text-[15rem] leading-none text-black mx-8 uppercase italic opacity-10">
                            {props.data?.nombre_negocio || "HEDKANDI"}
                        </span>
                    ))}
                </div>

                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-center px-4">
                    <h4 className="font-display-condensed text-3xl md:text-4xl tracking-widest mb-8 text-black">
                        ¿LISTO PARA TU TRANSFORMACIÓN?
                    </h4>
                    <button 
                        onClick={props.downloadVCF}
                        className="bg-black text-white px-12 md:px-16 py-4 md:py-5 font-display-condensed text-xl md:text-2xl tracking-widest uppercase hover:bg-white hover:text-black hover:border-black border border-transparent transition-all duration-500"
                    >
                        GUARDAR CONTACTO
                    </button>
                </div>
            </section>

            {/* ─── SLOT 3: Después de todo (footer, ubicación, delivery) ─── */}
            {props.afterMarqueeSlot}
        </div>
    );
}
