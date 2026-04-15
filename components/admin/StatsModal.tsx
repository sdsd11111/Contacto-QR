'use client';

import { useState, useEffect } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line
} from 'recharts';
import {
    Users,
    Eye,
    TrendingUp,
    X,
    Loader2,
    Globe,
    Smartphone,
    MousePointer2
} from 'lucide-react';

interface StatsData {
    realtime: {
        activeUsers: number;
    };
    summary: {
        activeUsers: number;
        sessions: number;
        pageViews: number;
    };
    daily: Array<{
        date: string;
        activeUsers: number;
        sessions: number;
        pageViews: number;
    }>;
}

export default function StatsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [data, setData] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchStats();
        }
    }, [isOpen]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/stats');
            if (!res.ok) throw new Error('Error al obtener estadísticas');
            const json = await res.json();
            setData(json);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-navy to-navy-light text-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-xl">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Estadísticas de ActivaQR</h2>
                            <p className="text-navy-light/60 text-sm">Rendimiento de los últimos 7 días</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-cream/30">
                    {loading ? (
                        <div className="h-96 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="w-12 h-12 text-navy animate-spin" />
                            <p className="text-navy/60 font-medium">Consultando Google Analytics...</p>
                        </div>
                    ) : error ? (
                        <div className="h-96 flex flex-col items-center justify-center text-red-500 gap-4">
                            <p className="font-bold">¡Uy! Algo salió mal</p>
                            <p className="text-sm border border-red-100 bg-red-50 p-4 rounded-xl">{error}</p>
                            <button onClick={fetchStats} className="px-6 py-2 bg-navy text-white rounded-full">Reintentar</button>
                        </div>
                    ) : data ? (
                        <>
                            {/* Top Metrics Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <MetricCard
                                    title="Activos Ahora"
                                    value={data.realtime.activeUsers}
                                    sub="Últimos 30 min"
                                    icon={<Users className="w-5 h-5 text-green-500" />}
                                    highlight
                                />
                                <MetricCard
                                    title="Usuarios (7d)"
                                    value={data.summary.activeUsers}
                                    sub="Visitantes únicos"
                                    icon={<Users className="w-5 h-5 text-blue-500" />}
                                />
                                <MetricCard
                                    title="Sesiones (7d)"
                                    value={data.summary.sessions}
                                    sub="Total visitas"
                                    icon={<MousePointer2 className="w-5 h-5 text-purple-500" />}
                                />
                                <MetricCard
                                    title="Vistas (7d)"
                                    value={data.summary.pageViews}
                                    sub="Total páginas"
                                    icon={<Eye className="w-5 h-5 text-orange-500" />}
                                />
                            </div>

                            {/* Chart Section */}
                            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                                <h3 className="text-lg font-bold text-navy mb-6">Tráfico Diario</h3>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data.daily}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                            <XAxis
                                                dataKey="date"
                                                tickFormatter={(val: any) => {
                                                    if (typeof val !== 'string') return val;
                                                    const year = val.substring(0, 4);
                                                    const month = val.substring(4, 6);
                                                    const day = val.substring(6, 8);
                                                    return `${day}/${month}`;
                                                }}
                                                tick={{ fontSize: 12, fill: '#666' }}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 12, fill: '#666' }}
                                            />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                labelFormatter={(val: any) => {
                                                    if (typeof val !== 'string') return val;
                                                    return `Fecha: ${val.substring(6, 8)}/${val.substring(4, 6)}/${val.substring(0, 4)}`;
                                                }}
                                            />
                                            <Bar dataKey="activeUsers" name="Usuarios" fill="#002B49" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Extras Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Globe className="w-5 h-5 text-navy" />
                                        <h3 className="font-bold text-navy">Origen del Tráfico</h3>
                                    </div>
                                    <p className="text-sm text-gray-500">Google Analytics detectando actividad...</p>
                                    {/* Aquí podríamos meter más detalle si GA4 nos da dimensiones geográficas */}
                                </div>
                                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Smartphone className="w-5 h-5 text-navy" />
                                        <h3 className="font-bold text-navy">Dispositivos</h3>
                                    </div>
                                    <p className="text-sm text-gray-500">Optimizando visualización de datos...</p>
                                </div>
                            </div>
                        </>
                    ) : null}
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 text-center text-xs text-gray-400">
                    Datos proporcionados por Google Analytics 4 API en tiempo real
                </div>
            </div>
        </div>
    );
}

function MetricCard({ title, value, sub, icon, highlight = false }: any) {
    return (
        <div className={`p-4 rounded-2xl border ${highlight ? 'bg-navy/5 border-navy/10' : 'bg-white border-gray-100'} shadow-sm flex flex-col gap-2`}>
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</span>
                {icon}
            </div>
            <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-navy">{value}</span>
            </div>
            <span className="text-[10px] text-gray-400">{sub}</span>
        </div>
    );
}
