"use client";

import { Share2 } from "lucide-react";
import { motion } from "framer-motion";

interface ShareButtonProps {
    title?: string;
    text?: string;
    url?: string;
    className?: string;
    variant?: "icon" | "button";
    buttonText?: string;
    buttonStyle?: "white" | "green" | "outline";
}

export default function ShareButton({ 
    title = "ActivaQR", 
    text = "Mira este perfil digital", 
    url,
    className = "",
    variant = "icon",
    buttonText = "COMPARTIR",
    buttonStyle = "white"
}: ShareButtonProps) {
    const handleShare = async () => {
        const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text,
                    url: shareUrl,
                });
            } catch (err) {
                console.error("Error compartiendo:", err);
            }
        } else {
            // Fallback: copiar al portapapeles
            try {
                await navigator.clipboard.writeText(shareUrl);
                alert("¡Enlace copiado al portapapeles!");
            } catch (err) {
                console.error("Error copiando:", err);
            }
        }
    };

    if (variant === "button") {
        const buttonStyles = {
            white: "bg-white text-black hover:bg-black hover:text-white border border-white",
            green: "bg-[#25D366] text-white hover:bg-white hover:text-[#25D366] border border-transparent hover:border-[#25D366]",
            outline: "bg-white/10 text-white border border-white/20 hover:bg-white hover:text-black"
        };

        return (
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className={`font-display-condensed tracking-widest uppercase transition-colors duration-300 flex items-center justify-center gap-2 ${buttonStyles[buttonStyle]} ${className}`}
            >
                <Share2 size={16} />
                {buttonText}
            </motion.button>
        );
    }

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShare}
            className={`bg-white/10 backdrop-blur-md border border-white/20 text-white p-3 rounded-full hover:bg-white/20 transition-all ${className}`}
            title="Compartir perfil"
        >
            <Share2 size={20} />
        </motion.button>
    );
}
