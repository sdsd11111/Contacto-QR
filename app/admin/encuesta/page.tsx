"use client";

import React, { useEffect, useState } from "react";
import {
    LayoutDashboard,
    BarChart3,
    Users,
    TrendingUp,
    ArrowLeft,
    Calendar,
    Search,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    MessageSquare,
    Lightbulb,
    Target,
    Copy,
    AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface SurveyResponse {
    id: string;
    created_at: string;
    p1: string;
    p2a: string | null;
    p2b: string | null;
    p3: string;
    p3_resp_custom: string | null;
    nombre_local: string | null;
    p4: string;
    p5: string;
    p6: string;
    total_score: number;
    color_semaforo: "rojo" | "amarillo" | "verde";
    user_metadata: any;
}

export default function AdminSurveyPage() {
    const [responses, setResponses] = useState<SurveyResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterColor, setFilterColor] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Query Builder State
    const [primaryQuestion, setPrimaryQuestion] = useState<string>("p3");
    const [secondaryQuestion, setSecondaryQuestion] = useState<string>("p4");

    useEffect(() => {
        fetchResponses();
    }, []);

    const fetchResponses = async () => {
        setLoading(true);
        try {
            const adminKey = localStorage.getItem('admin_access_key') || '';
            const response = await fetch('/api/survey/list', {
                headers: { 'x-admin-key': adminKey }
            });
            if (!response.ok) {
                const errData = await response.json();
                console.error('Survey API Error:', errData);
                alert(`Error cargando encuestas: ${errData.error || response.statusText}`);
                return;
            }
            const result = await response.json();
            if (result.data) setResponses(result.data);
        } catch (error: any) {
            console.error('Error fetching surveys:', error);
            alert(`Error de conexión: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        const headers = ["Fecha", "Nombre", "P1", "P2a", "P2b", "P3", "P4", "P5", "P6", "P7", "Score", "Color"];
        const csvRows = responses.map(r => [
            new Date(r.created_at).toLocaleDateString(),
            r.nombre_local || "Sin nombre",
            r.p1,
            r.p2a || "",
            r.p2b || "",
            r.p3,
            r.p4,
            r.p5,
            r.p6,
            r.user_metadata?.p7_bonus || "",
            r.total_score,
            r.color_semaforo
        ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));

        const csvContent = [headers.join(","), ...csvRows].join("\n");
        const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `diagnostico_visibilidad_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const stats = {
        total: responses.length,
        avgScore: responses.length > 0
            ? (responses.reduce((acc, r) => acc + r.total_score, 0) / responses.length).toFixed(1)
            : 0,
        distribution: {
            verde: responses.filter(r => r.color_semaforo === "verde").length,
            amarillo: responses.filter(r => r.color_semaforo === "amarillo").length,
            rojo: responses.filter(r => r.color_semaforo === "rojo").length,
        }
    };

    // === QUESTION CONFIG (Real Labels) ===
    const QUESTION_CONFIG: Record<string, { label: string; key: keyof SurveyResponse }> = {
        p1: { label: "P1: Forma de contacto", key: "p1" },
        p2a: { label: "P2A: Info adicional", key: "p2a" },
        p2b: { label: "P2B: Frustración", key: "p2b" },
        p3: { label: "P3: Cómo los guardan", key: "p3" },
        p4: { label: "P4: Ventas perdidas", key: "p4" },
        p5: { label: "P5: Clientes nuevos", key: "p5" },
        p6: { label: "P6: Inversión", key: "p6" },
        color_semaforo: { label: "Semáforo", key: "color_semaforo" }
    };

    // === DYNAMIC CROSS-TABULATION ===
    const calculateCrossTab = () => {
        const pKey = QUESTION_CONFIG[primaryQuestion]?.key || "p3";
        const sKey = QUESTION_CONFIG[secondaryQuestion]?.key || "p4";

        // Extract unique values from REAL data
        const primaryValues = [...new Set(responses.map(r => String(r[pKey] || "Sin respuesta")))];
        const secondaryValues = [...new Set(responses.map(r => String(r[sKey] || "Sin respuesta")))];

        // Build matrix
        const matrix = primaryValues.map(pVal => ({
            label: pVal,
            total: responses.filter(r => String(r[pKey]) === pVal).length,
            counts: secondaryValues.map(sVal =>
                responses.filter(r => String(r[pKey]) === pVal && String(r[sKey]) === sVal).length
            )
        }));

        return { primaryValues, secondaryValues, matrix };
    };

    const crossTab = calculateCrossTab();

    // Dynamic Insight Generator
    const generateInsight = () => {
        if (crossTab.matrix.length === 0) return "Sin datos para analizar.";

        // Find the most common combination
        let maxCount = 0;
        let maxPrimary = "";
        let maxSecondary = "";

        crossTab.matrix.forEach((row, pIdx) => {
            row.counts.forEach((count, sIdx) => {
                if (count > maxCount) {
                    maxCount = count;
                    maxPrimary = row.label;
                    maxSecondary = crossTab.secondaryValues[sIdx];
                }
            });
        });

        const percentage = responses.length > 0 ? Math.round((maxCount / responses.length) * 100) : 0;

        return `"El ${percentage}% de los encuestados respondieron '${maxPrimary}' en ${QUESTION_CONFIG[primaryQuestion]?.label} y '${maxSecondary}' en ${QUESTION_CONFIG[secondaryQuestion]?.label}."`;
    };

    const dynamicInsight = generateInsight();


    const filteredResponses = responses.filter(r => {
        const matchesColor = !filterColor || r.color_semaforo === filterColor;
        const name = (r.nombre_local || "").toLowerCase();
        const matchesSearch = name.includes(searchTerm.toLowerCase());
        return matchesColor && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
            {/* Sidebar Placeholder / Navigation */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            <LayoutDashboard className="w-6 h-6 text-primary" />
                            Admin Panel <span className="text-slate-400 font-normal">/ Survey Analytics</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-4 text-sm font-medium">
                        <span className="hidden md:inline text-slate-500">Sesión de César Reyes J.</span>
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            CR
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Respuestas"
                        value={stats.total}
                        icon={<Users className="w-6 h-6" />}
                        trend="+12%"
                        isPositive={true}
                    />
                    <StatCard
                        title="Score Promedio"
                        value={`${stats.avgScore}/20`}
                        icon={<BarChart3 className="w-6 h-6" />}
                        trend="En rango óptimo"
                    />
                    <StatCard
                        title="Crecimiento Crítico (V)"
                        value={stats.distribution.verde}
                        icon={<TrendingUp className="w-6 h-6" />}
                        color="text-emerald-600"
                        bg="bg-emerald-50"
                        trend="Alta intención"
                    />
                    <StatCard
                        title="Potenciales (A)"
                        value={stats.distribution.amarillo}
                        icon={<MessageSquare className="w-6 h-6" />}
                        color="text-amber-600"
                        bg="bg-amber-50"
                        trend="Follow-up req."
                    />
                </div>

                {/* === INTERACTIVE QUERY BUILDER === */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-primary/10 rounded-xl">
                            <BarChart3 className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-900">Generador de Insights</h3>
                            <p className="text-xs text-slate-500">Cruza cualquier pregunta para descubrir patrones</p>
                        </div>
                    </div>

                    {/* Question Selectors */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Pregunta Principal (Filas)</label>
                            <select
                                value={primaryQuestion}
                                onChange={(e) => setPrimaryQuestion(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            >
                                {Object.entries(QUESTION_CONFIG).map(([key, config]) => (
                                    <option key={key} value={key}>{config.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Cruzar Con (Columnas)</label>
                            <select
                                value={secondaryQuestion}
                                onChange={(e) => setSecondaryQuestion(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            >
                                {Object.entries(QUESTION_CONFIG).map(([key, config]) => (
                                    <option key={key} value={key}>{config.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Cross-Tabulation Matrix */}
                    <div className="overflow-x-auto mb-6">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50">
                                    <th className="p-3 text-left font-bold text-slate-600 rounded-tl-xl">
                                        {QUESTION_CONFIG[primaryQuestion]?.label} ↓
                                    </th>
                                    {crossTab.secondaryValues.map((sVal, idx) => (
                                        <th key={idx} className="p-3 text-center font-medium text-slate-600 whitespace-nowrap">
                                            {sVal || "—"}
                                        </th>
                                    ))}
                                    <th className="p-3 text-center font-bold text-slate-800 bg-slate-100 rounded-tr-xl">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {crossTab.matrix.map((row, rowIdx) => (
                                    <tr key={rowIdx} className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors">
                                        <td className="p-3 font-medium text-slate-700">{row.label || "—"}</td>
                                        {row.counts.map((count, colIdx) => {
                                            const intensity = count > 0 ? Math.min(count / Math.max(...row.counts) * 100, 100) : 0;
                                            return (
                                                <td key={colIdx} className="p-3 text-center">
                                                    <span
                                                        className="inline-block px-3 py-1 rounded-full font-bold text-xs"
                                                        style={{
                                                            backgroundColor: count > 0 ? `rgba(59, 130, 246, ${intensity / 100 * 0.3})` : 'transparent',
                                                            color: count > 0 ? '#1e40af' : '#94a3b8'
                                                        }}
                                                    >
                                                        {count}
                                                    </span>
                                                </td>
                                            );
                                        })}
                                        <td className="p-3 text-center font-bold text-slate-800 bg-slate-50">{row.total}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Dynamic Insight */}
                    <div className="bg-gradient-to-r from-primary/5 to-royal/5 border border-primary/20 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-slate-700 italic leading-relaxed">{dynamicInsight}</p>
                            </div>
                            <button
                                onClick={() => navigator.clipboard.writeText(dynamicInsight)}
                                className="px-4 py-2 bg-primary text-white rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-primary/90 transition-colors flex-shrink-0"
                            >
                                <Copy className="w-3 h-3" />
                                Copiar
                            </button>
                        </div>
                    </div>
                </div>


                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* List Table */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-2">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <Users className="w-5 h-5 text-slate-400" />
                                Respuestas ({filteredResponses.length})
                            </h2>
                            <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                                <button
                                    onClick={() => setFilterColor(null)}
                                    className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all", !filterColor ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-600")}
                                >
                                    Todos
                                </button>
                                <button
                                    onClick={() => setFilterColor("verde")}
                                    className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all", filterColor === "verde" ? "bg-emerald-100 text-emerald-700" : "text-slate-400 hover:text-emerald-600")}
                                >
                                    Verde
                                </button>
                                <button
                                    onClick={() => setFilterColor("amarillo")}
                                    className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all", filterColor === "amarillo" ? "bg-amber-100 text-amber-700" : "text-slate-400 hover:text-amber-600")}
                                >
                                    Amarillo
                                </button>
                                <button
                                    onClick={() => setFilterColor("rojo")}
                                    className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all", filterColor === "rojo" ? "bg-red-100 text-red-700" : "text-slate-400 hover:text-red-600")}
                                >
                                    Rojo
                                </button>
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                            <div className="p-4 border-b border-slate-100">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Buscar local / persona..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:border-primary/50 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
                                            <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider">Local / Persona</th>
                                            <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider">Perfil</th>
                                            <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider">Score</th>
                                            <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {loading ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                                    Cargando datos...
                                                </td>
                                            </tr>
                                        ) : filteredResponses.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                                    No hay respuestas que coincidan con el filtro.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredResponses.map((res) => (
                                                <tr key={res.id} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                                                        {new Date(res.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-primary">
                                                            {res.nombre_local || "Sin nombre"}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-semibold text-slate-900">
                                                            P3: {res.p3_resp_custom || res.p3}
                                                        </div>
                                                        <div className="text-xs text-slate-400 truncate max-w-[150px]">
                                                            Browser: {res.user_metadata?.userAgent?.split(' ')[0] || 'Unknown'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="font-mono font-bold text-lg">{res.total_score}</span>
                                                        <span className="text-slate-300 text-xs ml-1">/20</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <TrafficBadge color={res.color_semaforo} />
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Analytics Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                            <h3 className="font-bold flex items-center gap-2">
                                <Filter className="w-5 h-5 text-slate-400" />
                                Distribución Analítica
                            </h3>

                            {/* Simple SVG Donut Chart */}
                            <div className="flex justify-center py-4">
                                <div className="relative w-32 h-32">
                                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                                        {/* Background Circle */}
                                        <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-100" strokeWidth="4" />

                                        {/* Rojo Segment */}
                                        {responses.length > 0 && (
                                            <circle
                                                cx="18" cy="18" r="16" fill="none"
                                                stroke="currentColor"
                                                className="text-red-500 transition-all duration-1000"
                                                strokeWidth="4"
                                                strokeDasharray={`${(stats.distribution.rojo / stats.total) * 100} 100`}
                                            />
                                        )}

                                        {/* Amarillo Segment */}
                                        {responses.length > 0 && (
                                            <circle
                                                cx="18" cy="18" r="16" fill="none"
                                                stroke="currentColor"
                                                className="text-amber-500 transition-all duration-1000"
                                                strokeWidth="4"
                                                strokeDasharray={`${(stats.distribution.amarillo / stats.total) * 100} 100`}
                                                strokeDashoffset={`-${(stats.distribution.rojo / stats.total) * 100}`}
                                            />
                                        )}

                                        {/* Verde Segment */}
                                        {responses.length > 0 && (
                                            <circle
                                                cx="18" cy="18" r="16" fill="none"
                                                stroke="currentColor"
                                                className="text-emerald-500 transition-all duration-1000"
                                                strokeWidth="4"
                                                strokeDasharray={`${(stats.distribution.verde / stats.total) * 100} 100`}
                                                strokeDashoffset={`-${((stats.distribution.rojo + stats.distribution.amarillo) / stats.total) * 100}`}
                                            />
                                        )}
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-xl font-black">{stats.total}</span>
                                        <span className="text-[8px] font-black uppercase text-slate-400">Total</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <DistributionBar
                                    label="Crecimiento Crítico"
                                    count={stats.distribution.verde}
                                    total={stats.total}
                                    color="bg-emerald-500"
                                />
                                <DistributionBar
                                    label="Potencial"
                                    count={stats.distribution.amarillo}
                                    total={stats.total}
                                    color="bg-amber-500"
                                />
                                <DistributionBar
                                    label="Bajo Impacto"
                                    count={stats.distribution.rojo}
                                    total={stats.total}
                                    color="bg-red-500"
                                />
                            </div>
                        </div>

                        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 space-y-4">
                            <h3 className="font-bold text-primary flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" />
                                Insights del Analista
                            </h3>
                            <div className="text-sm text-slate-600 leading-relaxed space-y-2">
                                <p>
                                    El <span className="font-bold text-slate-900">{((stats.distribution.verde + stats.distribution.amarillo) / (stats.total || 1) * 100).toFixed(0)}%</span> de tus prospectos muestran una necesidad tangible.
                                </p>
                                <p className="text-xs bg-white/50 p-3 rounded-xl border border-primary/5 italic">
                                    "{stats.distribution.verde > stats.distribution.rojo
                                        ? "Tu mercado objetivo está respondiendo positivamente al diagnóstico de crecimiento."
                                        : "Se observa resistencia o falta de conciencia digital en la muestra actual."}"
                                </p>
                            </div>
                            <button
                                onClick={handleExport}
                                className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                            >
                                <Copy className="w-4 h-4" />
                                Exportar Datos para Facebook
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function StatCard({ title, value, icon, trend, isPositive, color = "text-slate-600", bg = "bg-white" }: any) {
    return (
        <div className={cn("border border-slate-200 rounded-2xl p-6 shadow-sm flex items-start justify-between transition-all hover:border-primary/20 hover:shadow-md", bg)}>
            <div className="space-y-2">
                <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">{title}</span>
                <div className="text-3xl font-extrabold text-slate-900">{value}</div>
                <div className={cn("text-xs font-bold flex items-center gap-1", isPositive ? "text-emerald-500" : "text-slate-400")}>
                    {isPositive ? <ArrowUpRight className="w-3 h-3" /> : null}
                    {trend}
                </div>
            </div>
            <div className={cn("p-4 rounded-xl", color.replace('text', 'bg').replace('-600', '-50'), color)}>
                {icon}
            </div>
        </div>
    );
}

function TrafficBadge({ color }: { color: string }) {
    const config: any = {
        verde: { bg: "bg-emerald-100", text: "text-emerald-700", label: "VERDE" },
        amarillo: { bg: "bg-amber-100", text: "text-amber-700", label: "AMARILLO" },
        rojo: { bg: "bg-red-100", text: "text-red-700", label: "ROJO" }
    };
    const c = config[color] || config.rojo;
    return (
        <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest", c.bg, c.text)}>
            {c.label}
        </span>
    );
}

function DistributionBar({ label, count, total, color }: any) {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-600">{label}</span>
                <span className="text-slate-400">{count} ({percentage.toFixed(0)}%)</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                    className={cn("h-full transition-all duration-1000", color)}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

function PerceptionBar({ label, count, total, color }: any) {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
        <div className="text-center space-y-2">
            <div className="relative h-32 w-full bg-slate-100 rounded-xl overflow-hidden flex items-end justify-center">
                <div
                    className={cn("w-full transition-all duration-1000 rounded-t-lg", color)}
                    style={{ height: `${Math.max(percentage, 5)}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-black text-white drop-shadow-lg">{count}</span>
                </div>
            </div>
            <div className="text-xs font-bold text-slate-600">{label}</div>
            <div className="text-[10px] text-slate-400">{percentage.toFixed(0)}%</div>
        </div>
    );
}
