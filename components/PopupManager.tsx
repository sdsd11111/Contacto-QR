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

        // --- 3. Time Logic (45s) ---
        const timer = setTimeout(() => {
            if (!sessionStorage.getItem("popup_time_closed") && !activePopup) {
                setActivePopup("time");
            }
        }, 45000);

        return () => {
            document.removeEventListener("mouseleave", handleMouseLeave);
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
                        <p className="text-white/80 font-bold mb-8 leading-tight">Aprovecha hoy el <span className="text-white text-2xl font-black">Precio de Lanzamiento</span> para tu identidad digital.</p>

                        <div className="flex justify-center mb-8">
                            <div className="bg-white/20 p-6 rounded-3xl border-4 border-white/60 shadow-xl max-w-[240px] w-full text-center">
                                <p className="text-[12px] text-primary uppercase font-black mb-2 bg-white px-3 py-1 rounded-full inline-block shadow-sm">Plan Profesional PRO</p>
                                <p className="text-5xl font-black text-white leading-none mb-2">$35/año</p>
                                <p className="text-[10px] text-white/60 font-bold">Sin cuotas mensuales</p>
                            </div>
                        </div>

                        <div className="bg-white/10 p-4 rounded-2xl mb-8 border border-white/20">
                            <p className="text-[11px] font-bold text-white/80 leading-tight">
                                🎁 <span className="text-white">¿Necesitas más de 5?</span> Obtén un <span className="text-primary font-black">20% OFF</span> adicional en licencias corporativas.
                            </p>
                        </div>

                        <button
                            onClick={() => handleWhatsAppRedirect("¡Hola! Me interesa el descuento de lanzamiento para mi contacto profesional ($35).")}
                            className="w-full py-5 bg-white text-primary rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:scale-105 transition-transform"
                        >
                            Lo pago con un solo trabajo
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
