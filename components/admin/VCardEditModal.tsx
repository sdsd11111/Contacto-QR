import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Trash2, Download, Save, RefreshCw, QrCode, ExternalLink, Clock, X as CloseIcon, Youtube } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming this utility exists

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
    if (!isOpen || !editingRegistro) return null;

    const galeriaUrls: string[] = (() => {
        const urls = editingRegistro.galeria_urls;
        if (!urls) return [];
        if (Array.isArray(urls)) return urls;
        if (typeof urls === 'string') {
            try {
                const parsed = JSON.parse(urls);
                return Array.isArray(parsed) ? parsed : [];
            } catch {
                return [];
            }
        }
        return [];
    })();

    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        // Limite total 5
        if (galeriaUrls.length + files.length > 5) {
            alert('Máximo 5 imágenes en galería.');
            return;
        }

        try {
            const uploadedUrls = [];
            for (const file of files) {
                const formData = new FormData();
                formData.append('file', file);
                const res = await fetch('/api/upload', { method: 'POST', body: formData });
                if (res.ok) {
                    const { url } = await res.json();
                    uploadedUrls.push(url);
                }
            }

            setEditingRegistro({
                ...editingRegistro,
                galeria_urls: [...galeriaUrls, ...uploadedUrls]
            });

        } catch (err: any) {
            alert("Error subiendo imágenes: " + err.message);
        }
    };

    const removeGalleryItem = (index: number) => {
        const newUrls = [...galeriaUrls];
        newUrls.splice(index, 1);
        setEditingRegistro({ ...editingRegistro, galeria_urls: newUrls });
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
        <div className="fixed inset-0 z-[50] flex items-center justify-center p-4">
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
                    <div className="sticky top-0 z-10 bg-[#050B1C]/80 backdrop-blur-xl border-b border-white/10 p-8 flex justify-between items-start">
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
                                editingRegistro.plan === 'pro' ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                                    "bg-white/5 text-white/40 border-white/10"
                            )}>
                                {editingRegistro.plan}
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
                                        <span className="text-[10px] uppercase font-black tracking-widest text-white/20">Sin Foto</span>
                                    )}
                                    <label className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm z-10">
                                        <Upload size={24} className="text-white" />
                                        <input type="file" className="hidden" accept="image/*" onChange={onPhotoUpload} />
                                    </label>
                                </div>
                            </div>
                            
                            {editingRegistro.plan === 'pro' && (
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
                                    <div className="grid grid-cols-2 gap-4">
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
                                    <div className="space-y-4">
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
                                                <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">Nombre Contacto</label>
                                                <input
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-primary/40 transition-all text-xs"
                                                    value={editingRegistro.contacto_nombre || ''}
                                                    onChange={e => setEditingRegistro({ ...editingRegistro, contacto_nombre: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">Apellido Contacto</label>
                                                <input
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-primary/40 transition-all text-xs"
                                                    value={editingRegistro.contacto_apellido || ''}
                                                    onChange={e => setEditingRegistro({ ...editingRegistro, contacto_apellido: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
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
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">YouTube (Perfil/Canal)</label>
                                        <input
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-primary/40 transition-all text-xs"
                                            value={editingRegistro.youtube || ''}
                                            onChange={e => setEditingRegistro({ ...editingRegistro, youtube: e.target.value })}
                                        />
                                    </div>
                                    <div className="bg-primary/5 p-4 rounded-2xl border border-primary/20">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 block ml-1 flex items-center gap-2">
                                            <Youtube size={12} /> Video Promocional (YouTube Embed)
                                        </label>
                                        <input
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-bold outline-none focus:border-primary/40 transition-all text-xs"
                                            value={editingRegistro.youtube_video_url || ''}
                                            onChange={e => setEditingRegistro({ ...editingRegistro, youtube_video_url: e.target.value })}
                                            placeholder="https://www.youtube.com/watch?v=..."
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">X / Twitter (Link)</label>
                                        <input
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-primary/40 transition-all text-xs"
                                            value={editingRegistro.x || ''}
                                            onChange={e => setEditingRegistro({ ...editingRegistro, x: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">Carta/Menú Digital (URL)</label>
                                    <input
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-primary/40 transition-all"
                                        value={editingRegistro.menu_digital || ''}
                                        onChange={e => setEditingRegistro({ ...editingRegistro, menu_digital: e.target.value })}
                                        placeholder="https://ejemplo.com/menu.pdf"
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
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">Google Maps (URL compartida)</label>
                                    <input
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-primary/40 transition-all"
                                        value={editingRegistro.google_business || ''}
                                        onChange={e => setEditingRegistro({ ...editingRegistro, google_business: e.target.value })}
                                        placeholder="https://maps.app.goo.gl/..."
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">Nombre de Red WiFi (SSID)</label>
                                    <input
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-primary/40 transition-all"
                                        value={editingRegistro.wifi_ssid || ''}
                                        onChange={e => setEditingRegistro({ ...editingRegistro, wifi_ssid: e.target.value })}
                                        placeholder="Ej. MiLocal_Guest"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">Contraseña del WiFi</label>
                                    <input
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-primary/40 transition-all"
                                        value={editingRegistro.wifi_password || ''}
                                        onChange={e => setEditingRegistro({ ...editingRegistro, wifi_password: e.target.value })}
                                        placeholder="Opcional"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 block ml-1 italic">Texto Botón Hero (Oferta)</label>
                                    <input
                                        className="w-full bg-primary/5 border border-primary/20 rounded-2xl px-6 py-4 font-bold outline-none focus:border-primary transition-all"
                                        value={editingRegistro.hero_button_text || ''}
                                        onChange={e => setEditingRegistro({ ...editingRegistro, hero_button_text: e.target.value })}
                                        placeholder="Ej. ACCEDE A NUESTRO INTERNET"
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">Sitio Web</label>
                                    <input
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-primary/40 transition-all"
                                        value={editingRegistro.web || ''}
                                        onChange={e => setEditingRegistro({ ...editingRegistro, web: e.target.value })}
                                    />
                                </div>
                                {/* Rest of links as per original if needed... leaving some to keep component size reasonable or can add them all */}
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 block ml-1">Sitio Web / Enlace Principal</label>
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
                                    {/* QR DE DESCARGA VCF */}
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
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-2 text-primary text-[10px] font-black uppercase hover:underline"
                                                >
                                                    <Download size={12} /> Descargar QR Alta Res.
                                                </a>
                                            </div>
                                        </div>
                                    </div>

                                    {/* QR DE PERFIL DIGITAL */}
                                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-4">
                                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Opción 2: Perfil Digital (Visualización)</p>
                                        <div className="flex items-center gap-6">
                                            <div className="bg-white p-3 rounded-2xl">
                                                <img
                                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : ''}/card/${editingRegistro.slug || editingRegistro.id}`)}`}
                                                    alt="QR Perfil"
                                                    className="w-20 h-20"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-bold text-white/60 leading-tight">Muestra el perfil completo con fotos y botones. El cliente elige cuándo guardar el contacto.</p>
                                                <a
                                                    href={`https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : ''}/card/${editingRegistro.slug || editingRegistro.id}`)}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-2 text-primary text-[10px] font-black uppercase hover:underline"
                                                >
                                                    <ExternalLink size={12} /> Descargar QR Alta Res.
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/30 border-b border-white/5 pb-4 mb-6">GALERÍA DE TRABAJOS</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {galeriaUrls.map((url: string, idx: number) => (
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
                                    {galeriaUrls.length < 5 && (
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
                        onClick={onClose}
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
    );
}
