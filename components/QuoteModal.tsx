"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Loader2, Send, Quote, Building, User, Phone, Package, ChevronRight, Download } from "lucide-react";

interface QuoteModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function QuoteModal({ isOpen, onClose }: QuoteModalProps) {
    const [step, setStep] = useState(1);
    const [plan, setPlan] = useState<'business' | 'catalog'>('business');
    const [formData, setFormData] = useState({
        name: "",
        businessName: "",
        whatsapp: "",
        productCount: 5,
        sellerCode: ""
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [sellerName, setSellerName] = useState<string | null>(null);
    const [isValidatingSeller, setIsValidatingSeller] = useState(false);

    // Validate seller code as user types
    useEffect(() => {
        const validateSeller = async () => {
            if (formData.sellerCode.length >= 3) {
                setIsValidatingSeller(true);
                try {
                    const res = await fetch(`/api/vcard/validate-seller?code=${formData.sellerCode}`);
                    const data = await res.json();
                    if (data.success) {
                        setSellerName(data.nombre);
                    } else {
                        setSellerName(null);
                    }
                } catch (e) {
                    setSellerName(null);
                } finally {
                    setIsValidatingSeller(false);
                }
            } else {
                setSellerName(null);
            }
        };

        const timer = setTimeout(validateSeller, 500);
        return () => clearTimeout(timer);
    }, [formData.sellerCode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/quote/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, plan })
            });

            if (res.ok) {
                // Trigger download
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `Cotizacion_${formData.name.replace(/\s+/g, '_')}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                setSuccess(true);
                
                // Construct WhatsApp message for the user to send too
                const planName = plan === 'catalog' ? 'Business + Catálogo ($120)' : 'Business ($60)';
                const message = encodeURIComponent(
                    `Hola ActivaQR, acabo de solicitar una cotización por la web.\n\n` +
                    `👤 *Cliente:* ${formData.name}\n` +
                    `🏢 *Negocio:* ${formData.businessName}\n` +
                    `📱 *WhatsApp:* ${formData.whatsapp}\n` +
                    `📦 *Plan:* ${planName}\n` +
                    `🔢 *Productos:* ${formData.productCount}\n` +
                    (sellerName ? `🤝 *Vendedor:* ${sellerName} (${formData.sellerCode})\n` : '') +
                    `\n_Ya descargué mi PDF de cotización._`
                );
                
                setTimeout(() => {
                    window.open(`https://wa.me/593983237491?text=${message}`, "_blank");
                }, 1500);

            } else {
                alert("Error al generar la cotización. Por favor intenta de nuevo.");
            }
        } catch (error) {
            console.error(error);
            alert("Ocurrió un error inesperado.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-lg bg-[#0a1124] border border-white/20 rounded-3xl shadow-2xl overflow-hidden"
            >
                {/* Header Gradient */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-primary-light to-primary" />

                <div className="p-6 sm:p-8">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                        <X size={20} />
                    </button>

                    {!success ? (
                        <>
                            <div className="mb-8">
                                <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary mb-4">
                                    <Quote size={24} />
                                </div>
                                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Solicita tu Cotización</h2>
                                <p className="text-white/70 text-sm mt-1">Generaremos una proforma personalizada en PDF.</p>
                            </div>

                            {/* Plan Tabs */}
                            <div className="flex p-1 bg-navy/80 rounded-2xl mb-8 border border-white/10">
                                <button
                                    onClick={() => setPlan('business')}
                                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                                        plan === 'business' 
                                        ? "bg-primary text-white shadow-lg shadow-primary/20" 
                                        : "text-white/50 hover:text-white"
                                    }`}
                                >
                                    Business ($60)
                                </button>
                                <button
                                    onClick={() => setPlan('catalog')}
                                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                                        plan === 'catalog' 
                                        ? "bg-primary text-white shadow-lg shadow-primary/20" 
                                        : "text-white/50 hover:text-white"
                                    }`}
                                >
                                    Catálogo ($120)
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/50 uppercase tracking-widest flex items-center gap-2 px-1">
                                            <User size={12} className="text-primary" /> Nombre y Apellido
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3.5 text-white placeholder-white/30 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                            placeholder="Tu nombre completo"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/50 uppercase tracking-widest flex items-center gap-2 px-1">
                                            <Building size={12} className="text-primary" /> Nombre del Negocio
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.businessName}
                                            onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                                            className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3.5 text-white placeholder-white/30 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                            placeholder="Nombre de tu local"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/50 uppercase tracking-widest flex items-center gap-2 px-1">
                                            <Phone size={12} className="text-primary" /> WhatsApp
                                        </label>
                                        <input
                                            type="tel"
                                            required
                                            value={formData.whatsapp}
                                            onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                                            className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3.5 text-white placeholder-white/30 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                            placeholder="Ej: 593987654321"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/50 uppercase tracking-widest flex items-center gap-2 px-1">
                                            <Package size={12} className="text-primary" /> Cantidad Productos
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={formData.productCount}
                                                onChange={(e) => setFormData({...formData, productCount: parseInt(e.target.value)})}
                                                disabled={plan === 'business'}
                                                className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3.5 text-white appearance-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all outline-none disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                {[...Array(10)].map((_, i) => (
                                                    <option key={i+1} value={i+1} className="bg-navy-light">{i+1}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/30">
                                                <ChevronRight size={16} className="rotate-90" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2">
                                    <label className="text-[10px] font-black text-white/50 uppercase tracking-widest flex items-center justify-between px-1">
                                        <span className="flex items-center gap-2 italic text-white/70">¿Tienes un código de vendedor?</span>
                                        {isValidatingSeller && <Loader2 size={12} className="animate-spin text-primary" />}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={formData.sellerCode}
                                            onChange={(e) => setFormData({...formData, sellerCode: e.target.value.toUpperCase()})}
                                            className={`w-full bg-white/10 border rounded-2xl px-4 py-3.5 text-white placeholder-white/30 transition-all outline-none ${
                                                sellerName ? "border-accent/60 bg-accent/20" : "border-white/20"
                                            }`}
                                            placeholder="Ej: 001"
                                        />
                                        {sellerName && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-accent">
                                                <Check size={16} />
                                                <span className="text-[10px] font-bold uppercase tracking-tight">{sellerName}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary hover:bg-primary-light text-white font-black py-4 rounded-2xl uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-sm flex items-center justify-center gap-3 mt-4"
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : (
                                        <>GENERAR COTIZACIÓN <Send size={18} /></>
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="py-12 text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center text-accent mx-auto mb-6"
                            >
                                <Check size={40} />
                            </motion.div>
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">¡Cotización Generada!</h2>
                            <p className="text-white/60 mt-4 max-w-xs mx-auto text-sm leading-relaxed">
                                Tu PDF se ha descargado automáticamente. Redirigiendo a WhatsApp para confirmar con un asesor...
                            </p>
                            
                            <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4 text-left">
                                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                                    <Download size={20} />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm uppercase">Revisa tus descargas</p>
                                    <p className="text-white/40 text-[10px]">Archivo: Cotizacion_{formData.name.replace(/\s+/g, '_')}.pdf</p>
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="mt-10 px-8 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/50 text-xs font-bold uppercase tracking-widest transition-all"
                            >
                                Cerrar
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
