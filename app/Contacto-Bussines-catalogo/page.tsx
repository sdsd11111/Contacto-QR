"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, ShieldCheck, Users, QrCode, Smartphone, Star, MapPin, Briefcase, BarChart3, ShoppingCart, Gift, Utensils, Download, PlayCircle, Plus, MessageCircle, Headphones } from "lucide-react";
import { ObjectionSection } from "@/components/ObjectionSection";
import Link from "next/link";
import { useEffect } from "react";

export default function ContactoBusinessCatalogoPage() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <main className="min-h-screen bg-navy selection:bg-primary/30 font-sans text-white">
            {/* Hero Fullscreen */}
            <section className="relative h-screen min-h-[800px] w-full flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img 
                        src="/images/mockup_laptop_automatizacion_activaqr_1772769734997.png" 
                        alt="Hero background" 
                        className="w-full h-full object-cover opacity-40 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/60 to-transparent"></div>
                </div>

                <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-md px-4 py-2 rounded-full border border-primary/30 shadow-lg mb-8"
                    >
                        <ShoppingCart className="text-primary w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-widest text-primary">El Perfil Definitivo Para Ventas</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="text-5xl md:text-7xl font-black text-white leading-tight mb-8 tracking-tighter"
                    >
                        Tu Propio Catálogo Digital <br/>
                        <span className="text-primary italic">Integrado y Listo</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="text-xl text-white/80 max-w-2xl mx-auto font-medium mb-12 leading-relaxed"
                    >
                        La solución TODO EN UNO. Perfil profesional business, ubicación y un catálogo interactivo con pedidos directos estructurados a tu WhatsApp.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        <Link
                            href="/registro?plan=catalog"
                            className="w-full sm:w-auto bg-primary text-white px-10 py-5 rounded-2xl font-black text-lg shadow-2xl shadow-primary/30 hover:-translate-y-1 transition-transform flex items-center justify-center gap-3 uppercase tracking-widest cursor-pointer"
                        >
                            Obtener por $200/año <ArrowRight size={20} />
                        </Link>
                        <a
                            href="#caracteristicas"
                            className="w-full sm:w-auto bg-white/10 backdrop-blur-md text-white px-10 py-5 rounded-2xl font-bold text-lg border border-white/20 hover:bg-white/20 transition-colors flex items-center justify-center"
                        >
                            Ver Detalles
                        </a>
                    </motion.div>
                </div>
            </section>

            {/* Características Section */}
            <section id="caracteristicas" className="py-24 bg-white text-navy relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black text-navy uppercase tracking-tighter">
                            Vitrinas <span className="text-primary italic">Interactivas</span>
                        </h2>
                        <p className="text-navy/60 mt-4 text-xl font-medium max-w-2xl mx-auto">
                            Tus clientes navegan por tus productos y hacen sus pedidos sin tener que salirse a descargar otras aplicaciones. Todo integrado.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                image: "/images/mockup_laptop_automatizacion_activaqr_1772769734997.png",
                                title: "Catálogo Interactivo",
                                desc: "Agrega hasta 50 productos en una galería premium. Tus clientes verán categorías y detalles completos."
                            },
                            {
                                image: "/images/estado de whatsapp.png",
                                title: "Pedidos a WhatsApp",
                                desc: "El cliente arma su carrito y su pedido llega estructurado y claro directamente a tu WhatsApp. Sin confusiones."
                            },
                            {
                                image: "/images/mockup de guardado.png",
                                title: "Business Dashboard",
                                desc: "Gestiona tu propio inventario visual de manera sencilla. Tú controlas lo que vendes."
                            },
                            {
                                image: "/images/features/perfil.png",
                                title: "Todo lo del Plan Business",
                                desc: "Incluye el perfil profesional, redes y enlaces múltiples, Maps, y tu foto para ser guardado en la agenda."
                            },
                            {
                                image: "/images/features/agenda.png",
                                title: "Carga Inicial Gratis",
                                desc: "Te ayudamos a estructurar tu información principal para que veas resultados rápidamente."
                            },
                            {
                                image: "/images/features/soporte.png",
                                title: "Soporte VIP",
                                desc: "Asistencia de nivel prioritario. Cualquier ajuste crítico en tu catálogo es atendido de inmediato."
                            }
                        ].map((feat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white p-0 rounded-[2.5rem] shadow-xl border border-navy/5 hover:border-primary/30 hover:shadow-2xl transition-all group overflow-hidden flex flex-col"
                            >
                                <div className="w-full aspect-video overflow-hidden border-b border-navy/5">
                                    <img 
                                        src={feat.image} 
                                        alt={feat.title} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                    />
                                </div>
                                <div className="p-8">
                                    <h3 className="text-xl font-black text-navy mb-3">{feat.title}</h3>
                                    <p className="text-navy/60 font-medium leading-relaxed">{feat.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Showcase Section */}
            <section className="py-24 bg-cream text-navy border-y border-navy/5 overflow-hidden">
                {/* ... existing code ... */}
            </section>

            {/* Nueva Sección: Promociones y Contenido Dinámico */}
            <section className="py-24 bg-white relative overflow-hidden text-navy">
                <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
                        <div className="lg:w-1/2">
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <h2 className="text-4xl md:text-6xl font-black text-navy uppercase tracking-tighter mb-8 leading-[0.9]">
                                    Potencia tus Ventas con <span className="text-primary italic">Contenido Dinámico</span>
                                </h2>
                                <p className="text-navy/60 text-xl font-medium mb-12 leading-relaxed">
                                    Con el Plan Catálogo, tus promociones cobran vida. Atrae a tus clientes con ofertas y llévalos directamente a comprar en tu vitrina digital.
                                </p>

                                <div className="space-y-8">
                                    {[
                                        {
                                            icon: <Gift className="text-primary" size={28} />,
                                            title: "Ofertas de Temporada",
                                            desc: "Aprovecha el espacio 'Hero' para destacar combos, descuentos navideños o promociones del mes."
                                        },
                                        {
                                            icon: <Utensils className="text-primary" size={28} />,
                                            title: "Especiales del Día",
                                            desc: "Actualiza tu propuesta gastronómica o de servicios diariamente. Tus clientes siempre verán lo más fresco."
                                        },
                                        {
                                            icon: <Download className="text-primary" size={28} />,
                                            title: "Descarga de Catálogos PDF",
                                            desc: "Para los que prefieren llevarse tu catálogo de temporada en el móvil, ofrece una descarga directa y profesional."
                                        }
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-6 group">
                                            <div className="w-14 h-14 shrink-0 rounded-2xl bg-navy/5 border border-navy/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                {item.icon}
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-black text-navy mb-2 uppercase italic tracking-tight">{item.title}</h4>
                                                <p className="text-navy/50 font-medium leading-relaxed">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        <div className="lg:w-1/2 relative">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                                className="relative z-10"
                            >
                                <MockupTelefono />
                            </motion.div>
                            
                            {/* Decorative background elements */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[80px] animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Comparativa / Before vs After */}
            <section className="py-24 bg-white border-y border-navy/5">
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-5xl font-black text-navy mb-16 tracking-tighter uppercase">
                        ¿Por qué dar el salto <span className="text-primary italic">al plan catálogo?</span>
                    </h2>

                    <div className="grid md:grid-cols-2 gap-8 text-left">
                        <div className="bg-red-50 p-8 rounded-[2rem] border border-red-100 relative">
                            <div className="absolute top-4 right-4 bg-red-100 text-red-500 text-xs font-black uppercase px-3 py-1 rounded-full">Contacto Business</div>
                            <h3 className="text-2xl font-black text-navy mb-6">Piensa en tu semana:</h3>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <span className="text-red-500 mt-1">❌</span>
                                    <span className="text-navy/70 font-medium">Mensajes preguntando precios que ya respondiste veinte veces.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-red-500 mt-1">❌</span>
                                    <span className="text-navy/70 font-medium">Fotos del mismo producto mandadas una y otra vez.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-red-500 mt-1">❌</span>
                                    <span className="text-navy/70 font-medium">Clientes que preguntan si hay stock y al final no compran nada.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-red-500 mt-1">❌</span>
                                    <span className="text-navy/70 font-medium">Horas perdidas que nunca se recuperan.</span>
                                </li>
                            </ul>
                            <p className="mt-6 text-sm text-red-500 font-bold bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                                Todo ese tiempo tiene un costo. Y lo estás pagando cada día sin darte cuenta.
                            </p>
                        </div>
                        <div className="bg-primary/5 p-8 rounded-[2rem] border border-primary/20 relative shadow-xl">
                            <div className="absolute top-4 right-4 bg-primary text-white text-xs font-black uppercase px-3 py-1 rounded-full shadow-md">Con Catálogo</div>
                            <h3 className="text-2xl font-black text-navy mb-6">Un vendedor que no duerme</h3>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 size={20} className="text-primary mt-1 shrink-0" />
                                    <span className="text-navy/80 font-bold">Tu catálogo vende solo mientras tú descansas o atiendes a otros clientes.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 size={20} className="text-primary mt-1 shrink-0" />
                                    <span className="text-navy/80 font-bold">Decisión de compra en segundos. El cliente elige, suma y te envía el pedido listo.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 size={20} className="text-primary mt-1 shrink-0" />
                                    <span className="text-navy/80 font-bold">Recibes pedidos exactos por WhatsApp, listos para cobrar y despachar hoy mismo.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Objection Audio Section */}
            <section className="py-12 bg-cream/30 border-y border-white/5">
                <div className="max-w-5xl mx-auto px-6">
                    <ObjectionSection />
                </div>
            </section>

            {/* Resumen Final CTA */}
            <section className="py-24 bg-navy relative overflow-hidden text-center">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-[100px] pointer-events-none"></div>
                
                <div className="max-w-3xl mx-auto px-6 relative z-10">
                    <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-6">
                        El Nivel <span className="text-primary">Supremo</span> de Ventas
                    </h2>
                    <p className="text-white/70 text-lg md:text-xl font-medium mb-12">
                        Por tan solo $200 al año, obtén el sistema Business total con módulo de tienda integrado.
                    </p>
                    <Link
                        href="/registro?plan=catalog"
                        className="inline-flex items-center justify-center gap-3 bg-white text-navy px-12 py-6 rounded-2xl font-black text-xl shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:scale-105 hover:bg-cream hover:text-primary transition-all uppercase tracking-widest"
                    >
                        Quiero el Catálogo <ArrowRight size={24} />
                    </Link>
                    <p className="text-white/40 text-sm mt-6 font-bold">*Incluye alojamiento por un año sin pagos mensuales extra.</p>
                </div>
            </section>
        </main>
    );
}

function MockupTelefono() {
    return (
        <div className="relative mx-auto w-[320px] h-[640px] bg-navy rounded-[3.5rem] border-[12px] border-navy shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden ring-1 ring-white/10">
            {/* Camera/Notch Area */}
            <div className="h-10 bg-navy w-full flex justify-center items-center rounded-t-[2.5rem] pt-2 relative z-50">
                <div className="w-24 h-6 bg-black rounded-full flex items-center justify-end px-4">
                    <div className="w-1.5 h-1.5 bg-white/10 rounded-full"></div>
                </div>
            </div>

            <div className="flex-1 bg-[#FDFDFF] p-4 flex flex-col relative overflow-y-auto custom-scrollbar">
                {/* Profile Header */}
                <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mt-2 flex items-center gap-4 border border-gray-100 relative z-10 hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center shrink-0 border border-primary/10">
                        <Star className="text-primary fill-primary/10" size={24} />
                    </div>
                    <div className="flex-1">
                        <div className="font-black text-navy text-base tracking-tight leading-none mb-1">Tu Negocio Pro</div>
                        <div className="text-[10px] text-primary font-black uppercase tracking-widest">Catálogo Oficial</div>
                    </div>
                </div>
                
                {/* Banner/Category */}
                <div className="mt-6 mb-4 px-1 flex items-center justify-between">
                    <div className="font-black text-navy text-sm uppercase tracking-tight">Destacados</div>
                    <div className="text-[10px] text-navy/40 font-bold uppercase cursor-pointer hover:text-primary">Ver todo</div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 gap-4 relative z-10 mb-8">
                    {[
                        { name: "Combo Premium", price: "$45.00", img: "/images/features/perfil.png" },
                        { name: "Servicio Express", price: "$25.00", img: "/images/features/agenda.png" },
                        { name: "Kit Digital", price: "$89.99", img: "/images/features/qr.png" },
                        { name: "Setup VIP", price: "$120.00", img: "/images/features/soporte.png" }
                    ].map((prod, idx) => (
                        <div key={idx} className="bg-white rounded-[2rem] p-3 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col gap-3 group transition-all hover:-translate-y-1">
                            <div className="h-28 w-full bg-cream rounded-2xl overflow-hidden relative border border-navy/5">
                                <img src={prod.img} alt={prod.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md p-1.5 rounded-xl shadow-sm">
                                    <MessageCircle size={12} className="text-primary" />
                                </div>
                            </div>
                            <div className="px-1">
                                <div className="font-bold text-navy text-[11px] leading-tight mb-1 truncate">{prod.name}</div>
                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-primary font-black text-xs">{prod.price}</span>
                                    <span className="text-[8px] text-navy/30 line-through font-bold">{idx === 0 ? "$60.00" : ""}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Final CTA Button Floating */}
                <div className="sticky bottom-2 left-0 right-0 z-40">
                    <div className="bg-[#25D366] text-white text-center py-4 rounded-2xl shadow-[0_10px_30px_rgba(37,211,102,0.4)] font-black text-xs tracking-widest uppercase flex items-center justify-center gap-3 border border-white/20">
                        <MessageCircle size={14} className="fill-white/20" />
                        Pedir por WhatsApp <span className="bg-white/20 px-2 py-1 rounded-lg tabular-nums">$95.00</span>
                    </div>
                </div>
            </div>
            
            {/* Bottom Bar Indicator */}
            <div className="h-6 bg-white w-full flex justify-center items-center pb-2">
                <div className="w-24 h-1 bg-navy/10 rounded-full"></div>
            </div>
        </div>
    );
}
