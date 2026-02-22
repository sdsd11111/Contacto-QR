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
    ShieldCheck,
    Edit,
    Save,
    X,
    Upload,
    Trash2,
    Mail,
    Loader2,
    ChevronRight,
    QrCode,
    BarChart3,
    Users,
    ChevronDown,
    Info,
    Settings
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Link from "next/link";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Utilidad para detectar URLs de marcador de posición o no válidas
const isPlaceholderUrl = (url: string | null | undefined) => {
    if (!url) return true;
    if (url.startsWith('data:image')) return false; // Base64 is not a placeholder
    const placeholders = ['photo.com', 'example.com', 'placeholder.com', 'placehold.co'];
    return placeholders.some(p => url.toLowerCase().includes(p));
};

export default function AdminDashboard() {
    const [registros, setRegistros] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("todos");
    const [sellers, setSellers] = useState<any[]>([]);
    const [sellerIdFilter, setSellerIdFilter] = useState<number | null>(null);
    const [isSellersDropdownOpen, setIsSellersDropdownOpen] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [accessKey, setAccessKey] = useState("");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingRegistro, setEditingRegistro] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

    // Estados para creación de vendedor
    const [isCreateSellerModalOpen, setIsCreateSellerModalOpen] = useState(false);
    const [newSeller, setNewSeller] = useState({ nombre: '', email: '', password: '', comision_porcentaje: 30 });
    const [isCreatingSeller, setIsCreatingSeller] = useState(false);
    const [nextSellerCode, setNextSellerCode] = useState<string | null>(null);
    const [isLive, setIsLive] = useState(false);

    // Estados para edición de vendedor
    const [isEditSellerModalOpen, setIsEditSellerModalOpen] = useState(false);
    const [editingSeller, setEditingSeller] = useState<any>(null);
    const [isSavingSeller, setIsSavingSeller] = useState(false);

    // Estados para migración de equipo
    const [isMigrateModalOpen, setIsMigrateModalOpen] = useState(false);
    const [migratingLeader, setMigratingLeader] = useState<any>(null);
    const [targetLeaderId, setTargetLeaderId] = useState<number>(0);
    const [isMigratingTeam, setIsMigratingTeam] = useState(false);

    const fetchNextCode = async () => {
        const adminKey = localStorage.getItem('admin_access_key') || '';
        try {
            const res = await fetch('/api/admin/sellers?nextCode=true', {
                headers: { 'x-admin-key': adminKey }
            });
            const data = await res.json();
            if (data.nextCode) setNextSellerCode(data.nextCode);
        } catch (err) {
            console.error("Error fetching next code:", err);
        }
    };

    const generatePassword = () => {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Evitando caracteres ambiguos
        let pass = "";
        for (let i = 0; i < 6; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setNewSeller({ ...newSeller, password: pass });
    };

    useEffect(() => {
        if (isCreateSellerModalOpen) {
            fetchNextCode();
        }
    }, [isCreateSellerModalOpen]);

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

    const fetchSellers = async () => {
        try {
            const adminKey = localStorage.getItem('admin_access_key') || '';
            const res = await fetch('/api/admin/sellers', {
                headers: { 'x-admin-key': adminKey }
            });
            if (res.ok) {
                const result = await res.json();
                if (result.data) setSellers(result.data);
            }
        } catch (err) {
            console.error('Error fetching sellers:', err);
        }
    };

    const handleEditSeller = (seller: any) => {
        setEditingSeller({ ...seller }); // Clone seller object to avoid direct mutation
        setIsEditSellerModalOpen(true);
    };

    const handleSaveSellerEdit = async () => {
        if (!editingSeller) return;
        setIsSavingSeller(true);
        try {
            const token = localStorage.getItem("admin_access_key");
            if (!token) throw new Error("No token admin");

            const res = await fetch(`/api/admin/sellers/${editingSeller.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "x-admin-key": token
                },
                body: JSON.stringify(editingSeller)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Error al actualizar vendedor");

            alert("Vendedor actualizado correctamente");
            setIsEditSellerModalOpen(false);
            setEditingSeller(null);
            fetchSellers(); // Refresh the list
        } catch (err: any) {
            alert(err.message || "Error de conexión");
        }
        setIsSavingSeller(false);
    };

    const handleDeleteSeller = async (id: number) => {
        const seller = sellers.find(s => s.id === id);
        if (!seller) return;

        if (seller.team_count > 0) {
            setMigratingLeader(seller);
            setIsMigrateModalOpen(true);
            return;
        }

        if (!confirm(`¿Estás seguro de eliminar a ${seller.nombre}? Esta acción no se puede deshacer.`)) return;
        const adminKey = localStorage.getItem('admin_access_key') || '';
        try {
            const res = await fetch(`/api/admin/sellers?id=${id}`, {
                method: 'DELETE',
                headers: { 'x-admin-key': adminKey }
            });
            if (res.ok) {
                alert("Vendedor eliminado con éxito");
                fetchSellers();
            } else {
                const data = await res.json();
                alert("Error: " + (data.error || "No se pudo eliminar"));
            }
        } catch (err: any) {
            alert("Error: " + err.message);
        }
    };

    const handleMigrateTeam = async () => {
        if (!migratingLeader) return;
        setIsMigratingTeam(true);

        const adminKey = localStorage.getItem('admin_access_key') || '';
        try {
            const res = await fetch('/api/admin/sellers/migrate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-key': adminKey
                },
                body: JSON.stringify({
                    fromLeaderId: migratingLeader.id,
                    toLeaderId: targetLeaderId === 0 ? null : targetLeaderId
                })
            });

            const data = await res.json();
            if (res.ok) {
                alert(data.message);
                setIsMigrateModalOpen(false);
                setMigratingLeader(null);
                fetchSellers(); // Refresh to allow deletion now
            } else {
                alert("Error: " + data.error);
            }
        } catch (err: any) {
            alert("Error: " + err.message);
        } finally {
            setIsMigratingTeam(false);
        }
    };

    useEffect(() => {
        if (isAuthorized) {
            fetchRegistros();
            fetchSellers();
        }
    }, [isAuthorized]);

    // Live Mode Effect
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isAuthorized && isLive) {
            interval = setInterval(() => {
                // Refresh without showing loading state to avoid flickering
                const adminKey = localStorage.getItem('admin_access_key') || '';
                fetch('/api/admin/registros', { headers: { 'x-admin-key': adminKey } })
                    .then(res => res.json())
                    .then(data => {
                        if (data.data) setRegistros(data.data);
                    })
                    .catch(err => console.error("Live update failed", err));
            }, 10000); // Every 10 seconds
        }
        return () => clearInterval(interval);
    }, [isAuthorized, isLive]);

    const updateCommissionStatus = async (id: string, currentStatus: string) => {
        if (pendingIds.has(id)) return;

        // El administrador solo puede marcar como 'paid_to_leader' si está 'pending'
        // o revertir a 'pending' si está 'paid_to_leader'.
        // 'completed' solo lo puede poner el vendedor final.
        let newStatus = '';
        if (currentStatus === 'pending') newStatus = 'paid_to_leader';
        else if (currentStatus === 'paid_to_leader') newStatus = 'pending';
        else return; // No permitir cambios manuales si ya está 'completed'

        if (!confirm(`¿Confirmas cambiar el estado a: ${newStatus === 'paid_to_leader' ? 'ENVIADO AL LÍDER' : 'PENDIENTE'}?`)) return;

        setPendingIds(prev => new Set(prev).add(id));
        const adminKey = localStorage.getItem('admin_access_key') || '';
        try {
            const body: any = { id, commission_status: newStatus };
            if (newStatus === 'paid_to_leader') body.leader_paid_at = new Date().toISOString();

            const res = await fetch('/api/admin/registros', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-key': adminKey
                },
                body: JSON.stringify(body)
            });
            if (res.ok) {
                setRegistros(prev => prev.map(r => r.id === id ? { ...r, commission_status: newStatus, leader_paid_at: body.leader_paid_at || r.leader_paid_at } : r));
            } else {
                const result = await res.json();
                alert("Error: " + (result.error || 'Error desconocido'));
            }
        } catch {
            alert("Error al conectar con el servidor.");
        } finally {
            setPendingIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        if (pendingIds.has(id)) return;
        setPendingIds(prev => new Set(prev).add(id));

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
        } finally {
            setPendingIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    };

    const handleEdit = (registro: any) => {
        // galeria_urls puede venir como string JSON desde MySQL, hay que parsearlo
        let galeriaUrls = registro.galeria_urls;
        if (typeof galeriaUrls === 'string') {
            try { galeriaUrls = JSON.parse(galeriaUrls); } catch { galeriaUrls = []; }
        }
        if (!Array.isArray(galeriaUrls)) galeriaUrls = [];
        setEditingRegistro({ ...registro, galeria_urls: galeriaUrls });
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

    const handleCreateSeller = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreatingSeller(true);
        const adminKey = localStorage.getItem('admin_access_key') || '';
        try {
            const res = await fetch('/api/admin/sellers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-key': adminKey
                },
                body: JSON.stringify(newSeller)
            });
            const result = await res.json();
            if (res.ok) {
                alert(`✅ Vendedor creado con éxito. Código asignado: ${result.data.codigo}`);
                setIsCreateSellerModalOpen(false);
                setNewSeller({ nombre: '', email: '', password: '', comision_porcentaje: 30 });
                fetchSellers();
            } else {
                alert("❌ Error: " + (result.error || 'Error desconocido'));
            }
        } catch (err: any) {
            alert("❌ Error: " + err.message);
        }
        setIsCreatingSeller(false);
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

        // Logical filter mapping
        let matchesStatus = true;
        if (statusFilter === "clientes_pendientes") {
            matchesStatus = r.status === "pendiente";
        } else if (statusFilter === "comisiones_pendientes") {
            // Pendiente de pago inicial o enviado a líder pero no confirmado 
            matchesStatus = !!(r.seller_id && (r.commission_status === "pending" || r.commission_status === "paid_to_leader") && (r.status === "pagado" || r.status === "entregado"));
        } else if (statusFilter === "comisiones_pagadas") {
            // Solo las que el vendedor ya confirmó (Ciclo completo)
            matchesStatus = !!(r.seller_id && r.commission_status === "completed");
        } else if (statusFilter !== "todos") {
            matchesStatus = r.status === statusFilter;
        }

        const matchesSeller = !sellerIdFilter || Number(r.seller_id) === Number(sellerIdFilter) || Number(r.parent_id) === Number(sellerIdFilter);
        return matchesSearch && matchesStatus && matchesSeller;
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
                    nombre: registro.nombre,
                    edit_code: registro.edit_code
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
                        {/* Accessible username field (hidden) */}
                        <input type="text" name="username" autoComplete="username" style={{ display: 'none' }} defaultValue="admin" />
                        <input
                            type="password"
                            placeholder="Ingrese Clave de Acceso"
                            autoComplete="current-password"
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
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">Gestión de vCards ActivaQR</p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => setIsLive(!isLive)}
                            className={cn(
                                "px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 shadow-xl",
                                isLive ? "bg-green-500 text-white animate-pulse" : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10"
                            )}
                        >
                            <div className={cn("w-2 h-2 rounded-full", isLive ? "bg-white" : "bg-white/20")} />
                            {isLive ? "LIVE MOD..." : "MODO LIVE OFF"}
                        </button>
                        <button
                            onClick={fetchRegistros}
                            className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-all text-white/40 hover:text-white"
                        >
                            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                        </button>
                        <button
                            onClick={handleLogout}
                            className="bg-primary hover:bg-[#FF8A33] px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-[0_10px_25px_rgba(255,107,0,0.3)] text-[#050B1C] transition-all flex items-center gap-2 group"
                        >
                            Cerrar Sesión
                            <LogOut className="group-hover:translate-x-1 transition-transform" size={18} />
                        </button>
                    </div>
                </header>

                {/* Resumen de Vendedores */}
                <div className="mb-12">
                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 mb-8 flex gap-4 items-start shadow-inner">
                        <Info className="text-primary flex-shrink-0 mt-1" size={24} />
                        <div>
                            <h3 className="text-primary font-black uppercase italic tracking-widest text-sm mb-2">Manual de Jerarquía Comercial</h3>
                            <ul className="text-white/60 text-xs space-y-2 list-disc ml-4">
                                <li><strong>Tú (Admin):</strong> Creas a los <span className="text-white font-bold">Vendedores Oficiales (Socios)</span> desde aquí. Ellos tienen trato directo contigo.</li>
                                <li><strong>Vendedores Oficiales:</strong> Ellos crean a sus propios <span className="text-white font-bold">Sub-vendedores</span> desde su propio panel (Gestionar Equipo).</li>
                                <li><strong>Sub-vendedores:</strong> Cobran un 30% fijo. Sus ventas suben de nivel a su Vendedor Oficial. <em>No los crees aquí.</em></li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Users className="text-primary" size={24} />
                            <h2 className="text-2xl font-black uppercase italic tracking-tighter">Socios & Vendedores</h2>
                        </div>
                        <button
                            onClick={() => setIsCreateSellerModalOpen(true)}
                            className="flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-navy transition-all shadow-lg shadow-primary/5"
                        >
                            <Users size={16} /> Crear Nuevo Vendedor
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        {/* Botón General */}
                        <button
                            onClick={() => setSellerIdFilter(null)}
                            className={cn(
                                "px-8 py-4 rounded-2xl border font-black text-xs uppercase tracking-widest transition-all transition-all",
                                !sellerIdFilter ? "bg-primary text-navy border-primary shadow-orange" : "bg-white/5 border-white/10 hover:bg-white/10"
                            )}
                        >
                            General
                        </button>

                        {/* Botón Cesar Reyes (Socio) */}
                        {sellers.filter(s => s.nombre === 'Cesar Reyes').map(s => (
                            <button
                                key={s.id}
                                onClick={() => setSellerIdFilter(s.id)}
                                className={cn(
                                    "px-8 py-4 rounded-2xl border font-black text-xs uppercase tracking-widest transition-all",
                                    sellerIdFilter === s.id ? "bg-accent text-white border-accent shadow-lg shadow-accent/20" : "bg-white/5 border-white/10 hover:bg-white/10"
                                )}
                            >
                                <span className="flex items-center gap-2">
                                    {s.nombre} <span className="bg-white/10 px-2 py-0.5 rounded-md text-[8px] font-black uppercase">Socio</span>
                                </span>
                            </button>
                        ))}

                        {/* Dropdown de Vendedores */}
                        <div className="relative">
                            <button
                                onClick={() => setIsSellersDropdownOpen(!isSellersDropdownOpen)}
                                className={cn(
                                    "px-8 py-4 rounded-2xl border font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2",
                                    sellerIdFilter && sellers.find(s => s.id === sellerIdFilter)?.nombre !== 'Cesar Reyes'
                                        ? "bg-white/20 border-white/40"
                                        : "bg-white/5 border-white/10 hover:bg-white/10"
                                )}
                            >
                                {sellerIdFilter && sellers.find(s => s.id === sellerIdFilter)?.nombre !== 'Cesar Reyes'
                                    ? sellers.find(s => s.id === sellerIdFilter)?.nombre
                                    : "Vendedores"}
                                <ChevronDown size={16} className={cn("transition-transform", isSellersDropdownOpen && "rotate-180")} />
                            </button>

                            <AnimatePresence>
                                {isSellersDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-full mt-2 left-0 w-64 bg-navy border border-white/10 rounded-[32px] overflow-hidden z-50 shadow-2xl p-2"
                                    >
                                        {sellers.filter(s => s.nombre !== 'Cesar Reyes').length === 0 ? (
                                            <p className="p-4 text-center text-[10px] font-bold text-white/40 uppercase tracking-widest">No hay otros vendedores</p>
                                        ) : (
                                            sellers.filter(s => s.nombre !== 'Cesar Reyes').map(s => (
                                                <div key={s.id} className="relative group">
                                                    <button
                                                        onClick={() => {
                                                            setSellerIdFilter(s.id);
                                                            setIsSellersDropdownOpen(false);
                                                        }}
                                                        className={cn(
                                                            "w-full text-left px-6 py-4 rounded-2xl transition-all flex flex-col hover:bg-white/5",
                                                            sellerIdFilter === s.id ? "bg-white/10" : ""
                                                        )}
                                                    >
                                                        <span className="font-black text-xs uppercase tracking-tighter truncate pr-16">{s.nombre}</span>
                                                        <div className="flex justify-between items-center mt-1">
                                                            <span className="text-[9px] font-black text-primary uppercase font-mono">#{s.codigo}</span>
                                                            <span className="text-[9px] font-bold text-white/40">{s.total_ventas} Ventas</span>
                                                        </div>
                                                    </button>
                                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleEditSeller(s); }}
                                                            className="p-2 bg-white/5 hover:bg-white/20 text-white/40 hover:text-white rounded-lg transition-all"
                                                            title="Editar Vendedor"
                                                        >
                                                            <Settings size={12} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteSeller(s.id); }}
                                                            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500/40 hover:text-red-500 rounded-lg transition-all"
                                                            title="Eliminar Vendedor"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
                    <div
                        onClick={() => setStatusFilter("todos")}
                        className={cn(
                            "bg-[#0A1229] border rounded-[32px] p-6 relative overflow-hidden group cursor-pointer transition-all hover:scale-[1.02]",
                            statusFilter === "todos" ? "border-primary" : "border-white/5"
                        )}
                    >
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform text-white"><QrCode size={48} /></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-3">vCards Vendidas</p>
                        <p className="text-4xl font-black italic tracking-tighter text-white">
                            {registros.filter(r => r.status === 'pagado' || r.status === 'entregado').length}
                        </p>
                    </div>

                    <div
                        onClick={() => setStatusFilter("pagado")}
                        className={cn(
                            "bg-[#0A1229] border rounded-[32px] p-6 relative overflow-hidden group cursor-pointer transition-all hover:scale-[1.02]",
                            statusFilter === "pagado" ? "border-accent" : "border-white/5"
                        )}
                    >
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform text-accent"><BarChart3 size={48} /></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-3">Total Ingresado</p>
                        <p className="text-4xl font-black italic tracking-tighter text-accent">
                            ${registros.reduce((acc, r) => (r.status === 'pagado' || r.status === 'entregado') ? acc + (r.plan === 'pro' ? 20 : 10) : acc, 0).toFixed(2)}
                        </p>
                    </div>

                    <div
                        onClick={() => setStatusFilter("todos")}
                        className="bg-[#0A1229] border border-white/5 rounded-[32px] p-6 relative overflow-hidden group shadow-lg shadow-white/5"
                    >
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform text-white"><ShieldAlert size={48} /></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-3">Utilidad Neta</p>
                        <p className="text-4xl font-black italic tracking-tighter text-white">
                            ${(() => {
                                const totalIngreso = registros.reduce((acc, r) => (r.status === 'pagado' || r.status === 'entregado') ? acc + (r.plan === 'pro' ? 20 : 10) : acc, 0);
                                const totalComisiones = registros.reduce((acc, r) => {
                                    if ((r.status === 'pagado' || r.status === 'entregado') && r.seller_id) {
                                        return acc + (r.plan === 'pro' ? 10 : 5);
                                    }
                                    return acc;
                                }, 0);
                                return (totalIngreso - totalComisiones).toFixed(2);
                            })()}
                        </p>
                    </div>

                    <div
                        onClick={() => setStatusFilter("clientes_pendientes")}
                        className={cn(
                            "border rounded-[32px] p-6 relative overflow-hidden group cursor-pointer transition-all hover:scale-[1.02]",
                            statusFilter === "clientes_pendientes" ? "bg-primary/20 border-primary shadow-[0_0_30px_rgba(255,107,0,0.1)]" : "bg-primary/10 border-primary/20 hover:bg-primary/20"
                        )}
                    >
                        <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:scale-110 transition-transform text-primary"><Users size={48} /></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-3 font-bold">Clientes x Cobrar</p>
                        <p className="text-4xl font-black italic tracking-tighter text-primary">
                            {registros.filter(r => r.status === 'pendiente').length}
                        </p>
                        <p className="text-[10px] font-bold text-primary/60 mt-2">
                            Val. Pendiente: ${registros.reduce((acc, r) => r.status === 'pendiente' ? acc + (r.plan === 'pro' ? 20 : 10) : acc, 0).toFixed(2)}
                        </p>
                    </div>

                    <div
                        onClick={() => setStatusFilter("comisiones_pendientes")}
                        className={cn(
                            "bg-[#0A1229] border rounded-[32px] p-8 relative overflow-hidden group cursor-pointer transition-all hover:scale-[1.02]",
                            statusFilter === "comisiones_pendientes" ? "border-primary shadow-lg shadow-primary/5" : "border-white/5"
                        )}
                    >
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform text-primary"><Users size={48} /></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-3">Comisiones x Pagar</p>
                        <p className="text-4xl font-black italic tracking-tighter text-white">
                            ${registros.reduce((acc, r) => {
                                if ((r.status === 'pagado' || r.status === 'entregado') && r.seller_id && r.commission_status !== 'paid') {
                                    return acc + (r.plan === 'pro' ? 10 : 5);
                                }
                                return acc;
                            }, 0).toFixed(2)}
                        </p>
                        <p className="text-[10px] font-bold text-white/40 mt-2">
                            {registros.filter(r => r.seller_id && r.commission_status !== 'paid' && (r.status === 'pagado' || r.status === 'entregado')).length} comisiones pendientes
                        </p>
                    </div>

                    <div
                        onClick={() => setStatusFilter("comisiones_pagadas")}
                        className={cn(
                            "bg-[#0A1229] border rounded-[32px] p-6 relative overflow-hidden group cursor-pointer transition-all hover:scale-[1.02]",
                            statusFilter === "comisiones_pagadas" ? "border-green-500" : "border-white/5"
                        )}
                    >
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform text-green-500"><CheckCircle size={48} /></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-500 mb-3">Comis. Pagadas</p>
                        <p className="text-4xl font-black italic tracking-tighter text-green-500">
                            ${registros.reduce((acc, r) => {
                                if ((r.status === 'pagado' || r.status === 'entregado') && r.seller_id && r.commission_status === 'paid') {
                                    return acc + (r.plan === 'pro' ? 10 : 5);
                                }
                                return acc;
                            }, 0).toFixed(2)}
                        </p>
                    </div>

                    <div className="bg-primary/5 border border-primary/20 rounded-[32px] p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform text-primary"><Clock size={48} /></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-3">Cola de Correos</p>
                        <p className="text-4xl font-black italic tracking-tighter text-primary">
                            {registros.filter(r => r.status === 'pagado' && !r.auto_email_sent).length}
                        </p>
                        <p className="text-[10px] font-bold text-white/40 mt-2 italic">
                            Envío automático en 24h
                        </p>
                    </div>
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
                                    <th className="px-8 py-6">Vendedor</th>
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
                                                    {r.foto_url && !isPlaceholderUrl(r.foto_url) ? (
                                                        <img src={r.foto_url} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User size={20} className="text-white/20" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm">{r.nombre}</p>
                                                    <p className="text-[10px] text-white/40">{r.email}</p>
                                                    {r.status === 'entregado' || r.auto_email_sent ? (
                                                        <p className="text-[8px] text-green-500 font-black uppercase mt-1 flex items-center gap-1">
                                                            <CheckCircle size={8} /> Enviado Digitalmente
                                                        </p>
                                                    ) : r.paid_at ? (
                                                        <p className="text-[8px] text-accent font-bold uppercase mt-1">💳 Pago: {new Date(r.paid_at).toLocaleString()}</p>
                                                    ) : null}
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
                                            {r.seller_id ? (
                                                <button
                                                    onClick={() => setSellerIdFilter(r.seller_id)}
                                                    className="flex flex-col gap-1 items-start group/seller hover:bg-primary/5 p-2 -m-2 rounded-lg transition-all"
                                                    title={`Filtrar ventas de Socio #${r.seller_id}`}
                                                >
                                                    <span className="text-[10px] font-black uppercase text-primary group-hover/seller:underline flex items-center gap-1">
                                                        {r.parent_name ? (
                                                            <>
                                                                <span className="text-white/40">{r.parent_name}</span>
                                                                <ChevronRight size={10} className="text-white/20" />
                                                                <span>{r.sold_by_name?.split(' ')[0]}</span>
                                                            </>
                                                        ) : (
                                                            r.sold_by_name || `Socio #${r.seller_id}`
                                                        )}
                                                        <Users size={10} className="opacity-0 group-hover/seller:opacity-100 transition-opacity" />
                                                    </span>
                                                    <span className={cn(
                                                        "text-[8px] font-black uppercase tracking-tighter text-left",
                                                        r.commission_status === 'paid' ? "text-green-500" : "text-white/20"
                                                    )}>
                                                        {r.commission_status === 'paid' ? 'Comisión Pagada' : 'Pago Pendiente'}
                                                    </span>
                                                </button>
                                            ) : (
                                                <span className="text-[10px] text-white/20 uppercase font-black">Directo</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    <div className={cn(
                                                        "w-2 h-2 rounded-full",
                                                        r.status === 'pagado' ? "bg-accent" : r.status === 'entregado' ? "bg-green-500" : r.status === 'cancelado' ? "bg-red-500" : "bg-yellow-500"
                                                    )} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">
                                                        {r.status}
                                                    </span>
                                                </div>
                                                {r.status === 'pendiente' && (
                                                    <span className="text-[8px] font-bold text-white/30 uppercase tracking-tighter italic">Esperando Pago</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                {/* Botón Enviar Email */}
                                                <button
                                                    onClick={() => sendVCardEmail(r)}
                                                    className="p-3 bg-green-500/20 text-green-500 rounded-xl hover:bg-green-500 hover:text-white transition-all"
                                                    title="Aprobar y Enviar Email"
                                                    disabled={r.isSending}
                                                >
                                                    {r.isSending ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />}
                                                </button>

                                                {/* Botón Aprobar Pago Manual */}
                                                {(r.status === 'pendiente' || r.status === 'cancelado') && (
                                                    <button
                                                        onClick={() => updateStatus(r.id, 'pagado')}
                                                        disabled={pendingIds.has(r.id)}
                                                        className="p-3 bg-blue-500/20 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all"
                                                        title="Marcar como Pagado"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                )}

                                                {/* Botón Cancelar */}
                                                {r.status !== 'cancelado' && (
                                                    <button
                                                        onClick={() => updateStatus(r.id, 'cancelado')}
                                                        disabled={pendingIds.has(r.id)}
                                                        className="p-3 bg-red-500/10 text-red-500/40 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                                        title="Cancelar Registro"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                )}

                                                {/* Botón Comisión (Socio) */}
                                                {r.seller_id && (
                                                    <div className="relative group/comm">
                                                        <button
                                                            onClick={() => updateCommissionStatus(r.id, r.commission_status)}
                                                            disabled={pendingIds.has(r.id)}
                                                            className={cn(
                                                                "p-3 rounded-xl transition-all shadow-lg",
                                                                r.commission_status === 'completed'
                                                                    ? "bg-green-500 text-white shadow-green-500/20"
                                                                    : r.commission_status === 'paid_to_leader'
                                                                        ? "bg-brand text-white shadow-brand/20"
                                                                        : "bg-white/5 text-white/20 border border-white/10 hover:bg-white/10"
                                                            )}
                                                            title={
                                                                r.commission_status === 'completed' ? "Pago Confirmado por Vendedor ✅" :
                                                                    r.commission_status === 'paid_to_leader' ? "Enviado al Líder (Esperando Confirmación) 🚚" :
                                                                        "Marcar como PAGADO AL LÍDER"
                                                            }
                                                        >
                                                            <ShieldCheck size={18} />
                                                        </button>

                                                        {/* Alerta de retraso > 48h */}
                                                        {r.commission_status === 'paid_to_leader' && r.leader_paid_at && (
                                                            (() => {
                                                                const paidDate = new Date(r.leader_paid_at).getTime();
                                                                const now = new Date().getTime();
                                                                const hoursPassed = (now - paidDate) / (1000 * 60 * 60);
                                                                if (hoursPassed > 48) {
                                                                    return (
                                                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-navy rounded-full animate-pulse shadow-lg shadow-red-500/50" />
                                                                    );
                                                                }
                                                                return null;
                                                            })()
                                                        )}
                                                    </div>
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
                                {!selectedReceipt || isPlaceholderUrl(selectedReceipt) ? (
                                    <p className="text-white/20 font-black uppercase tracking-widest">No hay imagen válida disponible</p>
                                ) : selectedReceipt.startsWith('data:image/') || (!selectedReceipt.endsWith('.pdf')) ? (
                                    <img
                                        src={selectedReceipt}
                                        className="max-h-[600px] w-auto rounded-2xl shadow-2xl"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = "https://placehold.co/600x400/0a0b1e/white?text=Error+al+cargar+imagen";
                                        }}
                                    />
                                ) : (
                                    <iframe src={selectedReceipt} className="w-full h-[600px] rounded-2xl" />
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
                                                {editingRegistro.foto_url && !isPlaceholderUrl(editingRegistro.foto_url) ? (
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

                                                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-4">
                                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Opción 2: Gestión de Comisión</p>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">Estado del Pago</label>
                                                            <select
                                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 font-bold text-xs outline-none focus:border-primary/40 transition-all appearance-none"
                                                                value={editingRegistro.commission_status || 'pending'}
                                                                onChange={e => {
                                                                    const val = e.target.value;
                                                                    setEditingRegistro({
                                                                        ...editingRegistro,
                                                                        commission_status: val,
                                                                        leader_paid_at: val === 'paid_to_leader' ? new Date().toISOString() : editingRegistro.leader_paid_at
                                                                    });
                                                                }}
                                                            >
                                                                <option value="pending" className="bg-navy">Pendiente</option>
                                                                <option value="paid_to_leader" className="bg-navy">Enviada a Líder 🚚</option>
                                                                <option value="completed" className="bg-navy">Confirmada por Vendedor ✅</option>
                                                            </select>
                                                        </div>
                                                        {editingRegistro.commission_status === 'paid_to_leader' && editingRegistro.leader_paid_at && (
                                                            <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                                                                <Clock size={14} className="text-amber-500" />
                                                                <p className="text-[9px] font-bold text-amber-200 uppercase tracking-tight">
                                                                    Pagado al líder el: {new Date(editingRegistro.leader_paid_at).toLocaleString()}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
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
            <AnimatePresence>
                {isCreateSellerModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-lg bg-navy rounded-[48px] border border-white/10 shadow-3xl overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                                <h3 className="text-2xl font-black uppercase italic tracking-tighter">Nuevo Vendedor Oficial</h3>
                                <button onClick={() => setIsCreateSellerModalOpen(false)} className="text-white/20 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleCreateSeller} className="p-10 space-y-8">
                                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex gap-3 shadow-inner">
                                    <Info className="text-primary flex-shrink-0" size={20} />
                                    <p className="text-primary text-[10px] font-bold leading-relaxed uppercase tracking-widest">
                                        🛑 ATENCIÓN: Solo usa esto para crear SOCIOS DIRECTOS. Los sub-vendedores deben ser creados por sus líderes.
                                    </p>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">Nombre Completo</label>
                                        <input
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-primary/40 transition-all"
                                            value={newSeller.nombre}
                                            onChange={e => setNewSeller({ ...newSeller, nombre: e.target.value })}
                                            placeholder="Ej: Abel Quiñonez"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">Email / WhatsApp</label>
                                        <input
                                            required
                                            type="email"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-primary/40 transition-all"
                                            value={newSeller.email}
                                            onChange={e => setNewSeller({ ...newSeller, email: e.target.value })}
                                            placeholder="vendedor@empresa.com"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="relative">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">Contraseña</label>
                                            <div className="relative">
                                                <input
                                                    required
                                                    type="text"
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-6 pr-20 py-4 font-bold outline-none focus:border-primary/40 transition-all font-mono"
                                                    value={newSeller.password}
                                                    onChange={e => setNewSeller({ ...newSeller, password: e.target.value })}
                                                    placeholder="••••"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={generatePassword}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-[8px] font-black uppercase tracking-widest transition-all"
                                                >
                                                    Generar
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">Comisión inicial (%)</label>
                                            <input
                                                required
                                                type="number"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-primary/40 transition-all"
                                                value={newSeller.comision_porcentaje}
                                                onChange={e => setNewSeller({ ...newSeller, comision_porcentaje: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    {nextSellerCode && (
                                        <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl flex justify-between items-center">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Código a asignar:</span>
                                            <span className="text-xl font-black text-primary italic italic tracking-tighter">{nextSellerCode}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateSellerModalOpen(false)}
                                        className="flex-1 px-8 py-4 rounded-2xl bg-white/5 font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isCreatingSeller}
                                        className="flex-1 px-8 py-4 rounded-2xl bg-primary shadow-orange font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all text-navy flex items-center justify-center gap-2"
                                    >
                                        {isCreatingSeller ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                                        {isCreatingSeller ? 'Guardando...' : 'Crear Vendedor'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal de Editar Vendedor */}
            <AnimatePresence>
                {isEditSellerModalOpen && editingSeller && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-lg bg-navy rounded-[48px] border border-white/10 shadow-3xl overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                                <h3 className="text-2xl font-black uppercase italic tracking-tighter">Editar Vendedor</h3>
                                <button onClick={() => setIsEditSellerModalOpen(false)} className="text-white/20 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={(e) => { e.preventDefault(); handleSaveSellerEdit(); }} className="p-10 space-y-8">
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">Nombre Completo</label>
                                        <input
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-primary/40 transition-all"
                                            value={editingSeller.nombre || ''}
                                            onChange={e => setEditingSeller({ ...editingSeller, nombre: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">Email</label>
                                        <input
                                            required
                                            type="email"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-primary/40 transition-all"
                                            value={editingSeller.email || ''}
                                            onChange={e => setEditingSeller({ ...editingSeller, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="relative">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">Nueva Contraseña</label>
                                            <input
                                                type="text"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-primary/40 transition-all font-mono"
                                                value={editingSeller.password || ''}
                                                onChange={e => setEditingSeller({ ...editingSeller, password: e.target.value })}
                                                placeholder="(Ignorar si no cambia)"
                                            />
                                            <p className="text-[8px] text-white/30 italic ml-2 mt-2">Déjalo vacío si no cambia</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">Comisión (%)</label>
                                            <input
                                                required
                                                type="number"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-primary/40 transition-all"
                                                value={editingSeller.comision_porcentaje || 0}
                                                onChange={e => setEditingSeller({ ...editingSeller, comision_porcentaje: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-4 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditSellerModalOpen(false)}
                                        className="flex-1 px-8 py-4 rounded-2xl bg-white/5 font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSavingSeller}
                                        className="flex-1 px-8 py-4 rounded-2xl bg-primary shadow-orange font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all text-navy flex items-center justify-center gap-2"
                                    >
                                        {isSavingSeller ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                                        {isSavingSeller ? 'Guardando...' : 'Guardar Cambios'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal de Migrar Equipo */}
            <AnimatePresence>
                {isMigrateModalOpen && migratingLeader && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-lg bg-navy rounded-[48px] border border-white/10 shadow-3xl overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                                <h3 className="text-2xl font-black uppercase italic tracking-tighter">Rescatar Equipo</h3>
                                <button onClick={() => setIsMigrateModalOpen(false)} className="text-white/20 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-10 space-y-8">
                                <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-3xl">
                                    <p className="text-sm text-amber-200">
                                        <span className="font-bold">{migratingLeader.nombre}</span> tiene <span className="font-bold">{migratingLeader.team_count} sub-vendedores</span> a su cargo.
                                        Para poder eliminar este líder, primero debes reasignar a su equipo.
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">Nuevo Líder de Destino</label>
                                        <select
                                            value={targetLeaderId}
                                            onChange={(e) => setTargetLeaderId(Number(e.target.value))}
                                            className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand font-bold text-white appearance-none"
                                        >
                                            <option value={0} className="bg-navy">Convertir en Oficiales (Admin)</option>
                                            {sellers
                                                .filter(s => s.id !== migratingLeader.id)
                                                .map(s => (
                                                    <option key={s.id} value={s.id} className="bg-navy">
                                                        {s.nombre}
                                                    </option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={() => setIsMigrateModalOpen(false)}
                                        className="flex-1 px-8 py-5 border border-white/10 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/5 transition-all text-white/40 hover:text-white"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleMigrateTeam}
                                        disabled={isMigratingTeam}
                                        className="flex-1 px-8 py-5 bg-brand rounded-2xl font-black uppercase tracking-widest text-xs text-white hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand/20 disabled:opacity-50"
                                    >
                                        {isMigratingTeam ? <RefreshCw size={14} className="animate-spin" /> : <Users size={14} />}
                                        {isMigratingTeam ? 'Migrando...' : 'Traspasar Equipo'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
