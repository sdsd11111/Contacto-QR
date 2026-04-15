import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Trash2, Download, Save, RefreshCw, QrCode, ExternalLink, Clock, X as CloseIcon, Youtube, Store, Library, Plus, Edit, Zap, ChevronDown, Star, Info, LogOut, CheckCircle, FileText, Loader2, ShieldCheck, User, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VCardEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    registro: any;
    setRegistro: (reg: any) => void;
    onSave: (nombre: string) => void;
    onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onPortadaUpload: (e: React.ChangeEvent<HTMLInputElement>, tipo: 'portada_desktop' | 'portada_movil') => void;
    isSaving: boolean;
}

export default function VCardEditModal({
    isOpen,
    onClose,
    registro: editingRegistro,
    setRegistro: setEditingRegistro,
    onSave,
    onPhotoUpload,
    onPortadaUpload,
    isSaving
}: VCardEditModalProps) {
    const [catalogTab, setCatalogTab] = useState<'config' | 'products'>('config');
    const [productCategoryFilter, setProductCategoryFilter] = useState<string>('Todas');

    if (!isOpen || !editingRegistro) return null;

    // Parse catalogo_json into a usable object
    const catalogoJson = (() => {
        let raw = editingRegistro.catalogo_json;
        if (!raw) return { categories: [] as string[], products: [] as any[] };
        
        let parsed = raw;
        if (typeof raw === 'string') {
            try {
                parsed = JSON.parse(raw);
            } catch (e) {
                return { categories: [] as string[], products: [] as any[] };
            }
        }
        
        if (Array.isArray(parsed)) {
            const products = parsed.map((p: any) => {
                const cat = p.categoria || p.category || 'Todas';
                const normalizedCat = cat === 'Sin Categoría' ? 'Todas' : cat;
                return { ...p, categoria: normalizedCat, category: normalizedCat };
            });
            return {
                categories: Array.from(new Set(products.map((p: any) => p.categoria))) as string[],
                products: products
            };
        }
        
        if (typeof parsed === 'object' && parsed !== null) {
            const rawCats = (parsed.categories || []) as string[];
            const normalizedCats = Array.from(new Set(rawCats.map(c => c === 'Sin Categoría' ? 'Todas' : c)));
            const products = (parsed.products || []).map((p: any) => {
                const cat = p.categoria || p.category || (normalizedCats[0] || 'Todas');
                const normalizedCat = cat === 'Sin Categoría' ? 'Todas' : cat;
                return { ...p, categoria: normalizedCat, category: normalizedCat };
            });
            return {
                categories: normalizedCats,
                products: products
            };
        }
        
        return { categories: [] as string[], products: [] as any[] };
    })();

    const updateCatalogo = (updated: { categories: string[], products: any[] }) => {
        setEditingRegistro({ ...editingRegistro, catalogo_json: updated });
    };




    const handleSaveEdit = () => {
        let recalculatedNombre = editingRegistro.nombre;
        if (editingRegistro.tipo_perfil === 'persona') {
            recalculatedNombre = `${editingRegistro.nombres || ''} ${editingRegistro.apellidos || ''}`.trim();
        } else if (editingRegistro.tipo_perfil === 'negocio') {
            recalculatedNombre = editingRegistro.nombre_negocio || editingRegistro.nombre;
        }
        
        onSave(recalculatedNombre);
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-6xl bg-[#050B1C] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden max-h-[95vh] flex flex-col"
            >
                <div className="flex-1 overflow-y-auto overflow-x-hidden">
                    {/* Header */}
                    <div className="sticky top-0 z-20 bg-[#050B1C]/80 backdrop-blur-xl border-b border-white/10 p-8 flex justify-between items-start">
                        <div>
                            <h3 className="text-3xl font-black uppercase italic tracking-tighter">Editar Registro</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-2">ID: {editingRegistro.id} • Slug: /{editingRegistro.slug}</p>
                        </div>
                        <div className="flex gap-4">
                            <span className={cn(
                                "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                editingRegistro.status === 'pagado' ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                    editingRegistro.status === 'entregado' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                        "bg-orange-500/10 text-orange-400 border-orange-500/20"
                            )}>
                                {editingRegistro.status}
                            </span>
                            <span className={cn(
                                "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                editingRegistro.plan === 'pro' || editingRegistro.plan === 'business' || editingRegistro.plan === 'catalog' || editingRegistro.plan === 'digital' 
                                    ? "bg-primary/10 text-primary border-primary/20" 
                                    : "bg-white/5 text-white/40 border-white/10"
                            )}>
                                {editingRegistro.plan === 'catalog' ? 'Business + Catálogo' : 
                                 editingRegistro.plan === 'business' ? 'Business' : 
                                 editingRegistro.plan === 'pro' || editingRegistro.plan === 'digital' ? 'Digital' : 
                                 editingRegistro.plan}
                            </span>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-3 bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 rounded-2xl transition-all"
                        >
                            <CloseIcon size={24} />
                        </button>
                    </div>

                    <div className="p-8 space-y-12">
                        {/* FOTOS DE PERFIL Y PORTADAS */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="col-span-1 space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-4 ml-1">Foto de Perfil / Logo</h4>
                                <div className="aspect-square bg-white/5 rounded-[32px] border-2 border-dashed border-white/10 flex flex-col items-center justify-center relative overflow-hidden group">
                                    {editingRegistro.foto_url ? (
                                        <img src={editingRegistro.foto_url} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-white/20">
                                            <Upload size={32} />
                                            <span className="text-[10px] uppercase font-black tracking-widest">Subir Foto</span>
                                        </div>
                                    )}
                                    <label className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm z-10">
                                        <Upload size={24} className="text-white" />
                                        <input type="file" className="hidden" accept="image/*" onChange={onPhotoUpload} />
                                    </label>
                                </div>
                            </div>
                            
                            {(editingRegistro.plan === 'business' || editingRegistro.plan === 'catalog') && (
                                <div className="col-span-2 grid grid-cols-2 gap-8">
                                    <div className="space-y-4 flex flex-col items-center">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-4">Hero Desktop (Banners)</h4>
                                        <div className="w-full aspect-video bg-white/5 rounded-3xl border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden group relative">
                                            {editingRegistro.portada_desktop ? (
                                                <img src={editingRegistro.portada_desktop} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-[10px] uppercase font-black text-white/20">Sin Portada</span>
                                            )}
                                            <label className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm z-10">
                                                <Upload size={24} className="text-white" />
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => onPortadaUpload(e, 'portada_desktop')} />
                                            </label>
                                        </div>
                                    </div>
                                    <div className="space-y-4 flex flex-col items-center">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-4">Hero Móvil (1080x1920)</h4>
                                        <div className="h-48 aspect-[9/16] bg-white/5 rounded-3xl border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden group relative">
                                            {editingRegistro.portada_movil ? (
                                                <img src={editingRegistro.portada_movil} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-[10px] uppercase font-black text-white/20 text-center px-4">Sin Portada</span>
                                            )}
                                            <label className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm z-10">
                                                <Upload size={24} className="text-white" />
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => onPortadaUpload(e, 'portada_movil')} />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* INFO PERSONAL Y REDES */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Columna Izquierda: Info Personal */}
                            <div className="space-y-6">
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/30 border-b border-white/5 pb-4">INFO PERSONAL</h4>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">Nombre que se mostrará</label>
                                    <input
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold text-white outline-none focus:border-primary/40 transition-all font-sans"
                                        value={editingRegistro.nombre || ''}
                                        onChange={e => {
                                            const val = e.target.value;
                                            const updates: any = { nombre: val };
                                            if (editingRegistro.tipo_perfil === 'negocio') {
                                                updates.nombre_negocio = val;
                                            }
                                            setEditingRegistro({ ...editingRegistro, ...updates });
                                        }}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">Profesión / Cargo</label>
                                        <input
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold text-white outline-none focus:border-primary/40 transition-all text-xs"
                                            value={editingRegistro.profesion || ''}
                                            onChange={e => setEditingRegistro({ ...editingRegistro, profesion: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">Empresa</label>
                                        <input
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold text-white outline-none focus:border-primary/40 transition-all text-xs"
                                            value={editingRegistro.empresa || ''}
                                            onChange={e => setEditingRegistro({ ...editingRegistro, empresa: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">WhatsApp (con código)</label>
                                    <input
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold text-white outline-none focus:border-primary/40 transition-all text-xs"
                                        value={editingRegistro.whatsapp || ''}
                                        onChange={e => setEditingRegistro({ ...editingRegistro, whatsapp: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">Email</label>
                                    <input
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold text-white outline-none focus:border-primary/40 transition-all"
                                        value={editingRegistro.email || ''}
                                        onChange={e => setEditingRegistro({ ...editingRegistro, email: e.target.value })}
                                    />
                                </div>

                                <div className="pt-4 border-t border-white/5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary mb-4 block ml-1">Tipo de Perfil</label>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setEditingRegistro({ ...editingRegistro, tipo_perfil: 'persona' })}
                                            className={cn(
                                                "flex-1 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all border",
                                                editingRegistro.tipo_perfil === 'persona' ? "bg-primary text-navy border-primary" : "bg-white/5 text-white/40 border-white/10"
                                            )}
                                        >
                                            Persona
                                        </button>
                                        <button
                                            onClick={() => setEditingRegistro({ ...editingRegistro, tipo_perfil: 'negocio' })}
                                            className={cn(
                                                "flex-1 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all border",
                                                editingRegistro.tipo_perfil === 'negocio' ? "bg-primary text-navy border-primary" : "bg-white/5 text-white/40 border-white/10"
                                            )}
                                        >
                                            Negocio
                                        </button>
                                    </div>
                                </div>

                                {editingRegistro.tipo_perfil === 'persona' ? (
                                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">Nombres</label>
                                            <input
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-primary/40 transition-all text-xs"
                                                value={editingRegistro.nombres || ''}
                                                onChange={e => setEditingRegistro({ ...editingRegistro, nombres: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">Apellidos</label>
                                            <input
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-primary/40 transition-all text-xs"
                                                value={editingRegistro.apellidos || ''}
                                                onChange={e => setEditingRegistro({ ...editingRegistro, apellidos: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-1">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">Nombre del Negocio</label>
                                            <input
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-primary/40 transition-all text-xs"
                                                value={editingRegistro.nombre_negocio || ''}
                                                onChange={e => setEditingRegistro({ ...editingRegistro, nombre_negocio: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-2 block ml-1">Nombre Contacto (Opcional)</label>
                                                <input
                                                    className="w-full bg-primary/5 border border-primary/20 rounded-2xl px-6 py-4 font-bold outline-none focus:border-primary/40 transition-all text-xs"
                                                    value={editingRegistro.contacto_nombre || ''}
                                                    onChange={e => setEditingRegistro({ ...editingRegistro, contacto_nombre: e.target.value })}
                                                    placeholder="Ej. Juan"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-2 block ml-1">Apellido Contacto (Opcional)</label>
                                                <input
                                                    className="w-full bg-primary/5 border border-primary/20 rounded-2xl px-6 py-4 font-bold outline-none focus:border-primary/40 transition-all text-xs"
                                                    value={editingRegistro.contacto_apellido || ''}
                                                    onChange={e => setEditingRegistro({ ...editingRegistro, contacto_apellido: e.target.value })}
                                                    placeholder="Ej. Paz"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Columna Derecha: Redes y Links */}
                            <div className="space-y-6">
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/30 border-b border-white/5 pb-4">REDES Y LINKS</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">Facebook</label>
                                        <input
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 font-bold text-white outline-none focus:border-primary/40 transition-all text-xs"
                                            value={editingRegistro.facebook || ''}
                                            onChange={e => setEditingRegistro({ ...editingRegistro, facebook: e.target.value })}
                                            placeholder="URL perfil"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">Instagram</label>
                                        <input
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 font-bold text-white outline-none focus:border-primary/40 transition-all text-xs"
                                            value={editingRegistro.instagram || ''}
                                            onChange={e => setEditingRegistro({ ...editingRegistro, instagram: e.target.value })}
                                            placeholder="URL perfil"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">TikTok</label>
                                        <input
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 font-bold text-white outline-none focus:border-primary/40 transition-all text-xs"
                                            value={editingRegistro.tiktok || ''}
                                            onChange={e => setEditingRegistro({ ...editingRegistro, tiktok: e.target.value })}
                                            placeholder="URL perfil"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">LinkedIn</label>
                                        <input
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 font-bold text-white outline-none focus:border-primary/40 transition-all text-xs"
                                            value={editingRegistro.linkedin || ''}
                                            onChange={e => setEditingRegistro({ ...editingRegistro, linkedin: e.target.value })}
                                            placeholder="URL perfil"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">YouTube Canal</label>
                                        <input
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 font-bold outline-none focus:border-primary/40 transition-all text-xs"
                                            value={editingRegistro.youtube || ''}
                                            onChange={e => setEditingRegistro({ ...editingRegistro, youtube: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">X (Twitter)</label>
                                        <input
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 font-bold outline-none focus:border-primary/40 transition-all text-xs"
                                            value={editingRegistro.x || ''}
                                            onChange={e => setEditingRegistro({ ...editingRegistro, x: e.target.value })}
                                        />
                                    </div>
                                </div>
                                </div>
                        </div>

                        {/* CONTENIDO Y UBICACIÓN */}
                        <div className="space-y-8">
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/30 border-b border-white/5 pb-4">CONTENIDO Y UBICACIÓN</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">Biografía / Sobre Mí</label>
                                        <textarea
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-primary/40 transition-all resize-none min-h-[120px]"
                                            value={editingRegistro.bio || ''}
                                            onChange={e => setEditingRegistro({ ...editingRegistro, bio: e.target.value })}
                                        />
                                    </div>
                                    {/* Soluciones Destacadas - Visible for professional plans except Catalog (as it has its own catalog) */}
                                    {(editingRegistro.plan === 'business' || editingRegistro.plan === 'digital' || editingRegistro.plan === 'pro' || editingRegistro.plan === 'basic') && (
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/10">
                                                <div>
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary block">Soluciones Destacadas</label>
                                                    <p className="text-[9px] font-bold text-white/40 leading-tight mt-1">Edita o elimina los servicios extraídos.</p>
                                                </div>
                                                <button 
                                                    onClick={() => {
                                                        const current = (editingRegistro.productos_servicios || '').trim();
                                                        const separator = '\n';
                                                        setEditingRegistro({ ...editingRegistro, productos_servicios: current + (current ? separator : '') + 'Nuevo Servicio' });
                                                    }}
                                                    className="text-white hover:text-primary bg-white/5 hover:bg-white/10 px-4 py-2 font-black uppercase text-[9px] rounded-lg flex items-center gap-1 transition-all"
                                                >
                                                    <Plus size={12} /> Añadir
                                                </button>
                                            </div>
                                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                                {(() => {
                                                    const rawText = editingRegistro.productos_servicios || '';
                                                    const separator = '\n';
                                                    const items = rawText.split(/[,\n]/).map((i: string) => i.trim()).filter((i: string) => i);
                                                    
                                                    if (items.length === 0) {
                                                        return <p className="text-[10px] text-white/30 italic px-2">Aún no hay servicios destacados.</p>;
                                                    }

                                                    return items.map((item: string, idx: number) => (
                                                        <div key={idx} className="flex gap-3 items-center bg-white/5 border border-white/10 p-3 rounded-xl hover:border-primary/30 transition-all group">
                                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[12px] group-hover:scale-110 transition-transform">
                                                                ✨
                                                            </div>
                                                            <input
                                                                className="flex-1 bg-transparent border-b border-transparent focus:border-primary/50 outline-none text-xs font-bold text-white/90 placeholder-white/20 transition-all"
                                                                value={item}
                                                                onChange={e => {
                                                                    const newItems = [...items];
                                                                    newItems[idx] = e.target.value;
                                                                    setEditingRegistro({ ...editingRegistro, productos_servicios: newItems.join('\n') });
                                                                }}
                                                            />
                                                            <button 
                                                                onClick={() => {
                                                                    const newItems = [...items];
                                                                    newItems.splice(idx, 1);
                                                                    setEditingRegistro({ ...editingRegistro, productos_servicios: newItems.join('\n') });
                                                                }}
                                                                className="p-2 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-100 md:opacity-0 group-hover:opacity-100"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    ));
                                                })()}
                                            </div>
                                        </div>
                                    )}

                                    {/* Etiquetas / Tags - Visible for all professional plans including Catalog */}
                                    {(editingRegistro.plan === 'business' || editingRegistro.plan === 'catalog' || editingRegistro.plan === 'digital' || editingRegistro.plan === 'pro' || editingRegistro.plan === 'basic') && (
                                        <div className="pt-4">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 block ml-1">Etiquetas / Tags (Separados por coma)</label>
                                            <input
                                                className="w-full bg-primary/5 border border-primary/20 rounded-2xl px-6 py-4 font-bold text-white outline-none focus:border-primary transition-all text-xs"
                                                value={editingRegistro.etiquetas || ''}
                                                onChange={e => setEditingRegistro({ ...editingRegistro, etiquetas: e.target.value })}
                                                placeholder="Ej. Parrillada, Eventos, Gourmet"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">Dirección Física</label>
                                        <input
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold text-white outline-none focus:border-primary/40 transition-all"
                                            value={editingRegistro.direccion || ''}
                                            onChange={e => setEditingRegistro({ ...editingRegistro, direccion: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">Google Maps (URL Compartir)</label>
                                        <input
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold text-white outline-none focus:border-primary/40 transition-all"
                                            value={editingRegistro.google_business || ''}
                                            onChange={e => setEditingRegistro({ ...editingRegistro, google_business: e.target.value })}
                                            placeholder="https://maps.app.goo.gl/..."
                                        />
                                    </div>
                                    {(editingRegistro.plan === 'business' || editingRegistro.plan === 'catalog' || editingRegistro.plan === 'digital') && (
                                        <div className="animate-in slide-in-from-top-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 block ml-1">Carta / Menú Digital (URL)</label>
                                            <input
                                                className="w-full bg-primary/5 border border-primary/20 rounded-2xl px-6 py-4 font-bold text-white outline-none focus:border-primary transition-all"
                                                value={editingRegistro.menu_digital || ''}
                                                onChange={e => setEditingRegistro({ ...editingRegistro, menu_digital: e.target.value })}
                                                placeholder="https://menu.com/..."
                                            />
                                        </div>
                                    )}
                                     <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">Estado</label>
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
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">Plan</label>
                                                <select
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-primary/40 transition-all appearance-none"
                                                value={editingRegistro.plan === 'pro' || editingRegistro.plan === 'basic' ? 'digital' : (editingRegistro.plan || 'digital')}
                                                onChange={e => setEditingRegistro({ ...editingRegistro, plan: e.target.value })}
                                            >
                                                <option value="digital" className="bg-navy">Digital ($20)</option>
                                                <option value="business" className="bg-navy">Business ($60)</option>
                                                <option value="catalog" className="bg-navy">Catálogo ($120)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CONFIGURACIÓN HERO (Solo Business/Catalog) */}
                        {(editingRegistro.plan === 'business' || editingRegistro.plan === 'catalog') && (
                            <div className="p-8 bg-primary/5 rounded-[2.5rem] border border-primary/20 space-y-8 animate-in zoom-in-95">
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                                    <Zap size={18} className="fill-primary" /> CONFIGURACIÓN HERO (OFERTA)
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-2 block ml-1">Texto del Botón Principal</label>
                                        <input
                                            className="w-full bg-[#050B1C] border border-primary/30 rounded-2xl px-6 py-4 font-bold text-white outline-none focus:border-primary transition-all text-lg"
                                            value={editingRegistro.hero_button_text || ''}
                                            onChange={e => setEditingRegistro({ ...editingRegistro, hero_button_text: e.target.value })}
                                            placeholder="EJ. DESCARGAR CATÁLOGO"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-2 block ml-1">Título de la Oferta</label>
                                        <input
                                            className="w-full bg-[#050B1C] border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-primary transition-all text-white"
                                            value={editingRegistro.hero_section_title || ''}
                                            onChange={e => setEditingRegistro({ ...editingRegistro, hero_section_title: e.target.value })}
                                            placeholder="Ej. Promoción Especial de Invierno"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-2 block ml-1">Video de YouTube (ID o URL)</label>
                                        <input
                                            className="w-full bg-[#050B1C] border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-primary transition-all text-white"
                                            value={editingRegistro.youtube_video_url || ''}
                                            onChange={e => setEditingRegistro({ ...editingRegistro, youtube_video_url: e.target.value })}
                                            placeholder="Ej. https://www.youtube.com/watch?v=..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 md:col-span-2">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-2 block ml-1">Calificación Google (Rating)</label>
                                            <input
                                                className="w-full bg-[#050B1C] border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-primary transition-all text-white"
                                                value={editingRegistro.google_rating || ''}
                                                onChange={e => setEditingRegistro({ ...editingRegistro, google_rating: e.target.value })}
                                                placeholder="Ej. 4.8"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-2 block ml-1">Número de Reseñas Google</label>
                                            <input
                                                className="w-full bg-[#050B1C] border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-primary transition-all text-white"
                                                value={editingRegistro.google_reviews_count || ''}
                                                onChange={e => setEditingRegistro({ ...editingRegistro, google_reviews_count: e.target.value })}
                                                placeholder="Ej. 125"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-2 block ml-1">Acción del Botón</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { id: 'wifi', label: 'Pasos/Inst.', icon: <Zap size={14} /> },
                                                { id: 'file', label: 'Descargar', icon: <Download size={14} /> },
                                                { id: 'link', label: 'Enlace', icon: <ExternalLink size={14} /> }
                                            ].map((action) => (
                                                <button
                                                    key={action.id}
                                                    type="button"
                                                    onClick={() => setEditingRegistro({ ...editingRegistro, hero_action: action.id })}
                                                    className={cn(
                                                        "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all gap-1",
                                                        (editingRegistro.hero_action === action.id || (!editingRegistro.hero_action && action.id === 'link')) 
                                                            ? "border-primary bg-primary text-navy" 
                                                            : "border-white/10 bg-white/5 text-white/40 hover:bg-white/10"
                                                    )}
                                                >
                                                    {action.icon}
                                                    <span className="text-[9px] font-black uppercase">{action.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Dashboards específicos de Acción */}
                                {editingRegistro.hero_action === 'wifi' && (
                                    <div className="p-6 bg-navy/40 rounded-3xl border border-white/5 space-y-4 animate-in slide-in-from-top-2">
                                        <p className="text-[10px] font-black text-primary uppercase tracking-widest">Configuración de Pasos Interactivos</p>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-3">
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-bold text-white/20 uppercase ml-1">Paso 1: Título</label>
                                                    <input 
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-primary transition-all" 
                                                        value={editingRegistro.hero_step1_title || ''} 
                                                        onChange={e => setEditingRegistro({ ...editingRegistro, hero_step1_title: e.target.value })} 
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-bold text-white/20 uppercase ml-1">Paso 1: Subtítulo</label>
                                                    <input 
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-medium text-white/50 outline-none focus:border-primary transition-all" 
                                                        value={editingRegistro.hero_step1_text || ''} 
                                                        onChange={e => setEditingRegistro({ ...editingRegistro, hero_step1_text: e.target.value })} 
                                                        placeholder="Subtítulo opcional"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-bold text-white/20 uppercase ml-1">Paso 2: Título</label>
                                                    <input 
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-primary transition-all" 
                                                        value={editingRegistro.hero_step2_title || ''} 
                                                        onChange={e => setEditingRegistro({ ...editingRegistro, hero_step2_title: e.target.value })} 
                                                        placeholder="Ej: Descargar Archivo"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-bold text-white/20 uppercase ml-1">Paso 2: Subtítulo</label>
                                                    <input 
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-medium text-white/50 outline-none focus:border-primary transition-all" 
                                                        value={editingRegistro.hero_step2_text || ''} 
                                                        onChange={e => setEditingRegistro({ ...editingRegistro, hero_step2_text: e.target.value })} 
                                                        placeholder="Subtítulo opcional"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-bold text-white/20 uppercase ml-1">Paso 3: Título</label>
                                                    <input 
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-primary transition-all" 
                                                        value={editingRegistro.hero_step3_title || ''} 
                                                        onChange={e => setEditingRegistro({ ...editingRegistro, hero_step3_title: e.target.value })} 
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-bold text-white/20 uppercase ml-1">Paso 3: Subtítulo</label>
                                                    <input 
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-medium text-white/50 outline-none focus:border-primary transition-all" 
                                                        value={editingRegistro.hero_step3_text || ''} 
                                                        onChange={e => setEditingRegistro({ ...editingRegistro, hero_step3_text: e.target.value })} 
                                                        placeholder="Subtítulo opcional"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {editingRegistro.hero_action === 'link' && (
                                    <div className="animate-in slide-in-from-top-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-2 block ml-1">Enlace Externo</label>
                                        <input
                                            className="w-full bg-[#050B1C] border border-primary/20 rounded-2xl px-6 py-4 font-bold text-white outline-none focus:border-primary transition-all"
                                            value={editingRegistro.hero_external_link || ''}
                                            onChange={e => setEditingRegistro({ ...editingRegistro, hero_external_link: e.target.value })}
                                            placeholder="https://pagina.com"
                                        />
                                    </div>
                                )}

                                {editingRegistro.hero_action === 'file' && (
                                    <div className="animate-in slide-in-from-top-2 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">URL del Archivo</label>
                                            {editingRegistro.hero_file_url && (
                                                <a href={editingRegistro.hero_file_url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1">
                                                    <ExternalLink size={10} /> Ver Archivo Actual
                                                </a>
                                            )}
                                        </div>
                                        <div className="flex gap-4">
                                            <input
                                                className="flex-1 bg-[#050B1C] border border-primary/20 rounded-2xl px-6 py-4 font-bold text-white outline-none focus:border-primary transition-all"
                                                value={editingRegistro.hero_file_url || ''}
                                                onChange={e => setEditingRegistro({ ...editingRegistro, hero_file_url: e.target.value })}
                                                placeholder="URL PDF o Imagen"
                                            />
                                            <label className="bg-primary text-navy px-6 py-4 rounded-2xl font-black uppercase text-[10px] flex items-center gap-2 cursor-pointer hover:bg-white transition-all shadow-lg active:scale-95">
                                                <Upload size={14} /> Subir
                                                <input type="file" className="hidden" onChange={async e => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;
                                                    if (file.size > 5 * 1024 * 1024) {
                                                        alert("El archivo supera los 5MB permitidos.");
                                                        return;
                                                    }
                                                    const fd = new FormData();
                                                    fd.append('file', file);
                                                    try {
                                                        const res = await fetch('/api/upload', { method: 'POST', body: fd });
                                                        if (res.ok) {
                                                            const { url } = await res.json();
                                                            setEditingRegistro({ ...editingRegistro, hero_file_url: url });
                                                        }
                                                    } catch (err) {
                                                        console.error("Error uploading file:", err);
                                                        alert("Error al subir el archivo.");
                                                    }
                                                }} />
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* REPUTACIÓN DIGITAL Y PRODUCTO VIDEO */}
                        {(editingRegistro.plan === 'business' || editingRegistro.plan === 'catalog') && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="p-8 bg-yellow-500/5 rounded-[2.5rem] border border-yellow-500/20 space-y-6">
                                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-yellow-500 flex items-center gap-3">
                                        <Star size={18} className="fill-yellow-500" /> REPUTACIÓN GOOGLE
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[9px] font-black uppercase text-yellow-500/40 mb-2 block">Rating Promedio</label>
                                            <input
                                                type="number" step="0.1" min="1" max="5"
                                                className="w-full bg-[#050B1C] border border-yellow-500/20 rounded-2xl px-4 py-3 font-bold text-center text-xl text-yellow-500 outline-none focus:border-yellow-500"
                                                value={editingRegistro.google_rating || ''}
                                                onChange={e => setEditingRegistro({ ...editingRegistro, google_rating: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black uppercase text-yellow-500/40 mb-2 block">Total Reseñas</label>
                                            <input
                                                type="number"
                                                className="w-full bg-[#050B1C] border border-yellow-500/20 rounded-2xl px-4 py-3 font-bold text-center text-xl text-yellow-500 outline-none focus:border-yellow-500"
                                                value={editingRegistro.google_reviews_count || ''}
                                                onChange={e => setEditingRegistro({ ...editingRegistro, google_reviews_count: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 bg-red-500/5 rounded-[2.5rem] border border-red-500/20 space-y-6">
                                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-red-500 flex items-center gap-3">
                                        <Youtube size={18} /> VIDEO PROMOCIONAL
                                    </h3>
                                    <div>
                                        <label className="text-[9px] font-black uppercase text-red-500/40 mb-2 block">Enlace Embed YouTube</label>
                                        <input
                                            className="w-full bg-[#050B1C] border border-red-500/20 rounded-2xl px-6 py-4 font-bold text-white outline-none focus:border-red-500 transition-all font-sans text-xs"
                                            value={editingRegistro.youtube_video_url || ''}
                                            onChange={e => setEditingRegistro({ ...editingRegistro, youtube_video_url: e.target.value })}
                                            placeholder="https://www.youtube.com/embed/..."
                                        />
                                    </div>
                                </div>
                            </div>
                        )}


                        {/* GESTION DE QR */}
                        <div className="bg-primary/5 p-8 rounded-[2.5rem] border border-primary/20 space-y-8">
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                                <QrCode size={16} /> GESTIÓN DE CÓDIGOS QR
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex items-center gap-6">
                                    <div className="bg-white p-2 rounded-xl">
                                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : ''}/api/vcard/${editingRegistro.slug || editingRegistro.id}`)}`} className="w-20 h-20" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-white uppercase">QR Descarga Directa</p>
                                        <p className="text-[9px] text-white/40 leading-tight">Ideal para tarjetas impresas. Guarda el contacto al instante.</p>
                                        <a href={`https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : ''}/api/vcard/${editingRegistro.slug || editingRegistro.id}`)}`} target="_blank" className="text-primary text-[9px] font-black uppercase hover:underline inline-flex items-center gap-1 mt-2">Descargar QR</a>
                                    </div>
                                </div>
                                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex items-center gap-6">
                                    <div className="bg-white p-2 rounded-xl">
                                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : ''}/card/${editingRegistro.slug || editingRegistro.id}`)}`} className="w-20 h-20" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-white uppercase">QR Perfil Digital</p>
                                        <p className="text-[9px] text-white/40 leading-tight">Muestra tu perfil completo en la web antes de guardar.</p>
                                        <a href={`https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : ''}/card/${editingRegistro.slug || editingRegistro.id}`)}`} target="_blank" className="text-primary text-[9px] font-black uppercase hover:underline inline-flex items-center gap-1 mt-2">Descargar QR</a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CATÁLOGO (Solo Plan Catalog) */}
                        {editingRegistro.plan === 'catalog' && (
                            <div className="space-y-8">
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary border-b border-white/5 pb-4 flex items-center gap-3">
                                    <Store size={18} /> CATÁLOGO DE PRODUCTOS
                                </h4>
                                
                                <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                                    <button onClick={() => setCatalogTab('config')} className={cn("flex-1 py-3 font-black uppercase text-[10px] tracking-widest rounded-xl transition-all", catalogTab === 'config' ? "bg-primary text-navy" : "text-white/40")}>Categorías</button>
                                    <button onClick={() => setCatalogTab('products')} className={cn("flex-1 py-3 font-black uppercase text-[10px] tracking-widest rounded-xl transition-all", catalogTab === 'products' ? "bg-primary text-navy" : "text-white/40")}>Productos ({catalogoJson.products.length}/20)</button>
                                </div>

                                {catalogTab === 'config' ? (
                                    <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 space-y-6">
                                        <div className="flex justify-between items-center">
                                            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Organización del Catálogo</p>
                                            <button onClick={() => {
                                                const cat = prompt('Nombre de la categoría:');
                                                if (cat) updateCatalogo({ ...catalogoJson, categories: [...catalogoJson.categories, cat] });
                                            }} className="text-primary font-black uppercase text-[10px] hover:underline flex items-center gap-1"><Plus size={12} /> Nueva Categoría</button>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            {catalogoJson.categories.map((c: string, i: number) => (
                                                <div key={i} className="bg-primary/10 border border-primary/20 px-4 py-2 rounded-xl flex items-center gap-3">
                                                    <span className="text-[10px] font-black text-primary uppercase">{c}</span>
                                                    <button onClick={() => updateCatalogo({ 
                                                        ...catalogoJson, 
                                                        products: catalogoJson.products.map((p: any) => 
                                                            (p.categoria || p.category) === c ? { ...p, categoria: 'Todas', category: 'Todas' } : p
                                                        ),
                                                        categories: catalogoJson.categories.filter((cat: any) => cat !== c) 
                                                    })} className="hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center border-b border-white/5 pb-6">
                                            <select 
                                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase text-white outline-none"
                                                value={productCategoryFilter}
                                                onChange={e => setProductCategoryFilter(e.target.value)}
                                            >
                                                <option value="Todas" className="bg-navy">Todas las Categorías</option>
                                                {catalogoJson.categories.map((c: any) => <option key={c} value={c} className="bg-navy">{c}</option>)}
                                            </select>
                                            <button onClick={() => {
                                                if (catalogoJson.products.length >= 20) {
                                                    alert("Máximo 20 productos permitidos en total.");
                                                    return;
                                                }
                                                const p = { 
                                                    id: `prod_${Date.now()}`, 
                                                    nombre: 'Nuevo Producto', 
                                                    name: 'Nuevo Producto', 
                                                    precio: '0.00', 
                                                    price: '0.00', 
                                                    categoria: catalogoJson.categories[0] || 'Todas', 
                                                    category: catalogoJson.categories[0] || 'Todas', 
                                                    image: '', 
                                                    descripcion: '', 
                                                    description: '' 
                                                };
                                                updateCatalogo({ ...catalogoJson, products: [p, ...catalogoJson.products] });
                                            }} className="bg-primary text-navy p-3 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"><Plus size={20} /></button>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                                            {catalogoJson.products.filter((p: any) => productCategoryFilter === 'Todas' || (p.categoria || p.category) === productCategoryFilter).map((prod: any, idx: number) => (
                                                <div key={prod.id || idx} className="bg-white/5 border border-white/10 p-6 rounded-3xl flex gap-6 relative group">
                                                    <button onClick={() => updateCatalogo({ ...catalogoJson, products: catalogoJson.products.filter((p: any) => p.id !== prod.id) })} className="absolute top-4 right-4 text-white/20 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                                    <div className="w-24 h-24 bg-white/10 rounded-2xl overflow-hidden relative border border-white/5 group-hover:border-primary/30 transition-all">
                                                        {prod.image ? <img src={prod.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white/10 uppercase font-black text-[10px]">Sin Imagen</div>}
                                                        <label className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-all backdrop-blur-sm">
                                                            <Upload size={16} className="text-white" />
                                                            <input type="file" className="hidden" accept="image/*" onChange={async e => {
                                                                const file = e.target.files?.[0];
                                                                if (!file) return;
                                                                const fd = new FormData();
                                                                fd.append('file', file);
                                                                const res = await fetch('/api/upload', { method: 'POST', body: fd });
                                                                if (res.ok) {
                                                                    const { url } = await res.json();
                                                                    const prods = [...catalogoJson.products];
                                                                    const pIdx = prods.findIndex(p => p.id === prod.id);
                                                                    prods[pIdx] = { ...prod, image: url };
                                                                    updateCatalogo({ ...catalogoJson, products: prods });
                                                                }
                                                            }} />
                                                        </label>
                                                    </div>
                                                    <div className="flex-1 space-y-4">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="text-[9px] font-black uppercase text-white/20 mb-1 block">Nombre Producto</label>
                                                                <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-primary/40" value={prod.nombre || prod.name || ''} onChange={e => {
                                                                    const prods = [...catalogoJson.products];
                                                                    const pIdx = prods.findIndex(p => (p.id && prod.id) ? p.id === prod.id : (p.nombre === prod.nombre || p.name === prod.name));
                                                                    prods[pIdx] = { ...prod, nombre: e.target.value, name: e.target.value };
                                                                    updateCatalogo({ ...catalogoJson, products: prods });
                                                                }} />
                                                            </div>
                                                            <div>
                                                                <label className="text-[9px] font-black uppercase text-white/20 mb-1 block">Precio</label>
                                                                <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-primary/40" value={prod.precio || prod.price || ''} onChange={e => {
                                                                    const prods = [...catalogoJson.products];
                                                                    const pIdx = prods.findIndex(p => (p.id && prod.id) ? p.id === prod.id : (p.nombre === prod.nombre || p.name === prod.name));
                                                                    prods[pIdx] = { ...prod, precio: e.target.value, price: e.target.value };
                                                                    updateCatalogo({ ...catalogoJson, products: prods });
                                                                }} />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="text-[9px] font-black uppercase text-white/20 mb-1 block">Descripción breve</label>
                                                            <textarea className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-medium min-h-[60px] resize-none outline-none focus:border-primary/40" value={prod.descripcion || prod.description || ''} onChange={e => {
                                                                const prods = [...catalogoJson.products];
                                                                const pIdx = prods.findIndex(p => (p.id && prod.id) ? p.id === prod.id : (p.nombre === prod.nombre || p.name === prod.name));
                                                                prods[pIdx] = { ...prod, descripcion: e.target.value, description: e.target.value };
                                                                updateCatalogo({ ...catalogoJson, products: prods });
                                                            }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Fixed */}
                <div className="p-8 border-t border-white/10 bg-[#050B1C]/90 backdrop-blur-xl flex justify-between items-center gap-4">
                    <div className="flex gap-4">
                        <button 
                            onClick={onClose}
                            className="px-8 py-4 rounded-2xl bg-white/5 font-black uppercase text-[10px] tracking-widest hover:bg-white/10 hover:text-white transition-all text-white/40"
                        >
                            Cancelar
                        </button>
                    </div>
                    
                    <div className="flex gap-4">
                         <a
                            href={`/api/vcard/${editingRegistro.slug || editingRegistro.id}`}
                            download={`${editingRegistro.slug || editingRegistro.id}.vcf`}
                            className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all flex items-center gap-2 text-white"
                        >
                            <Download size={14} /> vCard
                        </a>
                        <button
                            onClick={handleSaveEdit}
                            disabled={isSaving}
                            className="px-12 py-4 rounded-2xl bg-primary text-navy font-black uppercase text-[10px] tracking-[0.1em] shadow-[0_10px_30px_rgba(255,107,0,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                        >
                            {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
