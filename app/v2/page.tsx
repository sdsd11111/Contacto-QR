"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    CheckCircle2,
    Phone,
    ArrowRight,
    Smartphone,
    Users,
    Star,
    ShieldCheck,
    ChevronRight,
    QrCode,
    BarChart3,
    BrainCircuit,
    AlertTriangle
} from "lucide-react";
import VideoModal from "@/components/VideoModal";
import PopupManager from "@/components/PopupManager";
import Link from "next/link";

export default function HomeV2() {
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

    return (
        <main className="min-h-screen bg-slate-50 selection:bg-primary/30 scroll-smooth relative overflow-x-hidden font-sans text-navy">

            {/* Navbar Minimalista */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-navy/5">
                <div className="max-w-7xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
                    <div className="text-xl md:text-2xl font-black tracking-tighter text-navy flex items-center gap-2">
                        <span className="text-primary">!</span>Regístrame Ya <span className="text-xs bg-navy text-white px-2 py-1 rounded ml-2">BETA</span>
                    </div>
                    <Link href="/diagnostico" className="bg-primary text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-orange hover:scale-105 transition-transform flex items-center gap-2">
                        <BrainCircuit size={16} /> Diagnóstico Gratis
                    </Link>
                </div>
            </nav>

            {/* Hero Section: Neuro-Sales Focused */}
            <section className="relative h-screen min-h-[800px] w-full overflow-hidden flex items-center justify-center">
                {/* Video Background Full Screen */}
                <div className="absolute inset-0 z-0">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover grayscale opacity-60"
                    >
                        <source src="https://cdn.coverr.co/videos/coverr-people-scanning-qr-code-in-meeting-5264/1080p.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-white/20 to-slate-50 z-10"></div>
                </div>

                <div className="max-w-5xl mx-auto text-center relative z-20 px-6 pt-20">

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-navy/10 shadow-sm mb-8"
                    >
                        <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-widest text-navy/80">Neuro-Diagnóstico Disponible</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black text-navy leading-[1.1] mb-8 tracking-tighter drop-shadow-sm"
                    >
                        ¿Estás perdiendo ventas por ser un <span className="text-primary italic border-b-8 border-primary/20">Fantasma Digital?</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl md:text-2xl text-navy/80 mb-12 leading-relaxed max-w-3xl mx-auto font-bold"
                    >
                        El 40% de los clientes no guardan tu número porque es "muy difícil". <br className="hidden md:block" />
                        <span className="text-primary font-black">Descubre tu Arquetipo Digital</span> y cómo solucionarlo en 2 minutos.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    >
                        <Link
                            href="/diagnostico"
                            className="w-full sm:w-auto bg-primary text-white px-8 py-5 rounded-full font-black text-xl shadow-orange hover:translate-y-[-2px] transition-transform flex items-center justify-center gap-3"
                        >
                            Iniciar Test de Ventas <BrainCircuit size={24} />
                        </Link>
                        <button
                            onClick={() => setIsVideoModalOpen(true)}
                            className="w-full sm:w-auto bg-white/90 backdrop-blur-md text-navy px-8 py-5 rounded-full font-bold text-xl border border-navy/10 shadow-lg hover:bg-white transition-colors flex items-center justify-center gap-3"
                        >
                            <Phone size={24} className="text-primary" /> Ver video explicativo
                        </button>
                    </motion.div>

                    {/* Survey Teaser */}
                    <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                        <div className="bg-white/80 backdrop-blur p-4 rounded-xl border border-navy/5 shadow-sm">
                            <div className="text-primary font-black text-3xl mb-1">9/10</div>
                            <div className="text-xs font-bold text-navy/60 uppercase tracking-widest">Clientes Prefieren Foto</div>
                        </div>
                        <div className="bg-white/80 backdrop-blur p-4 rounded-xl border border-navy/5 shadow-sm">
                            <div className="text-primary font-black text-3xl mb-1">7 seg</div>
                            <div className="text-xs font-bold text-navy/60 uppercase tracking-widest">Para captar atención</div>
                        </div>
                        <div className="bg-white/80 backdrop-blur p-4 rounded-xl border border-navy/5 shadow-sm">
                            <div className="text-primary font-black text-3xl mb-1">+40%</div>
                            <div className="text-xs font-bold text-navy/60 uppercase tracking-widest">Ventas con VCard</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section: The Problem (Neuro Hook) */}
            <section className="py-24 bg-white">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="w-full md:w-1/2">
                            <div className="bg-red-50 p-8 rounded-[30px] border border-red-100 relative overflow-hidden">
                                <AlertTriangle className="absolute top-[-20px] right-[-20px] w-40 h-40 text-red-500/10 rotate-12" />
                                <h3 className="text-2xl font-black text-red-600 mb-4 relative z-10">El Efecto "No me acuerdo"</h3>
                                <p className="text-navy/70 leading-relaxed relative z-10">
                                    Tu cliente quiere recomendarte. Busca en su celular... "Pizzas"... "Abogado"...
                                    y salen 50 contactos sin foto.
                                    <br /><br />
                                    <strong>Resultado:</strong> Se rinde y llama al que aparece primero en Google.
                                    <br />
                                    <span className="text-red-500 font-bold">Acabas de perder dinero.</span>
                                </p>
                            </div>
                        </div>
                        <div className="w-full md:w-1/2 text-center md:text-left">
                            <h2 className="text-4xl font-black text-navy mb-6 tracking-tight">¿Qué tipo de empresario eres?</h2>
                            <p className="text-xl text-navy/60 mb-8">
                                Hemos identificado 3 arquetipos digitales. Solo uno de ellos maximiza sus ventas.
                            </p>
                            <Link href="/diagnostico" className="text-primary font-black text-lg underline underline-offset-4 hover:text-primary/80">
                                Descubre tu arquetipo ahora &rarr;
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Teaser (Keep it simple, push to Quiz) */}
            <section className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-5xl font-black text-navy mb-12">La Solución Definitiva</h2>
                    <div className="inline-block p-1 bg-white rounded-full shadow-lg border border-navy/5">
                        <Link href="/registro" className="flex items-center gap-4 px-8 py-4 bg-navy text-white rounded-full font-bold hover:bg-primary transition-colors">
                            <span>Saltar diagnóstico y ver precios</span>
                            <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>
            </section>

            <footer className="py-12 text-center text-navy/40 text-xs font-bold uppercase tracking-widest border-t border-navy/5">
                <p className="mb-2">© 2026 · Regístrame Ya</p>
                <p>Versión Beta: Funnel Neuroventas</p>
            </footer>

            <VideoModal isOpen={isVideoModalOpen} onClose={() => setIsVideoModalOpen(false)} videoId="Iy69aXd7MFI" />
        </main>
    );
}
