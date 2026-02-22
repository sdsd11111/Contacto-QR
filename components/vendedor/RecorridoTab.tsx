"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus, ChevronRight, ChevronLeft, Mic, MicOff,
    CheckCircle, X, Clock, Briefcase, Lightbulb,
    Utensils, Stethoscope, Scissors, ShirtIcon, Wrench,
    Pill, Building2, GraduationCap, HelpCircle,
    AlertCircle, MessageSquare, History, ChevronDown
} from "lucide-react";

// ────────────────────────────────────────────
// TIPOS
// ────────────────────────────────────────────
type VisitResult = "no_interesado" | "seguimiento" | "cerrado";
type BusinessCategory =
    | "restaurante" | "comercio" | "medico" | "salon_belleza"
    | "tienda_ropa" | "ferreteria" | "farmacia" | "hotel"
    | "educacion" | "otro";
type ContactRole = "dueño" | "encargado" | "empleado";

interface VisitForm {
    businessName: string;
    contactName: string;
    businessCategory: BusinessCategory | "";
    sector: string;
    contactRole: ContactRole | "";
    result: VisitResult | "";
    qrShared: boolean | null;
    mainObjection: string;
    followUpDate: string;
    highTicketSignal: boolean | null;
    notes: string;
    latitude: number | null;
    longitude: number | null;
}

interface FollowUp {
    id: number;
    businessName: string;
    contactName: string;
    category: string;
    objection: string;
    scheduledDate: string;
    whatsappMessage: string;
    status: "pendiente" | "completado" | "descartado";
}

interface VisitHistory {
    id: number;
    date: string;
    businessName: string;
    contactName: string;
    category: BusinessCategory;
    result: VisitResult;
    sector: string;
}

interface StrategicCard {
    category: BusinessCategory;
    painPoint: string;
    attentionGrabber: string;
    angle: string;
    objectionResponse: string;
}

// ────────────────────────────────────────────
// DATOS MOCK (→ BD mañana)
// ────────────────────────────────────────────
// STRATEGIC CARDS (se consultan dinámicamente)

// Categorías con iconos
const CATEGORIES: { value: BusinessCategory; label: string; icon: React.ElementType }[] = [
    { value: "restaurante", label: "Restaurante", icon: Utensils },
    { value: "medico", label: "Médico / Clínica", icon: Stethoscope },
    { value: "salon_belleza", label: "Salón / Spa", icon: Scissors },
    { value: "comercio", label: "Tienda / Comercio", icon: Briefcase },
    { value: "tienda_ropa", label: "Ropa / Moda", icon: ShirtIcon },
    { value: "ferreteria", label: "Ferretería", icon: Wrench },
    { value: "farmacia", label: "Farmacia", icon: Pill },
    { value: "hotel", label: "Hotel", icon: Building2 },
    { value: "educacion", label: "Educación", icon: GraduationCap },
    { value: "otro", label: "Otro", icon: HelpCircle },
];

const RESULT_CONFIG = {
    no_interesado: { label: "No interesado", color: "text-red-400", bg: "bg-red-500/10", emoji: "❌" },
    seguimiento: { label: "Seguimiento", color: "text-yellow-400", bg: "bg-yellow-500/10", emoji: "🔄" },
    cerrado: { label: "¡Cerrado!", color: "text-green-400", bg: "bg-green-500/10", emoji: "✅" },
};

// Genera plantilla WhatsApp con nombre real del vendedor y contacto
function generarMensaje(category: string, objection: string, businessName: string, contactName: string, sellerName: string): string {
    const objStr = objection ? ` Me comentó que "${objection}".` : "";
    const saludo = contactName ? `${contactName}, ` : "";
    const nombre = sellerName || "su asesor";
    const base: Record<string, string> = {
        restaurante: `Hola ${saludo}soy ${nombre} de ActivaQR. Le visité en ${businessName}.${objStr} Muchos restaurantes ya tienen su menú digital con QR. ¿Tiene un momento esta semana?`,
        medico: `Hola ${saludo}soy ${nombre} de ActivaQR. Le visité en ${businessName}.${objStr} Su tarjeta digital haría que sus pacientes lo encuentren sin esfuerzo. ¿Conversamos 10 minutos?`,
        salon_belleza: `Hola ${saludo}soy ${nombre} de ActivaQR. Le visité en ${businessName}.${objStr} Con su QR sus clientas la encuentran y la recomiendan al instante. ¿Le parece si coordinamos?`,
    };
    return base[category] || `Hola ${saludo}soy ${nombre} de ActivaQR. Le visité en ${businessName}.${objStr} Me gustaría retomar nuestra conversación. ¿Tiene un momento esta semana?`;
}

