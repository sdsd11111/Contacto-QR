'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, CheckCircle2, ChevronDown } from 'lucide-react';

interface ContractModalProps {
    seller: any;
    onAccept: () => void;
}

export default function ContractModal({ seller, onAccept }: ContractModalProps) {
    const [scrolledToBottom, setScrolledToBottom] = useState(false);
    const [isAccepting, setIsAccepting] = useState(false);
    const isSubSeller = !!seller.parent_id;

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const bottom = e.currentTarget.scrollHeight - e.currentTarget.scrollTop <= e.currentTarget.clientHeight + 50;
        if (bottom) {
            setScrolledToBottom(true);
        }
    };

    const handleAccept = async () => {
        setIsAccepting(true);
        try {
            const res = await fetch('/api/seller/accept-terms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ seller_id: seller.id })
            });
            const data = await res.json();
            if (data.success) {
                onAccept();
            } else {
                alert("Error al firmar el contrato: " + data.error);
                setIsAccepting(false);
            }
        } catch (err) {
            alert("Error de conexión al firmar el contrato.");
            setIsAccepting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-[#050B1C]/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="bg-[#0A1229] border border-primary/30 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden shadow-[0_0_50px_rgba(255,107,0,0.15)]"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-primary/20 to-transparent p-6 sm:p-8 border-b border-primary/20 flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <ShieldAlert className="text-primary w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tighter text-white">Acuerdo de Rendimiento Comercial</h2>
                        <p className="text-primary font-bold text-xs uppercase tracking-widest mt-1">ActivaQR Matrix • Documento Legal Requerido</p>
                    </div>
                </div>

                {/* Content (Scrollable) */}
                <div
                    className="p-6 sm:p-8 overflow-y-auto custom-scrollbar text-white/80 space-y-6 text-sm"
                    onScroll={handleScroll}
                >
                    <p className="font-bold text-white">Bienvenido/a {seller.nombre},</p>
                    <p>
                        Para garantizar la calidad de nuestra red y el valor de nuestra plataforma, <strong>ActivaQR</strong> establece las siguientes cuotas y políticas de rendimiento de cumplimiento obligatorio para acceder al panel de gestión de {isSubSeller ? "Asesores (Sub-vendedores)" : "Líderes Oficiales"}.
                    </p>

                    {!isSubSeller ? (
                        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                            <h3 className="text-blue-400 font-bold uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
                                <span className="bg-blue-500/20 px-2 py-1 rounded">Regla N° 1</span> Cuota Mínima Acumulativa (Líderes)
                            </h3>
                            <p className="mb-2">Para tener derecho a sumar las ventas generadas por tu equipo de Asesores y alcanzar las escalas de comisión premiadas (40% o 50%), debes cumplir una cuota de <strong>Ventas Personales Directas</strong>.</p>
                            <ul className="list-disc pl-5 space-y-2 text-white/70">
                                <li><strong>Mínimo Requerido:</strong> 30 contactos digitales vendidos directamente por ti al mes.</li>
                                <li><strong>Beneficio si cumples (&gt;= 30):</strong> Se suman todas las ventas de tu red de Asesores para subir tu rango general al 40% o 50%, cobrando el diferencial de todo el equipo.</li>
                                <li><strong>Penalidad si no cumples (&lt; 30):</strong> Tu rango se limitará estrictamente al 30% basado únicamente en tus propias ventas. Perderás el derecho a ganar comisiones sobre el volumen de tu equipo (dicho diferencial pasará íntegramente a ActivaQR Matrix).</li>
                            </ul>
                        </div>
                    ) : (
                        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                            <h3 className="text-green-400 font-bold uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
                                <span className="bg-green-500/20 px-2 py-1 rounded">Regla N° 1</span> Rendimiento de Campo (Asesores)
                            </h3>
                            <p className="mb-2">El acceso a la infraestructura tecnológica de ActivaQR requiere de actividad constante. Se evaluará tu rendimiento directamente a través del mapa de geolocalización.</p>
                            <ul className="list-disc pl-5 space-y-2 text-white/70">
                                <li><strong>Cuota Semanal:</strong> Registro mínimo de 20 visitas presenciales validadas vía GPS en la plataforma.</li>
                                <li><strong>Conversión Esperada:</strong> Esta actividad debe traducir en un cierre mínimo de 5 ventas directas mensuales para mantener la cuenta activa.</li>
                                <li><strong>Auditoría:</strong> ActivaQR y tu Líder auditarán las coordenadas de las visitas registradas para asegurar su veracidad.</li>
                            </ul>
                        </div>
                    )}

                    <div className="bg-white/5 border border-white/10 p-5 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary/50"></div>
                        <h3 className="text-primary font-bold uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
                            <span className="bg-primary/20 px-2 py-1 rounded">Regla N° 2</span> Flujo Financiero y Ética
                        </h3>
                        <ul className="list-disc pl-5 space-y-2 text-white/70">
                            <li><strong>Transparencia:</strong> Todos los pagos de los clientes (salvo acuerdo expreso de efectivo local) deben ingresar íntegramente a las cuentas oficiales de la matriz ("Regístrame Ya" / ActivaQR). Las comisiones correspondientes se liquidarán posterior a la verificación.</li>
                            <li><strong>Información Limpia:</strong> Suplantar identidad, registrar clientes falsos o alterar localizaciones deliberadamente es causal de eliminación inmediata de la red sin derecho a cobro de comisiones pendientes.</li>
                        </ul>
                    </div>

                    <p className="text-white/40 text-xs italic text-center pt-4">Por favor, desplázate hasta el final para aceptar los términos.</p>

                    {!scrolledToBottom && (
                        <div className="flex justify-center animate-bounce pt-2 pb-4">
                            <ChevronDown className="text-primary/50 w-6 h-6" />
                        </div>
                    )}
                </div>

                {/* Footer Action */}
                <div className="p-6 sm:p-8 bg-[#050B1C] border-t border-white/10 flex flex-col items-center justify-center shrink-0">
                    <button
                        disabled={!scrolledToBottom || isAccepting}
                        onClick={handleAccept}
                        className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${scrolledToBottom
                            ? "bg-primary text-[#050B1C] shadow-[0_0_20px_rgba(255,107,0,0.4)] hover:scale-[1.02] active:scale-95 cursor-pointer"
                            : "bg-white/5 text-white/20 cursor-not-allowed"
                            }`}
                    >
                        {isAccepting ? "Registrando Firma Digital..." : (
                            <>
                                <CheckCircle2 size={20} />
                                Acepto los términos como Contratista Independiente
                            </>
                        )}
                    </button>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest mt-4 text-center max-w-md">
                        Al hacer clic, se registrará tu IP ({new Date().toISOString()}) como prueba de aceptación legal.
                        <span className="block mt-1 text-primary/60 font-bold">Te enviaremos una copia de este acuerdo a tu correo electrónico.</span>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
