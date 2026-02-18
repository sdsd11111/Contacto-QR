"use client";

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
    ChevronDown
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Link from "next/link";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function SellerDashboard() {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [seller, setSeller] = useState<any>(null);
    const [registros, setRegistros] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPass, setLoginPass] = useState("");
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    useEffect(() => {
        const savedSeller = localStorage.getItem("vcard_seller_data");
        if (savedSeller) {
            const data = JSON.parse(savedSeller);
            setSeller(data);
            setIsAuthorized(true);
            fetchSellerSales(data.id);
        }
    }, []);

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
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Contraseña</label>
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

    return (
        <div className="min-h-screen bg-[#050B1C] text-white p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-primary/20 text-primary text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-primary/20">Vendedor Oficial</span>
                        </div>
                        <h1 className="text-4xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                            Hola, {seller?.nombre.split(' ')[0]}!
                        </h1>
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">Este es tu resumen de ventas y comisiones</p>
                    </div>

                    <div className="flex gap-4">
                        <Link
                            href="/"
                            onClick={() => {
                                // Ensure attribution is set when going home
                                localStorage.setItem("vcard_attribution_id", seller.id);
                            }}
                            className="bg-white/5 border border-white/10 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2 shadow-xl"
                        >
                            <Home size={18} /> Ir a Inicio
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="bg-[#FF3E3E] px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-500/20 cursor-pointer hover:scale-105 transition-all text-white flex items-center gap-2"
                        >
                            <LogOut size={18} /> Salir
                        </button>
                    </div>
                </header>

                {/* Barra de Progreso y Motivación */}
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
                                    <th className="px-8 py-6">Estado / Venta</th>
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
                                                <span className={cn(
                                                    "inline-block px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                                                    r.commission_status === 'paid'
                                                        ? "bg-green-500/10 text-green-500 border-green-500/20"
                                                        : "bg-white/5 text-white/30 border-white/5"
                                                )}>
                                                    {r.commission_status === 'paid' ? 'Comisión Cobrada' : 'Pendiente Cobro'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
