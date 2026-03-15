"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Download, Key, AlertCircle, CheckCircle, Loader2, Edit, Image as ImageIcon, Zap, Phone, User, ChevronDown, Store, Library, Plus, Trash2 } from 'lucide-react';
import { formatPhoneEcuador, cn } from '@/lib/utils';

interface VCardEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialSlug: string;
    allowCatalog?: boolean;
    initialSection?: 'perfil' | 'contacto' | 'hero' | 'portada' | 'catalogo';
    isSetup?: boolean;
}

export default function VCardEditModal({ 
    isOpen, 
    onClose, 
    initialSlug, 
    allowCatalog = false,
    initialSection = 'perfil',
    isSetup = false
}: VCardEditModalProps) {
    const [step, setStep] = useState<'code' | 'edit' | 'success'>('code');
    const [editCode, setEditCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [userData, setUserData] = useState<any>(null);
    const [usesRemaining, setUsesRemaining] = useState(0);
    const [activeSection, setActiveSection] = useState<'perfil' | 'contacto' | 'hero' | 'portada' | 'catalogo' | 'code' | 'success' | null>(initialSection);
    const [catalogTab, setCatalogTab] = useState<'config' | 'products'>('config');
    const [productCategoryFilter, setProductCategoryFilter] = useState<string>('Todas');

    // Load code from localStorage on mount
    useEffect(() => {
        const savedCode = localStorage.getItem('rya_edit_code_biz');
        if (savedCode) {
            setEditCode(savedCode);
        }
    }, []);

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
        youtube_video_url: '',
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
        etiquetas: '',
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
                localStorage.setItem('rya_edit_code_biz', cleanedCode);
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
                    youtube_video_url: data.data.youtube_video_url || '',
                    x: data.data.x || '',
                    wifi_ssid: data.data.wifi_ssid || '',
                    wifi_password: data.data.wifi_password || '',
                    foto_url: data.data.foto_url || '',
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
                    etiquetas: data.data.etiquetas || '', // Preserve tags
                    catalogo_json: (() => {
                        const raw = data.data.catalogo_json ? (typeof data.data.catalogo_json === 'string' ? JSON.parse(data.data.catalogo_json) : data.data.catalogo_json) : null;
                        if (!raw) return { categories: [], products: [] };
                        if (Array.isArray(raw)) {
                            return {
                                categories: Array.from(new Set(raw.map((p: any) => p.category || 'Sin Categoría'))),
                                products: raw
                            };
                        }
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
        setUploadingImage(true);
        const fd = new FormData();
        fd.append('file', file);
        try {
            const res = await fetch('/api/upload', { method: 'POST', body: fd });
            if (res.ok) {
                const { url } = await res.json();
                setFormData({ ...formData, [field]: url });
            } else {
                alert('Error al procesar la imagen');
            }
        } catch (err) {
            console.error('Error uploading image:', err);
            alert('Error de conexión al subir imagen');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        // Allow VCF, PDF, DOCX, etc.
        setLoading(true);
        const fd = new FormData();
        fd.append('file', file);
        try {
            const res = await fetch('/api/upload', { method: 'POST', body: fd });
            if (res.ok) {
                const { url } = await res.json();
                setFormData({ ...formData, hero_file_url: url });
                alert('Archivo subido correctamente');
            } else {
                alert('Error al subir el archivo');
            }
        } catch (err) {
            console.error('Error uploading file:', err);
            alert('Error al subir el archivo');
        } finally {
            setLoading(false);
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
                                        placeholder="Ingresa tu código"
                                        className="w-full border-2 border-gray-100 rounded-2xl p-4 text-center text-xl font-black tracking-[0.2em] focus:border-primary outline-none transition-all uppercase"
                                    />
                                    {error && <p className="text-red-500 text-xs font-bold mt-2 flex items-center justify-center gap-1 uppercase tracking-tighter italic"> <AlertCircle size={14}/> {error}</p>}
                                </div>

                                <button 
                                    onClick={validateCode}
                                    disabled={loading || !editCode}
                                    className="bg-primary text-white font-black py-4 px-10 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 uppercase tracking-widest text-sm flex items-center gap-2"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : <CheckCircle size={20} />}
                                    Validar Acceso
                                </button>
                                {error && error.includes('RYA-') && (
                                    <p className="mt-4 text-[10px] text-gray-400 font-bold uppercase italic border-t pt-4 w-full max-w-xs">
                                        Tip: Revisa tu correo de bienvenida para el código de edición.
                                    </p>
                                )}
                            </div>
                        )}

                        {step === 'edit' && (
                            <div className="space-y-6">
                                <div className="bg-navy/5 p-4 rounded-2xl border border-navy/10 flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3 text-navy">
                                        <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center">
                                            <Edit size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Editando Perfil</p>
                                            <p className="text-sm font-black uppercase tracking-tight italic">/{initialSlug}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">Usos Disponibles</p>
                                        <p className="text-lg font-black text-blue-600 tracking-tighter leading-none mt-1">{usesRemaining}</p>
                                    </div>
                                </div>

                                <div className="space-y-4 pb-20">
                                    {/* SECCIÓN 1: PERFIL */}
                                    <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                        <button 
                                            onClick={() => setActiveSection(activeSection === 'perfil' ? null : 'perfil')}
                                            className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-navy/10 flex items-center justify-center text-navy font-black italic uppercase text-xs">
                                                    ID
                                                </div>
                                                <span className="font-black text-navy uppercase text-sm tracking-tighter">Identidad y Perfil</span>
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
                                                                      {uploadingImage ? <Loader2 size={16} className="text-white animate-spin" /> : <Edit size={16} className="text-white" />}
                                                                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, 'foto_url')} disabled={uploadingImage} />
                                                                  </label>
                                                             </div>
                                                             <div className="flex-1 space-y-3">
                                                                 {uploadingImage && (
                                                                     <p className="text-[10px] text-primary font-black animate-pulse uppercase italic">Optimizando imagen...</p>
                                                                 )}
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
                                                             {formData.tipo_perfil === 'negocio' && (
                                                                 <div className="col-span-full grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                                                     <div className="space-y-1">
                                                                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nombres Responsable</label>
                                                                         <input className="w-full border rounded-lg p-3 text-sm font-bold bg-white" value={formData.contacto_nombre} onChange={(e) => setFormData({ ...formData, contacto_nombre: e.target.value })} placeholder="Ej. Juan" />
                                                                     </div>
                                                                     <div className="space-y-1">
                                                                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Apellidos Responsable</label>
                                                                         <input className="w-full border rounded-lg p-3 text-sm font-bold bg-white" value={formData.contacto_apellido} onChange={(e) => setFormData({ ...formData, contacto_apellido: e.target.value })} placeholder="Ej. Perez" />
                                                                     </div>
                                                                 </div>
                                                             )}
                                                             <div className="col-span-full space-y-1">
                                                                 <label className="text-[10px] font-black text-primary uppercase tracking-widest">Etiquetas / Tags (Separados por coma)</label>
                                                                 <input className="w-full border rounded-lg p-3 text-sm font-bold bg-primary/5 border-primary/20" value={formData.categories} onChange={(e) => setFormData({ ...formData, categories: e.target.value })} placeholder="Ej. Parrillada, Eventos, Gourmet" />
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
                                                            <label className="text-[10px] font-black text-[#FF0000] uppercase tracking-widest">Video de YouTube (Embed)</label>
                                                            <input className="w-full border rounded-lg p-3 text-sm font-bold bg-gray-50" value={formData.youtube_video_url} onChange={(e) => setFormData({ ...formData, youtube_video_url: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." />
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
                                                                            placeholder="Instrucciones para paso 3..." 
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {formData.hero_action === 'file' && (
                                                            <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                                                                <label className="text-[10px] font-black text-navy uppercase tracking-widest flex items-center gap-2">
                                                                    <Download size={14} /> Archivo a Descargar (VCF, PDF, etc.)
                                                                </label>
                                                                <div className="flex flex-col gap-3">
                                                                    <div className="flex gap-2">
                                                                        <input 
                                                                            className="flex-1 border rounded-lg p-3 text-sm font-bold bg-white" 
                                                                            value={formData.hero_file_url} 
                                                                            onChange={(e) => setFormData({ ...formData, hero_file_url: e.target.value })} 
                                                                            placeholder="URL o sube un archivo" 
                                                                        />
                                                                        <label className="cursor-pointer bg-primary text-white px-4 py-3 rounded-lg text-xs font-black uppercase flex items-center gap-2 hover:bg-primary/90 transition-all shrink-0">
                                                                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                                                            Subir
                                                                            <input type="file" className="hidden" onChange={handleFileChange} />
                                                                        </label>
                                                                    </div>
                                                                    {formData.hero_file_url && formData.hero_file_url.startsWith('data:') && (
                                                                        <p className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                                                                            <CheckCircle size={12} /> Archivo cargado correctamente (Base64)
                                                                        </p>
                                                                    )}
                                                                    <p className="text-[10px] text-gray-400 font-medium italic">Puedes subir tu archivo directamente aquí o pegar un link de Drive/Dropbox.</p>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {formData.hero_action === 'link' && (
                                                            <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                                                                <label className="text-[10px] font-black text-navy uppercase tracking-widest flex items-center gap-2">
                                                                    <Zap size={14} /> Enlace Externo
                                                                </label>
                                                                <input 
                                                                    className="w-full border rounded-lg p-3 text-sm font-bold bg-white" 
                                                                    value={formData.hero_external_link} 
                                                                    onChange={(e) => setFormData({ ...formData, hero_external_link: e.target.value })} 
                                                                    placeholder="https://tupagina.com/oferta" 
                                                                />
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
                                                    <div className="p-6 space-y-6">
                                                        <div className="space-y-3">
                                                            <div className="flex justify-between items-center">
                                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Portada Desktop (PC)</label>
                                                                <label className="cursor-pointer bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase hover:bg-primary/20 transition-colors">
                                                                    Cambiar Imagen
                                                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, 'portada_desktop')} />
                                                                </label>
                                                            </div>
                                                            <div className="aspect-[21/9] w-full bg-gray-100 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200">
                                                                {formData.portada_desktop ? (
                                                                    <img src={formData.portada_desktop} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-gray-300 italic font-medium">Sin imagen de escritorio</div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="space-y-3">
                                                            <div className="flex justify-between items-center">
                                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Portada Móvil (Celular)</label>
                                                                <label className="cursor-pointer bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase hover:bg-primary/20 transition-colors">
                                                                    Cambiar Imagen
                                                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, 'portada_movil')} />
                                                                </label>
                                                            </div>
                                                            <div className="aspect-[4/5] w-32 bg-gray-100 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200">
                                                                {formData.portada_movil ? (
                                                                    <img src={formData.portada_movil} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-gray-300 italic font-medium text-center p-2">Sin imagen móvil</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* SECCIÓN 5: CATÁLOGO DE PRODUCTOS (SOLO PRO) */}
                                    <div className={cn("border border-gray-100 rounded-2xl overflow-hidden shadow-sm", !allowCatalog && "opacity-50 grayscale pointer-events-none")}>
                                        <button 
                                            onClick={() => setActiveSection(activeSection === 'catalogo' ? null : 'catalogo')}
                                            className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-navy/10 flex items-center justify-center text-navy">
                                                    <Store size={18} />
                                                </div>
                                                <div className="text-left leading-none">
                                                    <span className="font-black text-navy uppercase text-sm tracking-tighter">Catálogo de Productos</span>
                                                    {!allowCatalog && <p className="text-[9px] font-black text-navy/40 uppercase tracking-widest">Exclusivo Plan PRO/BIZ</p>}
                                                </div>
                                            </div>
                                            <ChevronDown size={20} className={cn("text-navy/30 transition-transform", activeSection === 'catalogo' && "rotate-180")} />
                                        </button>
                                        <AnimatePresence>
                                            {activeSection === 'catalogo' && allowCatalog && (
                                                <motion.div 
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-visible bg-white border-t border-gray-100"
                                                >
                                                    <div className="p-0 flex flex-col max-h-[600px]">
                                                        {/* Sub-TABS del Catálogo */}
                                                        <div className="flex bg-gray-100 p-1 border-b border-gray-200">
                                                            <button onClick={() => setCatalogTab('config')} className={cn("flex-1 py-3 px-4 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all", catalogTab === 'config' ? "bg-white text-navy shadow-md" : "text-gray-500 hover:bg-gray-200")}>
                                                                <Library size={14} /> Configuración
                                                            </button>
                                                            <button onClick={() => setCatalogTab('products')} className={cn("flex-1 py-3 px-4 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all", catalogTab === 'products' ? "bg-white text-navy shadow-md" : "text-gray-500 hover:bg-gray-200")}>
                                                                <Store size={14} /> Gestionar Productos ({formData.catalogo_json.products.length})
                                                            </button>
                                                        </div>

                                                        {/* Contenido TABS */}
                                                        <div className="p-6 overflow-y-auto grow">
                                                            {catalogTab === 'config' ? (
                                                                <div className="space-y-6">
                                                                    <div className="space-y-3">
                                                                        <div className="flex justify-between items-center">
                                                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Categorías del Catálogo</label>
                                                                            <button 
                                                                                onClick={() => {
                                                                                    const cat = prompt('Nombre de la nueva categoría:');
                                                                                    if (cat && !formData.catalogo_json.categories.includes(cat)) {
                                                                                        setFormData({
                                                                                            ...formData,
                                                                                            catalogo_json: {
                                                                                                ...formData.catalogo_json,
                                                                                                categories: [...formData.catalogo_json.categories, cat]
                                                                                            }
                                                                                        });
                                                                                    }
                                                                                }}
                                                                                className="text-primary font-black uppercase text-[10px] flex items-center gap-1 hover:underline"
                                                                            >
                                                                                <Plus size={12} /> Nueva Categoría
                                                                            </button>
                                                                        </div>
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {formData.catalogo_json.categories.map((cat, idx) => (
                                                                                <div key={idx} className="bg-navy/5 border border-navy/10 px-3 py-1.5 rounded-xl flex items-center gap-2">
                                                                                    <span className="text-[10px] font-black text-navy uppercase">{cat}</span>
                                                                                    <button 
                                                                                        onClick={() => {
                                                                                            if (confirm(`¿Eliminar categoría "${cat}"?`)) {
                                                                                                setFormData({
                                                                                                    ...formData,
                                                                                                    catalogo_json: {
                                                                                                        ...formData.catalogo_json,
                                                                                                        categories: formData.catalogo_json.categories.filter(c => c !== cat)
                                                                                                    }
                                                                                                });
                                                                                            }
                                                                                        }}
                                                                                        className="text-navy/40 hover:text-red-500 transition-colors"
                                                                                    >
                                                                                        <X size={14} />
                                                                                    </button>
                                                                                </div>
                                                                            ))}
                                                                            {formData.catalogo_json.categories.length === 0 && (
                                                                                <p className="text-[10px] italic text-gray-300 p-4 w-full text-center border-2 border-dashed border-gray-100 rounded-2xl">Agrega categorías para organizar tus productos</p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-6 pb-20">
                                                                    {/* Filtro y Acción */}
                                                                    <div className="flex justify-between items-center sticky top-0 bg-white py-2 z-10 border-b mb-4">
                                                                        <select 
                                                                            value={productCategoryFilter}
                                                                            onChange={(e) => setProductCategoryFilter(e.target.value)}
                                                                            className="bg-gray-100 border-0 rounded-lg text-[10px] font-black uppercase py-2 px-3 outline-none"
                                                                        >
                                                                            <option value="Todas">Todas las Categorías</option>
                                                                            {formData.catalogo_json.categories.map(c => (
                                                                                <option key={c} value={c}>{c}</option>
                                                                            ))}
                                                                        </select>
                                                                        <button 
                                                                            onClick={() => {
                                                                                const newProduct = {
                                                                                    id: `prod_${Date.now()}`,
                                                                                    name: 'Nuevo Producto',
                                                                                    description: 'Descripción aquí',
                                                                                    price: '0.00',
                                                                                    category: formData.catalogo_json.categories[0] || 'Sin Categoría',
                                                                                    image: ''
                                                                                };
                                                                                setFormData({
                                                                                    ...formData,
                                                                                    catalogo_json: {
                                                                                        ...formData.catalogo_json,
                                                                                        products: [newProduct, ...formData.catalogo_json.products]
                                                                                    }
                                                                                });
                                                                            }}
                                                                            className="bg-primary text-white p-2 rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all"
                                                                            title="Agregar Producto"
                                                                        >
                                                                            <Plus size={20} />
                                                                        </button>
                                                                    </div>

                                                                    {/* Lista de Productos */}
                                                                    <div className="space-y-4">
                                                                        {formData.catalogo_json.products
                                                                            .filter(p => !p.isHidden) // No mostrar si está oculto (si aplica)
                                                                            .filter(p => productCategoryFilter === 'Todas' || p.category === productCategoryFilter)
                                                                            .map((prod, pIdx) => (
                                                                                <div key={prod.id || pIdx} className="bg-gray-50 p-4 rounded-2xl border border-gray-200 relative group animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                                                    <button 
                                                                                        onClick={() => {
                                                                                            if (confirm('¿Eliminar producto?')) {
                                                                                                const updatedProducts = formData.catalogo_json.products.filter((_, i) => i !== pIdx);
                                                                                                setFormData({
                                                                                                    ...formData,
                                                                                                    catalogo_json: { ...formData.catalogo_json, products: updatedProducts }
                                                                                                });
                                                                                            }
                                                                                        }}
                                                                                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                                                    >
                                                                                        <X size={14} />
                                                                                    </button>

                                                                                    <div className="grid grid-cols-[80px_1fr] gap-4">
                                                                                        <div className="relative aspect-square rounded-xl bg-gray-200 overflow-hidden group/img">
                                                                                            {prod.image ? (
                                                                                                <img src={prod.image} className="w-full h-full object-cover" />
                                                                                            ) : (
                                                                                                <div className="w-full h-full flex items-center justify-center text-gray-400 font-black text-xl italic uppercase">IMG</div>
                                                                                            )}
                                                                                            <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer">
                                                                                                <Edit size={16} className="text-white" />
                                                                                                <input 
                                                                                                    type="file" 
                                                                                                    accept="image/*" 
                                                                                                    className="hidden" 
                                                                                                    onChange={async (e) => {
                                                                                                        const file = e.target.files?.[0];
                                                                                                        if (!file) return;
                                                                                                        const fd = new FormData();
                                                                                                        fd.append('file', file);
                                                                                                        const res = await fetch('/api/upload', { method: 'POST', body: fd });
                                                                                                        if (res.ok) {
                                                                                                            const { url } = await res.json();
                                                                                                            const updatedProducts = [...formData.catalogo_json.products];
                                                                                                            updatedProducts[pIdx] = { ...prod, image: url };
                                                                                                            setFormData({ ...formData, catalogo_json: { ...formData.catalogo_json, products: updatedProducts } });
                                                                                                        }
                                                                                                    }} 
                                                                                                />
                                                                                            </label>
                                                                                        </div>
                                                                                        <div className="space-y-2">
                                                                                            <input 
                                                                                                className="w-full bg-transparent border-0 border-b border-navy/10 p-1 text-sm font-black uppercase text-navy outline-none italic placeholder:text-navy/20" 
                                                                                                value={prod.name} 
                                                                                                onChange={(e) => {
                                                                                                    const updatedProducts = [...formData.catalogo_json.products];
                                                                                                    updatedProducts[pIdx] = { ...prod, name: e.target.value };
                                                                                                    setFormData({ ...formData, catalogo_json: { ...formData.catalogo_json, products: updatedProducts } });
                                                                                                }}
                                                                                                placeholder="Nombre Producto" 
                                                                                            />
                                                                                            
                                                                                            <div className="flex gap-2">
                                                                                                <div className="flex-1">
                                                                                                    <p className="text-[8px] font-black uppercase opacity-40 mb-1">Precio</p>
                                                                                                    <input 
                                                                                                        className="w-full bg-white border border-gray-200 rounded-lg p-1.5 text-xs font-black text-navy" 
                                                                                                        value={prod.price} 
                                                                                                        onChange={(e) => {
                                                                                                            const updatedProducts = [...formData.catalogo_json.products];
                                                                                                            updatedProducts[pIdx] = { ...prod, price: e.target.value };
                                                                                                            setFormData({ ...formData, catalogo_json: { ...formData.catalogo_json, products: updatedProducts } });
                                                                                                        }}
                                                                                                        placeholder="0.00" 
                                                                                                    />
                                                                                                </div>
                                                                                                <div className="flex-[1.5]">
                                                                                                    <p className="text-[8px] font-black uppercase opacity-40 mb-1">Categoría</p>
                                                                                                    <select 
                                                                                                        className="w-full bg-white border border-gray-200 rounded-lg p-1.5 text-[9px] font-black uppercase"
                                                                                                        value={prod.category}
                                                                                                        onChange={(e) => {
                                                                                                            const updatedProducts = [...formData.catalogo_json.products];
                                                                                                            updatedProducts[pIdx] = { ...prod, category: e.target.value };
                                                                                                            setFormData({ ...formData, catalogo_json: { ...formData.catalogo_json, products: updatedProducts } });
                                                                                                        }}
                                                                                                    >
                                                                                                        <option value="Sin Categoría">Sin Categoría</option>
                                                                                                        {formData.catalogo_json.categories.map(c => (
                                                                                                            <option key={c} value={c}>{c}</option>
                                                                                                        ))}
                                                                                                    </select>
                                                                                                </div>
                                                                                            </div>

                                                                                            <textarea 
                                                                                                className="w-full bg-white border border-gray-200 rounded-lg p-2 text-[10px] font-medium min-h-[50px] resize-none" 
                                                                                                value={prod.description} 
                                                                                                onChange={(e) => {
                                                                                                    const updatedProducts = [...formData.catalogo_json.products];
                                                                                                    updatedProducts[pIdx] = { ...prod, description: e.target.value };
                                                                                                    setFormData({ ...formData, catalogo_json: { ...formData.catalogo_json, products: updatedProducts } });
                                                                                                }}
                                                                                                placeholder="Describe tu producto..." 
                                                                                            />
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                            {formData.catalogo_json.products.filter(p => productCategoryFilter === 'Todas' || p.category === productCategoryFilter).length === 0 && (
                                                                                <div className="text-center py-10 opacity-30 italic font-medium text-navy">
                                                                                    No hay productos en esta categoría
                                                                                </div>
                                                                            )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 'success' && (
                            <div className="flex flex-col items-center justify-center py-20 text-center animate-in zoom-in duration-500 px-4">
                                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-green-200 relative">
                                    <CheckCircle size={56} className="text-white" />
                                    <motion.div 
                                        className="absolute inset-0 rounded-full border-4 border-green-500"
                                        animate={{ scale: [1, 1.5, 1.5, 1], opacity: [1, 0, 0, 0] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                    />
                                </div>
                                <h3 className="text-4xl font-black text-navy mb-4 tracking-tighter uppercase italic leading-none">
                                    ¡Cambios<br/>Guardados!
                                </h3>
                                <p className="text-gray-500 font-bold mb-10 max-w-sm uppercase text-xs tracking-widest decoration-primary decoration-4">
                                    Tu perfil ha sido actualizado. Los cambios serán visibles de inmediato.
                                </p>
                                <button 
                                    onClick={() => window.location.reload()}
                                    className="bg-navy text-white font-black py-4 px-12 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-[0.2em] text-sm"
                                >
                                    Cerrar y Ver Perfil
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    {step === 'edit' && (
                        <div className="p-6 bg-white border-t flex justify-center gap-4 shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] relative z[60]">
                            <button 
                                onClick={onClose}
                                className="flex-1 max-w-[160px] bg-gray-100 text-navy font-black py-3 rounded-xl hover:bg-gray-200 transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                            >
                                <X size={16} /> Cancelar
                            </button>
                            <button 
                                 onClick={handleSave}
                                 disabled={loading || uploadingImage}
                                 className="flex-1 max-w-[300px] bg-primary text-white font-black py-3 rounded-xl hover:scale-[1.02] active:scale-100 transition-all uppercase tracking-[0.1em] text-xs flex items-center justify-center gap-3 shadow-lg shadow-primary/20 disabled:opacity-50"
                             >
                                 {loading ? <Loader2 className="animate-spin" size={18} /> : (uploadingImage ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />)}
                                 {loading ? 'Guardando...' : (uploadingImage ? 'Procesando...' : 'Guardar Perfil')}
                             </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
