"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, ShieldCheck, Users, QrCode, Smartphone, Star, MapPin, Briefcase, Zap, Download, Utensils, PlayCircle, Gift, Headphones } from "lucide-react";
import { ObjectionSection } from "@/components/ObjectionSection";
import Link from "next/link";
import { useEffect } from "react";

export default function ContactoBusinessPage() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <main className="min-h-screen bg-cream selection:bg-primary/30 font-sans text-navy">
            {/* Hero Fullscreen */}
            <section className="relative h-screen min-h-[800px] w-full flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0 bg-navy">
                    <img 
                        src="/images/ActivaQR_hero.webp" 
                        alt="Hero background" 
                        className="w-full h-full object-cover opacity-50 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-navy/70 via-navy/40 to-cream"></div>
                </div>

                <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-md px-4 py-2 rounded-full border border-primary/30 shadow-lg mb-8"
                    >
                        <Star className="text-primary w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-widest text-primary">El Perfil Para Profesionales</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="text-5xl md:text-7xl font-black text-white leading-tight mb-8 tracking-tighter"
                    >
                        Proyecta Confianza Absoluta con <br/>
                        <span className="text-primary italic">Contacto Business</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="text-xl text-white/80 max-w-2xl mx-auto font-medium mb-12 leading-relaxed"
                    >
                        Eleva la percepción de tu marca. Un perfil empresarial completo con múltiples enlaces, tu ubicación en Maps y botones de acción directos para que cierres más ventas.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        <Link
                            href="/registro?plan=business"
                            className="w-full sm:w-auto bg-primary text-white px-10 py-5 rounded-2xl font-black text-lg shadow-2xl shadow-primary/30 hover:-translate-y-1 transition-transform flex items-center justify-center gap-3 uppercase tracking-widest"
                        >
                            Obtener por $100/año <ArrowRight size={20} />
                        </Link>
                        <a
                            href="#caracteristicas"
                            className="w-full sm:w-auto bg-white/10 backdrop-blur-md text-white px-10 py-5 rounded-2xl font-bold text-lg border border-white/20 hover:bg-white/20 transition-colors flex items-center justify-center"
                        >
                            Ver Detalles
                        </a>
                    </motion.div>
                </div>
            </section>

            {/* Características Section */}
            <section id="caracteristicas" className="py-24 bg-cream relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black text-navy uppercase tracking-tighter">
                            Mucho más que <span className="text-primary italic">contacto</span>
                        </h2>
                        <p className="text-navy/60 mt-4 text-xl font-medium max-w-2xl mx-auto">
                            El plan Business está diseñado para negocios físicos o profesionales que quieren generar impacto desde el primer segundo.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                image: "/images/features/perfil.png",
                                title: "Perfil Empresarial",
                                desc: "Muestra la información de tu marca, logo y descripción destacada para generar total confianza profesional."
                            },
                            {
                                image: "/images/features/enlaces.png",
                                title: "Múltiples Enlaces",
                                desc: "Centraliza tu presencia digital. Agrega tu sitio web, WhatsApp, Instagram, Facebook, TikTok y cualquier información vital."
                            },
                            {
                                image: "/images/features/ubicacion.png",
                                title: "Ubicación en Maps",
                                desc: "Facilita la llegada de tus clientes. Integraremos el mapa de tu negocio físico directamente en tu perfil."
                            },
                            {
                                image: "/images/features/soporte.png",
                                title: "Soporte Prioritario",
                                desc: "Asistencia rápida y prioritaria para cualquier cambio, duda o configuración que requiera tu empresa."
                            },
                            {
                                image: "/images/features/agenda.png",
                                title: "Guardado en Agenda",
                                desc: "Tus clientes descargarán y guardarán tu contacto directamente en sus teléfonos con un solo botón."
                            },
                            {
                                image: "/images/features/qr.png",
                                title: "Código QR Dinámico",
                                desc: "Podrás cambiar tu información en cualquier momento y tu código impreso seguirá funcionando sin problemas."
                            }
                        ].map((feat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white p-0 rounded-[2.5rem] shadow-xl border border-navy/5 hover:border-primary/30 hover:shadow-2xl transition-all group overflow-hidden flex flex-col"
                            >
                                <div className="w-full aspect-video overflow-hidden border-b border-navy/5">
                                    <img 
                                        src={feat.image} 
                                        alt={feat.title} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                    />
                                </div>
                                <div className="p-8">
                                    <h3 className="text-xl font-black text-navy mb-3">{feat.title}</h3>
                                    <p className="text-navy/60 font-medium leading-relaxed">{feat.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Nueva Sección: Promociones y Contenido Dinámico */}
            <section className="py-24 bg-navy relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-8 leading-[0.9]">
                                    Potencia tus Ventas con <span className="text-primary italic">Contenido Dinámico</span>
                                </h2>
                                <p className="text-white/70 text-xl font-medium mb-12 leading-relaxed">
                                    No es solo una tarjeta, es una herramienta de marketing activa. Cambia tus promociones según la temporada y mantén a tus clientes comprometidos.
                                </p>

                                <div className="space-y-8">
                                    {[
                                        {
                                            icon: <Gift className="text-primary" size={28} />,
                                            title: "Ofertas de Temporada",
                                            desc: "Usa el banner principal (Hero) para anunciar promociones especiales, descuentos de temporada o lanzamientos."
                                        },
                                        {
                                            icon: <Utensils className="text-primary" size={28} />,
                                            title: "Menú Digital Express",
                                            desc: "Si eres un restaurante, permite que tus clientes vean tu menú actualizado con un solo clic directamente desde tu perfil."
                                        },
                                        {
                                            icon: <Download className="text-primary" size={28} />,
                                            title: "Descarga de Documentos",
                                            desc: "Comparte catálogos en PDF, listas de precios o cupones de descuento que tus clientes pueden guardar en sus archivos."
                                        }
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-6 group">
                                            <div className="w-14 h-14 shrink-0 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                {item.icon}
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-black text-white mb-2 uppercase italic tracking-tight">{item.title}</h4>
                                                <p className="text-white/50 font-medium leading-relaxed">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        <div className="lg:w-1/2 relative">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
                                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                                className="relative z-10"
                            >
                                <MockupTelefono />
                            </motion.div>
                            
                            {/* Decorative background elements */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/30 rounded-full blur-[100px] animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Comparativa / Before vs After */}
            <section className="py-24 bg-white border-y border-navy/5">
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-5xl font-black text-navy mb-16 tracking-tighter uppercase">
                        ¿Por qué dar el salto <span className="text-primary italic">al plan business?</span>
                    </h2>

                    <div className="grid md:grid-cols-2 gap-8 text-left">
                        <div className="bg-red-50 p-8 rounded-[2rem] border border-red-100 relative">
                            <div className="absolute top-4 right-4 bg-red-100 text-red-500 text-xs font-black uppercase px-3 py-1 rounded-full">Contacto Digital</div>
                            <h3 className="text-2xl font-black text-navy mb-6">Percepción de marca "barata"</h3>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <span className="text-red-500 mt-1">❌</span>
                                    <span className="text-navy/70">Clientes que no confían porque no ven nada institucional en tu perfil digital.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-red-500 mt-1">❌</span>
                                    <span className="text-navy/70">No puedes destacar productos o sedes con banners de alto impacto visual (Hero).</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-red-500 mt-1">❌</span>
                                    <span className="text-navy/70">Tus clientes te confunden con un contacto personal. Te ven pequeño y poco profesional.</span>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-primary/5 p-8 rounded-[2rem] border border-primary/20 relative shadow-xl">
                            <div className="absolute top-4 right-4 bg-primary text-white text-xs font-black uppercase px-3 py-1 rounded-full shadow-md">Con Business</div>
                            <h3 className="text-2xl font-black text-navy mb-6">Proyecta éxito inmediato</h3>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 size={20} className="text-primary mt-1 shrink-0" />
                                    <span className="text-navy/80 font-bold">El cliente siente que está tratando con una empresa líder y profesional.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 size={20} className="text-primary mt-1 shrink-0" />
                                    <span className="text-navy/80 font-bold">Imágenes Hero inmersivas (Móvil/Desktop) para promocionar lo más importante.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 size={20} className="text-primary mt-1 shrink-0" />
                                    <span className="text-navy/80 font-bold">Instalado en la agenda para que vuelvan a comprarte siempre, hoy mismo.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Objection Audio Section */}
            <section className="py-12 bg-cream/30 border-y border-navy/5">
                <div className="max-w-5xl mx-auto px-6">
                    <ObjectionSection />
                </div>
            </section>

            {/* Resumen Final CTA */}
            <section className="py-24 bg-navy relative overflow-hidden text-center">
                {/* ... existing code ... */}
            </section>
        </main>
    );
}

function MockupTelefono() {
    return (
        <div className="relative mx-auto w-[320px] h-[640px] bg-navy rounded-[3.5rem] border-[12px] border-navy shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden ring-1 ring-white/10">
            {/* Camera/Notch Area */}
            <div className="h-10 bg-navy w-full flex justify-center items-center rounded-t-[2.5rem] pt-2 relative z-50">
                <div className="w-24 h-6 bg-black rounded-full flex items-center justify-end px-4">
                    <div className="w-1.5 h-1.5 bg-white/10 rounded-full"></div>
                </div>
            </div>

            <div className="flex-1 bg-white p-4 flex flex-col relative overflow-y-auto custom-scrollbar">
                {/* Profile Header */}
                <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mt-2 flex flex-col items-center gap-2 border border-gray-50 relative z-10">
                    <div className="w-16 h-16 bg-navy rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3">
                        <Star className="text-primary" size={32} />
                    </div>
                    <div className="text-center">
                        <div className="font-black text-navy text-xl tracking-tight leading-none mb-1">Tu Negocio Pro</div>
                        <div className="text-[10px] text-navy/40 font-black uppercase tracking-widest">Digital Business Card</div>
                    </div>
                </div>
                
                {/* Action Buttons */}
                <div className="grid grid-cols-4 gap-3 mt-8 px-2">
                    {[Smartphone, MapPin, Users, QrCode].map((Icon, i) => (
                        <div key={i} className="aspect-square bg-navy/5 rounded-2xl flex items-center justify-center text-navy/40 border border-navy/5">
                            <Icon size={20} />
                        </div>
                    ))}
                </div>

                {/* Promotional Card - THE MAIN FOCUS */}
                <div className="mt-8 relative z-10 px-1">
                    <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-primary rounded-[2rem] p-6 shadow-2xl relative overflow-hidden group border border-white/20"
                    >
                        {/* Background effect */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] group-hover:scale-110 transition-transform duration-1000"></div>
                        
                        <div className="relative z-10 text-center">
                            <div className="inline-block bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black text-white uppercase tracking-widest mb-3">
                                Oferta Especial
                            </div>
                            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-1 leading-none">
                                2x1 en Todo
                            </h3>
                            <p className="text-white/80 text-[10px] font-bold mb-6 leading-tight">
                                Servicios de temporada por tiempo limitado
                            </p>
                            
                            <div className="bg-white text-primary py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 group-hover:scale-105 transition-transform">
                                ¡ACCEDE AHORA! <ArrowRight size={14} />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* List Items Placeholder */}
                <div className="mt-6 space-y-3 px-1">
                    {[1, 2].map((_, i) => (
                        <div key={i} className="h-14 bg-navy/5 rounded-2xl border border-navy/5 flex items-center px-4 gap-3 opacity-30">
                            <div className="w-8 h-8 rounded-xl bg-navy/10"></div>
                            <div className="h-2 w-24 bg-navy/10 rounded-full"></div>
                        </div>
                    ))}
                </div>
                
            </div>
            
            {/* Bottom Bar Indicator */}
            <div className="h-6 bg-white w-full flex justify-center items-center pb-2">
                <div className="w-24 h-1 bg-navy/10 rounded-full"></div>
            </div>
        </div>
    );
}
