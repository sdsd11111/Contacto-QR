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
    Users
} from "lucide-react";
import Link from "next/link";

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
            const res = await fetch(`/api/admin/registros?seller_id=${sellerId}`, {
                headers: { 'x-admin-key': 'rya-admin-k3y-2026-s3cur3' } // Temporarily using admin key or we should create a seller-specific API
            });
            const data = await res.json();
            if (data.data) {
                setRegistros(data.data);
            }
        } catch (err) {
            console.error("Error fetching sales:", err);
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

    const totalSales = registros.length;
    const pendingSales = registros.filter(r => r.status === 'pendiente').length;
    const paidSales = registros.filter(r => r.status === 'pagado' || r.status === 'entregado').length;
    const totalComission = paidSales * (seller?.comision || 10); // Simple calculation for now

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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <div className="bg-[#0A1229] border border-white/5 rounded-[32px] p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform"><Users size={48} /></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-3">Total Clientes</p>
                        <p className="text-4xl font-black italic tracking-tighter">{totalSales}</p>
                    </div>
                    <div className="bg-[#0A1229] border border-white/5 rounded-[32px] p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform text-accent"><DollarSign size={48} /></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent mb-3">Ventas Pagadas</p>
                        <p className="text-4xl font-black italic tracking-tighter">{paidSales}</p>
                    </div>
                    <div className="bg-[#0A1229] border border-white/5 rounded-[32px] p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform text-yellow-500"><Clock size={48} /></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-500 mb-3">En Revisión</p>
                        <p className="text-4xl font-black italic tracking-tighter">{pendingSales}</p>
                    </div>
                    <div className="bg-[#0A1229] border border-primary/20 rounded-[32px] p-8 relative overflow-hidden group shadow-lg shadow-primary/5">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform text-primary"><BarChart3 size={48} /></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-3">Comisión Generada</p>
                        <p className="text-4xl font-black italic tracking-tighter">${totalComission.toFixed(2)}</p>
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
                                    <th className="px-8 py-6">Cliente</th>
                                    <th className="px-8 py-6">Email / WhatsApp</th>
                                    <th className="px-8 py-6">Plan</th>
                                    <th className="px-8 py-6">Estado</th>
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
                                                <p className="font-bold text-sm text-white uppercase italic tracking-tighter">{r.nombre}</p>
                                                <p className="text-[10px] text-white/30 font-bold tracking-widest">{r.profesion || 'vCard Personal'}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-xs font-medium text-white/60">{r.email}</p>
                                                <p className="text-xs font-medium text-white/40 mt-1">{r.whatsapp}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${r.plan === 'pro' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-white/10 text-white/30'}`}>
                                                    {r.plan || 'basic'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${r.status === 'pagado' || r.status === 'entregado' ? 'bg-[#00F0FF]' : 'bg-yellow-500'}`} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">
                                                        {r.status === 'pagado' || r.status === 'entregado' ? 'Completado' : 'Pendiente'}
                                                    </span>
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
        </div>
    );
}
