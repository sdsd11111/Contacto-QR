"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Smartphone, Zap, MessageSquare, AlertCircle } from "lucide-react";

export default function PopupManager() {
    const [activePopup, setActivePopup] = useState<"exit" | "scroll" | "time" | null>(null);

    useEffect(() => {
        // --- 1. Exit Intent Logic ---
        const handleMouseLeave = (e: MouseEvent) => {
            if (e.clientY <= 0 && !sessionStorage.getItem("popup_exit_closed")) {
                setActivePopup("exit");
            }
        };
        document.addEventListener("mouseleave", handleMouseLeave);

        // --- 2. Scroll Logic (50%) ---
        const handleScroll = () => {
            const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            if (scrollPercent > 50 && !sessionStorage.getItem("popup_scroll_closed") && !activePopup) {
                setActivePopup("scroll");
            }
        };
        window.addEventListener("scroll", handleScroll);

        // --- 3. Time Logic (45s) ---
        const timer = setTimeout(() => {
            if (!sessionStorage.getItem("popup_time_closed") && !activePopup) {
                setActivePopup("time");
            }
        }, 45000);

        return () => {
            document.removeEventListener("mouseleave", handleMouseLeave);
            window.removeEventListener("scroll", handleScroll);
            clearTimeout(timer);
        };
    }, [activePopup]);

    const closePopup = (type: string) => {
        sessionStorage.setItem(`popup_${type}_closed`, "true");
        setActivePopup(null);
    };

    const handleWhatsAppRedirect = (message: string) => {
        const url = `https://wa.me/593963410409?text=${encodeURIComponent(message)}`;
        window.open(url, "_blank");
        setActivePopup(null);
    };

    return (
        <AnimatePresence>
            {/* Exit Intent Popup */}
            {activePopup === "exit" && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-navy/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl relative border-4 border-primary/20"
                    >
                        <button onClick={() => closePopup("exit")} className="absolute top-6 right-6 text-navy/20 hover:text-navy/40"><X size={24} /></button>
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                            <AlertCircle className="text-primary" size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-navy mb-4 uppercase tracking-tighter">🛑 Espera... una pregunta rápida.</h3>
                        <p className="text-navy/60 font-medium mb-8">¿Sabes cuántos trabajos perdiste este mes solo porque no encontraron tu número en la lista de contactos?</p>
                        <div className="space-y-3">
                            <button
                                onClick={() => handleWhatsAppRedirect("Hola, creo que estoy perdiendo trabajos por mi contacto actual. Quiero mi contacto digital.")}
                                className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-orange hover:scale-105 transition-transform"
                            >
                                Probablemente varios... ¡Ayúdame!
                            </button>
                            <button onClick={() => closePopup("exit")} className="w-full py-4 text-navy/40 font-black text-[10px] uppercase tracking-widest hover:text-navy/60">
                                Ninguno, mis clientes son ordenados.
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Scroll Popup (Toast) */}
            {activePopup === "scroll" && (
                <motion.div
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="fixed bottom-8 right-8 z-[110] max-w-sm w-full bg-navy rounded-3xl p-6 shadow-2xl border border-white/10"
                >
                    <button onClick={() => closePopup("scroll")} className="absolute top-4 right-4 text-white/20 hover:text-white/40"><X size={20} /></button>
                    <div className="flex items-center gap-4 mb-4">
                        <img src="https://i.pravatar.cc/100?img=12" alt="Testimonio" className="w-12 h-12 rounded-full border-2 border-primary grayscale hover:grayscale-0 transition-transform cursor-pointer" />
                        <div>
                            <h4 className="text-white text-sm font-black uppercase tracking-widest leading-none">Roberto · Eléctrico</h4>
                            <p className="text-primary text-[10px] font-bold mt-1 uppercase">Guayaquil</p>
                        </div>
                    </div>
                    <p className="text-white/70 text-xs font-medium italic leading-relaxed mb-4">
                        "Desde que les paso mi contacto digital, me llaman el triple porque salgo primero en su agenda."
                    </p>
                    <button
                        onClick={() => {
                            window.scrollTo({ top: document.getElementById('hero')?.offsetTop, behavior: 'smooth' });
                            closePopup("scroll");
                        }}
                        className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline"
                    >
                        Ver cómo lo hizo él →
                    </button>
                </motion.div>
            )}

            {/* Time Delayed (Oferta) */}
            {activePopup === "time" && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-navy/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-primary rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl relative border-8 border-white group"
                    >
                        <button onClick={() => closePopup("time")} className="absolute top-6 right-6 text-white/40 hover:text-white/60"><X size={24} /></button>
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 animate-bounce">
                            <Zap className="text-primary" size={32} />
                        </div>
                        <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter italic">⚡ Oferta Flash</h3>
                        <p className="text-white/80 font-bold mb-8 leading-tight">Te veo interesado. Hoy tu vCard Profesional con un <span className="text-white text-2xl font-black">20% de Descuento</span>.</p>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-white/10 p-4 rounded-2xl border border-white/20">
                                <p className="text-[10px] text-white/60 uppercase font-black mb-1">Básico</p>
                                <p className="text-2xl font-black text-white leading-none">$10</p>
                                <p className="text-[8px] text-white/40 line-through">Antes $20</p>
                            </div>
                            <div className="bg-white/20 p-4 rounded-2xl border border-white/40 shadow-lg">
                                <p className="text-[10px] text-primary uppercase font-black mb-1 bg-white px-2 py-0.5 rounded-full inline-block">Pro + QR</p>
                                <p className="text-2xl font-black text-white leading-none">$20</p>
                                <p className="text-[8px] text-white/40 line-through">Antes $40</p>
                            </div>
                        </div>

                        <button
                            onClick={() => handleWhatsAppRedirect("¡Hola! Quiero activar mi contacto profesional con la Oferta de Lanzamiento (Básico $10 / Pro $20)")}
                            className="w-full py-5 bg-white text-primary rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-transform"
                        >
                            Lo pago con un solo trabajo
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
