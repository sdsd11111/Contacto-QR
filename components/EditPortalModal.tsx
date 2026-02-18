"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Download, Key, AlertCircle, CheckCircle, Loader2, Edit, ArrowRight } from 'lucide-react';
import { formatPhoneEcuador, cn } from '@/lib/utils';

interface EditPortalModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function EditPortalModal({ isOpen, onClose }: EditPortalModalProps) {
    const [step, setStep] = useState<'code' | 'edit' | 'success'>('code');
    const [editCode, setEditCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [userData, setUserData] = useState<any>(null);
    const [usesRemaining, setUsesRemaining] = useState(0);

    // Form fields editable
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
        foto_url: '' // For profile image update (base64)
    });

    const validateCode = async () => {
        if (!editCode.trim()) return;
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/edit/validate-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: editCode })
            });
            const data = await res.json();

            if (res.ok) {
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
                    foto_url: '' // Keep empty on load, only set if changed. Use userData.foto_url for display.
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

        // Auto-format WhatsApp before saving using global utility
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
                setUserData({ ...userData, ...formattedData }); // Update local user data for preview
                setUsesRemaining(result.remaining);
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

    const downloadVCard = async () => {
        if (!userData) return;

        setLoading(true); // Re-use loading state for visual feedback

        let photoBase64 = "";

        // Intentar descargar y convertir la foto a Base64 si existe
        // Usamos formData.foto_url si es nueva (ya es base64) o userData.foto_url
        const currentPhotoUrl = formData.foto_url || userData.foto_url;

        if (currentPhotoUrl) {
            // Si ya es base64 (empieza con data:image), usarla directo limpiando el header
            if (currentPhotoUrl.startsWith('data:image')) {
                photoBase64 = currentPhotoUrl.split(',')[1];
            } else {
                // Si es URL externa, intentar fetch (puede fallar por CORS si no está configurado)
                try {
                    const response = await fetch(currentPhotoUrl);
                    const blob = await response.blob();
                    const reader = new FileReader();
                    photoBase64 = await new Promise((resolve) => {
                        reader.onloadend = () => {
                            const base64 = (reader.result as string).split(',')[1];
                            resolve(base64);
                        };
                        reader.readAsDataURL(blob);
                    });
                } catch (error) {
                    console.error("Error al procesar la imagen para vCard", error);
                }
            }
        }

        const currentUrl = `${window.location.origin}/card/${userData.slug}`;

        // Variables para construir la vCard estructurada
        let fullName = '';
        let structuredName = ''; // Campo N:
        let organization = '';   // Campo ORG:

        if (formData.tipo_perfil === 'persona') {
            fullName = `${formData.nombres} ${formData.apellidos}`.trim();
            structuredName = `${formData.apellidos};${formData.nombres};;;`;
            organization = formData.company || '';
        } else {
            fullName = formData.nombre_negocio;
            organization = formData.nombre_negocio;
            if (formData.contacto_nombre || formData.contacto_apellido) {
                structuredName = `${formData.contacto_apellido || ''};${formData.contacto_nombre || ''};;;`;
            } else {
                structuredName = ';;;;';
            }
        }

        let vcard = `BEGIN:VCARD
VERSION:3.0
FN:${fullName}
N:${structuredName}
ORG:${organization}
TITLE:${formData.profession || ""}
TEL;TYPE=CELL,VOICE:${formData.whatsapp}
EMAIL;TYPE=WORK,INTERNET:${formData.email || ""}
URL:${currentUrl}
NOTE:${formData.bio || "Generado por Regístrame Ya!"}`;

        if (photoBase64) {
            vcard += `
PHOTO;ENCODING=b;TYPE=JPEG:${photoBase64}`;
        }

        if (formData.address) {
            vcard += `
ADR;TYPE=WORK:;;${formData.address};;;;`;
        }

        if (formData.instagram) vcard += `\nURL;type=Instagram:${formData.instagram.startsWith('http') ? formData.instagram : `https://instagram.com/${formData.instagram.replace('@', '')}`}`;
        if (formData.linkedin) vcard += `\nURL;type=LinkedIn:${formData.linkedin}`;
        if (formData.web) vcard += `\nURL;type=Website:${formData.web}`;
        if (formData.facebook) vcard += `\nURL;type=Facebook:${formData.facebook}`;
        if (formData.tiktok) vcard += `\nURL;type=TikTok:${formData.tiktok.startsWith('http') ? formData.tiktok : `https://tiktok.com/@${formData.tiktok.replace('@', '')}`}`;

        vcard += `\nEND:VCARD`;

        const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const filename = `${userData.nombre.replace(/[^a-zA-Z0-9]/g, '_')}.vcf`;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        setLoading(false);
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
                                Portal de Autoedición
                            </h2>
                            <p className="text-white/80 text-xs font-bold uppercase tracking-widest mt-1">
                                Actualiza tus datos sin cambiar tu QR
                            </p>
                        </div>
                        <button onClick={onClose} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto grow">

                        {/* STEP 1: CODE ENTRY */}
                        {step === 'code' && (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                                    <Key size={40} className="text-primary" />
                                </div>
                                <h3 className="text-2xl font-black text-navy mb-2">Ingresa tu Código de Edición</h3>
                                <p className="text-gray-500 mb-8 max-w-xs">
                                    Encuentra tu código único (ej. RYA-2026-XXXX) en el correo de bienvenida.
                                </p>

                                <div className="w-full max-w-sm mb-4">
                                    <input
                                        type="text"
                                        value={editCode}
                                        onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                                        placeholder="RYA-2026-XXXX"
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
                                    disabled={loading || editCode.length < 10}
                                    className="bg-navy text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-navy/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : 'Verificar Código'}
                                </button>
                            </div>
                        )}

                        {/* STEP 2: EDIT FORM */}
                        {step === 'edit' && userData && (
                            <div>
                                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                                    <AlertCircle className="text-yellow-600 shrink-0 mt-0.5" size={20} />
                                    <div>
                                        <p className="text-sm text-yellow-800 font-bold">Edita con cuidado</p>
                                        <p className="text-xs text-yellow-700 mt-1">
                                            Tienes <strong className="text-yellow-900">{usesRemaining} ediciones restantes</strong>.
                                            Al guardar, se descontará una edición. Tu código QR físico seguirá funcionando igual.
                                        </p>
                                    </div>
                                </div>

                                {/* Perfil Type Toggle */}
                                <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-6">
                                    <button
                                        onClick={() => setFormData({ ...formData, tipo_perfil: 'persona' })}
                                        className={cn(
                                            "flex-1 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all",
                                            formData.tipo_perfil === 'persona' ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-navy"
                                        )}
                                    >
                                        Persona
                                    </button>
                                    <button
                                        onClick={() => setFormData({ ...formData, tipo_perfil: 'negocio' })}
                                        className={cn(
                                            "flex-1 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all",
                                            formData.tipo_perfil === 'negocio' ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-navy"
                                        )}
                                    >
                                        Negocio / Local
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Image Upload & Dynamic Name Fields */}
                                    <div className="col-span-full border-b pb-6 mb-2">
                                        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                                            <div className="relative group w-24 h-24 shrink-0">
                                                <div className="w-full h-full bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow-md">
                                                    {formData.foto_url || userData.foto_url ? (
                                                        <img
                                                            src={formData.foto_url || userData.foto_url}
                                                            alt="Profile"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-2xl">?</div>
                                                    )}
                                                </div>
                                                <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                    <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                                                        <Edit size={20} className="text-white" />
                                                    </div>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                const reader = new FileReader();
                                                                reader.onloadend = () => {
                                                                    setFormData({ ...formData, foto_url: reader.result as string });
                                                                };
                                                                reader.readAsDataURL(file);
                                                            }
                                                        }}
                                                    />
                                                </label>
                                            </div>

                                            <div className="flex-1 w-full space-y-4">
                                                {formData.tipo_perfil === 'persona' ? (
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="form-group">
                                                            <label className="text-[10px] font-black text-primary uppercase mb-1 block">Nombres</label>
                                                            <input
                                                                className="w-full border rounded-xl p-2.5 font-bold text-navy focus:border-primary outline-none transition-all text-sm"
                                                                value={formData.nombres}
                                                                onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                                                                placeholder="Ej. Juan"
                                                            />
                                                        </div>
                                                        <div className="form-group">
                                                            <label className="text-[10px] font-black text-primary uppercase mb-1 block">Apellidos</label>
                                                            <input
                                                                className="w-full border rounded-xl p-2.5 font-bold text-navy focus:border-primary outline-none transition-all text-sm"
                                                                value={formData.apellidos}
                                                                onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                                                                placeholder="Ej. Pérez"
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        <div className="form-group">
                                                            <label className="text-[10px] font-black text-primary uppercase mb-1 block">Nombre del Negocio / Local</label>
                                                            <input
                                                                className="w-full border rounded-xl p-2.5 font-bold text-navy focus:border-primary outline-none transition-all text-sm"
                                                                value={formData.nombre_negocio}
                                                                onChange={(e) => setFormData({ ...formData, nombre_negocio: e.target.value })}
                                                                placeholder="Ej. Restaurante El Sol"
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="form-group">
                                                                <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Contacto Nombre (Opcional)</label>
                                                                <input
                                                                    className="w-full border rounded-xl p-2.5 font-bold text-navy focus:border-primary outline-none transition-all text-sm"
                                                                    value={formData.contacto_nombre}
                                                                    onChange={(e) => setFormData({ ...formData, contacto_nombre: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="form-group">
                                                                <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Contacto Apellido (Opcional)</label>
                                                                <input
                                                                    className="w-full border rounded-xl p-2.5 font-bold text-navy focus:border-primary outline-none transition-all text-sm"
                                                                    value={formData.contacto_apellido}
                                                                    onChange={(e) => setFormData({ ...formData, contacto_apellido: e.target.value })}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Editable Fields */}
                                    <div className="form-group">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Profesión</label>
                                        <input
                                            className="w-full border rounded-lg p-2 font-medium"
                                            value={formData.profession}
                                            onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Empresa</label>
                                        <input
                                            className="w-full border rounded-lg p-2 font-medium"
                                            value={formData.company}
                                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-full">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Bio / Descripción</label>
                                        <textarea
                                            className="w-full border rounded-lg p-2 font-medium"
                                            rows={2}
                                            value={formData.bio}
                                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="text-xs font-bold text-gray-500 uppercase">WhatsApp</label>
                                        <input
                                            className="w-full border rounded-lg p-2 font-medium"
                                            value={formData.whatsapp}
                                            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                                        <input
                                            className="w-full border rounded-lg p-2 font-medium"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>

                                    {/* Dirección y Web - SECCIÓN NUEVA */}
                                    <div className="col-span-full border-t pt-4 mt-2 mb-2">
                                        <h4 className="text-sm font-black text-navy uppercase mb-3 flex items-center gap-2">
                                            <span className="w-1 h-4 bg-primary rounded-full"></span>
                                            Ubicación y Web
                                        </h4>
                                    </div>
                                    <div className="form-group">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Dirección</label>
                                        <input
                                            className="w-full border rounded-lg p-2 font-medium"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            placeholder="Ciudad, País"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Sitio Web</label>
                                        <input
                                            className="w-full border rounded-lg p-2 font-medium"
                                            value={formData.web}
                                            onChange={(e) => setFormData({ ...formData, web: e.target.value })}
                                            placeholder="https://..."
                                        />
                                    </div>
                                    <div className="col-span-full form-group">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Google Business (Link)</label>
                                        <input
                                            className="w-full border rounded-lg p-2 font-medium"
                                            value={formData.google_business}
                                            onChange={(e) => setFormData({ ...formData, google_business: e.target.value })}
                                            placeholder="https://maps.app.goo.gl/..."
                                        />
                                    </div>

                                    {/* Redes Sociales - SECCIÓN NUEVA */}
                                    <div className="col-span-full border-t pt-4 mt-2 mb-2">
                                        <h4 className="text-sm font-black text-navy uppercase mb-3 flex items-center gap-2">
                                            <span className="w-1 h-4 bg-primary rounded-full"></span>
                                            Redes Sociales
                                        </h4>
                                    </div>

                                    <div className="form-group">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Instagram (Usuario)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-gray-400 font-bold">@</span>
                                            <input
                                                className="w-full border rounded-lg p-2 pl-7 font-medium"
                                                value={formData.instagram}
                                                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                                                placeholder="usuario"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="text-xs font-bold text-gray-500 uppercase">TikTok (Usuario)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-gray-400 font-bold">@</span>
                                            <input
                                                className="w-full border rounded-lg p-2 pl-7 font-medium"
                                                value={formData.tiktok}
                                                onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                                                placeholder="usuario"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Facebook (Link)</label>
                                        <input
                                            className="w-full border rounded-lg p-2 font-medium"
                                            value={formData.facebook}
                                            onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                                            placeholder="https://facebook.com/..."
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="text-xs font-bold text-gray-500 uppercase">LinkedIn (Link)</label>
                                        <input
                                            className="w-full border rounded-lg p-2 font-medium"
                                            value={formData.linkedin}
                                            onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                                            placeholder="https://linkedin.com/in/..."
                                        />
                                    </div>

                                    <div className="col-span-full border-t pt-4 mt-2 mb-2">
                                        <h4 className="text-sm font-black text-navy uppercase mb-3 flex items-center gap-2">
                                            <span className="w-1 h-4 bg-primary rounded-full"></span>
                                            Oferta
                                        </h4>
                                    </div>
                                    <div className="col-span-full form-group">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Productos / Servicios</label>
                                        <textarea
                                            className="w-full border rounded-lg p-2 font-medium"
                                            rows={2}
                                            value={formData.products}
                                            onChange={(e) => setFormData({ ...formData, products: e.target.value })}
                                        />
                                    </div>

                                    <div className="col-span-full form-group">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Categorías / Etiquetas</label>
                                        <input
                                            className="w-full border rounded-lg p-2 font-medium"
                                            value={formData.categories}
                                            onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
                                            placeholder="Ej. Marketing, Ventas, Consultoría (Separado por comas)"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: SUCCESS */}
                        {step === 'success' && (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600">
                                    <CheckCircle size={40} />
                                </div>
                                <h3 className="text-2xl font-black text-navy mb-2">¡Cambios Guardados!</h3>
                                <p className="text-gray-500 mb-8 max-w-xs">
                                    Tu información ha sido actualizada. Tu código QR físico funcionará con estos nuevos datos.
                                </p>
                                <p className="text-sm font-bold text-navy mb-6">
                                    Te quedan: <span className="text-primary text-lg">{usesRemaining}</span> ediciones.
                                </p>

                                <div className="flex flex-col gap-3 w-full max-w-sm">
                                    <button
                                        onClick={downloadVCard}
                                        disabled={loading}
                                        className="bg-primary text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : <Download size={20} />}
                                        Descargar Archivo de Contacto (.vcf)
                                    </button>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="text-navy/50 font-bold uppercase text-xs hover:text-navy transition-colors py-2"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Footer Actions */}
                    {step === 'edit' && (
                        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3 shrink-0">
                            <button
                                onClick={() => setStep('code')}
                                className="px-6 py-2 rounded-xl border border-gray-300 font-bold text-gray-500 hover:bg-gray-100 transition-colors uppercase text-sm"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="px-6 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors uppercase text-sm flex items-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                Guardar Cambios
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
