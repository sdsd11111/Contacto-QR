"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
    CheckCircle,
    XCircle,
    ExternalLink,
    Search,
    Filter,
    Clock,
    Eye,
    Download,
    RefreshCw,
    LogOut,
    User,
    ImageIcon,
    FileText,
    ShieldAlert,
    Edit,
    Save,
    X,
    Upload,
    Trash2,
    Mail,
    Loader2,
    ChevronRight,
    QrCode,
    BarChart3
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Link from "next/link";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function AdminDashboard() {
    const [registros, setRegistros] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("todos");
    const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [accessKey, setAccessKey] = useState("");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingRegistro, setEditingRegistro] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const storedKey = localStorage.getItem('admin_access_key');
        if (storedKey) {
            // Validar la clave almacenada contra el servidor
            fetch('/api/admin/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: storedKey })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.valid) {
                        setIsAuthorized(true);
                    } else {
                        localStorage.removeItem('admin_access_key');
                    }
                })
                .catch(() => localStorage.removeItem('admin_access_key'));
        }
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: accessKey })
            });
            const data = await res.json();
            if (data.valid) {
                localStorage.setItem('admin_access_key', accessKey);
                setIsAuthorized(true);
            } else {
                alert("Clave incorrecta");
            }
        } catch {
            alert("Error de conexión al servidor");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_access_key');
        setIsAuthorized(false);
    };

    const fetchRegistros = async () => {
        setLoading(true);
        try {
            const adminKey = localStorage.getItem('admin_access_key') || '';
            const res = await fetch('/api/admin/registros', {
                headers: { 'x-admin-key': adminKey }
            });
            if (!res.ok) {
                const result = await res.json();
                console.error('Admin API Error:', result);
                alert(`Error cargando registros: ${result.error || res.statusText}`);
                return;
            }
            const result = await res.json();
            if (result.data) setRegistros(result.data);
        } catch (err: any) {
            console.error('Error fetching registros:', err);
            alert(`Error de conexión: ${err.message}`);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (isAuthorized) fetchRegistros();
    }, [isAuthorized]);

    const updateStatus = async (id: string, newStatus: string) => {
        const adminKey = localStorage.getItem('admin_access_key') || '';
        try {
            const res = await fetch('/api/admin/registros', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-key': adminKey
                },
                body: JSON.stringify({ id, status: newStatus })
            });
            const result = await res.json();
            if (res.ok) {
                setRegistros(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
            } else {
                alert("Error al actualizar estado: " + (result.error || 'Error desconocido'));
            }
        } catch {
            alert("Error al actualizar estado.");
        }
    };

    const handleEdit = (registro: any) => {
        setEditingRegistro({ ...registro });
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!editingRegistro) return;
        setIsSaving(true);
        const adminKey = localStorage.getItem('admin_access_key') || '';
        try {
            const res = await fetch('/api/admin/registros', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-key': adminKey
                },
                body: JSON.stringify({
                    id: editingRegistro.id,
                    nombre: editingRegistro.nombre,
                    profesion: editingRegistro.profesion,
                    empresa: editingRegistro.empresa,
                    whatsapp: editingRegistro.whatsapp,
                    email: editingRegistro.email,
                    bio: editingRegistro.bio,
                    direccion: editingRegistro.direccion,
                    web: editingRegistro.web,
                    instagram: editingRegistro.instagram,
                    linkedin: editingRegistro.linkedin,
                    facebook: editingRegistro.facebook,
                    tiktok: editingRegistro.tiktok,
                    productos_servicios: editingRegistro.productos_servicios,
                    etiquetas: editingRegistro.etiquetas,
                    status: editingRegistro.status,
                    plan: editingRegistro.plan,
                    foto_url: editingRegistro.foto_url,
                    galeria_urls: editingRegistro.galeria_urls,
                })
            });
            const result = await res.json();
            if (res.ok) {
                setRegistros(prev => prev.map(r => r.id === editingRegistro.id ? editingRegistro : r));
                setIsEditModalOpen(false);
                setEditingRegistro(null);
            } else {
                alert("Error al guardar cambios: " + (result.error || 'Error desconocido'));
            }
        } catch (err: any) {
            alert("Error al guardar cambios: " + err.message);
        }
        setIsSaving(false);
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editingRegistro) return;

        setIsSaving(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${editingRegistro.id}/photo_${Math.random()}.${fileExt}`;
            const { error } = await supabase.storage
                .from('vcards')
                .upload(fileName, file);

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('vcards')
                .getPublicUrl(fileName);

            setEditingRegistro({ ...editingRegistro, foto_url: publicUrl });

            await fetch('/api/admin/registros', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-key': localStorage.getItem('admin_access_key') || ''
                },
                body: JSON.stringify({ id: editingRegistro.id, foto_url: publicUrl })
            });

        } catch (err: any) {
            alert("Error subiendo foto: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || !editingRegistro || files.length === 0) return;

        setIsSaving(true);
        try {
            const newUrls = [...(editingRegistro.galeria_urls || [])];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const fileExt = file.name.split('.').pop();
                const fileName = `${editingRegistro.id}/gallery_${Math.random()}.${fileExt}`;
                const { error } = await supabase.storage
                    .from('vcards')
                    .upload(fileName, file);

                if (error) throw error;

                const { data: { publicUrl } } = supabase.storage
                    .from('vcards')
                    .getPublicUrl(fileName);

                newUrls.push(publicUrl);
            }

            setEditingRegistro({ ...editingRegistro, galeria_urls: newUrls });

            await fetch('/api/admin/registros', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-key': localStorage.getItem('admin_access_key') || ''
                },
                body: JSON.stringify({ id: editingRegistro.id, galeria_urls: newUrls })
            });

        } catch (err: any) {
            alert("Error subiendo galería: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const removeGalleryItem = async (index: number) => {
        if (!editingRegistro) return;
        const newUrls = [...(editingRegistro.galeria_urls || [])];
        newUrls.splice(index, 1);
        setEditingRegistro({ ...editingRegistro, galeria_urls: newUrls });

        await fetch('/api/admin/registros', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-key': localStorage.getItem('admin_access_key') || ''
            },
            body: JSON.stringify({ id: editingRegistro.id, galeria_urls: newUrls })
        });
    };

    const filtered = registros.filter(r => {
        const name = (r.nombre || "").toLowerCase();
        const email = (r.email || "").toLowerCase();
        const matchesSearch = name.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "todos" || r.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Helper: obtener admin key del localStorage
    const getAdminKey = () => localStorage.getItem('admin_access_key') || '';

    const sendVCardEmail = async (registro: any) => {
        if (!confirm(`¿Estás seguro de aprobar y enviar el correo a ${registro.email}?`)) return;

        setRegistros(prev => prev.map(r => r.id === registro.id ? { ...r, isSending: true } : r));

        try {
            const vcardUrl = `${window.location.origin}/api/vcard/${registro.slug || registro.id}`;
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(vcardUrl)}`;

            const res = await fetch('/api/send-vcard', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-key': getAdminKey()
                },
                body: JSON.stringify({
                    vcardUrl,
                    qrUrl,
                    plan: registro.plan,
                    email: registro.email,
                    nombre: registro.nombre
                })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Error enviando correo');

            alert("✅ Correo enviado con éxito");

            if (registro.status !== 'entregado') {
                await updateStatus(registro.id, 'entregado');
            }

        } catch (error: any) {
            console.error("Error sending email:", error);
            alert("❌ Error al enviar: " + error.message);
        } finally {
            setRegistros(prev => prev.map(r => r.id === registro.id ? { ...r, isSending: false } : r));
        }
    };

    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-navy flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full glass-card p-12 text-center"
                >
                    <div className="w-20 h-20 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-8">
                        <ShieldAlert size={40} />
                    </div>
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-8">Acceso Restringido</h2>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <input
                            type="password"
                            placeholder="Ingrese Clave de Acceso"
                            value={accessKey}
                            onChange={(e) => setAccessKey(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-primary/40 text-center font-bold"
                        />
                        <button type="submit" className="w-full bg-primary py-4 rounded-2xl font-black uppercase tracking-widest shadow-orange">
                            Entrar
                        </button>
                    </form>
                </motion.div>
            </div>
        );
    }

    if (loading && registros.length === 0) {
        return (
            <div className="min-h-screen bg-navy flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-navy text-white p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black uppercase italic tracking-tighter">Admin Dashboard</h1>
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">Gestión de vCards RegistraYa!</p>
                    </div>

                    <div className="flex gap-4">
                        <button onClick={fetchRegistros} className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
                            <RefreshCw size={20} className={cn(loading && "animate-spin")} />
                        </button>
                        <button
                            onClick={handleLogout}
                            className="bg-primary px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-orange cursor-pointer hover:scale-105 transition-all text-navy"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </header>

                {/* Quick Access to Survey Analytics */}
                <div className="mb-12">
                    <Link href="/admin/encuesta" className="group block">
                        <div className="glass-card p-8 border border-primary/20 hover:border-primary/50 transition-all flex items-center justify-between overflow-hidden relative">
                            <div className="relative z-10">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2">Módulo de Análisis</p>
                                <h3 className="text-2xl font-black uppercase italic tracking-tighter">Panel de Estadísticas de Encuesta</h3>
                                <p className="text-white/40 text-sm mt-1 max-w-xl">Analiza el impacto de digitalización de tus prospectos y visualiza los resultados del semáforo de ventas.</p>
                            </div>
                            <div className="relative z-10 bg-primary/20 p-5 rounded-3xl text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-navy transition-all duration-500">
                                <BarChart3 size={32} />
                            </div>
                            {/* Decorative background element */}
                            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all" />
                        </div>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
                    {['todos', 'pendiente', 'pagado', 'entregado'].map(s => (
                        <div
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={cn(
                                "p-6 rounded-3xl border cursor-pointer transition-all",
                                statusFilter === s ? "bg-primary/10 border-primary" : "bg-white/5 border-white/10 hover:border-white/20"
                            )}
                        >
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">{s}</p>
                            <p className="text-3xl font-black">{registros.filter(r => s === 'todos' || r.status === s).length}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-white/5 border border-white/10 rounded-[40px] overflow-hidden">
                    <div className="p-8 border-b border-white/10 flex flex-col md:flex-row justify-between gap-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar por nombre o email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-16 py-4 outline-none focus:border-primary/40 transition-all font-bold"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-black uppercase tracking-widest text-white/40 bg-white/[0.02]">
                                    <th className="px-8 py-6">Usuario</th>
                                    <th className="px-8 py-6">Plan</th>
                                    <th className="px-8 py-6">Comprobante</th>
                                    <th className="px-8 py-6">Estado</th>
                                    <th className="px-8 py-6">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {filtered.map((r) => (
                                    <tr key={r.id} className="hover:bg-white/[0.02] transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden flex items-center justify-center">
                                                    {r.foto_url ? <img src={r.foto_url} className="w-full h-full object-cover" /> : <User size={20} />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm">{r.nombre}</p>
                                                    <p className="text-[10px] text-white/40">{r.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={cn(
                                                "px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                                r.plan === 'pro' ? "bg-primary/20 text-primary" : "bg-white/10 text-white/40"
                                            )}>
                                                {r.plan || 'basic'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            {r.comprobante_url ? (
                                                <button
                                                    onClick={() => setSelectedReceipt(r.comprobante_url)}
                                                    className="flex items-center gap-2 text-xs font-bold text-primary hover:underline"
                                                >
                                                    <ImageIcon size={16} /> Ver Recibo
                                                </button>
                                            ) : (
                                                <span className="text-[10px] text-white/20 uppercase font-black">Sin Archivo</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "w-2 h-2 rounded-full",
                                                    r.status === 'pagado' ? "bg-accent" : r.status === 'pendiente' ? "bg-yellow-500" : "bg-white/20"
                                                )} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">
                                                    {r.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => sendVCardEmail(r)}
                                                    className="p-3 bg-green-500/20 text-green-500 rounded-xl hover:bg-green-500 hover:text-white transition-all flex items-center gap-2"
                                                    title="Aprobar y Enviar Email"
                                                    disabled={r.isSending}
                                                >
                                                    {r.isSending ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />}
                                                </button>

                                                {r.status === 'pendiente' && (
                                                    <button
                                                        onClick={() => updateStatus(r.id, 'pagado')}
                                                        className="p-3 bg-accent/20 text-accent rounded-xl hover:bg-accent transition-all hover:text-white"
                                                        title="Aprobar Pago"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleEdit(r)}
                                                    className="p-3 bg-white/5 text-white/40 rounded-xl hover:bg-white/10 hover:text-white transition-all"
                                                    title="Editar vCard"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <a
                                                    href={`/api/vcard/${r.slug || r.id}`}
                                                    download={`${r.slug || r.id}.vcf`}
                                                    className="p-3 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-navy transition-all"
                                                    title="Descargar vCard"
                                                >
                                                    <Download size={18} />
                                                </a>
                                                <a
                                                    href={`/card/${r.slug || r.id}`}
                                                    target="_blank"
                                                    className="p-3 bg-white/5 text-white/40 rounded-xl hover:bg-white/10 hover:text-white transition-all"
                                                    title="Ver Perfil"
                                                >
                                                    <Eye size={18} />
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {selectedReceipt && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedReceipt(null)}
                        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-8 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className="max-w-4xl w-full bg-navy rounded-[48px] overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-8 border-b border-white/10 flex justify-between items-center">
                                <h3 className="text-xl font-black uppercase italic tracking-tighter">Comprobante de Pago</h3>
                                <button onClick={() => setSelectedReceipt(null)} className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all text-white/40 hover:text-white">
                                    Cerrar
                                </button>
                            </div>
                            <div className="p-8 flex items-center justify-center min-h-[400px]">
                                {selectedReceipt.endsWith('.pdf') ? (
                                    <iframe src={selectedReceipt} className="w-full h-[600px] rounded-2xl" />
                                ) : (
                                    <img src={selectedReceipt} className="max-h-[600px] w-auto rounded-2xl shadow-2xl" />
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isEditModalOpen && editingRegistro && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto pt-20 pb-20">
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className="w-full max-w-4xl bg-navy-light rounded-[40px] border border-white/10 shadow-3xl overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                                <div>
                                    <h3 className="text-2xl font-black uppercase italic tracking-tighter">Editar Registro</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-1">ID: {editingRegistro.id}</p>
                                </div>
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all text-white/40 hover:text-white"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                <div className="space-y-12">
                                    <div className="space-y-6">
                                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/30 border-b border-white/5 pb-4">FOTO DE PERFIL</h4>
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-32 h-32 rounded-full bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden group relative">
                                                {editingRegistro.foto_url ? (
                                                    <img src={editingRegistro.foto_url} className="w-full h-full object-cover" />
                                                ) : (
                                                    <User size={40} className="text-white/10" />
                                                )}
                                                <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                                                    <Upload size={20} className="text-white" />
                                                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                                                </label>
                                            </div>
                                            <p className="text-[10px] font-bold text-white/40 text-center uppercase">Formatos: JPG, PNG. Máx 5MB.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/30 border-b border-white/5 pb-4">INFO PERSONAL</h4>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">Nombre Completo</label>
                                                <input
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-primary/40 transition-all"
                                                    value={editingRegistro.nombre || ''}
                                                    onChange={e => setEditingRegistro({ ...editingRegistro, nombre: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">Profesión</label>
                                                <input
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-primary/40 transition-all"
                                                    value={editingRegistro.profesion || ''}
                                                    onChange={e => setEditingRegistro({ ...editingRegistro, profesion: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">WhatsApp (con código)</label>
                                                <input
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-primary/40 transition-all"
                                                    value={editingRegistro.whatsapp || ''}
                                                    onChange={e => setEditingRegistro({ ...editingRegistro, whatsapp: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">Email</label>
                                                <input
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-primary/40 transition-all"
                                                    value={editingRegistro.email || ''}
                                                    onChange={e => setEditingRegistro({ ...editingRegistro, email: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/30 border-b border-white/5 pb-4">REDES Y LINKS</h4>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">Facebook (Link)</label>
                                                <input
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-primary/40 transition-all"
                                                    value={editingRegistro.facebook || ''}
                                                    onChange={e => setEditingRegistro({ ...editingRegistro, facebook: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">TikTok (Link)</label>
                                                <input
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-primary/40 transition-all"
                                                    value={editingRegistro.tiktok || ''}
                                                    onChange={e => setEditingRegistro({ ...editingRegistro, tiktok: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">Instagram (Link)</label>
                                                <input
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-primary/40 transition-all"
                                                    value={editingRegistro.instagram || ''}
                                                    onChange={e => setEditingRegistro({ ...editingRegistro, instagram: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">LinkedIn (Link)</label>
                                                <input
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-primary/40 transition-all"
                                                    value={editingRegistro.linkedin || ''}
                                                    onChange={e => setEditingRegistro({ ...editingRegistro, linkedin: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6 pt-4">
                                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/30 border-b border-white/5 pb-4">CONTENIDO Y SEO</h4>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">Bio / Descripción</label>
                                            <textarea
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-primary/40 transition-all resize-none overflow-hidden"
                                                rows={3}
                                                value={editingRegistro.bio || ''}
                                                onChange={e => {
                                                    setEditingRegistro({ ...editingRegistro, bio: e.target.value });
                                                    e.target.style.height = 'auto';
                                                    e.target.style.height = `${e.target.scrollHeight}px`;
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">Productos / Servicios</label>
                                            <textarea
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-primary/40 transition-all resize-none overflow-hidden"
                                                rows={3}
                                                value={editingRegistro.productos_servicios || ''}
                                                onChange={e => {
                                                    setEditingRegistro({ ...editingRegistro, productos_servicios: e.target.value });
                                                    e.target.style.height = 'auto';
                                                    e.target.style.height = `${e.target.scrollHeight}px`;
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">Etiquetas (Separadas por coma)</label>
                                            <input
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-primary/40 transition-all"
                                                value={editingRegistro.etiquetas || ''}
                                                onChange={e => setEditingRegistro({ ...editingRegistro, etiquetas: e.target.value })}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">Estado del Registro</label>
                                                <select
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-primary/40 transition-all appearance-none"
                                                    value={editingRegistro.status}
                                                    onChange={e => setEditingRegistro({ ...editingRegistro, status: e.target.value })}
                                                >
                                                    <option value="pendiente" className="bg-navy">Pendiente</option>
                                                    <option value="pagado" className="bg-navy">Pagado</option>
                                                    <option value="entregado" className="bg-navy">Entregado</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">Plan contratado</label>
                                                <select
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-primary/40 transition-all appearance-none uppercase"
                                                    value={editingRegistro.plan || 'basic'}
                                                    onChange={e => setEditingRegistro({ ...editingRegistro, plan: e.target.value })}
                                                >
                                                    <option value="basic" className="bg-navy">Básico ($10)</option>
                                                    <option value="pro" className="bg-navy">Pro ($20)</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">Ubicación / Dirección</label>
                                                <input
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-primary/40 transition-all"
                                                    value={editingRegistro.direccion || ''}
                                                    onChange={e => setEditingRegistro({ ...editingRegistro, direccion: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">Sitio Web</label>
                                                <input
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-primary/40 transition-all"
                                                    value={editingRegistro.web || ''}
                                                    onChange={e => setEditingRegistro({ ...editingRegistro, web: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="bg-primary/5 p-8 rounded-[2.5rem] border border-primary/20">
                                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-6 flex items-center gap-2">
                                                <QrCode size={16} /> GESTIÓN DE CÓDIGOS QR
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-4">
                                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Opción 1: Descarga Directa (Archivo .vcf)</p>
                                                    <div className="flex items-center gap-6">
                                                        <div className="bg-white p-3 rounded-2xl">
                                                            <img
                                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : ''}/api/vcard/${editingRegistro.slug || editingRegistro.id}`)}`}
                                                                alt="QR Descarga"
                                                                className="w-20 h-20"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <p className="text-[10px] font-bold text-white/60 leading-tight">Ideal para tarjetas físicas básicas. Al escanear, el contacto se guarda al instante.</p>
                                                            <a
                                                                href={`https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : ''}/api/vcard/${editingRegistro.slug || editingRegistro.id}`)}`}
                                                                target="_blank"
                                                                className="inline-flex items-center gap-2 text-primary text-[10px] font-black uppercase hover:underline"
                                                            >
                                                                <Download size={12} /> Descargar QR Alta Res.
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Opción 2: Perfil Digital (Desactivado por ahora) */}
                                            </div>
                                        </div>

                                        <div className="pt-4">
                                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/30 border-b border-white/5 pb-4 mb-6">GALERÍA DE TRABAJOS</h4>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                {(editingRegistro.galeria_urls || []).map((url: string, idx: number) => (
                                                    <div key={idx} className="relative aspect-square rounded-2xl bg-white/5 overflow-hidden group">
                                                        <img src={url} className="w-full h-full object-cover" />
                                                        <button
                                                            onClick={() => removeGalleryItem(idx)}
                                                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                ))}
                                                {(editingRegistro.galeria_urls || []).length < 5 && (
                                                    <label className="aspect-square rounded-2xl bg-white/5 border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/10 transition-all">
                                                        <Upload size={20} className="text-white/20" />
                                                        <span className="text-[8px] font-black uppercase tracking-widest opacity-20">Subir</span>
                                                        <input type="file" className="hidden" multiple accept="image/*" onChange={handleGalleryUpload} />
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 border-t border-white/10 bg-white/[0.02] flex justify-end gap-4 overflow-x-auto">
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-8 py-4 rounded-2xl bg-white/5 font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all"
                                >
                                    Cerrar
                                </button>

                                {editingRegistro && (
                                    <a
                                        href={`/api/vcard/${editingRegistro.slug || editingRegistro.id}`}
                                        download={`${editingRegistro.slug || editingRegistro.id}.vcf`}
                                        className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all flex items-center gap-2 text-white"
                                    >
                                        <Download size={14} />
                                        Descargar vCard
                                    </a>
                                )}

                                <button
                                    onClick={handleSaveEdit}
                                    disabled={isSaving}
                                    className="px-10 py-4 rounded-2xl bg-primary shadow-orange font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all text-navy flex items-center gap-2 whitespace-nowrap"
                                >
                                    {isSaving ? (
                                        <RefreshCw size={14} className="animate-spin" />
                                    ) : (
                                        <Save size={14} />
                                    )}
                                    {isSaving ? 'Guardando...' : 'Guardar y Cerrar'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
