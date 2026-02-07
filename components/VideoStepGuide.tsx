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
    1: "/videos/step1-welcome.mp4",
    2: "/videos/step2-personal.mp4",
    3: "/videos/step3-bio.mp4",
    4: "/videos/step4-products.mp4",
    5: "/videos/step5-payment.mp4",
    6: "/videos/step6-success.mp4",
};

export default function VideoStepGuide({ step, isVisible, onClose }: VideoStepGuideProps) {
    const [isMinimized, setIsMinimized] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.load();
            if (isPlaying) videoRef.current.play().catch(() => setIsPlaying(false));
        }
    }, [step]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause();
            else videoRef.current.play();
            setIsPlaying(!isPlaying);
        }
    };

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    width: isMinimized ? "60px" : "280px",
                    height: isMinimized ? "60px" : "auto"
                }}
                exit={{ opacity: 0, y: 50, scale: 0.9 }}
                className={cn(
                    "fixed bottom-6 right-6 z-[100] bg-navy/90 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden shadow-primary/20 transition-all duration-500",
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
                        <div className="absolute top-3 right-3 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsMinimized(true); }}
                                className="w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                            >
                                <Minimize2 size={14} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onClose(); }}
                                className="w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>

                        {/* Video Layer */}
                        <div className="aspect-[16/9] w-full bg-black relative">
                            <video
                                ref={videoRef}
                                className="w-full h-full object-cover"
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                                loop
                                playsInline
                                muted
                                autoPlay
                            >
                                <source src={stepVideos[step] || stepVideos[1]} type="video/mp4" />
                            </video>

                            {/* Overlay Play/Pause */}
                            <div
                                className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/5 hover:bg-black/20 transition-colors"
                                onClick={togglePlay}
                            >
                                {!isPlaying && <Play size={40} className="text-white opacity-80" />}
                            </div>
                        </div>

                        {/* Caption Area */}
                        <div className="p-4 pt-3 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/80">
                                Guía en Vivo: Paso {step}
                            </p>
                        </div>
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}
