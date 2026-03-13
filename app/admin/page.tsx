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
    Settings,
    Landmark,
    CreditCard,
    TrendingUp,
    Smartphone,
    Store,
    Library,
    Plus
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Link from "next/link";
import StatsModal from "@/components/admin/StatsModal";
import VCardEditModal from "@/components/admin/VCardEditModal";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Utilidad para detectar URLs de marcador de posición o no válidas
const isPlaceholderUrl = (url: string | null | undefined) => {
    if (!url) return true;
    if (url.startsWith('data:image')) return false; // Base64 is not a placeholder
    const placeholders = [
        'photo.com', 'example.com', 'placeholder.com', 'placehold.co', 
        'placeholder.supabase.co', 'supabase.co/storage',
        '_default.png', 'hero_desktop_default', 'hero_mobile_default'
    ];
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
    const [generatingPdfId, setGeneratingPdfId] = useState<string | null>(null);

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
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
    const [isHeroPromptOpen, setIsHeroPromptOpen] = useState(false);
    const [promptRegistro, setPromptRegistro] = useState<any>(null);
    const [setupTarget, setSetupTarget] = useState<'view' | 'catalog'>('view');
    const [setupProducts, setSetupProducts] = useState<any[]>([
        { id: Date.now().toString(), categoria: '', titulo: '', descripcion: '', precio: '', url: '' }
    ]);

    // Estados para Catálogo
    const [isCatalogManagerOpen, setIsCatalogManagerOpen] = useState(false);
    const [catalogRegistro, setCatalogRegistro] = useState<any>(null);
    const [catalogItems, setCatalogItems] = useState<any[]>([]);
    const [newCatalogItem, setNewCatalogItem] = useState({ categoria: 'General', titulo: '', descripcion: '', precio: '' });
    const [catalogImageFile, setCatalogImageFile] = useState<File | null>(null);
    const [isSavingCatalog, setIsSavingCatalog] = useState(false);

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

    const handleDeleteRegistro = async (id: number, nombre: string) => {
        if (!confirm(`¿Estás seguro de eliminar permanentemente a ${nombre}? Esta acción borrara todos los datos asociados (incluyendo el slug) y no se puede deshacer.`)) return;

        const adminKey = localStorage.getItem('admin_access_key') || '';
        try {
            const res = await fetch(`/api/admin/registros?id=${id}`, {
                method: 'DELETE',
                headers: { 'x-admin-key': adminKey }
            });
            if (res.ok) {
                alert("Registro eliminado con éxito");
                fetchRegistros();
            } else {
                const data = await res.json();
                alert("Error: " + (data.error || "No se pudo eliminar el registro"));
            }
        } catch (err: any) {
            alert("Error: " + err.message);
        }
    };

    const handleDeleteSeller = async (id: number) => {
        const seller = sellers.find(s => s.id === id);
        if (!seller) return;

        // Siempre abrir el modal de rescate para asegurar que los clientes/visitas no queden huérfanos
        setMigratingLeader(seller);
        setIsMigrateModalOpen(true);
    };

    const handleMigrateAndConfirmDelete = async () => {
        if (!migratingLeader) return;

        if (targetLeaderId === 0) {
            alert("Para heredar clientes y mapas, debes seleccionar a un Socio o Vendedor Oficial. (Si eres tú mismo, selecciónate en la lista).");
            return;
        }

        if (!confirm(`¿Estás absolutamente seguro de ELIMINAR a ${migratingLeader.nombre} y TRANSFERIR permanentemente todo su portafolio al vendedor seleccionado?`)) return;

        setIsMigratingTeam(true);

        const adminKey = localStorage.getItem('admin_access_key') || '';
        try {
            const res = await fetch(`/api/admin/sellers?id=${migratingLeader.id}&targetLeaderId=${targetLeaderId}`, {
                method: 'DELETE',
                headers: { 'x-admin-key': adminKey }
            });

            const data = await res.json();
            if (res.ok) {
                alert(data.message || "Vendedor eliminado y portafolio heredado con éxito.");
                setIsMigrateModalOpen(false);
                setMigratingLeader(null);
                fetchSellers();
                fetchRegistros(); // Refrescar registros heredados
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

        // Ciclo: pending -> paid_to_leader -> completed -> pending
        let newStatus = '';
        if (currentStatus === 'pending') newStatus = 'paid_to_leader';
        else if (currentStatus === 'paid_to_leader') newStatus = 'completed';
        else if (currentStatus === 'completed') newStatus = 'pending';
        else newStatus = 'pending';

        const statusLabels: Record<string, string> = {
            'pending': 'PENDIENTE ⏳',
            'paid_to_leader': 'ENVIADO AL LÍDER 🚚',
            'completed': 'COMISIÓN PAGADA ✅'
        };

        if (!confirm(`¿Confirmas cambiar el estado a: ${statusLabels[newStatus]}?`)) return;

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

        let recalculatedNombre = editingRegistro.nombre;
        if (editingRegistro.tipo_perfil === 'negocio') {
            recalculatedNombre = editingRegistro.nombre_negocio || editingRegistro.nombre;
        } else if (editingRegistro.tipo_perfil === 'persona') {
            const combined = `${editingRegistro.nombres || ''} ${editingRegistro.apellidos || ''}`.trim();
            if (combined) recalculatedNombre = combined;
        }

        try {
            const res = await fetch('/api/admin/registros', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-key': adminKey
                },
                body: JSON.stringify({
                    id: editingRegistro.id,
                    nombre: recalculatedNombre,
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
                    // New fields
                    google_business: editingRegistro.google_business,
                    youtube: editingRegistro.youtube,
                    x: editingRegistro.x,
                    menu_digital: editingRegistro.menu_digital,
                    tipo_perfil: editingRegistro.tipo_perfil,
                    nombres: editingRegistro.nombres,
                    apellidos: editingRegistro.apellidos,
                    nombre_negocio: editingRegistro.nombre_negocio,
                    contacto_nombre: editingRegistro.contacto_nombre,
                    contacto_apellido: editingRegistro.contacto_apellido,
                    portada_desktop: editingRegistro.portada_desktop,
                    portada_movil: editingRegistro.portada_movil,
                    wifi_ssid: editingRegistro.wifi_ssid,
                    wifi_password: editingRegistro.wifi_password,
                    hero_button_text: editingRegistro.hero_button_text,
                })
            });
            const result = await res.json();
            if (res.ok) {
                setRegistros(prev => prev.map(r => r.id === editingRegistro.id ? { ...editingRegistro, nombre: recalculatedNombre } : r));
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
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);
            const uploadRes = await fetch('/api/upload', { method: 'POST', body: uploadFormData });
            if (!uploadRes.ok) throw new Error('Error subiendo foto al servidor');
            const { url: publicUrl } = await uploadRes.json();

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

    const handlePortadaUpload = async (e: React.ChangeEvent<HTMLInputElement>, tipo: 'portada_desktop' | 'portada_movil') => {
        const file = e.target.files?.[0];
        if (!file || !editingRegistro) return;

        setIsSaving(true);
        try {
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);
            const uploadRes = await fetch('/api/upload', { method: 'POST', body: uploadFormData });
            if (!uploadRes.ok) throw new Error(`Error subiendo ${tipo} al servidor`);
            const { url: publicUrl } = await uploadRes.json();

            setEditingRegistro({ ...editingRegistro, [tipo]: publicUrl });

            await fetch('/api/admin/registros', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-key': localStorage.getItem('admin_access_key') || ''
                },
                body: JSON.stringify({ id: editingRegistro.id, [tipo]: publicUrl })
            });

        } catch (err: any) {
            alert(`Error subiendo ${tipo}: ` + err.message);
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
                const uploadFormData = new FormData();
                uploadFormData.append('file', file);
                const uploadRes = await fetch('/api/upload', { method: 'POST', body: uploadFormData });
                if (!uploadRes.ok) throw new Error(`Error subiendo imagen #${i + 1} al servidor`);
                const { url: publicUrl } = await uploadRes.json();
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

    const handleViewProfile = (registro: any) => {
        // Si no tiene imágenes o son placeholders, abrir el modal de diseño
        if (isPlaceholderUrl(registro.portada_desktop) || isPlaceholderUrl(registro.portada_movil)) {
            setPromptRegistro(registro);
            setSetupTarget('view');
            setIsHeroPromptOpen(true);
        } else {
            window.open(`/card/${registro.slug || registro.id}`, '_blank');
        }
    };

    const handleCatalogSetup = (registro: any) => {
        const catItems = typeof registro.catalogo_json === 'string' ? JSON.parse(registro.catalogo_json || '[]') : (registro.catalogo_json || []);
        
        // Si el catálogo está vacío, SIEMPRE abrir el modal de setup rápido
        if (catItems.length === 0) {
            setPromptRegistro(registro);
            setSetupTarget('catalog');
            setIsHeroPromptOpen(true);
            return;
        }

        // Si ya tiene catálogo pero faltan imágenes hero, pedir eso
        if (isPlaceholderUrl(registro.portada_desktop) || isPlaceholderUrl(registro.portada_movil)) {
            setPromptRegistro(registro);
            setSetupTarget('catalog');
            setIsHeroPromptOpen(true);
        } else {
            window.open(`/catalog/${registro.slug || registro.id}`, '_blank');
        }
    };

    const openCatalogManager = (registro: any) => {
        setCatalogRegistro(registro);
        setCatalogItems(typeof registro.catalogo_json === 'string' ? JSON.parse(registro.catalogo_json || '[]') : (registro.catalogo_json || []));
        setIsCatalogManagerOpen(true);
    };

    const handleAddCatalogItem = async () => {
        if (!catalogRegistro || !catalogImageFile || !newCatalogItem.titulo) return;
        setIsSavingCatalog(true);

        try {
            // Subir imagen
            const fd = new FormData();
            fd.append('file', catalogImageFile);
            const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd });
            if (!uploadRes.ok) throw new Error('Error subiendo imagen del catálogo');
            const { url } = await uploadRes.json();

            const newItem = {
                id: Date.now().toString(),
                categoria: newCatalogItem.categoria || 'General',
                titulo: newCatalogItem.titulo,
                descripcion: newCatalogItem.descripcion,
                precio: newCatalogItem.precio,
                url
            };

            const updatedItems = [...catalogItems, newItem];
            setCatalogItems(updatedItems);

            // Guardar en JSON de Registro
            await fetch('/api/admin/registros', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-key': localStorage.getItem('admin_access_key') || ''
                },
                body: JSON.stringify({ id: catalogRegistro.id, catalogo_json: JSON.stringify(updatedItems) })
            });

            // Limpiar formulario
            setNewCatalogItem({ categoria: 'General', titulo: '', descripcion: '', precio: '' });
            setCatalogImageFile(null);
            fetchRegistros(); // Refrescar

        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsSavingCatalog(false);
        }
    };

    const handleDeleteCatalogItem = async (index: number) => {
        if (!catalogRegistro) return;
        const updatedItems = [...catalogItems];
        updatedItems.splice(index, 1);
        setCatalogItems(updatedItems);

        await fetch('/api/admin/registros', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-key': localStorage.getItem('admin_access_key') || ''
            },
            body: JSON.stringify({ id: catalogRegistro.id, catalogo_json: JSON.stringify(updatedItems) })
        });
        fetchRegistros();
    };


    const handleHeroUploadConfirm = async () => {
        if (!promptRegistro) return;
        
        // Si hay datos de catálogo en el setup rápido, guardarlos primero
        const productsToSave = setupProducts.filter(p => p.titulo.trim() || p.categoria.trim());
        
        if (productsToSave.length > 0) {
            // Aseguramos que tengan IDs válidos y valores por defecto
            const formattedProducts = productsToSave.map((p, idx) => ({
                id: p.id || (Date.now() + idx).toString(),
                categoria: p.categoria.trim() || 'General',
                titulo: p.titulo.trim() || `Producto ${idx + 1}`,
                descripcion: p.descripcion.trim(),
                precio: p.precio.trim(),
                url: p.url || '' 
            }));
            
            try {
                await fetch('/api/admin/registros', {
                    method: 'PATCH',
                    headers: { 
                        'Content-Type': 'application/json', 
                        'x-admin-key': localStorage.getItem('admin_access_key') || '' 
                    },
                    body: JSON.stringify({ 
                        id: promptRegistro.id, 
                        catalogo_json: JSON.stringify(formattedProducts) 
                    })
                });
            } catch (err) {
                console.error("Error saving initial catalog items", err);
            }
        }

        // Refresh registries to reflect new images
        fetchRegistros();
        setIsHeroPromptOpen(false);
        setSetupProducts([{ id: Date.now().toString(), categoria: '', titulo: '', descripcion: '', precio: '', url: '' }]);
        
        const path = setupTarget === 'catalog' ? 'catalog' : 'card';
        const suffix = setupTarget === 'catalog' ? '?setup=true' : '';
        
        // Open the profile/catalog after a short delay to ensure DB update is perceived
        setTimeout(() => {
            window.open(`/${path}/${promptRegistro.slug || promptRegistro.id}${suffix}`, '_blank');
        }, 500);
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

    const handleGenerateReviewPDF = async (registro: any) => {
        if (generatingPdfId) return;
        setGeneratingPdfId(registro.id);

        try {
            const res = await fetch('/api/admin/generate-review-pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-key': getAdminKey()
                },
                body: JSON.stringify({ id: registro.id })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Error generando PDF');
            }

            // Check WhatsApp status instead of downloading
            const waSent = res.headers.get('X-WhatsApp-Sent');
            if (waSent === 'true') {
                alert('✅ PDF generado y enviado por WhatsApp correctamente al cliente.');
            } else {
                const waError = res.headers.get('X-WhatsApp-Error') || '';
                alert(`⚠️ Error enviando WhatsApp: ${waError || 'Revise las variables de Evolution API'}`);
            }

        } catch (error: any) {
            console.error('Error generating PDF:', error);
            alert('❌ Error: ' + error.message);
        } finally {
            setGeneratingPdfId(null);
        }
    };

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

                    <div className="flex gap-4 items-center flex-wrap">
                        <Link
                            href="/admin/marketing"
                            className="bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 hover:scale-105 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(0,200,83,0.1)]"
                        >
                            <BarChart3 size={16} />
                            Marketing & Enablement
                        </Link>
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
                            onClick={() => setIsStatsModalOpen(true)}
                            className="bg-navy border border-primary/30 text-primary px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-navy transition-all flex items-center gap-2 shadow-lg shadow-primary/10"
                        >
                            <TrendingUp size={16} />
                            Estadísticas
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
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex flex-col truncate pr-4">
                                                                <span className="font-black text-xs uppercase tracking-tighter truncate">{s.nombre}</span>
                                                                <span className={cn(
                                                                    "text-[7px] font-black uppercase tracking-widest mt-0.5",
                                                                    s.parent_id ? "text-white/40" : "text-primary"
                                                                )}>
                                                                    {s.parent_id ? "— Asesor (Sub)" : "• Líder (Socio)"}
                                                                </span>
                                                            </div>
                                                            {s.terminos_aceptados_en ? (
                                                                <span className="text-[7px] bg-green-500/20 text-green-500 px-2 py-0.5 rounded font-black uppercase whitespace-nowrap" title={`Firmado el ${new Date(s.terminos_aceptados_en).toLocaleString()}`}>
                                                                    Firmado
                                                                </span>
                                                            ) : (
                                                                <span className="text-[7px] bg-red-500/20 text-red-500 px-2 py-0.5 rounded font-black uppercase whitespace-nowrap">
                                                                    Pendiente
                                                                </span>
                                                            )}
                                                        </div>
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

                {/* Datos Bancarios del Vendedor Seleccionado */}
                <AnimatePresence>
                    {sellerIdFilter && sellers.find(s => s.id === sellerIdFilter) && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mb-12"
                        >
                            <div className="bg-[#0A1229] border border-primary/20 rounded-[40px] p-8 sm:p-10 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                                    <Landmark size={80} className="text-primary" />
                                </div>

                                {(() => {
                                    const s = sellers.find(sel => sel.id === sellerIdFilter);
                                    if (!s) return null;

                                    return (
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-3 mb-6">
                                                <CreditCard className="text-primary" size={24} />
                                                <h3 className="text-xl font-black uppercase italic tracking-tighter">Datos Bancarios: {s.nombre}</h3>
                                            </div>

                                            {s.datos_bancarios_completados ? (
                                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                                        <p className="text-[8px] font-black uppercase tracking-widest text-white/30 mb-1">Banco</p>
                                                        <p className="text-sm font-bold text-white uppercase">{s.banco_nombre}</p>
                                                    </div>
                                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                                        <p className="text-[8px] font-black uppercase tracking-widest text-white/30 mb-1">Beneficiario</p>
                                                        <p className="text-sm font-bold text-white uppercase italic">{s.banco_beneficiario}</p>
                                                    </div>
                                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                                        <p className="text-[8px] font-black uppercase tracking-widest text-white/30 mb-1">Cédula</p>
                                                        <p className="text-sm font-bold text-white font-mono">{s.banco_cedula}</p>
                                                    </div>
                                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                                        <p className="text-[8px] font-black uppercase tracking-widest text-white/30 mb-1">N° Cuenta</p>
                                                        <p className="text-sm font-bold text-primary font-mono">{s.banco_numero_cuenta}</p>
                                                    </div>
                                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                                        <p className="text-[8px] font-black uppercase tracking-widest text-white/30 mb-1">Email</p>
                                                        <p className="text-sm font-bold text-white lowercase truncate">{s.banco_correo}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-4 p-6 bg-red-500/10 border border-red-500/20 rounded-3xl">
                                                    <ShieldAlert className="text-red-500 flex-shrink-0" />
                                                    <p className="text-sm font-bold text-red-500/80 uppercase tracking-tight">
                                                        Este vendedor aún no ha completado sus datos bancarios.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

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
                            {registros.length}
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
                                        const seller = sellers.find(s => s.id === r.seller_id);
                                        const percentage = seller ? parseFloat(seller.comision_porcentaje) : 0;
                                        const price = r.plan === 'pro' ? 20 : 10;
                                        return acc + (price * percentage / 100);
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
                                if ((r.status === 'pagado' || r.status === 'entregado') && r.seller_id && (r.commission_status === 'pending' || !r.commission_status)) {
                                    const seller = sellers.find(s => s.id === r.seller_id);
                                    const percentage = seller ? parseFloat(seller.comision_porcentaje) : 0;
                                    const price = r.plan === 'pro' ? 20 : 10;
                                    return acc + (price * percentage / 100);
                                }
                                return acc;
                            }, 0).toFixed(2)}
                        </p>
                        <p className="text-[10px] font-bold text-white/40 mt-2">
                            {registros.filter(r => r.seller_id && (r.commission_status === 'pending' || !r.commission_status) && (r.status === 'pagado' || r.status === 'entregado')).length} comisiones pendientes
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
                                if ((r.status === 'pagado' || r.status === 'entregado') && r.seller_id && (r.commission_status === 'paid_to_leader' || r.commission_status === 'completed')) {
                                    const seller = sellers.find(s => s.id === r.seller_id);
                                    const percentage = seller ? parseFloat(seller.comision_porcentaje) : 0;
                                    const price = r.plan === 'pro' ? 20 : 10;
                                    return acc + (price * percentage / 100);
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
                            Envío inmediato
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
                                    <th className="px-4 py-6">Usuario</th>
                                    <th className="px-4 py-6 uppercase">Plan</th>
                                    <th className="px-4 py-6">Comprobante</th>
                                    <th className="px-4 py-6">Vendedor</th>
                                    <th className="px-4 py-6 font-bold">Estado</th>
                                    <th className="px-4 py-6">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {filtered.map((r) => (
                                    <tr key={r.id} className="hover:bg-white/[0.02] transition-all group">
                                        <td className="px-4 py-6">
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
                                        <td className="px-4 py-6">
                                            <div className="flex flex-col gap-2">
                                                <span className={cn(
                                                    "px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest w-fit",
                                                    r.plan === 'pro' ? "bg-primary/20 text-primary" : "bg-white/10 text-white/40"
                                                )}>
                                                    {r.plan || 'basic'}
                                                </span>
                                                {r.menu_digital && (
                                                    <a
                                                        href={r.menu_digital}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[8px] font-black uppercase text-primary hover:underline flex items-center gap-1"
                                                    >
                                                        <FileText size={10} /> Ver Menú
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-6">
                                            {r.comprobante_url ? (
                                                <button
                                                    onClick={() => setSelectedReceipt(r.comprobante_url)}
                                                    className="group relative flex items-center justify-center p-1 bg-white/5 border border-white/10 rounded-xl hover:border-accent transition-all overflow-hidden"
                                                >
                                                    <div className="absolute inset-0 bg-accent/20 opacity-0 group-hover:opacity-100 flex items-center justify-center z-10 transition-all">
                                                        <Eye size={14} className="text-white" />
                                                    </div>
                                                    <img
                                                        src={r.comprobante_url}
                                                        alt="Comprobante"
                                                        className="h-10 w-10 object-cover rounded-lg group-hover:scale-110 transition-transform"
                                                    />
                                                </button>
                                            ) : (
                                                <span className="text-[8px] text-white/20 uppercase font-black italic tracking-widest">Sin archivo</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-6">
                                            {r.seller_id ? (
                                                <button
                                                    onClick={() => handleEditSeller(sellers.find(s => s.id === r.seller_id))}
                                                    className="flex flex-col items-start gap-1 p-2 rounded-xl border border-white/5 hover:bg-white/5 transition-all group/seller"
                                                >
                                                    <span className="text-[10px] font-black text-accent uppercase leading-tight tracking-widest flex items-center gap-2">
                                                        {r.sold_by_name?.includes(' ') ? (
                                                            <>
                                                                <ChevronRight size={10} className="text-white/20" />
                                                                <span>{r.sold_by_name?.split(' ')[0]}</span>
                                                            </>
                                                        ) : (
                                                            r.sold_by_name || `Socio #${r.seller_id}`
                                                        )}
                                                    </span>
                                                </button>
                                            ) : (
                                                <span className="text-[10px] text-white/20 uppercase font-black">Directo</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-6">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    <div className={cn(
                                                        "w-2 h-2 rounded-full",
                                                        r.status === 'pagado' ? "bg-accent" : r.status === 'entregado' ? "bg-green-500" : r.status === 'cancelado' ? "bg-red-500" : "bg-yellow-500"
                                                    )} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                                                        {r.status}
                                                    </span>
                                                </div>
                                                {r.status === 'pendiente' && (
                                                    <span className="text-[8px] font-bold text-white/30 uppercase tracking-tighter italic whitespace-nowrap">Esperando Pago</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-6">
                                            <div className="flex items-center gap-1.5">
                                                {/* Botón Enviar Email */}
                                                <button
                                                    onClick={() => sendVCardEmail(r)}
                                                    className="p-2 bg-green-500/20 text-green-500 rounded-xl hover:bg-green-500 hover:text-white transition-all shadow-lg shadow-green-500/10"
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
                                                        className="p-2 bg-blue-500/20 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-lg shadow-blue-500/10"
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
                                                        className="p-2 bg-red-500/10 text-red-500/40 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                                        title="Cancelar Registro"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                )}

                                                {/* Botón Eliminar Físico */}
                                                <button
                                                    onClick={() => handleDeleteRegistro(r.id, r.nombre)}
                                                    className="p-2 bg-red-500/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-500/30 shadow-lg shadow-red-500/10"
                                                    title="Eliminar Registro (Permanente)"
                                                >
                                                    <Trash2 size={18} />
                                                </button>

                                                {/* Botón Comisión (Socio) */}
                                                {r.seller_id && (
                                                    <button
                                                        onClick={() => updateCommissionStatus(r.id, r.commission_status)}
                                                        disabled={pendingIds.has(r.id)}
                                                        className={cn(
                                                            "p-2 rounded-xl transition-all shadow-lg",
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
                                                )}

                                                {/* Botón PDF Revisión */}
                                                <button
                                                    onClick={() => handleGenerateReviewPDF(r)}
                                                    disabled={generatingPdfId === r.id}
                                                    className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl hover:bg-indigo-500 hover:text-white transition-all shadow-lg shadow-indigo-500/10"
                                                    title="Generar PDF de Revisión y enviar por WhatsApp"
                                                >
                                                    {generatingPdfId === r.id ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
                                                </button>

                                                <button
                                                    onClick={() => handleEdit(r)}
                                                    className="p-2 bg-white/5 text-white/40 rounded-xl hover:bg-white/10 hover:text-white transition-all"
                                                    title="Editar vCard"
                                                >
                                                    <Edit size={18} />
                                                </button>

                                                <a
                                                    href={`/api/vcard/${r.slug || r.id}`}
                                                    download={`${r.slug || r.id}.vcf`}
                                                    className="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-navy transition-all shadow-lg shadow-primary/10"
                                                    title="Descargar vCard"
                                                >
                                                    <Download size={18} />
                                                </a>

                                                <button
                                                    onClick={() => handleViewProfile(r)}
                                                    className="p-2 bg-white/5 text-white/40 rounded-xl hover:bg-white/10 hover:text-white transition-all"
                                                    title="Ver Perfil"
                                                >
                                                    <Eye size={18} />
                                                </button>

                                                <button
                                                    onClick={() => handleCatalogSetup(r)}
                                                    className="p-2 bg-[#f66739]/10 text-[#f66739] rounded-xl hover:bg-[#f66739] hover:text-white transition-all shadow-lg shadow-[#f66739]/10"
                                                    title="Ver Catálogo / Productos"
                                                >
                                                    <Store size={18} />
                                                </button>

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
                    <VCardEditModal
                        isOpen={isEditModalOpen}
                        onClose={() => setIsEditModalOpen(false)}
                        registro={editingRegistro}
                        setRegistro={setEditingRegistro}
                        onSave={handleSaveEdit}
                        onPhotoUpload={handlePhotoUpload}
                        onPortadaUpload={handlePortadaUpload}
                        isSaving={isSaving}
                    />
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
                                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-red-400">Eliminar y Rescatar</h3>
                                <button onClick={() => setIsMigrateModalOpen(false)} className="text-white/20 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-10 space-y-8">
                                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl space-y-2">
                                    <p className="text-sm text-red-200">
                                        Estás a punto de eliminar a <span className="font-bold">{migratingLeader.nombre}</span> permanentemente.
                                    </p>
                                    <p className="text-sm text-red-200 opacity-80">
                                        Sus clientes activos, pines geográficos y equipo de venta (si los tiene) <strong>quedarán huérfanos</strong>. Para asegurarlos, elige al Socio que recibirá este portafolio:
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
                                            <option value={0} className="bg-navy">-- SELECCIONA A QUIÉN TRANSFERIR --</option>
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
                                        onClick={handleMigrateAndConfirmDelete}
                                        disabled={isMigratingTeam}
                                        className="flex-1 px-8 py-5 bg-red-600 rounded-2xl font-black uppercase tracking-widest text-xs text-white hover:bg-red-500 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 disabled:opacity-50"
                                    >
                                        {isMigratingTeam ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                        {isMigratingTeam ? 'Procesando...' : 'Traspasar y Eliminar'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {isHeroPromptOpen && promptRegistro && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity : 0, scale: 0.9 }}
                            className="w-full max-w-2xl bg-[#0A0B1E] border border-white/10 rounded-[48px] overflow-hidden shadow-3xl relative"
                        >
                            <button 
                                onClick={() => setIsHeroPromptOpen(false)}
                                className="absolute top-8 right-8 p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all text-white/40 hover:text-white z-50"
                            >
                                <X size={24} />
                            </button>
                            <div className="p-10 text-center">
                                <div className="w-20 h-20 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                                    {setupTarget === 'catalog' ? <Store size={40} /> : <ImageIcon size={40} />}
                                </div>
                                <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-4">
                                    {setupTarget === 'catalog' ? '¡Activación de Catálogo!' : '¡Diseño Premium Pendiente!'}
                                </h3>
                                <p className="text-white/60 text-sm mb-12 max-w-sm mx-auto leading-relaxed">
                                    {setupTarget === 'catalog' 
                                        ? `Configura la primera categoría y producto para activar el catálogo de `
                                        : `Para que la VCard de `}
                                    <span className="text-white font-bold">{promptRegistro.nombre}</span>
                                    {setupTarget === 'catalog' ? ` y asegúrate de que las imágenes luzcan profesionales.` : ` se vea profesional, necesitamos configurar las imágenes del Hero primero.`}
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Fondo Escritorio</p>
                                        <div className="aspect-video bg-white/5 rounded-[32px] border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden group relative">
                                            {promptRegistro.portada_desktop && !isPlaceholderUrl(promptRegistro.portada_desktop) ? (
                                                <img src={promptRegistro.portada_desktop} className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon size={32} className="text-white/10" />
                                            )}
                                            <label htmlFor="hero-desktop-upload" className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm z-10">
                                                <Upload size={20} className="text-white" />
                                            </label>
                                            <input 
                                                id="hero-desktop-upload"
                                                type="file" 
                                                className="hidden" 
                                                accept="image/*" 
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;
                                                    const formData = new FormData();
                                                    formData.append('file', file);
                                                    const res = await fetch('/api/upload', { method: 'POST', body: formData });
                                                    if (res.ok) {
                                                        const { url } = await res.json();
                                                        await fetch('/api/admin/registros', {
                                                            method: 'PATCH',
                                                            headers: { 'Content-Type': 'application/json', 'x-admin-key': localStorage.getItem('admin_access_key') || '' },
                                                            body: JSON.stringify({ id: promptRegistro.id, portada_desktop: url })
                                                        });
                                                        setPromptRegistro({...promptRegistro, portada_desktop: url});
                                                    }
                                                }} 
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Fondo Móvil</p>
                                        <div className="aspect-[9/16] h-32 mx-auto bg-white/5 rounded-3xl border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden group relative">
                                            {promptRegistro.portada_movil && !isPlaceholderUrl(promptRegistro.portada_movil) ? (
                                                <img src={promptRegistro.portada_movil} className="w-full h-full object-cover" />
                                            ) : (
                                                <Smartphone size={32} className="text-white/10" />
                                            )}
                                            <label htmlFor="hero-mobile-upload" className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm z-10">
                                                <Upload size={20} className="text-white" />
                                            </label>
                                            <input 
                                                id="hero-mobile-upload"
                                                type="file" 
                                                className="hidden" 
                                                accept="image/*" 
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;
                                                    const formData = new FormData();
                                                    formData.append('file', file);
                                                    const res = await fetch('/api/upload', { method: 'POST', body: formData });
                                                    if (res.ok) {
                                                        const { url } = await res.json();
                                                        await fetch('/api/admin/registros', {
                                                            method: 'PATCH',
                                                            headers: { 'Content-Type': 'application/json', 'x-admin-key': localStorage.getItem('admin_access_key') || '' },
                                                            body: JSON.stringify({ id: promptRegistro.id, portada_movil: url })
                                                        });
                                                        setPromptRegistro({...promptRegistro, portada_movil: url});
                                                    }
                                                }} 
                                            />
                                        </div>
                                    </div>
                                </div>

                                {setupTarget === 'catalog' && (
                                    <div className="mb-12 space-y-8">
                                        <div className="flex items-center justify-between px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(255,107,0,0.5)]" />
                                                <h4 className="text-[12px] font-black uppercase tracking-[0.2em] text-white">Configuración del Catálogo</h4>
                                            </div>
                                            <button 
                                                onClick={() => setSetupProducts([...setupProducts, { id: Date.now().toString(), categoria: '', titulo: '', descripcion: '', precio: '', url: '' }])}
                                                className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-xl transition-all border border-primary/20 group"
                                            >
                                                <Plus size={16} className="group-hover:scale-110 transition-transform" />
                                                <span className="text-[10px] font-black uppercase tracking-wider">Añadir Producto</span>
                                            </button>
                                        </div>

                                        <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                            {setupProducts.map((p, index) => (
                                                <div key={p.id} className="p-6 bg-white/5 rounded-[32px] border border-white/10 group relative transition-all hover:bg-white/[0.07] hover:border-primary/30">
                                                    {setupProducts.length > 1 && (
                                                        <button 
                                                            onClick={() => setSetupProducts(setupProducts.filter(item => item.id !== p.id))}
                                                            className="absolute -top-3 -right-3 w-8 h-8 bg-red-500/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100 z-20"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}

                                                    <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-8">
                                                        {/* Product Image Upload */}
                                                        <div className="space-y-3">
                                                            <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest px-1">Imagen</p>
                                                            <div className="aspect-square bg-[#1A1B3A] rounded-2xl border-2 border-dashed border-white/5 flex items-center justify-center overflow-hidden group relative transition-all hover:border-primary/30">
                                                                {p.url ? (
                                                                    <img src={p.url} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="text-center p-4">
                                                                        <Upload size={20} className="text-white/10 mx-auto mb-2" />
                                                                        <p className="text-[8px] font-bold text-white/20 uppercase">Subir</p>
                                                                    </div>
                                                                )}
                                                                <label htmlFor={`setup-product-image-${p.id}`} className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer backdrop-blur-[2px] z-10">
                                                                    <ImageIcon size={18} className="text-white" />
                                                                </label>
                                                                <input 
                                                                    id={`setup-product-image-${p.id}`}
                                                                    type="file" 
                                                                    className="hidden" 
                                                                    accept="image/*" 
                                                                    onChange={async (e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (!file) return;
                                                                        const formData = new FormData();
                                                                        formData.append('file', file);
                                                                        const res = await fetch('/api/upload', { method: 'POST', body: formData });
                                                                        if (res.ok) {
                                                                            const { url } = await res.json();
                                                                            const newProducts = [...setupProducts];
                                                                            newProducts[index].url = url;
                                                                            setSetupProducts(newProducts);
                                                                        }
                                                                    }} 
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Product Details Inputs */}
                                                        <div className="space-y-4">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div className="space-y-2 text-left">
                                                                    <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest px-2">Categoría</label>
                                                                    <input 
                                                                        type="text" 
                                                                        placeholder="Ej. Platos Fuertes"
                                                                        value={p.categoria}
                                                                        onChange={(e) => {
                                                                            const newProducts = [...setupProducts];
                                                                            newProducts[index].categoria = e.target.value;
                                                                            setSetupProducts(newProducts);
                                                                        }}
                                                                        className="w-full bg-[#1A1B3A] border border-white/5 rounded-2xl p-3 text-sm font-bold focus:border-primary/50 transition-all outline-none"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2 text-left">
                                                                    <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest px-2">Nombre del Producto</label>
                                                                    <input 
                                                                        type="text" 
                                                                        placeholder="Ej. Arroz con Pollo"
                                                                        value={p.titulo}
                                                                        onChange={(e) => {
                                                                            const newProducts = [...setupProducts];
                                                                            newProducts[index].titulo = e.target.value;
                                                                            setSetupProducts(newProducts);
                                                                        }}
                                                                        className="w-full bg-[#1A1B3A] border border-white/5 rounded-2xl p-3 text-sm font-bold focus:border-primary/50 transition-all outline-none"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-[1fr_120px] gap-4">
                                                                <div className="space-y-2 text-left">
                                                                    <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest px-2">Descripción Corta</label>
                                                                    <input 
                                                                        type="text" 
                                                                        placeholder="Detalles rápidos..."
                                                                        value={p.descripcion}
                                                                        onChange={(e) => {
                                                                            const newProducts = [...setupProducts];
                                                                            newProducts[index].descripcion = e.target.value;
                                                                            setSetupProducts(newProducts);
                                                                        }}
                                                                        className="w-full bg-[#1A1B3A] border border-white/5 rounded-2xl p-3 text-sm font-bold focus:border-primary/50 transition-all outline-none"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2 text-left">
                                                                    <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest px-2">Precio</label>
                                                                    <input 
                                                                        type="text" 
                                                                        placeholder="Ej. 15.00"
                                                                        value={p.precio}
                                                                        onChange={(e) => {
                                                                            const newProducts = [...setupProducts];
                                                                            newProducts[index].precio = e.target.value;
                                                                            setSetupProducts(newProducts);
                                                                        }}
                                                                        className="w-full bg-[#1A1B3A] border border-white/5 rounded-2xl p-3 text-sm font-bold focus:border-primary/50 transition-all outline-none text-primary"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        <div className="pt-4 px-4 flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                            <p className="text-[10px] font-medium text-white/40 uppercase tracking-[0.1em]">
                                                {setupProducts.length} producto(s) listo(s) para ser publicados en el catálogo.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col gap-4">
                                    <button
                                        onClick={handleHeroUploadConfirm}
                                        disabled={(!promptRegistro.portada_desktop || !isPlaceholderUrl(promptRegistro.portada_desktop)) && (!promptRegistro.portada_movil || !isPlaceholderUrl(promptRegistro.portada_movil)) ? false : (setupTarget === 'view')}
                                        className="w-full bg-primary text-navy py-5 rounded-[24px] font-black uppercase tracking-widest shadow-orange hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                                    >
                                        {setupTarget === 'catalog' ? 'Activar Catálogo y Continuar' : 'Guardar y Ver Perfil'}
                                    </button>
                                    <button
                                        onClick={() => setIsHeroPromptOpen(false)}
                                        className="w-full py-5 rounded-[24px] border border-white/10 text-white/40 font-black uppercase tracking-widest hover:bg-white/5 transition-all"
                                    >
                                        Ahora No
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <StatsModal
                isOpen={isStatsModalOpen}
                onClose={() => setIsStatsModalOpen(false)}
            />
        </div>
    );
}
