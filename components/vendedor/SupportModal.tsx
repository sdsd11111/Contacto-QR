"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, HeadphonesIcon, HelpCircle } from "lucide-react";

export default function SupportModal({ isOpen, onClose, seller }: { isOpen: boolean; onClose: () => void; seller: any }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 text-left">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/90 backdrop-blur-md" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 40 }} transition={{ type: "spring", damping: 25 }}
                    className="relative w-full sm:max-w-4xl h-[85vh] sm:h-[80vh] bg-[#0A1229] border border-white/10 rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden flex flex-col mt-auto sm:mt-0"
                >
                    <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02] z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center border border-green-500/30">
                                <HelpCircle className="text-green-400" size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white uppercase italic tracking-tight">Centro de Soporte</h3>
                                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Video Tutorial y Capacitación</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-3 text-white/40 hover:bg-white/10 hover:text-white rounded-full transition-all">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex-1 bg-black relative">
                        <iframe
                            src="https://www.youtube.com/embed/SMaMj7Y5DKY?autoplay=1&rel=0"
                            title="ActivaQR Support Video"
                            className="absolute inset-0 w-full h-full border-none"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        ></iframe>
                    </div>

                    <div className="p-6 bg-white/[0.02] border-t border-white/10 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">
                            ¿Aún tienes dudas? Contacta a tu líder de equipo
                        </p>
                        <button
                            onClick={onClose}
                            className="w-full sm:w-auto px-10 py-3 bg-white/10 hover:bg-white/20 text-white font-black uppercase tracking-widest rounded-xl transition-all text-xs"
                        >
                            Entendido
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
