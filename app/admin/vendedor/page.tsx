"use client";

import RecorridoTab from "@/components/vendedor/RecorridoTab";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    LogOut,
    User,
    BarChart3,
    Clock,
    CheckCircle,
    Home,
    Search,
    RefreshCw,
    ShieldCheck,
    DollarSign,
    Users,
    ChevronDown,
    Trash2,
    Info,
    ChevronRight,
    X,
    Settings,
    HelpCircle
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Link from "next/link";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function SellerDashboard() {
    // TODO: Restaurar autenticación mañana al integrar BD
    const MOCK_SELLER = { id: 1, nombre: "Abel", email: "abel@activaqr.com", role: "seller", comision: 30, codigo: "001" };
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [activeTab, setActiveTab] = useState<"ventas" | "recorrido">("recorrido");
    const [seller, setSeller] = useState<any>(null); // Inicia como null para forzar login real
    const [registros, setRegistros] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPass, setLoginPass] = useState("");
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    // Recuperar Contraseña
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [isSendingForgot, setIsSendingForgot] = useState(false);

    // Profile State
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [profilePass, setProfilePass] = useState("");
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

    // Team State
    const [team, setTeam] = useState<any[]>([]);
    const [showTeamModal, setShowTeamModal] = useState(false);
    const [isCreatingMember, setIsCreatingMember] = useState(false);
    const [newMember, setNewMember] = useState({ nombre: '', email: '', password: '' });

    useEffect(() => {
        const savedSeller = localStorage.getItem("vcard_seller_data");
        if (savedSeller) {
            const data = JSON.parse(savedSeller);
            setSeller(data);
            setIsAuthorized(true);
            fetchSellerSales(data.id);
            fetchTeam(data.id);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchTeam = async (parentId: number) => {
        try {
            const res = await fetch(`/api/seller/team?parent_id=${parentId}`);
            const data = await res.json();
            if (data.data) setTeam(data.data);
        } catch (err) {
            console.error("Error fetching team:", err);
        }
    };

    const handleCreateMember = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreatingMember(true);
        try {
            const res = await fetch("/api/seller/team", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...newMember, parent_id: seller.id })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                alert("Miembro agregado con éxito. Su código es: " + data.data.codigo);
                setNewMember({ nombre: '', email: '', password: '' });
                fetchTeam(seller.id);
                setShowTeamModal(false);
            } else {
                alert(data.error || "Error al crear miembro");
            }
        } catch (err) {
            alert("Error de conexión");
        }
        setIsCreatingMember(false);
    };

    const handleConfirmPayment = async (registroId: number) => {
        if (!confirm("¿Confirmas que has recibido el pago total de tu comisión por esta venta?")) return;

        try {
            const res = await fetch("/api/seller/confirm-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ registroId, sellerId: seller.id })
            });

            const data = await res.json();
            if (res.ok) {
                alert(data.message);
                fetchSellerSales(seller.id);
            } else {
                alert("Error: " + data.error);
            }
        } catch (err: any) {
            alert("Error: " + err.message);
        }
    };

    const handleDeleteMember = async (memberId: number) => {
        if (!confirm("¿Estás seguro de que deseas desactivar a este asesor? Ya no podrá acceder a su panel ni registrar ventas.")) return;

        try {
            const res = await fetch(`/api/seller/team?id=${memberId}&parent_id=${seller.id}`, {
                method: "DELETE"
            });
            const data = await res.json();
            if (res.ok && data.success) {
                fetchTeam(seller.id);
            } else {
                alert(data.error || "Error al eliminar miembro");
            }
        } catch (err) {
            alert("Error de conexión");
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdatingProfile(true);
        try {
            const res = await fetch("/api/seller/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: seller.id, password: profilePass })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                alert("Perfil actualizado correctamente");
                setShowProfileModal(false);
                // Update local storage and state optionally if we return updated seller 
            } else {
                alert(data.error || "Error al actualizar perfil");
            }
        } catch (err) {
            alert("Error de conexión");
        }
        setIsUpdatingProfile(false);
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSendingForgot(true);
        try {
            const res = await fetch("/api/auth/seller/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: forgotEmail })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                alert("Si tu correo está registrado, te hemos enviado tu contraseña actual por email.");
                setShowForgotPassword(false);
                setForgotEmail("");
            } else {
                alert(data.error || "Ocurrió un error al enviar el correo.");
            }
        } catch (err) {
            alert("Error de conexión");
        }
        setIsSendingForgot(false);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoggingIn(true);
        try {
            const res = await fetch("/api/auth/seller/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: loginEmail, password: loginPass })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                localStorage.setItem("vcard_seller_data", JSON.stringify(data.seller));
                // Set attribution cookie/storage for the redirect to home
                localStorage.setItem("vcard_attribution_id", data.seller.id);
                setSeller(data.seller);
                setIsAuthorized(true);
                fetchSellerSales(data.seller.id);
            } else {
                alert(data.error || "Error al iniciar sesión");
            }
        } catch (err) {
            alert("Error de conexión");
        }
        setIsLoggingIn(false);
    };

    const handleLogout = () => {
        localStorage.removeItem("vcard_seller_data");
        // We keep attribution id even after logout if they want to keep tracking? 
        // Or remove it? Usually SAS keep it.
        setIsAuthorized(false);
        setSeller(null);
    };

    const fetchSellerSales = async (sellerId: number) => {
        setLoading(true);
        try {
            // We need an API that returns ONLY the sales for THIS seller
            const res = await fetch(`/api/admin/registros?seller_id=${sellerId}`);
            // The API should handle seller-level authorization or use a public-safe seller endpoint
            const data = await res.json();
            if (data.data) {
                // Mostramos todo para que el vendedor vea su "pipeline"
                // Pero los totales solo cuentan lo confirmado
                setRegistros(data.data);
            }
        } catch (err) {
            console.error("SellerDashboard: Error fetching sales:", err);
        }
        setLoading(false);
    };

    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-[#050B1C] flex items-center justify-center p-6 font-sans">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-[#0A1229] border border-white/10 rounded-[40px] p-12 text-center shadow-2xl"
                >
                    <div className="w-20 h-20 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(255,107,0,0.2)]">
                        <ShieldCheck size={40} />
                    </div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white mb-2">Panel de Vendedores</h2>
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-10">Ingresa tus credenciales para gestionar tus ventas</p>

                    {showForgotPassword ? (
                        <form onSubmit={handleForgotPassword} className="space-y-6">
                            <p className="text-[10px] text-white/50 leading-relaxed mb-6 font-bold uppercase tracking-widest text-left">
                                Ingresa el correo electrónico asociado a tu cuenta. Te enviaremos tus credenciales de acceso.
                            </p>
                            <div className="space-y-2 text-left">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Correo Electrónico</label>
                                <input
                                    type="email"
                                    placeholder="tu@email.com"
                                    value={forgotEmail}
                                    onChange={(e) => setForgotEmail(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-primary/40 text-white font-bold transition-all"
                                    required
                                />
                            </div>
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isSendingForgot || !forgotEmail}
                                    className="w-full bg-white/10 hover:bg-white/20 py-4 rounded-xl font-black uppercase tracking-widest text-white transition-all shadow-lg active:scale-95 disabled:opacity-50 text-xs mb-4"
                                >
                                    {isSendingForgot ? "Enviando..." : "Enviar Credenciales"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForgotPassword(false)}
                                    className="w-full text-white/40 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest"
                                >
                                    Volver al Login
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2 text-left">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Correo Electrónico</label>
                                <input
                                    type="email"
                                    placeholder="tu@email.com"
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-primary/40 text-white font-bold transition-all"
                                    required
                                />
                            </div>
                            <div className="space-y-2 text-left">
                                <div className="flex justify-between items-center px-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Contraseña</label>
                                    <button
                                        type="button"
                                        onClick={() => setShowForgotPassword(true)}
                                        className="text-[9px] text-primary hover:text-white uppercase tracking-widest font-black transition-colors"
                                    >
                                        ¿Olvidaste tu clave?
                                    </button>
                                </div>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={loginPass}
                                    onChange={(e) => setLoginPass(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-primary/40 text-white font-bold transition-all"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoggingIn}
                                className="w-full bg-primary hover:bg-[#FF8A33] py-5 rounded-2xl font-black uppercase tracking-widest shadow-[0_10px_25px_rgba(255,107,0,0.3)] text-[#050B1C] transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                            >
                                {isLoggingIn ? "Validando..." : "Entrar a mi Panel"}
                                {!isLoggingIn && <LayoutDashboard className="group-hover:translate-x-1 transition-transform" size={20} />}
                            </button>
                        </form>
                    )}

                    <div className="mt-8 pt-8 border-t border-white/5">
                        <Link href="/" className="text-white/30 hover:text-white font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                            <Home size={14} /> Volver al Inicio
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    const totalSales = registros.filter(r => r.status !== 'cancelado').length;
    const pendingSales = registros.filter(r => r.status === 'pendiente').length;
    const paidSales = registros.filter(r => r.status === 'pagado' || r.status === 'entregado').length;

    // Lógica de Comisiones Dinámicas
    const getCommissionTier = (salesCount: number) => {
        if (salesCount >= 200) return { percentage: 50, nextTier: null, goal: 200, currentTierMin: 200 };
        if (salesCount >= 100) return { percentage: 40, nextTier: 200, goal: 100, currentTierMin: 100 };
        return { percentage: 30, nextTier: 100, goal: 0, currentTierMin: 0 };
    };

    const tier = getCommissionTier(paidSales);
    const currentPercentage = tier.percentage;

    // Comisiones Pagadas (según lo marcado por el admin)
    const paidCommissions = registros.reduce((acc, r) => {
        if ((r.status === 'pagado' || r.status === 'entregado') && r.commission_status === 'paid') {
            const price = r.plan === 'pro' ? 20 : 10;
            return acc + (price * (currentPercentage / 100));
        }
        return acc;
    }, 0);

    // Pendiente de Cobro
    const pendingCommissions = registros.reduce((acc, r) => {
        if ((r.status === 'pagado' || r.status === 'entregado') && r.commission_status !== 'paid') {
            const price = r.plan === 'pro' ? 20 : 10;
            return acc + (price * (currentPercentage / 100));
        }
        return acc;
    }, 0);

    // Valor Total Histórico
    const totalCommission = paidCommissions + pendingCommissions;
    // Rol del seller: sub-vendedor tiene parent_id, líder no
    const isSubSeller = !!(seller?.parent_id);

    // Soporte Centralizado (Número del Admin)
    const SUPPORT_NUMBER = "593962657270"; // César Reyes (Admin)
    const SUPPORT_URL = `https://wa.me/${SUPPORT_NUMBER}?text=${encodeURIComponent("Hola ActivaQR, necesito soporte técnico o tengo una sugerencia.")}`;

    return (
        <div className="min-h-screen bg-[#050B1C] text-white p-4 sm:p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-primary/20 text-primary text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-primary/20">
                                {isSubSeller ? "Asesor de Ventas" : "Vendedor Oficial"}
                            </span>
                        </div>
                        <h1 className="text-4xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                            Hola, {seller?.nombre.split(' ')[0]}!
                        </h1>
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">Este es tu resumen de ventas y comisiones</p>
                    </div>

                    <div className="flex gap-4">
                        <Link href="/"
                            onClick={() => localStorage.setItem("vcard_attribution_id", seller.id)}
                            className="bg-white/5 border border-white/10 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2 shadow-xl"
                        >
                            <Home size={18} /> Ir a Inicio
                        </Link>
                        {/* Gestionar Equipo: solo el líder lo ve */}
                        {!isSubSeller && (
                            <button onClick={() => setShowTeamModal(true)}
                                className="bg-primary/20 text-primary border border-primary/20 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary/30 transition-all flex items-center gap-2 shadow-xl"
                            >
                                <Users size={18} /> Gestionar Equipo
                            </button>
                        )}
                        <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer"
                            className="bg-green-500/10 text-green-500 border border-green-500/20 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-500/20 transition-all flex items-center gap-2 shadow-xl"
                        >
                            <HelpCircle size={18} /> Soporte
                        </a>
                        <button onClick={handleLogout}
                            className="bg-[#FF3E3E] px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-500/20 cursor-pointer hover:scale-105 transition-all text-white flex items-center gap-2"
                        >
                            <LogOut size={18} /> Salir
                        </button>
                    </div>
                </header>

                {/* ── TABS DE NAVEGACIÓN ── */}
                <div className="flex gap-2 mb-10 bg-white/5 rounded-2xl p-1.5 border border-white/10">
                    <button
                        onClick={() => setActiveTab("recorrido")}
                        className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === "recorrido"
                            ? "bg-primary text-[#050B1C] shadow-lg shadow-primary/30"
                            : "text-white/40 hover:text-white/70"
                            }`}
                    >
                        🗺️ Mi Recorrido
                    </button>
                    <button
                        onClick={() => setActiveTab("ventas")}
                        className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === "ventas"
                            ? "bg-white/15 text-white shadow"
                            : "text-white/40 hover:text-white/70"
                            }`}
                    >
                        💰 Mis Ventas
                    </button>
                </div>

                {/* ── CONTENIDO DEL TAB RECORRIDO ── */}
                {activeTab === "recorrido" && (
                    <RecorridoTab seller={seller} />
                )}

                {/* ── MENSAJE DE GARANTÍA ACTIVAQR ── */}
                {activeTab === "ventas" && (
                    <div className="mb-8 p-6 bg-brand/10 border border-brand/20 rounded-3xl flex items-center gap-4">
                        <ShieldCheck className="text-brand shrink-0" size={24} />
                        <p className="text-sm font-bold text-brand/90 leading-tight">
                            Tu pago está respaldado por la administración de <span className="uppercase">ActivaQR</span>.
                            Si tu comisión figura como <span className="italic">"Enviada a Líder"</span> pero no la recibes en 24h, usa el botón de Soporte para avisarnos.
                        </p>
                    </div>
                )}

                {activeTab === "ventas" && (
                    <div>

                        {/* Barra de Progreso y Motivación - Solo para Líderes (Vendedor Oficial) */}
                        {!isSubSeller ? (
                            <div className="mb-12 bg-[#0A1229] border border-primary/20 rounded-[40px] p-10 relative overflow-hidden shadow-2xl">
                                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                                    <DollarSign size={120} className="text-primary" />
                                </div>

                                <div className="relative z-10">
                                    <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
                                        <div>
                                            <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white mb-2">Tu Nivel de Comisión: <span className="text-primary">{currentPercentage}%</span></h2>
                                            <p className="text-white/40 text-[11px] font-black uppercase tracking-widest">
                                                {tier.nextTier
                                                    ? `¡Estás a ${tier.nextTier - paidSales} ventas de subir al ${currentPercentage + 10}%!`
                                                    : "¡HAS ALCANZADO EL NIVEL MÁXIMO DE COMISIÓN! 🚀"}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-white/20 text-[10px] font-black uppercase tracking-widest mb-1">Ventas Confirmadas</p>
                                            <p className="text-3xl font-black italic tracking-tighter text-white">{paidSales} / {tier.nextTier || '∞'}</p>
                                        </div>
                                    </div>

                                    {/* Barra de progreso */}
                                    <div className="h-6 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-1">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${tier.nextTier ? Math.min(100, ((paidSales - tier.currentTierMin) / (tier.nextTier - tier.currentTierMin)) * 100) : 100}%` }}
                                            className="h-full bg-gradient-to-r from-primary to-[#FF8A33] rounded-full shadow-[0_0_20px_rgba(255,107,0,0.4)]"
                                        />
                                    </div>

                                    <div className="flex justify-between mt-4 text-[10px] font-black uppercase tracking-widest">
                                        <span className={cn(paidSales >= 0 ? "text-primary" : "text-white/20")}>Nivel 1 (30%)</span>
                                        <span className={cn(paidSales >= 100 ? "text-primary" : "text-white/20")}>Nivel 2 (40%)</span>
                                        <span className={cn(paidSales >= 200 ? "text-primary" : "text-white/20")}>Nivel Pro (50%)</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="mb-12 bg-[#0A1229] border border-white/5 rounded-[40px] p-8 flex flex-col md:flex-row items-center gap-6 shadow-2xl">
                                <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center text-primary">
                                    <DollarSign size={40} />
                                </div>
                                <div className="text-center md:text-left flex-1">
                                    <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-1">Tu Comisión Fija: <span className="text-primary">30%</span></h2>
                                    <p className="text-white/40 text-[11px] font-black uppercase tracking-widest">Por cada venta confirmada recibes el 30% del valor del plan.</p>
                                </div>
                                <div className="bg-white/5 px-6 py-4 rounded-2xl border border-white/10">
                                    <p className="text-white/20 text-[10px] font-black uppercase tracking-widest mb-1">Puesto</p>
                                    <p className="text-lg font-black italic tracking-tighter text-white">Asesor de Ventas</p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
                            <div className="bg-[#0A1229] border border-white/5 rounded-[32px] p-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform"><Users size={48} /></div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-3">Total Clientes</p>
                                <p className="text-4xl font-black italic tracking-tighter">{totalSales}</p>
                            </div>
                            <div className="bg-[#0A1229] border border-white/5 rounded-[32px] p-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform text-yellow-500"><Clock size={48} /></div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-500 mb-3">Ventas Pendientes</p>
                                <p className="text-4xl font-black italic tracking-tighter text-yellow-500">{pendingSales}</p>
                            </div>
                            <div className="bg-[#0A1229] border border-white/5 rounded-[32px] p-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform text-accent"><DollarSign size={48} /></div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent mb-3">Ventas Confirmadas</p>
                                <p className="text-4xl font-black italic tracking-tighter text-accent">{paidSales}</p>
                            </div>
                            <div className="bg-[#0A1229] border border-white/5 rounded-[32px] p-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform text-green-500"><CheckCircle size={48} /></div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-500 mb-3">Ya Cobrado</p>
                                <p className="text-4xl font-black italic tracking-tighter text-green-500">${paidCommissions.toFixed(2)}</p>
                            </div>
                            <div className="bg-[#0A1229] border border-primary/20 rounded-[32px] p-8 relative overflow-hidden group shadow-lg shadow-primary/5">
                                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform text-primary"><BarChart3 size={48} /></div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-3">Pendiente de Cobro</p>
                                <p className="text-4xl font-black italic tracking-tighter text-primary">${pendingCommissions.toFixed(2)}</p>
                            </div>
                        </div>

                        <div className="bg-[#0A1229] border border-white/10 rounded-[40px] overflow-hidden shadow-2xl">
                            <div className="p-8 border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 bg-white/[0.02]">
                                <h3 className="text-xl font-black uppercase italic tracking-tighter">Mis Registros Recientes</h3>
                                <button onClick={() => fetchSellerSales(seller.id)} className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
                                    <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-[10px] font-black uppercase tracking-widest text-white/30 bg-white/[0.01]">
                                            <th className="px-8 py-6">Fecha</th>
                                            <th className="px-8 py-6">Cliente / Plan</th>
                                            <th className="px-8 py-6">Contacto</th>
                                            <th className="px-8 py-6">Vendedor</th>
                                            <th className="px-8 py-6 px-8 py-6">Estado / Venta</th>
                                            <th className="px-8 py-6 text-right">Pago / Comisión</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {registros.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-8 py-20 text-center">
                                                    <div className="max-w-xs mx-auto opacity-20">
                                                        <Users size={48} className="mx-auto mb-4" />
                                                        <p className="text-sm font-bold uppercase tracking-widest">Aún no tienes registros</p>
                                                        <p className="text-[10px] mt-2">¡Comienza a compartir tu enlace para ver tus ventas aquí!</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            registros.map((r) => (
                                                <tr key={r.id} className="hover:bg-white/[0.01] transition-all">
                                                    <td className="px-8 py-6">
                                                        <p className="text-xs font-bold text-white/40">{new Date(r.created_at).toLocaleDateString()}</p>
                                                        <p className="text-[10px] text-white/20 mt-1">{new Date(r.created_at).toLocaleTimeString()}</p>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex flex-col gap-1">
                                                            <p className="font-bold text-sm text-white uppercase italic tracking-tighter">{r.nombre}</p>
                                                            <span className={cn(
                                                                "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest w-fit",
                                                                r.plan === 'pro' ? "bg-primary/20 text-primary" : "bg-white/10 text-white/40"
                                                            )}>
                                                                Plan {r.plan || 'basic'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <p className="text-xs font-medium text-white/60">{r.email}</p>
                                                        <p className="text-[10px] text-white/40 mt-1">{r.whatsapp}</p>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex flex-col gap-1">
                                                            <p className="text-xs font-bold text-white/60 uppercase">
                                                                {r.sold_by_name ? (r.sold_by_name === seller.nombre ? "Tú" : r.sold_by_name.split(' ')[0]) : "Tú"}
                                                            </p>
                                                            <span className="text-[8px] font-black uppercase tracking-widest text-white/20">
                                                                {r.sold_by_code || seller.codigo}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-2">
                                                            <div className={cn(
                                                                "w-2 h-2 rounded-full",
                                                                (r.status === 'pagado' || r.status === 'entregado') ? "bg-[#00F0FF]" : r.status === 'cancelado' ? "bg-red-500" : "bg-yellow-500"
                                                            )} />
                                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                                                                {r.status === 'pagado' || r.status === 'entregado' ? 'Confirmado' : r.status === 'cancelado' ? 'Cancelado' : 'Pendiente Pago'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <div className="flex flex-col items-end gap-2">
                                                            <span className={cn(
                                                                "inline-block px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                                                                r.commission_status === 'completed'
                                                                    ? "bg-green-500/10 text-green-500 border-green-500/20"
                                                                    : r.commission_status === 'paid_to_leader'
                                                                        ? "bg-brand/10 text-brand border-brand/20"
                                                                        : "bg-white/5 text-white/30 border-white/5"
                                                            )}>
                                                                {r.commission_status === 'completed'
                                                                    ? 'Comisión Cobrada ✅'
                                                                    : r.commission_status === 'paid_to_leader'
                                                                        ? 'Enviada a Líder 🚚'
                                                                        : 'Pendiente Cobro'}
                                                            </span>

                                                            {/* Botón de Confirmación para Sub-vendedores */}
                                                            {r.commission_status === 'paid_to_leader' && (
                                                                <button
                                                                    onClick={() => handleConfirmPayment(r.id)}
                                                                    className="px-4 py-2 bg-brand text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-brand/20"
                                                                >
                                                                    Confirmar Recibo
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )} {/* Fin tab Mis Ventas */}

                {/* Modal de Gestión de Equipo */}
                <AnimatePresence>
                    {showTeamModal && (
                        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowTeamModal(false)}
                                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative w-full max-w-4xl bg-[#0A1229] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                            >
                                <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                                    <div>
                                        <h3 className="text-2xl font-black uppercase italic tracking-tighter">Mi Equipo de Trabajo</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-1">Gana comisión por las ventas de tus referidos</p>
                                    </div>
                                    <button
                                        onClick={() => setShowTeamModal(false)}
                                        className="p-3 hover:bg-white/10 rounded-full transition-all"
                                    >
                                        <LogOut className="rotate-180" size={24} />
                                    </button>
                                </div>

                                <div className="px-8 pt-8">
                                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 flex gap-4 items-start">
                                        <Info className="text-primary flex-shrink-0 mt-1" size={20} />
                                        <div>
                                            <h4 className="text-primary font-black uppercase italic tracking-widest text-xs mb-1">¿Cómo funciona mi equipo?</h4>
                                            <p className="text-white/60 text-[11px] leading-relaxed">
                                                Aquí puedes dar de alta a tus <strong>Sub-vendedores</strong>. La regla de oro es: <strong className="text-white">Ellos ganarán siempre un 30%</strong> por cada venta. La gran ventaja para ti es que <strong className="text-primary">TODAS sus ventas suman a tu volumen total</strong>, ayudándote a subir tu propio porcentaje de comisión global hasta el 50%.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-8 pt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Lista de Miembros */}
                                    <div className="space-y-6">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-4">Miembros Activos ({team.length})</h4>
                                        <div className="space-y-4">
                                            {team.length === 0 ? (
                                                <div className="text-center py-10 border border-dashed border-white/10 rounded-3xl">
                                                    <p className="text-sm font-bold text-white/20 uppercase tracking-widest">No hay miembros aún</p>
                                                </div>
                                            ) : (
                                                team.map((m: any) => (
                                                    <div key={m.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl flex justify-between items-center group hover:border-primary/20 transition-all">
                                                        <div>
                                                            <p className="font-bold text-sm uppercase italic tracking-tight">{m.nombre}</p>
                                                            <p className="text-[10px] text-white/40 mt-1 uppercase font-black tracking-widest">{m.code}</p>
                                                        </div>
                                                        <div className="text-right flex items-center gap-4">
                                                            <div>
                                                                <p className="text-[10px] font-black uppercase text-primary mb-1">{m.ventas_pagadas} Ventas</p>
                                                                <p className="text-[8px] text-white/20 uppercase">Total: {m.total_ventas}</p>
                                                            </div>
                                                            <button
                                                                onClick={() => handleDeleteMember(m.id)}
                                                                className="p-2 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                                title="Desactivar Asesor"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    {/* Formulario de Registro */}
                                    <div className="bg-white/[0.03] border border-white/10 p-8 rounded-3xl self-start">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2">Agregar Nuevo Miembro</h4>
                                        <p className="text-[9px] text-white/40 uppercase tracking-widest mb-6 border-b border-white/5 pb-4">
                                            Quedará registrado bajo tu código ({seller?.code})
                                        </p>
                                        <form onSubmit={handleCreateMember} className="space-y-4">
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-2">Nombre Completo</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={newMember.nombre}
                                                    onChange={(e) => setNewMember({ ...newMember, nombre: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm focus:border-primary/40 outline-none transition-all"
                                                    placeholder="Ej. Juan Pérez"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-2">Correo Electrónico</label>
                                                <input
                                                    type="email"
                                                    required
                                                    value={newMember.email}
                                                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm focus:border-primary/40 outline-none transition-all"
                                                    placeholder="juan@ejemplo.com"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-2">Contraseña Temporal</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={newMember.password}
                                                    onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm focus:border-primary/40 outline-none transition-all"
                                                    placeholder="Min. 6 caracteres"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={isCreatingMember}
                                                className="w-full bg-primary hover:bg-[#FF8A33] py-4 rounded-xl font-black uppercase tracking-widest text-[#050B1C] transition-all shadow-lg active:scale-95 disabled:opacity-50 text-xs mt-4"
                                            >
                                                {isCreatingMember ? 'Procesando...' : 'Crear Acceso ahora'}
                                            </button>
                                        </form>
                                        <p className="text-[9px] text-white/20 mt-6 leading-relaxed italic">
                                            * Al crear un miembro, se le generará un código derivado del tuyo. Sus ventas se sumarán a tu total de nivel, pero él podrá ver sus propios registros.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>{/* max-w-7xl */}

            {/* Modal de Mi Perfil */}
            <AnimatePresence>
                {showProfileModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowProfileModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-md bg-[#0A1229] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden"
                        >
                            <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                                <div>
                                    <h3 className="text-2xl font-black uppercase italic tracking-tighter">Mi Perfil</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-1">Gestión de Cuenta</p>
                                </div>
                                <button
                                    onClick={() => setShowProfileModal(false)}
                                    className="p-3 hover:bg-white/10 rounded-full transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleProfileUpdate} className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 mb-6 flex flex-col items-center">
                                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-3">
                                            <User size={24} />
                                        </div>
                                        <p className="font-black uppercase tracking-widest text-sm">{seller?.nombre}</p>
                                        <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">{seller?.email}</p>
                                        <div className="mt-3 bg-primary/20 text-primary text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest">
                                            Código: {seller?.code}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Actualizar Contraseña</label>
                                        <input
                                            type="text"
                                            minLength={4}
                                            value={profilePass}
                                            onChange={(e) => setProfilePass(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold focus:border-primary/40 outline-none transition-all"
                                            placeholder="Nueva contraseña (opcional)"
                                        />
                                        <p className="text-[9px] text-white/30 italic ml-2 mt-1">Déjalo en blanco si no quieres cambiarla</p>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isUpdatingProfile || !profilePass}
                                    className="w-full bg-primary hover:bg-[#FF8A33] text-[#050B1C] py-4 rounded-xl font-black uppercase tracking-widest shadow-[0_10px_25px_rgba(255,107,0,0.3)] transition-all flex justify-center items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isUpdatingProfile ? "Guardando..." : "Guardar Cambios"}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
