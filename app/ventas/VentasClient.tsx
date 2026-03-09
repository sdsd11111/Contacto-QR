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
        <main className="min-h-screen bg-cream selection:bg-primary/30 scroll-smooth font-sans text-navy">
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
                        href="#empezar"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="inline-flex items-center gap-3 bg-navy text-white px-8 py-4 rounded-full font-black uppercase tracking-widest hover:bg-primary transition-colors duration-300 shadow-xl"
                    >
                        Empezar Ahora <ArrowRight size={20} />
                    </motion.a>
                </div>
            </section>

            {/* Video & CTA Section */}
            <section id="empezar" className="py-24 bg-navy relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid lg:grid-cols-12 gap-16 items-center">

                        {/* Columna Izquierda: Video (7/12 columnas) */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="lg:col-span-7 w-full"
                        >
                            <h2 className="text-3xl md:text-6xl font-black text-white tracking-tighter uppercase mb-6 leading-tight">
                                Empieza Hoy con <br />
                                <span className="text-primary italic">ActivaQR</span>
                            </h2>
                            <p className="text-white/70 text-lg mb-10 max-w-xl font-medium">
                                Mira el video para entender por qué ActivaQR es la herramienta más vendida y por qué deberías unirte a nuestro equipo.
                            </p>

                            <div className="relative aspect-video rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4 border-white/10 bg-white/5 mb-10 group">
                                <iframe
                                    className="absolute inset-0 w-full h-full"
                                    src="https://www.youtube.com/embed/T_scD4kCmrg"
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                ></iframe>
                            </div>

                            <div className="flex flex-wrap gap-8">
                                <div className="flex items-center gap-4 text-white/80">
                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-primary border border-white/10">
                                        <CheckCircle2 size={24} />
                                    </div>
                                    <div>
                                        <span className="block font-black uppercase text-xs tracking-widest text-primary">Gratis</span>
                                        <span className="font-bold">Capacitación</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-white/80">
                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-primary border border-white/10">
                                        <TrendingUp size={24} />
                                    </div>
                                    <div>
                                        <span className="block font-black uppercase text-xs tracking-widest text-primary">Altas</span>
                                        <span className="font-bold">Comisiones</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Columna Derecha: Formulario (5/12 columnas) */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="lg:col-span-5 relative z-20"
                        >
                            <div className="bg-white/5 backdrop-blur-sm p-1 rounded-[3rem] border border-white/10 relative">
                                <div className="p-8 md:p-10">
                                    <div className="mb-8">
                                        <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Formulario de Registro</h3>
                                        <p className="text-white/50 text-sm font-medium">Completa tus datos y un asesor te contactará en breve.</p>
                                    </div>
                                    <SalesLeadForm />
                                </div>
                            </div>
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
        provincia: '',
        canton: '',
        experiencia: '',
        aceptaTerminos: false
    });

    const [cantonesDisponibles, setCantonesDisponibles] = useState<string[]>([]);

    const ubicaciones: Record<string, string[]> = {
        "Azuay": ["Cuenca", "Gualaceo", "Paute", "Sigsig", "Girón", "Santa Isabel", "Pucará", "San Fernando", "Nabón", "Oña", "Chordeleg", "El Pan", "Sevilla de Oro", "Guachapala", "Camilo Ponce Enríquez"],
        "Bolívar": ["Guaranda", "Chillanes", "Chimbo", "Echeandía", "San Miguel", "Caluma", "Las Naves"],
        "Cañar": ["Azogues", "Biblián", "Cañar", "La Troncal", "El Tambo", "Deleg", "Suscal"],
        "Carchi": ["Tulcán", "Bolívar", "Espejo", "Mira", "Montúfar", "San Pedro de Huaca"],
        "Chimborazo": ["Riobamba", "Alausí", "Colta", "Chambo", "Chunchi", "Guamote", "Guano", "Pallatanga", "Penipe", "Cumandá"],
        "Cotopaxi": ["Latacunga", "La Maná", "Pangua", "Pujilí", "Salcedo", "Saquisilí", "Sigchos"],
        "El Oro": ["Machala", "Arenillas", "Atahualpa", "Balsas", "Chilla", "El Guabo", "Huaquillas", "Marcabelí", "Pasaje", "Piñas", "Portovelo", "Santa Rosa", "Zaruma", "Las Lajas"],
        "Esmeraldas": ["Esmeraldas", "Eloy Alfaro", "Muisne", "Quinindé", "San Lorenzo", "Atacames", "Rioverde", "La Concordia"],
        "Galápagos": ["San Cristóbal", "Isabela", "Santa Cruz"],
        "Guayas": ["Guayaquil", "Alfredo Baquerizo Moreno (Juján)", "Balao", "Balzar", "Colimes", "Daule", "Durán", "Empalme", "El Triunfo", "Milagro", "Naranjal", "Naranjito", "Palestina", "Pedro Carbo", "Samborondón", "Santa Lucía", "Salitre", "San Jacinto de Yaguachi", "Playas", "Simón Bolívar", "Marcelino Maridueña", "Nobol", "Lomas de Sargentillo", "Antonio Elizalde", "Isidro Ayora"],
        "Imbabura": ["Ibarra", "Antonio Ante", "Cotacachi", "Otavalo", "Pimampiro", "San Miguel de Urcuquí"],
        "Loja": ["Loja", "Calvas", "Catamayo", "Celica", "Chaguarpamba", "Espíndola", "Gonzanamá", "Macará", "Paltas", "Puyango", "Saraguro", "Sozoranga", "Zapotillo", "Pindal", "Quilanga", "Olmedo"],
        "Los Ríos": ["Babahoyo", "Baba", "Montalvo", "Puebloviejo", "Quevedo", "Urdaneta", "Ventanas", "Vinces", "Palenque", "Buena Fé", "Valencia", "Mocache", "Quinsaloma"],
        "Manabí": ["Portoviejo", "Bolívar", "Chone", "El Carmen", "Flavio Alfaro", "Jipijapa", "Junín", "Manta", "Montecristi", "Paján", "Pichincha", "Rocafuerte", "Santa Ana", "Sucre", "Tosagua", "24 de Mayo", "Pedernales", "Olmedo", "Puerto López", "Jama", "Jaramijó", "San Vicente"],
        "Morona Santiago": ["Macas", "Gualaquiza", "Limón Indanza", "Palora", "Santiago", "Sucúa", "Huamboya", "San Juan Bosco", "Taisha", "Logroño", "Pablo Sexto", "Tiwintza"],
        "Napo": ["Tena", "Archidona", "El Chaco", "Quijos", "Carlos Julio Arosemena Tola"],
        "Orellana": ["Francisco de Orellana", "Aguarico", "La Joya de los Sachas", "Loreto"],
        "Pastaza": ["Puyo", "Mera", "Santa Clara", "Arajuno"],
        "Pichincha": ["Quito", "Cayambe", "Mejía", "Pedro Moncayo", "Rumiñahui", "San Miguel de los Bancos", "Pedro Vicente Maldonado", "Puerto Quito"],
        "Santa Elena": ["Santa Elena", "La Libertad", "Salinas"],
        "Santo Domingo": ["Santo Domingo"],
        "Sucumbíos": ["Nueva Loja", "Cascales", "Cuyabeno", "Lago Agrio", "Shushufindi", "Sucumbíos", "Gonzalo Pizarro", "Putumayo"],
        "Tungurahua": ["Ambato", "Baños de Agua Santa", "Cevallos", "Mocha", "Patate", "Quero", "San Pedro de Pelileo", "Santiago de Píllaro", "Tisaleo"],
        "Zamora Chinchipe": ["Zamora", "Chinchipe", "Nangaritza", "Yacuambi", "Yantzaza", "El Pangui", "Centinela del Cóndor", "Palanda", "Paquisha"]
    };

    const handleProvinciaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const prov = e.target.value;
        setFormData({ ...formData, provincia: prov, canton: '' });
        setCantonesDisponibles(ubicaciones[prov] || []);
    };

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
                    provincia: formData.provincia,
                    canton: formData.canton,
                    experiencia: formData.experiencia
                })
            });

            if (res.ok) {
                setStatus('success');
                // Redirigir a WhatsApp después de 1.5 segundos
                setTimeout(() => {
                    const message = encodeURIComponent(`Hola ActivaQR quiero informacion sobre los vendedores. Soy ${formData.nombre} de ${formData.canton}, ${formData.provincia} 😊`);
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

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-navy/40 ml-4 mb-2 block">Provincia</label>
                    <select
                        required
                        value={formData.provincia}
                        onChange={handleProvinciaChange}
                        className="w-full px-6 py-3 rounded-full bg-cream border border-navy/5 focus:outline-none focus:border-primary font-bold text-navy text-sm appearance-none cursor-pointer"
                    >
                        <option value="">Seleccione...</option>
                        {Object.keys(ubicaciones).sort().map(prov => (
                            <option key={prov} value={prov}>{prov}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-navy/40 ml-4 mb-2 block">Cantón</label>
                    <select
                        required
                        disabled={!formData.provincia}
                        value={formData.canton}
                        onChange={e => setFormData({ ...formData, canton: e.target.value })}
                        className="w-full px-6 py-3 rounded-full bg-cream border border-navy/5 focus:outline-none focus:border-primary font-bold text-navy text-sm appearance-none cursor-pointer disabled:opacity-50"
                    >
                        <option value="">Seleccione...</option>
                        {cantonesDisponibles.sort().map(can => (
                            <option key={can} value={can}>{can}</option>
                        ))}
                    </select>
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
