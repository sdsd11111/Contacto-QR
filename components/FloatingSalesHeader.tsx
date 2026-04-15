"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Briefcase } from "lucide-react";

export default function FloatingSalesHeader() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            // Show header when user scrolls down 400px
            if (window.scrollY > 400) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    key="floating-sales-header"
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="fixed top-0 left-0 right-0 z-[60] bg-navy/95 backdrop-blur-md border-b border-white/10 shadow-xl"
                >
                    {/* Desktop View */}
                    <div className="hidden sm:flex max-w-6xl mx-auto px-6 h-16 md:h-[72px] items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                                <Briefcase size={16} />
                            </div>
                            <span className="text-white font-black uppercase tracking-tighter text-sm md:text-base">
                                Gana Dinero Vendiendo <span className="text-primary italic">ActivaQR</span>
                            </span>
                        </div>
                        <Link
                            href="/ventas"
                            className="bg-primary text-white px-4 py-2 md:px-6 rounded-full font-black text-xs md:text-sm uppercase tracking-widest shadow-lg shadow-primary/30 hover:scale-105 transition-transform flex items-center gap-2"
                        >
                            Ver Plan <ArrowRight size={16} className="hidden md:block" />
                        </Link>
                    </div>

                    {/* Mobile View */}
                    <div className="sm:hidden px-5 h-16 flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-white/70 text-[10px] uppercase font-bold tracking-widest leading-none mb-1">Únete a ventas</span>
                            <span className="text-white font-black uppercase tracking-tighter text-sm leading-none">
                                Gana Dinero <span className="text-primary italic">ActivaQR</span>
                            </span>
                        </div>
                        <Link
                            href="/ventas"
                            className="bg-primary text-white px-4 py-2.5 rounded-full font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/30 flex items-center gap-2"
                        >
                            Ver <ArrowRight size={14} />
                        </Link>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