// Default = mañana
function getTomorrow() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
}

// ────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ────────────────────────────────────────────
export default function RecorridoTab({ seller }: { seller: any }) {
    const [activeSection, setActiveSection] = useState<"hoy" | "historial">("hoy");
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [followUps, setFollowUps] = useState<FollowUp[]>([]);
    const [history, setHistory] = useState<VisitHistory[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [visitSaved, setVisitSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [strategicCard, setStrategicCard] = useState<StrategicCard | null>(null);

    const [form, setForm] = useState<VisitForm>({
        businessName: "", contactName: "", businessCategory: "", sector: "",
        contactRole: "", result: "", qrShared: null, mainObjection: "",
        followUpDate: getTomorrow(), highTicketSignal: null,
        notes: "", latitude: null, longitude: null,
    });

    // ────────────────────────────────────────────
    // FETCH DATA
    // ────────────────────────────────────────────
    useEffect(() => {
        if (!seller?.id) return;

        const fetchData = async () => {
            try {
                // Fetch Seguimientos
                const resFu = await fetch(`/api/follow-ups?seller_id=${seller.id}`);
                const dataFu = await resFu.json();
                if (dataFu.success) {
                    setFollowUps(dataFu.data.map((r: any) => ({
                        id: r.id,
                        businessName: r.business_name,
                        contactName: r.contact_name,
                        category: r.category || "otro",
                        objection: r.objection || "",
                        scheduledDate: r.scheduled_date?.split("T")[0] || "",
                        whatsappMessage: r.whatsapp_message || "",
                        status: r.status
                    })));
                }

                // Fetch Historial (últimos 7 días)
                const resHi = await fetch(`/api/field-visits?seller_id=${seller.id}`);
                const dataHi = await resHi.json();
                if (dataHi.success) {
                    setHistory(dataHi.data);
                }
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
            }
        };

        fetchData();
    }, [seller?.id]);

    // Soporte Centralizado (Número del Admin)
    const SUPPORT_NUMBER = "593962657270"; // César Reyes (Admin)
    const SUPPORT_URL = `https://wa.me/${SUPPORT_NUMBER}?text=${encodeURIComponent("Hola ActivaQR, necesito soporte técnico o tengo una sugerencia.")}`;

    const todayStr = new Date().toLocaleDateString("es-EC", { weekday: "long", day: "numeric", month: "long" });

    const demoQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent("https://activaqr.com/card/demo")}&color=FF6B00&bgcolor=050B1C`;
    const contactQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(SUPPORT_URL)}&color=25D366&bgcolor=050B1C`;

    const resetForm = () => {
        setForm({
            businessName: "", contactName: "", businessCategory: "", sector: "",
            contactRole: "", result: "", qrShared: null, mainObjection: "",
            followUpDate: getTomorrow(), highTicketSignal: null,
            notes: "", latitude: null, longitude: null,
        });
        setStrategicCard(null);
        setCurrentStep(1);
        setIsRecording(false);
    };

    const handleCategorySelect = async (cat: BusinessCategory) => {
        setForm(f => ({ ...f, businessCategory: cat }));
        // Cargar ficha desde la BD
        setStrategicCard(null); // Reset while loading
        try {
            const res = await fetch(`/api/strategic-cards?category=${cat}`);
            const data = await res.json();
            if (data.success && data.data) {
                setStrategicCard({
                    category: cat,
                    painPoint: data.data.pain_point,
                    attentionGrabber: data.data.attention_grabber,
                    angle: data.data.recommended_angle,
                    objectionResponse: data.data.objection_response
                });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveVisit = async () => {
        setIsSaving(true);
        let lat: number | null = null, lng: number | null = null;
        try {
            if (navigator.geolocation) {
                const pos = await new Promise<GeolocationPosition>((res, rej) =>
                    navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 })
                );
                lat = pos.coords.latitude;
                lng = pos.coords.longitude;
            }
        } catch { /* sin GPS = no bloqueante */ }

        const sellerName = seller?.nombre?.split(" ")[0] || "";

        try {
            const res = await fetch("/api/field-visits", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sellerId: seller.id,
                    businessName: form.businessName,
                    contactName: form.contactName,
                    category: form.businessCategory,
                    sector: form.sector,
                    result: form.result,
                    objection: form.mainObjection,
                    notes: form.notes,
                    highTicket: form.highTicketSignal,
                    lat: lat,
                    lng: lng,
                    followUpDate: form.followUpDate
                })
            });
            const data = await res.json();
            if (data.success) {
                // TODO: Refresh history / follow-ups
                // Fetch Historial again (or append to local state)
                fetch(`/api/field-visits?seller_id=${seller.id}`).then(r => r.json()).then(d => d.success && setHistory(d.data));
                fetch(`/api/follow-ups?seller_id=${seller.id}`).then(r => r.json()).then(d => d.success && setFollowUps(d.data.map((r: any) => ({
                    id: r.id,
                    businessName: r.business_name,
                    contactName: r.contact_name,
                    category: r.category || "otro",
                    objection: r.objection || "",
                    scheduledDate: r.scheduled_date?.split("T")[0] || "",
                    whatsappMessage: r.whatsapp_message || "",
                    status: r.status
                }))));
            }
        } catch (e) {
            console.error("Error saving visit", e);
        }

        setIsSaving(false);
        setVisitSaved(true);
        setTimeout(() => { setVisitSaved(false); setShowRegisterModal(false); resetForm(); }, 2200);
    };

    const handleFollowUpAction = async (id: number, action: "completado" | "descartado") => {
        try {
            await fetch("/api/follow-ups", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status: action })
            });
            setFollowUps(prev => prev.filter(f => f.id !== id));
        } catch (e) {
            console.error("Error updating follow-up", e);
        }
    };

    const canGoNext = () => {
        if (currentStep === 1) return form.businessName.trim() !== "" && form.contactName.trim() !== "" && form.businessCategory !== "";
        if (currentStep === 2) return form.contactRole !== "" && form.result !== "" && form.qrShared !== null;
        return true;
    };

    const todayFollowUps = followUps.filter(f => f.status === "pendiente");

    return (
        <div className="space-y-8">
            {/* ── QR SECTION ── */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0A1229] border border-primary/30 rounded-[24px] p-5 flex flex-col items-center gap-3 shadow-lg shadow-primary/10">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">📲 Demo</span>
                    <div className="bg-white p-2 rounded-xl">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={demoQrUrl} alt="QR Demo" width={130} height={130} className="rounded-lg" />
                    </div>
                    <p className="text-white/50 text-[10px] text-center leading-snug">
                        Muéstralo al cliente<br /><span className="text-white/80 font-bold">Ve cómo funciona</span>
                    </p>
                </div>
                <div className="bg-[#0A1229] border border-green-500/30 rounded-[24px] p-5 flex flex-col items-center gap-3 shadow-lg shadow-green-500/10">
                    <span className="text-[10px] font-black uppercase tracking-widest text-green-400">👋 Soporte</span>
                    <div className="bg-white p-2 rounded-xl">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={contactQrUrl} alt="QR Soporte" width={130} height={130} className="rounded-lg" />
                    </div>
                    <p className="text-white/50 text-[10px] text-center leading-snug">
                        Pídele que lo escanee<br /><span className="text-green-400 font-bold">Te agrega en WhatsApp</span>
                    </p>
                </div>
            </div>

            {/* ── BOTÓN REGISTRAR ── */}
            <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => { resetForm(); setShowRegisterModal(true); }}
                className="w-full bg-primary hover:bg-[#FF8A33] py-6 rounded-[24px] font-black text-xl uppercase tracking-widest text-[#050B1C] shadow-[0_10px_30px_rgba(255,107,0,0.3)] flex items-center justify-center gap-3 transition-all"
            >
                <Plus size={28} strokeWidth={3} /> Registrar Visita
            </motion.button>

            {/* ── TABS HOY / HISTORIAL ── */}
            <div>
                <div className="flex gap-2 mb-5 bg-white/5 rounded-xl p-1 border border-white/10">
                    <button
                        onClick={() => setActiveSection("hoy")}
                        className={`flex-1 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeSection === "hoy" ? "bg-white/15 text-white" : "text-white/30 hover:text-white/60"}`}
                    >
                        <Clock size={14} /> Seguimientos de Hoy
                        {todayFollowUps.length > 0 && (
                            <span className="bg-yellow-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded-full">{todayFollowUps.length}</span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveSection("historial")}
                        className={`flex-1 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeSection === "historial" ? "bg-white/15 text-white" : "text-white/30 hover:text-white/60"}`}
                    >
                        <History size={14} /> Mi Historial
                    </button>
                </div>

                {/* SEGUIMIENTOS DE HOY */}
                {activeSection === "hoy" && (
                    <div>
                        <p className="text-white/25 text-[10px] font-bold uppercase tracking-widest mb-4">{todayStr}</p>
                        {todayFollowUps.length === 0 ? (
                            <div className="bg-[#0A1229] border border-white/5 rounded-[24px] p-10 text-center">
                                <CheckCircle size={36} className="mx-auto mb-3 text-green-500 opacity-30" />
                                <p className="text-white/25 font-bold text-sm uppercase tracking-widest">Todo al día 🎉</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {todayFollowUps.map(fu => (
                                    <FollowUpCard key={fu.id} followUp={fu} onAction={handleFollowUpAction} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* HISTORIAL */}
                {activeSection === "historial" && (
                    <HistorialSection history={history} />
                )}
            </div>

            {/* ── MODAL REGISTRO ── */}
            <AnimatePresence>
                {showRegisterModal && (
                    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowRegisterModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                        <motion.div
                            initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 60 }} transition={{ type: "spring", damping: 25 }}
                            className="relative w-full sm:max-w-lg bg-[#0A1229] border border-white/10 rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col max-h-[94vh]"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">Paso {currentStep} de 3</p>
                                    <h3 className="text-xl font-black uppercase italic tracking-tighter">
                                        {currentStep === 1 && "¿A dónde fuiste?"}
                                        {currentStep === 2 && "¿Cómo te fue?"}
                                        {currentStep === 3 && "Detalles finales"}
                                    </h3>
                                </div>
                                <button onClick={() => setShowRegisterModal(false)} className="p-3 hover:bg-white/10 rounded-full transition-all">
                                    <X size={22} />
                                </button>
                            </div>
                            <div className="h-1.5 bg-white/5 w-full flex-shrink-0">
                                <motion.div animate={{ width: `${(currentStep / 3) * 100}%` }} className="h-full bg-primary rounded-full" transition={{ duration: 0.3 }} />
                            </div>

                            {/* Contenido */}
                            <div className="flex-1 overflow-y-auto p-6">
                                <AnimatePresence mode="wait">
                                    {visitSaved ? <SuccessStep key="ok" /> :
                                        currentStep === 1 ? <Step1 key="s1" form={form} setForm={setForm} onCategorySelect={handleCategorySelect} strategicCard={strategicCard} /> :
                                            currentStep === 2 ? <Step2 key="s2" form={form} setForm={setForm} /> :
                                                <Step3 key="s3" form={form} setForm={setForm} isRecording={isRecording} setIsRecording={setIsRecording} />
                                    }
                                </AnimatePresence>
                            </div>

                            {/* Navegación */}
                            {!visitSaved && (
                                <div className="p-6 border-t border-white/10 flex gap-3 flex-shrink-0">
                                    {currentStep > 1 && (
                                        <button onClick={() => setCurrentStep(s => s - 1)}
                                            className="flex items-center gap-2 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all">
                                            <ChevronLeft size={18} /> Atrás
                                        </button>
                                    )}
                                    {currentStep < 3 ? (
                                        <button onClick={() => canGoNext() && setCurrentStep(s => s + 1)} disabled={!canGoNext()}
                                            className="flex-1 flex items-center justify-center gap-2 py-4 bg-primary hover:bg-[#FF8A33] rounded-2xl font-black text-sm uppercase tracking-widest text-[#050B1C] transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                                            Siguiente <ChevronRight size={18} />
                                        </button>
                                    ) : (
                                        <button onClick={handleSaveVisit} disabled={!form.result || isSaving}
                                            className="flex-1 flex items-center justify-center gap-2 py-4 bg-primary hover:bg-[#FF8A33] rounded-2xl font-black text-sm uppercase tracking-widest text-[#050B1C] transition-all disabled:opacity-30">
                                            {isSaving ? <span className="animate-pulse">📍 Capturando ubicación...</span>
                                                : <><CheckCircle size={18} /> Guardar Visita</>}
                                        </button>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ────────────────────────────────────────────
// SUB-COMPONENTES DEL MODAL
// ────────────────────────────────────────────

function SuccessStep() {
    return (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-14 text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle size={40} className="text-green-400" />
            </div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-green-400 mb-2">¡Visita Guardada!</h3>
            <p className="text-white/40 text-sm font-medium">Ubicación registrada. ¡Sigue así! 💪</p>
        </motion.div>
    );
}

function Step1({ form, setForm, onCategorySelect, strategicCard }: {
    form: VisitForm;
    setForm: React.Dispatch<React.SetStateAction<VisitForm>>;
    onCategorySelect: (cat: BusinessCategory) => void;
    strategicCard: StrategicCard | null;
}) {
    const [showCard, setShowCard] = useState(true);

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            {/* Nombre del negocio */}
            <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/40">Nombre del negocio *</label>
                <input type="text" value={form.businessName}
                    onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))}
                    placeholder="Ej: Restaurante El Buen Sabor"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-base font-medium focus:border-primary/50 outline-none transition-all placeholder:text-white/20" />
            </div>

            {/* Con quién hablaste */}
            <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-widest text-primary/70">👤 ¿Con quién hablaste? *</label>
                <input type="text" value={form.contactName}
                    onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))}
                    placeholder="Ej: Don Carlos, María, el dueño..."
                    className="w-full bg-primary/5 border border-primary/20 rounded-2xl px-5 py-4 text-base font-medium focus:border-primary/50 outline-none transition-all placeholder:text-white/20" />
                <p className="text-white/20 text-[10px] ml-2">Para dirigirte bien en el seguimiento</p>
            </div>

            {/* Categoría */}
            <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/40">¿Tipo de negocio? *</label>
                <div className="grid grid-cols-2 gap-2">
                    {([
                        { value: "restaurante", label: "Restaurante", icon: Utensils },
                        { value: "medico", label: "Médico / Clínica", icon: Stethoscope },
                        { value: "salon_belleza", label: "Salón / Spa", icon: Scissors },
                        { value: "comercio", label: "Tienda / Comercio", icon: Briefcase },
                        { value: "tienda_ropa", label: "Ropa / Moda", icon: ShirtIcon },
                        { value: "ferreteria", label: "Ferretería", icon: Wrench },
                        { value: "farmacia", label: "Farmacia", icon: Pill },
                        { value: "hotel", label: "Hotel", icon: Building2 },
                        { value: "educacion", label: "Educación", icon: GraduationCap },
                        { value: "otro", label: "Otro", icon: HelpCircle },
                    ] as const).map(cat => {
                        const Icon = cat.icon;
                        const isSelected = form.businessCategory === cat.value;
                        return (
                            <button key={cat.value} onClick={() => onCategorySelect(cat.value)}
                                className={`flex items-center gap-3 p-3.5 rounded-2xl border font-bold text-sm text-left transition-all ${isSelected
                                    ? "bg-primary/20 border-primary/50 text-primary"
                                    : "bg-white/5 border-white/10 text-white/50 hover:border-white/20"}`}>
                                <Icon size={18} className="flex-shrink-0" />
                                <span className="leading-tight text-[13px]">{cat.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ★ FICHA ESTRATÉGICA — aparece al seleccionar categoría */}
            <AnimatePresence>
                {strategicCard && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden">
                        <div className="bg-yellow-500/10 border border-yellow-500/25 rounded-2xl overflow-hidden">
                            <button onClick={() => setShowCard(!showCard)}
                                className="w-full flex items-center gap-3 p-4 text-left">
                                <Lightbulb size={18} className="text-yellow-400 flex-shrink-0" />
                                <span className="flex-1 font-black text-[12px] uppercase tracking-widest text-yellow-400">💡 Tip antes de entrar</span>
                                <ChevronDown size={16} className={`text-yellow-400/50 transition-transform ${showCard ? "rotate-180" : ""}`} />
                            </button>
                            <AnimatePresence>
                                {showCard && (
                                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                                        <div className="px-4 pb-4 space-y-3">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-yellow-500/50 mb-1">💥 Su dolor probable</p>
                                                <p className="text-yellow-100/80 text-[13px] font-medium leading-snug">{strategicCard.painPoint}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-yellow-500/50 mb-1">🎯 Lo que captura su atención</p>
                                                <p className="text-yellow-100/80 text-[13px] font-medium leading-snug">{strategicCard.attentionGrabber}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-yellow-500/50 mb-1">⚡ Si objetan precio</p>
                                                <p className="text-yellow-100/80 text-[13px] font-medium leading-snug">{strategicCard.objectionResponse}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sector */}
            <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/40">Sector / Barrio (opcional)</label>
                <input type="text" value={form.sector}
                    onChange={e => setForm(f => ({ ...f, sector: e.target.value }))}
                    placeholder="Ej: Centro, La Pradera..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-base font-medium focus:border-primary/50 outline-none transition-all placeholder:text-white/20" />
            </div>
        </motion.div>
    );
}

function Step2({ form, setForm }: { form: VisitForm; setForm: React.Dispatch<React.SetStateAction<VisitForm>> }) {
    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-7">
            <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/40">¿Quién te atendió? *</label>
                <div className="grid grid-cols-3 gap-3">
                    {([
                        { value: "dueño", label: "Dueño", icon: "👑" },
                        { value: "encargado", label: "Encargado", icon: "🗂️" },
                        { value: "empleado", label: "Empleado", icon: "👤" },
                    ] as const).map(role => (
                        <button key={role.value} onClick={() => setForm(f => ({ ...f, contactRole: role.value }))}
                            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border font-bold text-sm transition-all ${form.contactRole === role.value
                                ? "bg-primary/20 border-primary/50 text-primary"
                                : "bg-white/5 border-white/10 text-white/50 hover:border-white/20"}`}>
                            <span className="text-2xl">{role.icon}</span>{role.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/40">¿Cómo resultó? *</label>
                <div className="space-y-3">
                    {([
                        { value: "no_interesado", label: "No le interesó", emoji: "❌", cls: "bg-red-500/20 border-red-500/50 text-red-400" },
                        { value: "seguimiento", label: "Debo dar seguimiento", emoji: "🔄", cls: "bg-yellow-500/20 border-yellow-500/50 text-yellow-400" },
                        { value: "cerrado", label: "¡Vendido! Cerré la venta", emoji: "✅", cls: "bg-green-500/20 border-green-500/50 text-green-400" },
                    ] as const).map(res => (
                        <button key={res.value} onClick={() => setForm(f => ({ ...f, result: res.value }))}
                            className={`w-full flex items-center gap-4 p-5 rounded-2xl border font-bold text-base text-left transition-all ${form.result === res.value ? res.cls : "bg-white/5 border-white/10 text-white/50 hover:border-white/20"}`}>
                            <span className="text-3xl">{res.emoji}</span>{res.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/40">¿Escaneó el QR de soporte? *</label>
                <div className="grid grid-cols-2 gap-3">
                    {([
                        { value: true, label: "Sí, me agregó", emoji: "📲", cls: "bg-green-500/20 border-green-500/50 text-green-400" },
                        { value: false, label: "No esta vez", emoji: "🚫", cls: "bg-white/10 border-white/20 text-white/60" },
                    ] as const).map(opt => (
                        <button key={String(opt.value)} onClick={() => setForm(f => ({ ...f, qrShared: opt.value }))}
                            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border font-bold text-sm transition-all ${form.qrShared === opt.value ? opt.cls : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"}`}>
                            <span className="text-2xl">{opt.emoji}</span>{opt.label}
                        </button>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

function Step3({ form, setForm, isRecording, setIsRecording }: {
    form: VisitForm; setForm: React.Dispatch<React.SetStateAction<VisitForm>>;
    isRecording: boolean; setIsRecording: (v: boolean) => void;
}) {
    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex gap-3">
                <AlertCircle size={18} className="text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-blue-300 text-[12px] font-medium leading-relaxed">
                    Opcional. Más detalles = mejor coaching para ti en el próximo intento.
                </p>
            </div>

            <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/40">¿Qué objeción pusieron?</label>
                <input type="text" value={form.mainObjection}
                    onChange={e => setForm(f => ({ ...f, mainObjection: e.target.value }))}
                    placeholder="Ej: Muy caro, no lo necesito, ya tengo..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-base font-medium focus:border-primary/50 outline-none transition-all placeholder:text-white/20" />
            </div>

            {form.result === "seguimiento" && (
                <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-widest text-yellow-500/70">
                        📅 ¿Cuándo dar seguimiento?
                        <span className="ml-2 text-yellow-500/40 normal-case font-normal">(la IA ajustará esto)</span>
                    </label>
                    <input type="date" value={form.followUpDate}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={e => setForm(f => ({ ...f, followUpDate: e.target.value }))}
                        className="w-full bg-white/5 border border-yellow-500/20 rounded-2xl px-5 py-4 text-base font-medium focus:border-yellow-500/50 outline-none transition-all text-white" />
                    <p className="text-white/20 text-[10px] ml-2">Default: mañana. La IA optimizará según el tipo de negocio.</p>
                </div>
            )}

            <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/40">¿Señal de servicio mayor? (web, análisis...)</label>
                <div className="grid grid-cols-2 gap-3">
                    {([
                        { value: true, label: "Sí, lo creo", emoji: "💎", cls: "bg-purple-500/20 border-purple-500/50 text-purple-400" },
                        { value: false, label: "No por ahora", emoji: "➖", cls: "bg-white/10 border-white/20 text-white/60" },
                    ] as const).map(opt => (
                        <button key={String(opt.value)} onClick={() => setForm(f => ({ ...f, highTicketSignal: opt.value }))}
                            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border font-bold text-sm transition-all ${form.highTicketSignal === opt.value ? opt.cls : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"}`}>
                            <span className="text-2xl">{opt.emoji}</span>{opt.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/40">🎙️ Nota de voz de debrief (máx. 2 min)</label>
                <button onClick={() => setIsRecording(!isRecording)}
                    className={`w-full flex items-center justify-center gap-3 py-5 rounded-2xl border font-black text-base uppercase tracking-widest transition-all ${isRecording ? "bg-red-500/20 border-red-500/50 text-red-400 animate-pulse" : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"}`}>
                    {isRecording ? <><MicOff size={22} /> Detener</> : <><Mic size={22} /> Grabar debrief</>}
                </button>
                {isRecording && <p className="text-red-400/60 text-[11px] text-center">Grabando... di qué capturó su atención y qué dolor funcionó.</p>}
                <p className="text-white/20 text-[10px] text-center">El admin lo analiza en backend. El vendedor no espera nada.</p>
            </div>
        </motion.div>
    );
}

// ────────────────────────────────────────────
// HISTORIAL
// ────────────────────────────────────────────
function HistorialSection({ history }: { history: VisitHistory[] }) {
    // Agrupar por día
    const grouped = history.reduce((acc, v) => {
        const day = new Date(v.date).toLocaleDateString("es-EC", { weekday: "long", day: "numeric", month: "long" });
        if (!acc[day]) acc[day] = [];
        acc[day].push(v);
        return acc;
    }, {} as Record<string, VisitHistory[]>);

    if (history.length === 0) {
        return (
            <div className="bg-[#0A1229] border border-white/5 rounded-[24px] p-10 text-center">
                <History size={36} className="mx-auto mb-3 text-white/20" />
                <p className="text-white/25 font-bold text-sm uppercase tracking-widest">Sin visitas en los últimos 7 días</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {Object.entries(grouped).map(([day, visits]) => (
                <div key={day}>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3 capitalize">{day}</p>
                    <div className="space-y-2">
                        {visits.map(v => {
                            const rc = RESULT_CONFIG[v.result];
                            const Cat = ([...([{ value: "restaurante", icon: Utensils }, { value: "medico", icon: Stethoscope }, { value: "salon_belleza", icon: Scissors }, { value: "comercio", icon: Briefcase }, { value: "farmacia", icon: Pill }, { value: "hotel", icon: Building2 }, { value: "otro", icon: HelpCircle }]) as any]).find((c: any) => c.value === v.category)?.icon || HelpCircle;
                            return (
                                <div key={v.id} className="bg-[#0A1229] border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:border-white/10 transition-all">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${rc.bg}`}>
                                        <span className="text-lg">{rc.emoji}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-black text-sm uppercase italic tracking-tight truncate">{v.businessName}</p>
                                        <p className="text-white/40 text-[11px] font-medium">
                                            {v.contactName && <span className="text-white/60">👤 {v.contactName} · </span>}
                                            {v.sector}
                                        </p>
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full border flex-shrink-0 ${rc.bg} ${rc.color} border-current/20`}>
                                        {rc.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}

// ────────────────────────────────────────────
// TARJETA DE SEGUIMIENTO
// ────────────────────────────────────────────
function FollowUpCard({ followUp, onAction }: {
    followUp: FollowUp;
    onAction: (id: number, action: "completado" | "descartado") => void;
}) {
    const [showMsg, setShowMsg] = useState(false);
    const [copied, setCopied] = useState(false);

    return (
        <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="bg-[#0A1229] border border-yellow-500/20 rounded-[24px] p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                    <p className="font-black text-base uppercase italic tracking-tighter">{followUp.businessName}</p>
                    {followUp.contactName && (
                        <p className="text-primary/70 text-[11px] font-bold mt-0.5">👤 {followUp.contactName}</p>
                    )}
                    {followUp.objection && (
                        <p className="text-white/40 text-[11px] mt-1 font-medium">💬 &ldquo;{followUp.objection}&rdquo;</p>
                    )}
                </div>
                <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full whitespace-nowrap">
                    <Clock size={10} className="inline mr-1" />Hoy
                </span>
            </div>

            <button onClick={() => setShowMsg(!showMsg)}
                className="w-full flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-400 font-bold text-[12px] text-left hover:bg-green-500/15 transition-all">
                <MessageSquare size={16} className="flex-shrink-0" />
                <span className="flex-1">Mensaje WhatsApp sugerido</span>
                <ChevronDown size={14} className={`transition-transform ${showMsg ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
                {showMsg && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <div className="bg-white/5 rounded-2xl p-4 space-y-3">
                            <p className="text-white/70 text-[12px] font-medium leading-relaxed">{followUp.whatsappMessage}</p>
                            <button onClick={() => { navigator.clipboard.writeText(followUp.whatsappMessage); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                                className={`w-full py-3 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${copied ? "bg-green-500/20 text-green-400" : "bg-green-500 text-white hover:bg-green-600"}`}>
                                {copied ? "✓ Copiado" : "📋 Copiar mensaje"}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-2 gap-3">
                <button onClick={() => onAction(followUp.id, "completado")}
                    className="flex items-center justify-center gap-2 py-3 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-400 font-black text-[11px] uppercase tracking-widest hover:bg-green-500/20 transition-all">
                    <CheckCircle size={16} /> Hecho
                </button>
                <button onClick={() => onAction(followUp.id, "descartado")}
                    className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-2xl text-white/30 font-black text-[11px] uppercase tracking-widest hover:bg-white/10 transition-all">
                    <X size={16} /> Descartar
                </button>
            </div>
        </motion.div>
    );
}
