"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    CheckCircle2,
    DollarSign,
    TrendingUp,
    Users,
    Smartphone,
    Briefcase,
    MessageCircle,
    ArrowRight,
    Star,
    Target
} from "lucide-react";

export default function VentasClient() {
    return (
        <main className="min-h-screen bg-cream selection:bg-primary/30 scroll-smooth pb-20 font-sans text-navy">
            {/* Hero Section */}
            <section className="relative pt-32 pb-24 px-6 overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-navy/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest text-primary border border-primary/20 mb-6"
                    >
                        <Briefcase size={14} /> Únete a Nuestro Equipo
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-black text-navy tracking-tighter uppercase mb-6 leading-tight"
                    >
                        Gana Vendiendo <br />
                        <span className="text-primary italic">ActivaQR</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-navy/70 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-10 leading-relaxed"
                    >
                        Conviértete en distribuidor autorizado de la herramienta digital que todo negocio, profesional y artesano necesita hoy en día. Sin horarios fijos y con las comisiones más altas del mercado.
                    </motion.p>

                    <motion.a
                        href="#comisiones"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="inline-flex items-center gap-3 bg-navy text-white px-8 py-4 rounded-full font-black uppercase tracking-widest hover:bg-primary transition-colors duration-300 shadow-xl"
                    >
                        Ver Plan de Comisiones <ArrowRight size={20} />
                    </motion.a>
                </div>
            </section>

            {/* ¿Qué es ActivaQR? - Contexto Rápido */}
            <section className="py-20 bg-white border-y border-navy/5 relative overflow-hidden">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl font-black text-navy uppercase tracking-tighter mb-6">
                                ¿Qué estarás <span className="text-primary italic">vendiendo?</span>
                            </h2>
                            <p className="text-navy/70 mb-6 text-lg leading-relaxed">
                                ActivaQR genera un <strong className="text-navy font-bold">contacto digital instalable</strong> directamente en la agenda del teléfono de los clientes. <span className="italic text-primary">No es una web, no es un PDF, no es una tarjeta digital común.</span>
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "Contacto real guardado en el teléfono (con foto y logo)",
                                    "Aparece en el buscador de contactos del cliente",
                                    "El negocio empieza a mostrar sus estados de WhatsApp",
                                    "Elimina la fricción de guardar un número manualmente"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <CheckCircle2 className="text-[#66bf19] mt-1 shrink-0" size={20} />
                                        <span className="text-navy/80 font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="absolute inset-0 bg-primary/20 rounded-[3rem] blur-2xl transform rotate-3"></div>
                            <img
                                src="/images/mockup de guardado.png"
                                alt="Ejemplo de Contacto Digital"
                                className="relative rounded-[2rem] shadow-2xl border border-white/20 object-cover w-full h-[400px]"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Plan de Comisiones */}
            <section id="comisiones" className="py-24 bg-navy relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary rounded-full blur-[120px] -translate-y-1/2"></div>
                </div>

                <div className="max-w-6xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase mb-4">
                            Tus <span className="text-primary italic">Ganancias</span>
                        </h2>
                        <p className="text-white/60 max-w-2xl mx-auto text-lg font-medium">
                            Nuestro modelo de compensación por niveles (calculado por mes calendario) premia tu esfuerzo directamente.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Nivel Base */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-white/10 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 flex flex-col items-center text-center group hover:bg-white/15 transition-colors"
                        >
                            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                                <DollarSign size={32} />
                            </div>
                            <div className="text-sm font-black text-white/50 uppercase tracking-widest mb-2">Nivel Base</div>
                            <div className="text-5xl font-black text-white mb-4">30%</div>
                            <p className="text-white/70 text-sm font-medium leading-relaxed">
                                Comisión inicial estándar para todos los nuevos distribuidores en cada venta realizada.
                            </p>
                        </motion.div>

                        {/* Nivel Plata */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="bg-gradient-to-br from-slate-300 to-slate-400 p-8 rounded-[2rem] border-2 border-slate-200 flex flex-col items-center text-center relative overflow-hidden transform md:-translate-y-4 shadow-xl"
                        >
                            <div className="w-16 h-16 bg-white/30 rounded-2xl flex items-center justify-center text-navy mb-6 shadow-inner">
                                <TrendingUp size={32} />
                            </div>
                            <div className="text-sm font-black text-navy/60 uppercase tracking-widest mb-2">Nivel Plata</div>
                            <div className="text-5xl font-black text-navy mb-4">40%</div>
                            <p className="text-navy/80 text-sm font-medium leading-relaxed">
                                Al alcanzar la meta de ventas mensual. Mayores ganancias por el mismo esfuerzo.
                            </p>
                        </motion.div>

                        {/* Nivel Oro */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-8 rounded-[2rem] border-2 border-yellow-300 flex flex-col items-center text-center relative shadow-xl shadow-yellow-500/20"
                        >
                            <div className="absolute top-4 right-4 text-white">
                                <Star fill="currentColor" size={24} />
                            </div>
                            <div className="w-16 h-16 bg-white/30 rounded-2xl flex items-center justify-center text-navy mb-6 shadow-inner">
                                <Users size={32} />
                            </div>
                            <div className="text-sm font-black text-navy/70 uppercase tracking-widest mb-2">Nivel Oro</div>
                            <div className="text-5xl font-black text-navy mb-4">50%</div>
                            <p className="text-navy/90 text-sm font-medium leading-relaxed">
                                Top performers. Máxima comisión y posibilidad de formar tu propio equipo de ventas.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Cómo Funciona */}
            <section className="py-24 bg-cream">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black text-navy tracking-tighter uppercase mb-4">
                            Un Proceso <span className="text-primary italic">Simple</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-[4.5rem] left-[15%] right-[15%] h-1 bg-navy/10 z-0"></div>

                        {[
                            {
                                step: "01",
                                title: "Ofrece el Servicio",
                                desc: "Visita negocios locales o contacta profesionales ofreciendo ActivaQR usando nuestros argumentos probados.",
                                icon: <Target size={24} />
                            },
                            {
                                step: "02",
                                title: "Cierra la Venta",
                                desc: "Registra a tu cliente en la plataforma, él realiza el pago oficial a nuestras cuentas.",
                                icon: <Smartphone size={24} />
                            },
                            {
                                step: "03",
                                title: "Recibe tu Comisión",
                                desc: "Revisamos el pago y acreditamos tu comisión inmediatamente en tu balance para retiro.",
                                icon: <DollarSign size={24} />
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="relative z-10 flex flex-col items-center text-center"
                            >
                                <div className="w-20 h-20 bg-white border border-navy/10 rounded-2xl shadow-xl flex items-center justify-center text-primary mb-6 relative">
                                    {item.icon}
                                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-navy text-white text-xs font-black flex items-center justify-center rounded-full border-2 border-white">
                                        {item.step}
                                    </div>
                                </div>
                                <h3 className="text-xl font-black text-navy uppercase mb-3">{item.title}</h3>
                                <p className="text-navy/60 font-medium leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Beneficios & Requisitos */}
            <section className="py-24 bg-white border-y border-navy/5">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-16">
                        {/* Beneficios */}
                        <div>
                            <h3 className="text-2xl font-black text-navy uppercase tracking-tighter mb-8 flex items-center gap-3">
                                <span className="bg-[#66bf19]/20 text-[#66bf19] p-2 rounded-lg"><Star size={24} /></span>
                                Beneficios
                            </h3>
                            <ul className="space-y-6">
                                {[
                                    { t: "Horario Flexible", d: "Trabaja a tu propio ritmo, ideal como ingreso extra o trabajo a tiempo completo." },
                                    { t: "Cero Inversión", d: "No necesitas comprar inventario ni pagar membresías para empezar a vender." },
                                    { t: "Market Inmenso", d: "Todo negocio físico, técnico o profesional independiente necesita esta herramienta." },
                                    { t: "Material de Apoyo", d: "Te damos guiones, imágenes y un documento de ADN para que sepas qué decir exactamente." }
                                ].map((b, i) => (
                                    <li key={i} className="flex gap-4">
                                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 text-primary mt-1">
                                            <CheckCircle2 size={18} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-navy text-lg">{b.t}</h4>
                                            <p className="text-navy/60 text-sm mt-1">{b.d}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Requisitos */}
                        <div>
                            <h3 className="text-2xl font-black text-navy uppercase tracking-tighter mb-8 flex items-center gap-3">
                                <span className="bg-primary/20 text-primary p-2 rounded-lg"><Briefcase size={24} /></span>
                                Requisitos
                            </h3>
                            <div className="bg-cream p-8 rounded-[2rem] border border-navy/5 h-full">
                                <ul className="space-y-4">
                                    {[
                                        "Ganas de trabajar y generar ingresos.",
                                        "Habilidad para hablar con dueños de negocios o profesionales.",
                                        "Teléfono inteligente (smartphone) con internet.",
                                        "Disposición para aprender la metodología y pitch de ActivaQR.",
                                        "Cuenta bancaria para recibir tus comisiones (Transferencia local)."
                                    ].map((req, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className="bg-navy/10 text-navy w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 shrink-0">
                                                {i + 1}
                                            </div>
                                            <span className="text-navy/80 font-medium">{req}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-8 p-4 bg-primary/10 rounded-xl border border-primary/20 text-sm text-navy/70 italic font-medium">
                                    <strong className="text-primary not-italic">Importante:</strong> Nuestro modelo se basa en la honestidad. Los pagos de los clientes siempre van directos a la empresa, y nosotros te pagamos tu comisión puntualmente.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Final + Formulario */}
            <section id="empezar" className="py-24 bg-cream px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center bg-navy p-8 md:p-12 rounded-[3rem] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                        {/* Columna Izquierda: Texto */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative z-10"
                        >
                            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase mb-6 leading-tight">
                                ¿Listo para <br />
                                <span className="text-primary italic">empezar?</span>
                            </h2>
                            <p className="text-white/70 text-lg mb-8 max-w-xl font-medium">
                                Completa tus datos y un asesor se contactará contigo para activar tu cuenta de vendedor y darte acceso a tu panel.
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4 text-white/80">
                                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-primary">
                                        <CheckCircle2 size={20} />
                                    </div>
                                    <span className="font-bold">Capacitación gratuita incluida</span>
                                </div>
                                <div className="flex items-center gap-4 text-white/80">
                                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-primary">
                                        <CheckCircle2 size={20} />
                                    </div>
                                    <span className="font-bold">Acceso a panel de gestión</span>
                                </div>
                                <div className="flex items-center gap-4 text-white/80">
                                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-primary">
                                        <CheckCircle2 size={20} />
                                    </div>
                                    <span className="font-bold">Soporte prioritario</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Columna Derecha: Formulario */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative z-20"
                        >
                            <SalesLeadForm />
                        </motion.div>
                    </div>
                </div>
            </section>
        </main>
    );
}

function SalesLeadForm() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [formData, setFormData] = useState({
        nombre: '',
        celular: '',
        ciudad: '',
        experiencia: '',
        aceptaTerminos: false
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.aceptaTerminos) {
            alert("Debes aceptar los términos y condiciones para continuar.");
            return;
        }

        setStatus('loading');
        try {
            const res = await fetch('/api/ventas/vendedor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: formData.nombre,
                    celular: formData.celular,
                    ciudad: formData.ciudad,
                    experiencia: formData.experiencia
                })
            });

            if (res.ok) {
                setStatus('success');
                // Redirigir a WhatsApp después de 1.5 segundos
                setTimeout(() => {
                    const message = encodeURIComponent("Hola ActivaQR quiero informacion sobre los vendedores 😊");
                    window.open(`https://wa.me/593983237491?text=${message}`, '_blank');
                }, 1500);
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className="bg-white p-8 rounded-[2rem] text-center">
                <div className="w-16 h-16 bg-[#66bf19]/20 text-[#66bf19] rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={32} />
                </div>
                <h3 className="text-2xl font-black text-navy uppercase mb-2">¡Registro Exitoso!</h3>
                <p className="text-navy/60 font-medium mb-6">Redirigiéndote a WhatsApp para finalizar tu activación...</p>
                <div className="animate-pulse text-xs font-black text-primary uppercase tracking-widest">
                    Cargando WhatsApp...
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2rem] shadow-xl space-y-4">
            <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-navy/40 ml-4 mb-2 block">Nombre completo</label>
                <input
                    required
                    type="text"
                    value={formData.nombre}
                    onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej. Juan Pérez"
                    className="w-full px-6 py-3 rounded-full bg-cream border border-navy/5 focus:outline-none focus:border-primary font-bold text-navy text-sm"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-navy/40 ml-4 mb-2 block">Celular</label>
                    <input
                        required
                        type="tel"
                        value={formData.celular}
                        onChange={e => setFormData({ ...formData, celular: e.target.value })}
                        placeholder="099..."
                        className="w-full px-6 py-3 rounded-full bg-cream border border-navy/5 focus:outline-none focus:border-primary font-bold text-navy text-sm"
                    />
                </div>
                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-navy/40 ml-4 mb-2 block">Ciudad</label>
                    <input
                        required
                        type="text"
                        value={formData.ciudad}
                        onChange={e => setFormData({ ...formData, ciudad: e.target.value })}
                        placeholder="Ej. Quito"
                        className="w-full px-6 py-3 rounded-full bg-cream border border-navy/5 focus:outline-none focus:border-primary font-bold text-navy text-sm"
                    />
                </div>
            </div>

            <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-navy/40 ml-4 mb-2 block">¿Tienes experiencia vendiendo?</label>
                <div className="flex gap-4 px-2">
                    {['Sí', 'No'].map(opt => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                            <input
                                required
                                type="radio"
                                name="experiencia"
                                value={opt}
                                onChange={e => setFormData({ ...formData, experiencia: e.target.value })}
                                className="hidden"
                            />
                            <div className={`w-5 h-5 rounded-full border-2 border-navy/10 flex items-center justify-center transition-all ${formData.experiencia === opt ? 'bg-primary border-primary' : 'bg-transparent group-hover:border-primary/50'}`}>
                                {formData.experiencia === opt && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                            </div>
                            <span className={`text-sm font-bold uppercase ${formData.experiencia === opt ? 'text-navy' : 'text-navy/40'}`}>{opt}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                        required
                        type="checkbox"
                        checked={formData.aceptaTerminos}
                        onChange={e => setFormData({ ...formData, aceptaTerminos: e.target.checked })}
                        className="hidden"
                    />
                    <div className={`w-5 h-5 mt-0.5 rounded border-2 border-navy/10 flex items-center justify-center shrink-0 transition-all ${formData.aceptaTerminos ? 'bg-primary border-primary' : 'bg-transparent group-hover:border-primary/50'}`}>
                        {formData.aceptaTerminos && <Check size={14} className="text-white" />}
                    </div>
                    <span className="text-[10px] font-bold text-navy/50 leading-tight">
                        Acepto los <a href="/terminos" target="_blank" className="text-primary hover:underline">términos y condiciones</a> y la <a href="/privacidad" target="_blank" className="text-primary hover:underline">política de privacidad</a>.
                    </span>
                </label>
            </div>

            <button
                disabled={status === 'loading'}
                type="submit"
                className="w-full py-4 rounded-full bg-navy text-white font-black uppercase tracking-widest text-sm shadow-lg hover:bg-primary transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
            >
                {status === 'loading' ? (
                    <> <Loader2 size={20} className="animate-spin" /> Procesando... </>
                ) : (
                    <> Enviar Solicitud <ArrowRight size={20} /> </>
                )}
            </button>

            {status === 'error' && (
                <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center mt-2">
                    Ocurrió un error. Inténtalo de nuevo.
                </p>
            )}
        </form>
    );
}

function Loader2({ size, className }: { size: number, className: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>;
}

function Check({ size, className }: { size: number, className: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12" /></svg>;
}
