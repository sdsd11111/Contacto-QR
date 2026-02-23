"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    Palette,
    Globe,
    FileText,
    Clapperboard,
    MonitorPlay,
    X,
    Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { marketingDetails } from "@/lib/marketing-data";

const TABS = [
    { id: 'overview', label: 'Estrategia Core', icon: LayoutDashboard },
    { id: 'brand', label: 'ADN & Marca', icon: Palette },
    { id: 'web', label: 'Web & Embudos', icon: Globe },
    { id: 'content', label: 'Contenido Digital', icon: FileText },
    { id: 'scripts', label: 'Hub de Vendedores (Guiones)', icon: Clapperboard, highlight: true },
    { id: 'ads', label: 'Inversión Publicitaria', icon: MonitorPlay }
];

export default function MarketingDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [detailKey, setDetailKey] = useState<string | null>(null);

    return (
        <div className="relative w-full h-full flex flex-col gap-8">
            {/* Tabs Navigation */}
            <div className="flex flex-wrap gap-3 mb-4">
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "px-6 py-4 rounded-2xl flex items-center gap-3 font-black text-[10px] uppercase tracking-widest transition-all",
                                isActive
                                    ? "bg-primary text-navy shadow-orange"
                                    : tab.highlight
                                        ? "bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20"
                                        : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10 hover:text-white"
                            )}
                        >
                            <Icon size={16} className={isActive ? "text-navy" : tab.highlight ? "text-primary flex-shrink-0" : ""} />
                            {tab.label}
                            {tab.highlight && !isActive && <Sparkles size={12} className="ml-1 animate-pulse text-amber-400" />}
                        </button>
                    );
                })}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                <AnimatePresence mode="wait">
                    {/* --- OVERVIEW --- */}
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6"
                        >
                            <MarketingCard
                                onClick={() => setDetailKey('hero')}
                                className="col-span-1 md:col-span-3 bg-gradient-to-br from-navy to-[#1f2937] border-white/10"
                                title="CLAIM PRINCIPAL"
                                mainText='"Tu cliente te tiene en su teléfono"'
                                subText="Un código QR que descarga tu contacto automáticamente. Sin apps, sin búsquedas, sin que te olviden."
                                icon="📱"
                            />
                            <MarketingCard onClick={() => setDetailKey('colors')} title="COLORES Core" mainText="Verde ActivaQR" subText="Identity #00C853" />
                            <MarketingCard onClick={() => setDetailKey('budget')} title="PRESUPUESTO" mainText="$2,300/mes" subText="Facebook + Google + TV Local" highlight />
                            <MarketingCard onClick={() => setDetailKey('metrics')} className="col-span-1 md:col-span-3" title="METAS 90 DÍAS" mainText="Target: 50+ Leads / 3x ROAS" subText="Incremento de cierre del 30% vía WhatsApp" />
                        </motion.div>
                    )}

                    {/* --- BRAND --- */}
                    {activeTab === 'brand' && (
                        <motion.div
                            key="brand"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                            <MarketingCard onClick={() => setDetailKey('positioning')} className="bg-gradient-to-br from-navy to-[#1f2937]" title="POSICIONAMIENTO" mainText="Especialistas en Contactos" subText="Solo vCard para profesionales" />
                            <MarketingCard onClick={() => setDetailKey('competitors')} title="COMPETIDORES" mainText="Diferenciador Fuerte" subText="No somos Linktree. No somos Canva. Somos tu Contacto." />
                            <MarketingCard onClick={() => setDetailKey('voice')} className="col-span-1 md:col-span-2" title="VOZ DE MARCA" mainText="Profesional Periférico" subText="Cercano / Directo / Emocional / Antitecnológico" />
                        </motion.div>
                    )}

                    {/* --- WEB --- */}
                    {activeTab === 'web' && (
                        <motion.div
                            key="web"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            <MarketingCard onClick={() => setDetailKey('structure')} className="col-span-1 md:col-span-2" title="ESTRUCTURA DEL SITIO" mainText="Home > Demo > Checkout" subText="Embudo minimalista lineal" />
                            <MarketingCard onClick={() => setDetailKey('seo')} title="TRÁFICO SEO" mainText="Keywords B2B" subText="Optimización semántica vCard" />
                            <MarketingCard onClick={() => setDetailKey('funnel')} className="col-span-1 md:col-span-3" title="FUNNEL DE CONVERSIÓN" mainText="TikTok → Web → WhatsApp → Venta" subText="Flujo de máxima conversión humana en WhatsApp" highlight />
                        </motion.div>
                    )}

                    {/* --- CONTENT --- */}
                    {activeTab === 'content' && (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                            <MarketingCard onClick={() => setDetailKey('calendar')} title="CALENDARIO SEMANAL" mainText="Contenido por día" subText="Lunes Blog, Martes Dolor, Jueves Demo" />
                            <MarketingCard onClick={() => setDetailKey('platforms')} title="PLATAFORMAS CORE" mainText="Instagram & Facebook" subText="Foco en rango de 35-65 años. TikTok no es prioridad." />
                            <MarketingCard onClick={() => setDetailKey('blog')} className="col-span-1 md:col-span-2" title="ESTRATEGIA BLOG" mainText="Inyección de CTAs" subText="Todos los artículos dirigen a Landing o WhatsApp" highlight />
                        </motion.div>
                    )}

                    {/* --- SCRIPTS (SALES ENABLEMENT) --- */}
                    {activeTab === 'scripts' && (
                        <motion.div
                            key="scripts"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6"
                        >
                            <MarketingCard onClick={() => setDetailKey('scripts')} className="col-span-1 md:col-span-3 bg-primary/5 border-primary/20" title="BIBLIOTECA DE GUIONES" mainText="Activos para vendedores" subText="14 Guiones listos para copiar, pegar y grabar" icon="🔥" />
                            <MarketingCard onClick={() => setDetailKey('scripts-list')} className="col-span-1 md:col-span-2" title="GUIONES VIP" mainText="Problema > Solución > Objeción" subText="Mapeo del dolor comercial de no ser recordado" />
                            <MarketingCard onClick={() => setDetailKey('tips')} title="TIPS PRODUCCIÓN" mainText="Entrenamiento asíncrono" subText="Iluminación, gesticulación y ganchos rápidos" />
                        </motion.div>
                    )}

                    {/* --- ADS --- */}
                    {activeTab === 'ads' && (
                        <motion.div
                            key="ads"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                            <MarketingCard onClick={() => setDetailKey('ads-budget')} title="PRESUPUESTO ADS" mainText="$2,300 Recomendado" subText="Meta Ads + Google + TV/Radio local" highlight />
                            <MarketingCard onClick={() => setDetailKey('ads-channels')} title="PRIORIDAD DE CANALES" mainText="1. WhatsApp  2. Meta Ads" subText="Flujo Outbound apoyado de pauta en Video" />
                            <MarketingCard onClick={() => setDetailKey('ads-detail')} className="col-span-1 md:col-span-2" title="SEGMENTACIÓN" mainText="Dueños de negocio (35-65a)" subText="Target local + Intent B2B" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Detail Panel Desktop (Slide from right) & Mobile (Fullscreen Modal) */}
            <AnimatePresence>
                {detailKey && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setDetailKey(null)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                        />

                        {/* Panel */}
                        <motion.div
                            initial={{ x: "100%", opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: "100%", opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="fixed top-0 right-0 h-[100dvh] w-full md:w-[600px] bg-navy border-l border-white/10 z-[110] shadow-3xl overflow-y-auto"
                        >
                            <div className="sticky top-0 p-6 bg-navy/80 backdrop-blur-xl border-b border-white/10 flex justify-between items-center z-10">
                                <h3 className="text-xl font-black uppercase italic tracking-tighter">Detalle Estratégico</h3>
                                <button
                                    onClick={() => setDetailKey(null)}
                                    className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-white/40 hover:text-white"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-8">
                                <div dangerouslySetInnerHTML={{ __html: marketingDetails[detailKey] || '<p>Contenido en construcción por el agente especialista.</p>' }} />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

// Reusable UI Card
function MarketingCard({
    title,
    mainText,
    subText,
    icon,
    className,
    onClick,
    highlight
}: {
    title: string,
    mainText: string,
    subText?: string,
    icon?: string,
    className?: string,
    onClick?: () => void,
    highlight?: boolean
}) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "group cursor-pointer relative overflow-hidden rounded-[32px] p-8 transition-all hover:-translate-y-1",
                highlight
                    ? "bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 hover:border-primary border-transparent"
                    : "bg-white/5 border border-white/10 hover:border-white/30",
                className
            )}
        >
            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest text-white/60">
                Ver detalle →
            </div>

            <h4 className={cn("text-[10px] font-black uppercase tracking-widest mb-4", highlight ? "text-primary" : "text-white/40")}>
                {title}
            </h4>

            <p className="text-2xl font-black tracking-tighter leading-tight text-white">{mainText}</p>

            {subText && (
                <p className={cn("mt-4 text-sm font-medium", highlight ? "text-white/80" : "text-white/60")}>
                    {subText}
                </p>
            )}

            {icon && (
                <div className="absolute -bottom-6 -right-6 text-[120px] opacity-10 rotate-[-15deg] select-none pointer-events-none">
                    {icon}
                </div>
            )}
        </div>
    );
}
