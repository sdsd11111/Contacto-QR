'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Landmark, User, CreditCard, Hash, Mail, Send, CheckCircle2 } from 'lucide-react';

interface BankDetailsModalProps {
    sellerId: number;
    onSuccess: () => void;
}

export default function BankDetailsModal({ sellerId, onSuccess }: BankDetailsModalProps) {
    const [formData, setFormData] = useState({
        banco_nombre: '',
        banco_beneficiario: '',
        banco_numero_cuenta: '',
        banco_cedula: '',
        banco_correo: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/seller/bank-details', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ seller_id: sellerId, ...formData })
            });
            const data = await res.json();
            if (data.success) {
                setIsSuccess(true);
                setTimeout(() => {
                    onSuccess();
                }, 2000);
            } else {
                alert("Error al guardar datos: " + data.error);
                setIsSubmitting(false);
            }
        } catch (err) {
            alert("Error de conexión.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] bg-[#050B1C]/95 backdrop-blur-xl flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-[#0A1229] border border-primary/30 rounded-[40px] w-full max-w-xl shadow-2xl overflow-hidden relative"
            >
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <Landmark size={150} className="text-primary" />
                </div>

                <div className="p-8 sm:p-12 relative z-10">
                    <div className="flex flex-col items-center text-center mb-10">
                        <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center text-primary mb-6 shadow-[0_0_30px_rgba(255,107,0,0.2)]">
                            <CreditCard size={40} />
                        </div>
                        <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white mb-2">Configura tus Pagos</h2>
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest max-w-xs">Necesitamos tus datos bancarios para transferirte tus comisiones automáticamente</p>
                    </div>

                    <AnimatePresence mode="wait">
                        {isSuccess ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-12 flex flex-col items-center text-center"
                            >
                                <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6">
                                    <CheckCircle2 size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">¡Datos guardados!</h3>
                                <p className="text-white/40 text-sm">Estamos redirigiéndote a tu panel...</p>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2 flex items-center gap-1">
                                            <Landmark size={12} /> Entidad Bancaria
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Ej. Banco de Loja"
                                            value={formData.banco_nombre}
                                            onChange={(e) => setFormData({ ...formData, banco_nombre: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-primary/40 text-white font-bold transition-all placeholder:text-white/10"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2 flex items-center gap-1">
                                            <User size={12} /> Beneficiario
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Nombre Completo"
                                            value={formData.banco_beneficiario}
                                            onChange={(e) => setFormData({ ...formData, banco_beneficiario: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-primary/40 text-white font-bold transition-all placeholder:text-white/10"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2 flex items-center gap-1">
                                        <Hash size={12} /> Número de Cuenta
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="0000000000"
                                        value={formData.banco_numero_cuenta}
                                        onChange={(e) => setFormData({ ...formData, banco_numero_cuenta: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-primary/40 text-white font-bold transition-all placeholder:text-white/10"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2 flex items-center gap-1">
                                            <Hash size={12} /> Cédula
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="1100000000"
                                            value={formData.banco_cedula}
                                            onChange={(e) => setFormData({ ...formData, banco_cedula: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-primary/40 text-white font-bold transition-all placeholder:text-white/10"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2 flex items-center gap-1">
                                            <Mail size={12} /> Correo
                                        </label>
                                        <input
                                            type="email"
                                            placeholder="ejemplo@mail.com"
                                            value={formData.banco_correo}
                                            onChange={(e) => setFormData({ ...formData, banco_correo: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-primary/40 text-white font-bold transition-all placeholder:text-white/10"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-primary hover:bg-[#FF8A33] py-5 rounded-2xl font-black uppercase italic tracking-widest shadow-[0_10px_25px_rgba(255,107,0,0.3)] text-[#050B1C] transition-all flex items-center justify-center gap-3 group disabled:opacity-50 mt-4"
                                >
                                    {isSubmitting ? "Guardando..." : "Completar mi Perfil"}
                                    <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </button>

                                <p className="text-[9px] text-white/20 text-center uppercase tracking-widest">Podrás editar estos datos más adelante contactando a soporte.</p>
                            </form>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
