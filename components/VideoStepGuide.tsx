"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Maximize2, Minimize2, Play, Pause } from "lucide-react";
import { cn } from "../lib/utils";

interface VideoStepGuideProps {
    step: number;
    isVisible: boolean;
    onClose: () => void;
}

const stepVideos: Record<number, string> = {
    1: "TuDbyx2nVUs",
    2: "05L7n46UTVg",
    3: "6RR-efvsAr4",
    4: "QDQnK8hPMHY",
    5: "BbT8dYvNoHU",
    6: "aJbOc4o3VKc",
};

export default function VideoStepGuide({ step, isVisible, onClose }: VideoStepGuideProps) {
    const [isMinimized, setIsMinimized] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    // Resetear estados cuando cambia el paso para que la guía vuelva a aparecer
    useEffect(() => {
        setIsMinimized(false);
        setIsDismissed(false);
    }, [step]);

    // Si el usuario lo cerró completamente (X), mostramos un pequeño lanzador
    if (!isVisible) return null;

    const videoId = stepVideos[step] || stepVideos[1];
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&controls=1`;

    if (isDismissed) {
        return (
            <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={() => setIsDismissed(false)}
                className="fixed bottom-6 right-6 z-[100] w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform group border-4 border-white"
            >
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping group-hover:hidden" />
                <Play size={24} className="fill-current relative z-10" />
                <div className="absolute -top-1 -right-1 bg-navy text-[8px] font-black px-1.5 py-0.5 rounded-full border border-white">
                    GUÍA
                </div>
            </motion.button>
        );
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    // Mobile: 160px width, Desktop: 300px width
                    width: isMinimized ? "60px" : { base: "160px", md: "300px" } as any,
                }}
                exit={{ opacity: 0, y: 50, scale: 0.9 }}
                style={{
                    width: isMinimized ? "60px" : undefined // Handled by animate width above, but framer-motion width needs to be consistent
                }}
                className={cn(
                    "fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[100] bg-navy/90 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-[2rem] shadow-2xl overflow-hidden shadow-primary/20 transition-all duration-500",
                    isMinimized && "rounded-full cursor-pointer hover:scale-110"
                )}
                onClick={() => isMinimized && setIsMinimized(false)}
            >
                {isMinimized ? (
                    <div className="w-full h-full flex items-center justify-center">
                        <Play size={20} className="text-primary fill-current" />
                    </div>
                ) : (
                    <div className="relative group">
                        {/* Header Control */}
                        <div className="absolute top-3 right-3 z-[110] flex gap-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsMinimized(true); }}
                                className="w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                            >
                                <Minimize2 size={14} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsDismissed(true); }}
                                className="w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>

                        {/* Video Layer (YouTube Embed) */}
                        <div className="aspect-[9/16] w-full bg-black relative">
                            <iframe
                                src={embedUrl}
                                title="Guía Alejandra"
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>

                        {/* Caption Area */}
                        <div className="p-4 pt-3 flex items-center gap-3 bg-navy">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/80">
                                Guía Alejandra: Paso {step}
                            </p>
                        </div>
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}
