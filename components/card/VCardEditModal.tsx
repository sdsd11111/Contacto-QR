"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Download, Key, AlertCircle, CheckCircle, Loader2, Edit, Image as ImageIcon, Zap, Phone, User, ChevronDown, Store, Library, Plus, Trash2 } from 'lucide-react';
import { formatPhoneEcuador, cn } from '@/lib/utils';

interface VCardEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialSlug: string;
}

export default function VCardEditModal({ isOpen, onClose, initialSlug }: VCardEditModalProps) {
    const [step, setStep] = useState<'code' | 'edit' | 'success'>('code');
    const [editCode, setEditCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [userData, setUserData] = useState<any>(null);
    const [usesRemaining, setUsesRemaining] = useState(0);
    const [activeSection, setActiveSection] = useState<'perfil' | 'contacto' | 'hero' | 'portada' | 'catalogo' | 'code' | 'success' | null>('perfil');
    const [catalogTab, setCatalogTab] = useState<'config' | 'products'>('config');
    const [productCategoryFilter, setProductCategoryFilter] = useState<string>('Todas');

    const [formData, setFormData] = useState({
        tipo_perfil: 'persona' as 'persona' | 'negocio',
        nombres: '',
        apellidos: '',
        nombre_negocio: '',
        contacto_nombre: '',
        contacto_apellido: '',
        profession: '',
        company: '',
        whatsapp: '',
        email: '',
        bio: '',
        address: '',
        web: '',
        google_business: '',
        instagram: '',
        linkedin: '',
        facebook: '',
        tiktok: '',
        products: '',
        categories: '',
        menu_digital: '',
        youtube: '',
        x: '',
        wifi_ssid: '',
        wifi_password: '',
        foto_url: '',
        portada_desktop: '',
        portada_movil: '',
        hero_button_text: '',
        hero_action: 'wifi' as 'wifi' | 'file' | 'link',
        hero_file_url: '',
        hero_external_link: '',
        hero_wifi_steps: ['step1', 'step2', 'step3'] as string[],
        hero_section_title: 'Oferta del Hero',
        hero_step1_title: 'Descarga Nuestro Contacto',
        hero_step2_title: 'Asegurate de importar el contacto',
        hero_step2_text: '',
        hero_step3_title: 'Conéctate a la Red',
        hero_step3_text: '',
        catalogo_json: { categories: [], products: [] } as { categories: string[], products: any[] }
    });

    const validateCode = async () => {
        const cleanedCode = editCode.trim().replace(/\s/g, '');
        if (!cleanedCode) return;
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/edit/validate-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: cleanedCode })
            });
            const data = await res.json();

            if (res.ok) {
                // If the code is for a different slug, we should ideally check it
                // but for now we follow the same logic as the home portal
                setUserData(data.data);
                setUsesRemaining(data.usesRemaining);
                setFormData({
                    tipo_perfil: data.data.tipo_perfil || 'persona',
                    nombres: data.data.nombres || '',
                    apellidos: data.data.apellidos || '',
                    nombre_negocio: data.data.nombre_negocio || '',
                    contacto_nombre: data.data.contacto_nombre || '',
                    contacto_apellido: data.data.contacto_apellido || '',
                    profession: data.data.profession || '',
                    company: data.data.company || '',
                    whatsapp: data.data.whatsapp || '',
                    email: data.data.email || '',
                    bio: data.data.bio || '',
                    address: data.data.address || '',
                    web: data.data.web || '',
                    google_business: data.data.google_business || '',
                    instagram: data.data.instagram || '',
                    linkedin: data.data.linkedin || '',
                    facebook: data.data.facebook || '',
                    tiktok: data.data.tiktok || '',
                    products: data.data.products || '',
                    categories: data.data.categories || '',
                    menu_digital: data.data.menu_digital || '',
                    youtube: data.data.youtube || '',
                    x: data.data.x || '',
                    wifi_ssid: data.data.wifi_ssid || '',
                    wifi_password: data.data.wifi_password || '',
                    foto_url: '',
                    portada_desktop: data.data.portada_desktop || '', 
                    portada_movil: data.data.portada_movil || '',
                    hero_button_text: data.data.hero_button_text || '',
                    hero_action: data.data.hero_action || 'wifi',
                    hero_file_url: data.data.hero_file_url || '',
                    hero_external_link: data.data.hero_external_link || '',
                    hero_wifi_steps: data.data.hero_wifi_steps ? (typeof data.data.hero_wifi_steps === 'string' ? JSON.parse(data.data.hero_wifi_steps) : data.data.hero_wifi_steps) : ['step1', 'step2', 'step3'],
                    hero_section_title: data.data.hero_section_title || 'Oferta del Hero',
                    hero_step1_title: data.data.hero_step1_title || 'Descarga Nuestro Contacto',
                    hero_step2_title: data.data.hero_step2_title || 'Asegurate de importar el contacto',
                    hero_step2_text: data.data.hero_step2_text || '',
                    hero_step3_title: data.data.hero_step3_title || 'Conéctate a la Red',
                    hero_step3_text: data.data.hero_step3_text || '',
                    catalogo_json: (() => {
                        const raw = data.data.catalogo_json ? (typeof data.data.catalogo_json === 'string' ? JSON.parse(data.data.catalogo_json) : data.data.catalogo_json) : null;
                        if (!raw) return { categories: [], products: [] };
                        if (Array.isArray(raw)) return { categories: Array.from(new Set(raw.map((p:any) => p.categoria))).filter(Boolean), products: raw };
                        return raw;
                    })()
                });
                setStep('edit');
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!confirm('¿Estás seguro de guardar los cambios? Se descontará 1 uso de edición.')) return;

        const formattedData = {
            ...formData,
            whatsapp: formatPhoneEcuador(formData.whatsapp)
        };

        setLoading(true);
        try {
            const res = await fetch('/api/edit/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: editCode,
                    data: formattedData
                })
            });
            const result = await res.json();

            if (res.ok) {
                setStep('success');
            } else {
                alert(result.error);
            }
        } catch (err) {
            alert('Error al guardar cambios');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, field: 'foto_url' | 'portada_desktop' | 'portada_movil') => {
        const file = e.target.files?.[0];
        if (!file) return;
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        if (res.ok) {
            const { url } = await res.json();
            setFormData({ ...formData, [field]: url });
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="bg-primary p-6 flex justify-between items-center text-white shrink-0">
                        <div>
                            <h2 className="text-xl font-black uppercase italic tracking-tight flex items-center gap-2">
                                <Edit size={24} />
                                Configuración de VCard
                            </h2>
                            <p className="text-white/80 text-xs font-bold uppercase tracking-widest mt-1">
                                Edita Hero, WiFi y perfil directamente
                            </p>
                        </div>
                        <button onClick={onClose} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto grow">

                        {step === 'code' && (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                                    <Key size={40} className="text-primary" />
                                </div>
                                <h3 className="text-2xl font-black text-navy mb-2">Código de Edición Requerido</h3>
                                <p className="text-gray-500 mb-8 max-w-xs text-sm">
                                    Por seguridad, ingresa el código que recibiste por correo para editar este perfil.
                                </p>

                                <div className="w-full max-w-sm mb-4">
                                    <input
                                        type="text"
                                        value={editCode}
                                        onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                                        placeholder="RYA-XXXX"
                                        className="w-full text-center text-2xl font-black text-navy border-2 border-gray-200 rounded-xl p-4 uppercase focus:border-primary outline-none tracking-widest"
                                    />
                                    {error && (
                                        <p className="text-red-500 text-sm font-bold mt-2 flex items-center justify-center gap-1">
                                            <AlertCircle size={14} /> {error}
                                        </p>
                                    )}
                                </div>

                                <button
                                    onClick={validateCode}
                                    disabled={loading || editCode.length < 4}
                                    className="bg-navy text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-navy/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : 'Verificar y Entrar'}
                                </button>
                            </div>
                        )}

                        {step === 'edit' && userData && (
                            <div className="space-y-4">
                                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3 mb-6">
                                    <AlertCircle className="text-yellow-600 shrink-0 mt-0.5" size={20} />
                                    <div>
                                        <p className="text-sm text-yellow-800 font-bold">Modo Edición Activo</p>
                                        <p className="text-xs text-yellow-700 mt-1">
                                            Tienes <strong>{usesRemaining} ediciones restantes</strong>.
                                        </p>
                                    </div>
                                </div>

                                {/* ACORDEÓN DE SECCIONES */}
                                <div className="space-y-3">
                                    {/* SECCIÓN 1: DATOS DEL PERFIL */}
                                    <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                        <button 
                                            onClick={() => setActiveSection(activeSection === 'perfil' ? null : 'perfil')}
                                            className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                    <User size={18} />
                                                </div>
                                                <span className="font-black text-navy uppercase text-sm tracking-tighter">Datos del Perfil</span>
                                            </div>
                                            <ChevronDown size={20} className={cn("text-navy/30 transition-transform", activeSection === 'perfil' && "rotate-180")} />
                                        </button>
                                        <AnimatePresence>
                                            {activeSection === 'perfil' && (
                                                <motion.div 
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden bg-white border-t border-gray-100"
                                                >
                                                    <div className="p-6 space-y-6">
                                                        <div className="flex gap-6 items-center">
                                                            <div className="relative group w-20 h-20 shrink-0">
                                                                <div className="w-full h-full bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow-md">
                                                                    {formData.foto_url || userData.foto_url ? (
                                                                        <img src={formData.foto_url || userData.foto_url} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xl">?</div>
                                                                    )}
                                                                </div>
                                                                <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                                    <Edit size={16} className="text-white" />
                                                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, 'foto_url')} />
                                                                </label>
                                                            </div>
                                                            <div className="flex-1 space-y-3">
                                                                <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                                                                    {['persona', 'negocio'].map((t) => (
                                                                        <button key={t} onClick={() => setFormData({ ...formData, tipo_perfil: t as any })} className={cn("flex-1 py-1.5 rounded-md font-bold text-[10px] uppercase tracking-widest transition-all", formData.tipo_perfil === t ? "bg-white text-primary shadow-sm" : "text-gray-500")}>
                                                                            {t}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                                {formData.tipo_perfil === 'persona' ? (
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <input className="w-full border rounded-lg p-3 text-sm font-bold bg-gray-50" value={formData.nombres} onChange={(e) => setFormData({ ...formData, nombres: e.target.value })} placeholder="Nombres" />
                                                                        <input className="w-full border rounded-lg p-3 text-sm font-bold bg-gray-50" value={formData.apellidos} onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })} placeholder="Apellidos" />
                                                                    </div>
                                                                ) : (
                                                                    <input className="w-full border rounded-lg p-3 text-sm font-bold bg-gray-50" value={formData.nombre_negocio} onChange={(e) => setFormData({ ...formData, nombre_negocio: e.target.value })} placeholder="Nombre del Negocio" />
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-1">
                                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Profesión / Rubro</label>
                                                                <input className="w-full border rounded-lg p-3 text-sm font-bold bg-gray-50" value={formData.profession} onChange={(e) => setFormData({ ...formData, profession: e.target.value })} placeholder="Ej. Arquitecto" />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Empresa (Opcional)</label>
                                                                <input className="w-full border rounded-lg p-3 text-sm font-bold bg-gray-50" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} placeholder="Tu empresa" />
                                                            </div>
                                                            <div className="col-span-full space-y-1">
                                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sobre Mí / Bio</label>
                                                                <textarea className="w-full border rounded-lg p-3 text-sm font-medium bg-gray-50" rows={3} value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} placeholder="Cuéntales qué haces..." />
                                                            </div>
                                                            <div className="col-span-full space-y-1">
                                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Productos y Servicios</label>
                                                                <textarea className="w-full border rounded-lg p-3 text-sm font-medium bg-gray-50" rows={3} value={formData.products} onChange={(e) => setFormData({ ...formData, products: e.target.value })} placeholder="Lista tus servicios principales..." />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* SECCIÓN 2: CONTACTO Y REDES */}
                                    <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                        <button 
                                            onClick={() => setActiveSection(activeSection === 'contacto' ? null : 'contacto')}
                                            className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-[#25D366]/10 flex items-center justify-center text-[#25D366]">
                                                    <Phone size={18} />
                                                </div>
                                                <span className="font-black text-navy uppercase text-sm tracking-tighter">Contacto y Redes Sociales</span>
                                            </div>
                                            <ChevronDown size={20} className={cn("text-navy/30 transition-transform", activeSection === 'contacto' && "rotate-180")} />
                                        </button>
                                        <AnimatePresence>
                                            {activeSection === 'contacto' && (
                                                <motion.div 
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden bg-white border-t border-gray-100"
                                                >
                                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-black text-[#25D366] uppercase tracking-widest">WhatsApp</label>
                                                            <input className="w-full border rounded-lg p-3 text-sm font-bold bg-gray-50" value={formData.whatsapp} onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })} placeholder="+593..." />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Email</label>
                                                            <input className="w-full border rounded-lg p-3 text-sm font-bold bg-gray-50" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="email@ejemplo.com" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Instagram (Link)</label>
                                                            <input className="w-full border rounded-lg p-3 text-sm font-bold bg-gray-50" value={formData.instagram} onChange={(e) => setFormData({ ...formData, instagram: e.target.value })} placeholder="https://..." />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-black text-[#0077B5] uppercase tracking-widest">LinkedIn (Link)</label>
                                                            <input className="w-full border rounded-lg p-3 text-sm font-bold bg-gray-50" value={formData.linkedin} onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })} placeholder="https://..." />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-black text-black uppercase tracking-widest">TikTok (Link)</label>
                                                            <input className="w-full border rounded-lg p-3 text-sm font-bold bg-gray-50" value={formData.tiktok} onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })} placeholder="https://..." />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-black text-[#FF0000] uppercase tracking-widest">YouTube (Canal)</label>
                                                            <input className="w-full border rounded-lg p-3 text-sm font-bold bg-gray-50" value={formData.youtube} onChange={(e) => setFormData({ ...formData, youtube: e.target.value })} placeholder="https://..." />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Menú Digital (Link)</label>
                                                            <input className="w-full border rounded-lg p-3 text-sm font-bold bg-gray-50" value={formData.menu_digital} onChange={(e) => setFormData({ ...formData, menu_digital: e.target.value })} placeholder="https://..." />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-black text-primary uppercase tracking-widest">Sitio Web</label>
                                                            <input className="w-full border rounded-lg p-3 text-sm font-bold bg-gray-50" value={formData.web} onChange={(e) => setFormData({ ...formData, web: e.target.value })} placeholder="https://..." />
                                                        </div>
                                                        <div className="col-span-full space-y-1">
                                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dirección Física</label>
                                                            <input className="w-full border rounded-lg p-3 text-sm font-bold bg-gray-50" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Ej. Calle Principal #123" />
                                                        </div>
                                                        <div className="col-span-full space-y-1">
                                                            <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Google Business / Maps</label>
                                                            <input className="w-full border rounded-lg p-3 text-sm font-bold bg-gray-50" value={formData.google_business} onChange={(e) => setFormData({ ...formData, google_business: e.target.value })} placeholder="Link a Maps" />
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* SECCIÓN 3: OFERTA DEL HERO (BOTÓN PRINCIPAL) */}
                                    <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                        <button 
                                            onClick={() => setActiveSection(activeSection === 'hero' ? null : 'hero')}
                                            className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                                                    <Zap size={18} />
                                                </div>
                                                <span className="font-black text-navy uppercase text-sm tracking-tighter">Oferta del Hero (Botón Principal)</span>
                                            </div>
                                            <ChevronDown size={20} className={cn("text-navy/30 transition-transform", activeSection === 'hero' && "rotate-180")} />
                                        </button>
                                        <AnimatePresence>
                                            {activeSection === 'hero' && (
                                                <motion.div 
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden bg-white border-t border-gray-100"
                                                >
                                                    <div className="p-6 space-y-6">
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Título del Botón (Texto que verá el usuario)</label>
                                                            <input 
                                                                className="w-full border rounded-lg p-3 text-sm font-bold bg-gray-50" 
                                                                value={formData.hero_button_text} 
                                                                onChange={(e) => setFormData({ ...formData, hero_button_text: e.target.value })} 
                                                                placeholder="Ej. DIA DE LA MUJER, ACCEDER WIFI, etc." 
                                                            />
                                                        </div>

                                                        <div className="space-y-4">
                                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Acción al hacer clic</label>
                                                            <div className="grid grid-cols-3 gap-2">
                                                                {[
                                                                    { id: 'wifi', label: 'Conexión WiFi', icon: <Zap size={14} /> },
                                                                    { id: 'file', label: 'Descargar Archivo', icon: <Download size={14} /> },
                                                                    { id: 'link', label: 'Abrir Enlace', icon: <Zap size={14} /> }
                                                                ].map((action) => (
                                                                    <button
                                                                        key={action.id}
                                                                        onClick={() => setFormData({ ...formData, hero_action: action.id as any })}
                                                                        className={cn(
                                                                            "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all gap-2",
                                                                            formData.hero_action === action.id 
                                                                                ? "border-primary bg-primary/5 text-primary" 
                                                                                : "border-gray-100 text-gray-400 hover:border-gray-200"
                                                                        )}
                                                                    >
                                                                        {action.icon}
                                                                        <span className="text-[9px] font-black uppercase tracking-tight">{action.label}</span>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="space-y-4">
                                                            <div className="space-y-1">
                                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Título de la Sección de Pasos</label>
                                                                <input 
                                                                    className="w-full border rounded-lg p-3 text-sm font-bold bg-gray-50" 
                                                                    value={formData.hero_section_title} 
                                                                    onChange={(e) => setFormData({ ...formData, hero_section_title: e.target.value })} 
                                                                    placeholder="Ej. Configuración WiFi, Oferta Especial, etc." 
                                                                />
                                                            </div>
                                                        </div>

                                                        {formData.hero_action === 'wifi' && (
                                                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-6">
                                                                <div className="space-y-4 pb-4 border-b border-gray-200">
                                                                    <h5 className="text-[10px] font-black text-navy uppercase tracking-widest">Datos de WiFi (Si aplica)</h5>
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                        <input className="w-full border rounded-lg p-2 text-sm font-bold" value={formData.wifi_ssid} onChange={(e) => setFormData({ ...formData, wifi_ssid: e.target.value })} placeholder="SSID (Nombre Red)" />
                                                                        <input className="w-full border rounded-lg p-2 text-sm font-bold" value={formData.wifi_password} onChange={(e) => setFormData({ ...formData, wifi_password: e.target.value })} placeholder="Contraseña" />
                                                                    </div>
                                                                </div>

                                                                <div className="space-y-6">
                                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Configuración de Pasos:</p>
                                                                    
                                                                    {/* Paso 1 */}
                                                                    <div className="space-y-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                                            <input 
                                                                                type="checkbox" 
                                                                                checked={formData.hero_wifi_steps.includes('step1')} 
                                                                                onChange={(e) => {
                                                                                    const steps = e.target.checked 
                                                                                        ? [...formData.hero_wifi_steps, 'step1']
                                                                                        : formData.hero_wifi_steps.filter(s => s !== 'step1');
                                                                                    setFormData({ ...formData, hero_wifi_steps: steps });
                                                                                }}
                                                                                className="rounded border-gray-300 text-primary w-4 h-4"
                                                                            />
                                                                            <span className="text-[11px] font-black text-navy uppercase">Mostrar Paso 1</span>
                                                                        </label>
                                                                        <input 
                                                                            className="w-full border rounded-lg p-2 text-xs font-bold bg-gray-50" 
                                                                            value={formData.hero_step1_title} 
                                                                            onChange={(e) => setFormData({ ...formData, hero_step1_title: e.target.value })} 
                                                                            placeholder="Título Paso 1" 
                                                                        />
                                                                    </div>

                                                                    {/* Paso 2 */}
                                                                    <div className="space-y-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                                            <input 
                                                                                type="checkbox" 
                                                                                checked={formData.hero_wifi_steps.includes('step2')} 
                                                                                onChange={(e) => {
                                                                                    const steps = e.target.checked 
                                                                                        ? [...formData.hero_wifi_steps, 'step2']
                                                                                        : formData.hero_wifi_steps.filter(s => s !== 'step2');
                                                                                    setFormData({ ...formData, hero_wifi_steps: steps });
                                                                                }}
                                                                                className="rounded border-gray-300 text-primary w-4 h-4"
                                                                            />
                                                                            <span className="text-[11px] font-black text-navy uppercase">Mostrar Paso 2</span>
                                                                        </label>
                                                                        <input 
                                                                            className="w-full border rounded-lg p-2 text-xs font-bold bg-gray-50" 
                                                                            value={formData.hero_step2_title} 
                                                                            onChange={(e) => setFormData({ ...formData, hero_step2_title: e.target.value })} 
                                                                            placeholder="Título Paso 2" 
                                                                        />
                                                                        <textarea 
                                                                            className="w-full border rounded-lg p-2 text-xs font-medium bg-gray-50" 
                                                                            rows={2}
                                                                            value={formData.hero_step2_text} 
                                                                            onChange={(e) => setFormData({ ...formData, hero_step2_text: e.target.value })} 
                                                                            placeholder="Texto descriptivo para el paso 2..." 
                                                                        />
                                                                    </div>

                                                                    {/* Paso 3 */}
                                                                    <div className="space-y-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                                            <input 
                                                                                type="checkbox" 
                                                                                checked={formData.hero_wifi_steps.includes('step3')} 
                                                                                onChange={(e) => {
                                                                                    const steps = e.target.checked 
                                                                                        ? [...formData.hero_wifi_steps, 'step3']
                                                                                        : formData.hero_wifi_steps.filter(s => s !== 'step3');
                                                                                    setFormData({ ...formData, hero_wifi_steps: steps });
                                                                                }}
                                                                                className="rounded border-gray-300 text-primary w-4 h-4"
                                                                            />
                                                                            <span className="text-[11px] font-black text-navy uppercase">Mostrar Paso 3</span>
                                                                        </label>
                                                                        <input 
                                                                            className="w-full border rounded-lg p-2 text-xs font-bold bg-gray-50" 
                                                                            value={formData.hero_step3_title} 
                                                                            onChange={(e) => setFormData({ ...formData, hero_step3_title: e.target.value })} 
                                                                            placeholder="Título Paso 3" 
                                                                        />
                                                                        <textarea 
                                                                            className="w-full border rounded-lg p-2 text-xs font-medium bg-gray-50" 
                                                                            rows={2}
                                                                            value={formData.hero_step3_text} 
                                                                            onChange={(e) => setFormData({ ...formData, hero_step3_text: e.target.value })} 
                                                                            placeholder="Texto descriptivo para el paso 3..." 
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {formData.hero_action === 'file' && (
                                                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
                                                                <h5 className="text-[10px] font-black text-navy uppercase tracking-widest mb-2">Archivo para Descargar (PDF, VCF, etc.)</h5>
                                                                <div className="flex items-center gap-4">
                                                                    {formData.hero_file_url ? (
                                                                        <div className="flex-1 p-3 bg-white border rounded-xl flex items-center justify-between">
                                                                            <span className="text-xs font-bold text-navy truncate max-w-[200px]">{formData.hero_file_url.split('/').pop()}</span>
                                                                            <button onClick={() => setFormData({ ...formData, hero_file_url: '' })} className="text-red-500 hover:text-red-700">
                                                                                <X size={16} />
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <label className="flex-1 p-4 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                                                                            <Download className="text-gray-300 group-hover:text-primary mb-2" size={24} />
                                                                            <span className="text-[10px] font-bold text-gray-400">Clic para subir archivo</span>
                                                                            <input type="file" accept=".pdf,.vcf,.jpg,.png" className="hidden" onChange={async (e) => {
                                                                                const file = e.target.files?.[0];
                                                                                if (file) {
                                                                                    // Subir archivo (podemos reusar la lógica de handleImageChange pero adaptada o usar base64 para prototipo)
                                                                                    const reader = new FileReader();
                                                                                    reader.onloadend = () => {
                                                                                        setFormData({ ...formData, hero_file_url: reader.result as string });
                                                                                    };
                                                                                    reader.readAsDataURL(file);
                                                                                }
                                                                            }} />
                                                                        </label>
                                                                    )}
                                                                </div>
                                                                <p className="text-[9px] text-gray-400">Este archivo se descargará automáticamente cuando el usuario pulse el botón principal.</p>
                                                            </div>
                                                        )}

                                                        {formData.hero_action === 'link' && (
                                                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
                                                                <h5 className="text-[10px] font-black text-navy uppercase tracking-widest mb-2">Enlace Externo</h5>
                                                                <input 
                                                                    className="w-full border rounded-lg p-3 text-sm font-bold bg-white" 
                                                                    value={formData.hero_external_link} 
                                                                    onChange={(e) => setFormData({ ...formData, hero_external_link: e.target.value })} 
                                                                    placeholder="https://drive.google.com/..." 
                                                                />
                                                                <p className="text-[9px] text-gray-400">Se abrirá este enlace en una nueva pestaña (útil para menús en Drive, catálogos externos, etc.).</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* SECCIÓN 4: IMÁGENES DE PORTADA */}
                                    <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                        <button 
                                            onClick={() => setActiveSection(activeSection === 'portada' ? null : 'portada')}
                                            className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                    <ImageIcon size={18} />
                                                </div>
                                                <span className="font-black text-navy uppercase text-sm tracking-tighter">Imágenes de Portada</span>
                                            </div>
                                            <ChevronDown size={20} className={cn("text-navy/30 transition-transform", activeSection === 'portada' && "rotate-180")} />
                                        </button>
                                        <AnimatePresence>
                                            {activeSection === 'portada' && (
                                                <motion.div 
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden bg-white border-t border-gray-100"
                                                >
                                                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Escritorio (1920x1080)</label>
                                                            <div className="relative aspect-video bg-gray-50 rounded-xl overflow-hidden border-2 border-dashed border-gray-200 group">
                                                                {formData.portada_desktop || userData.portada_desktop ? (
                                                                    <img src={formData.portada_desktop || userData.portada_desktop} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 p-4 text-center">
                                                                        <ImageIcon size={32} className="mb-2" />
                                                                        <span className="text-[10px] font-bold">Sin Imagen</span>
                                                                    </div>
                                                                )}
                                                                <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity cursor-pointer text-white">
                                                                    <Edit size={24} className="mb-1" />
                                                                    <span className="text-[10px] font-black uppercase">Cambiar</span>
                                                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, 'portada_desktop')} />
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Móvil (Vertical)</label>
                                                            <div className="relative aspect-[9/16] h-48 mx-auto bg-gray-50 rounded-xl overflow-hidden border-2 border-dashed border-gray-200 group">
                                                                {formData.portada_movil || userData.portada_movil ? (
                                                                    <img src={formData.portada_movil || userData.portada_movil} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 p-4 text-center">
                                                                        <ImageIcon size={32} className="mb-2" />
                                                                        <span className="text-[10px] font-bold">Sin Imagen</span>
                                                                    </div>
                                                                )}
                                                                <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity cursor-pointer text-white text-center p-4">
                                                                    <Edit size={24} className="mb-1" />
                                                                    <span className="text-[10px] font-black uppercase">Cambiar</span>
                                                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, 'portada_movil')} />
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* SECCIÓN 5: GESTIÓN DE CATÁLOGO */}
                                    <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                        <button 
                                            onClick={() => setActiveSection(activeSection === 'catalogo' ? null : 'catalogo')}
                                            className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                                                    <Store size={18} />
                                                </div>
                                                <span className="font-black text-navy uppercase text-sm tracking-tighter">Catálogo de Productos</span>
                                            </div>
                                            <ChevronDown size={20} className={cn("text-navy/30 transition-transform", activeSection === 'catalogo' && "rotate-180")} />
                                        </button>
                                        <AnimatePresence>
                                            {activeSection === 'catalogo' && (
                                                <motion.div 
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden bg-white border-t border-gray-100"
                                                >
                                                    <div className="p-6 space-y-6">
                                                        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-4">
                                                            <button 
                                                                type="button"
                                                                onClick={() => setCatalogTab('config')}
                                                                className={cn("flex-1 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all", catalogTab === 'config' ? "bg-white text-orange-500 shadow-sm" : "text-gray-500")}
                                                            >
                                                                <Library size={14} className="inline mr-1" /> Categorías
                                                            </button>
                                                            <button 
                                                                type="button"
                                                                onClick={() => setCatalogTab('products')}
                                                                className={cn("flex-1 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all", catalogTab === 'products' ? "bg-white text-orange-500 shadow-sm" : "text-gray-500")}
                                                            >
                                                                <Store size={14} className="inline mr-1" /> Productos
                                                            </button>
                                                        </div>

                                                        {/* CATEGORIES CONFIG */}
                                                        {catalogTab === 'config' && (
                                                            <div className="space-y-4">
                                                                <div className="flex items-center justify-between">
                                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Títulos de Categorías</label>
                                                                    <button 
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const cat = prompt('Nombre de la nueva categoría:');
                                                                            if (cat) {
                                                                                const newCats = [...formData.catalogo_json.categories, cat];
                                                                                setFormData({ ...formData, catalogo_json: { ...formData.catalogo_json, categories: newCats } });
                                                                            }
                                                                        }}
                                                                        className="text-[10px] font-black text-orange-500 uppercase flex items-center gap-1 hover:underline"
                                                                    >
                                                                        <Plus size={12} /> Nueva Categoría
                                                                    </button>
                                                                </div>
                                                                
                                                                <div className="flex flex-wrap gap-2">
                                                                    {formData.catalogo_json.categories.map((cat: string, idx: number) => (
                                                                        <div key={idx} className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full group">
                                                                            <span className="text-[10px] font-bold text-navy uppercase">{cat}</span>
                                                                            <button 
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    const newCats = formData.catalogo_json.categories.filter((_:any, i:number) => i !== idx);
                                                                                    setFormData({ ...formData, catalogo_json: { ...formData.catalogo_json, categories: newCats } });
                                                                                }}
                                                                                className="text-red-400 hover:text-red-600 transition-colors"
                                                                            >
                                                                                <X size={10} />
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                    {formData.catalogo_json.categories.length === 0 && (
                                                                        <p className="text-[10px] text-gray-400 italic">No has definido categorías para tu catálogo aún.</p>
                                                                    )}
                                                                </div>
                                                                <p className="text-[9px] text-gray-400">Estas categorías servirán para filtrar tus productos en la vista pública.</p>
                                                            </div>
                                                        )}

                                                        {/* PRODUCTS MANAGEMENT */}
                                                        {catalogTab === 'products' && (
                                                            <div className="space-y-6">
                                                                <div className="flex flex-col gap-4">
                                                                    <div className="flex items-center justify-between">
                                                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Gestión de Productos</label>
                                                                        <button 
                                                                            type="button"
                                                                            onClick={() => {
                                                                                const firstCat = productCategoryFilter !== 'Todas' ? productCategoryFilter : (formData.catalogo_json.categories[0] || 'General');
                                                                                const newProduct = { 
                                                                                    id: Math.random().toString(36).substr(2, 9),
                                                                                    categoria: firstCat, 
                                                                                    titulo: 'Nuevo Producto', 
                                                                                    descripcion: '', 
                                                                                    precio: '', 
                                                                                    url: '' 
                                                                                };
                                                                                setFormData({ 
                                                                                    ...formData, 
                                                                                    catalogo_json: { 
                                                                                        ...formData.catalogo_json, 
                                                                                        products: [...formData.catalogo_json.products, newProduct] 
                                                                                    } 
                                                                                });
                                                                            }}
                                                                            className="bg-orange-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all hover:-translate-y-0.5"
                                                                        >
                                                                            <Plus size={14} /> Agregar Producto
                                                                        </button>
                                                                    </div>
                                                                    
                                                                    {/* Category Filter for Admin */}
                                                                    <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setProductCategoryFilter('Todas')}
                                                                            className={cn("shrink-0 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all", productCategoryFilter === 'Todas' ? "bg-navy text-white" : "bg-gray-100 text-gray-500")}
                                                                        >
                                                                            Todas
                                                                        </button>
                                                                        {formData.catalogo_json.categories.map((cat: string) => (
                                                                            <button
                                                                                key={cat}
                                                                                type="button"
                                                                                onClick={() => setProductCategoryFilter(cat)}
                                                                                className={cn("shrink-0 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all", productCategoryFilter === cat ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-500")}
                                                                            >
                                                                                {cat}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                                                    {formData.catalogo_json.products
                                                                        .filter((p: any) => productCategoryFilter === 'Todas' || p.categoria === productCategoryFilter)
                                                                        .map((item: any, idx: number) => (
                                                                        <div key={item.id || idx} className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative group">
                                                                            <button 
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    const newList = formData.catalogo_json.products.filter((_:any, i:number) => i !== idx);
                                                                                    setFormData({ 
                                                                                        ...formData, 
                                                                                        catalogo_json: { 
                                                                                            ...formData.catalogo_json, 
                                                                                            products: formData.catalogo_json.products.filter((p: any) => p.id !== item.id) 
                                                                                        } 
                                                                                    });
                                                                                }}
                                                                                className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                                                                            >
                                                                                <Trash2 size={12} />
                                                                            </button>
                                                                            
                                                                            <div className="flex flex-col sm:flex-row gap-6">
                                                                                <div className="w-full sm:w-1/3">
                                                                                    <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 group/img">
                                                                                        {item.url ? (
                                                                                            <img src={item.url} className="w-full h-full object-cover" />
                                                                                        ) : (
                                                                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 p-4 text-center">
                                                                                                <ImageIcon size={24} className="mb-2" />
                                                                                                <span className="text-[10px] font-bold">Imagen</span>
                                                                                            </div>
                                                                                        )}
                                                                                        <label className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-white">
                                                                                            <Edit size={20} className="mb-1" />
                                                                                            <span className="text-[10px] font-black uppercase">Subir</span>
                                                                                            <input 
                                                                                                type="file" 
                                                                                                accept="image/*" 
                                                                                                className="hidden" 
                                                                                                onChange={async (e) => {
                                                                                                    const file = e.target.files?.[0];
                                                                                                    if (file) {
                                                                                                        setLoading(true);
                                                                                                        const fd = new FormData();
                                                                                                        fd.append('file', file);
                                                                                                        const res = await fetch('/api/upload', { method: 'POST', body: fd });
                                                                                                        if (res.ok) {
                                                                                                            const { url } = await res.json();
                                                                                                            const newList = [...formData.catalogo_json.products];
                                                                                                            newList[idx].url = url;
                                                                                                            setFormData({ ...formData, catalogo_json: { ...formData.catalogo_json, products: newList } });
                                                                                                        }
                                                                                                        setLoading(false);
                                                                                                    }
                                                                                                }} 
                                                                                            />
                                                                                        </label>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex-1 space-y-3">
                                                                                    <div className="grid grid-cols-2 gap-3">
                                                                                        <div className="space-y-1">
                                                                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Categoría</label>
                                                                                            <select 
                                                                                                className="w-full text-[11px] font-bold border-none bg-gray-50 rounded-xl p-2.5 focus:ring-2 focus:ring-orange-500/20"
                                                                                                value={item.categoria}
                                                                                                onChange={(e) => {
                                                                                                    const newList = [...formData.catalogo_json.products];
                                                                                                    newList[idx].categoria = e.target.value;
                                                                                                    setFormData({ ...formData, catalogo_json: { ...formData.catalogo_json, products: newList } });
                                                                                                }}
                                                                                            >
                                                                                                {formData.catalogo_json.categories.length > 0 ? (
                                                                                                    formData.catalogo_json.categories.map((cat:string) => (
                                                                                                        <option key={cat} value={cat}>{cat}</option>
                                                                                                    ))
                                                                                                ) : (
                                                                                                    <option value="General">General</option>
                                                                                                )}
                                                                                            </select>
                                                                                        </div>
                                                                                        <div className="space-y-1">
                                                                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Precio</label>
                                                                                            <input 
                                                                                                className="w-full text-[11px] font-bold border-none bg-gray-50 rounded-xl p-2.5 focus:ring-2 focus:ring-orange-500/20"
                                                                                                placeholder="Ej: $10.00"
                                                                                                value={item.precio}
                                                                                                onChange={(e) => {
                                                                                                    const newList = [...formData.catalogo_json.products];
                                                                                                    newList[idx].precio = e.target.value;
                                                                                                    setFormData({ ...formData, catalogo_json: { ...formData.catalogo_json, products: newList } });
                                                                                                }}
                                                                                            />
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="space-y-1">
                                                                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Título del Producto</label>
                                                                                        <input 
                                                                                            className="w-full text-xs font-black border-none bg-gray-50 rounded-xl p-3 focus:ring-2 focus:ring-orange-500/20 uppercase"
                                                                                            placeholder="Ej: Hamburguesa de la Casa"
                                                                                            value={item.titulo}
                                                                                            onChange={(e) => {
                                                                                                const newList = [...formData.catalogo_json.products];
                                                                                                newList[idx].titulo = e.target.value;
                                                                                                setFormData({ ...formData, catalogo_json: { ...formData.catalogo_json, products: newList } });
                                                                                            }}
                                                                                        />
                                                                                    </div>
                                                                                    <div className="space-y-1">
                                                                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Descripción</label>
                                                                                        <textarea 
                                                                                            className="w-full text-[11px] font-medium border-none bg-gray-50 rounded-xl p-3 focus:ring-2 focus:ring-orange-500/20"
                                                                                            placeholder="Escribe los ingredientes o detalles aquí..."
                                                                                            rows={2}
                                                                                            value={item.descripcion}
                                                                                            onChange={(e) => {
                                                                                                const newList = [...formData.catalogo_json.products];
                                                                                                newList[idx].descripcion = e.target.value;
                                                                                                setFormData({ ...formData, catalogo_json: { ...formData.catalogo_json, products: newList } });
                                                                                            }}
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                    {formData.catalogo_json.products.length === 0 && (
                                                                        <div className="py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                                                                            <Store className="mx-auto mb-4 text-gray-300" size={48} />
                                                                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Aún no has agregado productos</p>
                                                                            <p className="text-[10px] text-gray-300 mt-2">Haz clic en "Agregar Producto" para comenzar</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 'success' && (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600">
                                    <CheckCircle size={40} />
                                </div>
                                <h3 className="text-2xl font-black text-navy mb-2">¡VCard Actualizada!</h3>
                                <p className="text-gray-500 mb-8 max-w-xs text-sm">
                                    Los cambios ya están en línea. Recarga la página para ver el nuevo diseño de tu Hero y datos.
                                </p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="bg-primary text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                                >
                                    Ver Cambios Ahora
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    {step === 'edit' && (
                        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3 shrink-0">
                            <button onClick={onClose} className="px-6 py-2 rounded-xl border border-gray-300 font-bold text-gray-500 hover:bg-gray-100 transition-colors uppercase text-xs">
                                Cancelar
                            </button>
                            <button onClick={handleSave} disabled={loading} className="px-6 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors uppercase text-xs flex items-center gap-2">
                                {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                Guardar Perfil
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
