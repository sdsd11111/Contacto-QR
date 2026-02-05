"use client";

import { useState, useEffect } from "react";
import QRCode from 'qrcode';
import { motion, AnimatePresence } from "framer-motion";
import {
    User,
    Briefcase,
    Smartphone,
    Camera,
    ChevronRight,
    ChevronLeft,
    Check,
    Mail,
    Zap,
    ShieldCheck,
    ArrowRight,
    CheckCircle,
    FileText,
    Tag,
    Loader2
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "@/lib/supabase";
import imageCompression from 'browser-image-compression';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const steps = [
    { id: 1, title: 'Básico', icon: User },
    { id: 2, title: 'Perfil', icon: Briefcase },
    { id: 3, title: 'Visual', icon: Camera },
    { id: 4, title: 'Plan', icon: Zap },
    { id: 5, title: 'Pago', icon: Smartphone },
];

const INDUSTRY_TAGS: Record<string, string[]> = {
    'carpintero': ['Carpintería', 'Muebles', 'Madera', 'Reparaciones', 'Diseño'],
    'plomero': ['Plomería', 'Tubería', 'Agua', 'Goteras', 'Filtración', 'Fontanero'],
    'electricista': ['Electricidad', 'Luces', 'Cables', 'Cortocircuito', 'Instalaciones'],
    'enfermera': ['Enfermería', 'Cuidado', 'Salud', 'Adultos', 'Niños', 'Curaciones'],
    'enfermero': ['Enfermería', 'Cuidado', 'Salud', 'Adultos', 'Niños', 'Curaciones'],
    'pastelero': ['Pastelería', 'Tortas', 'Dulces', 'Eventos', 'Fiestas', 'Repostería'],
    'pastelera': ['Pastelería', 'Tortas', 'Dulces', 'Eventos', 'Fiestas', 'Repostería'],
    'tecnico': ['Reparaciones', 'Servicio Técnico', 'Mantenimiento', 'Soporte'],
    'abogado': ['Legal', 'Juicios', 'Asesoría', 'Derecho'],
    'doctor': ['Salud', 'Medicina', 'Consulta', 'Médico'],
    'odontologo': ['Dientes', 'Salud Bucal', 'Dentista', 'Limpieza'],
};

export default function RegisterWizard() {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        profession: '',
        company: '',
        whatsapp: '',
        email: '',
        bio: '',
        address: '',
        web: '',
        instagram: '',
        linkedin: '',
        categories: '',
        plan: 'pro' as 'basic' | 'pro',
        photo: null as File | null,
        gallery: [] as File[],
        receipt: null as File | null,
    });

    const [emailError, setEmailError] = useState('');
    const [hasManualTags, setHasManualTags] = useState(false);

    // Auto-suggest tags based on profession
    useEffect(() => {
        if (!hasManualTags) {
            const profession = formData.profession.toLowerCase().trim();
            // Buscar coincidencia exacta o parcial
            const key = Object.keys(INDUSTRY_TAGS).find(k => profession.includes(k));
            if (key) {
                updateForm('categories', INDUSTRY_TAGS[key].join(', '));
            }
        }
    }, [formData.profession, hasManualTags]);

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const generateSlug = (nombre: string) => {
        const cleanName = nombre
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Quitar acentos
            .replace(/[^a-z0-9]/g, "-") // Reemplazar no-alfanuméricos por guiones
            .replace(/-+/g, "-") // Quitar guiones seguidos
            .replace(/^-|-$/g, ""); // Quitar guiones al inicio/final

        const shortId = Math.random().toString(36).substring(2, 6); // 4 caracteres aleatorios
        return `${cleanName}-${shortId}`;
    };

    const compressAndUpload = async (file: File, bucket: string, path: string) => {
        try {
            let fileToUpload: File | Blob = file;

            // Solo comprimir si es una imagen
            if (file.type.startsWith('image/')) {
                const options = {
                    maxSizeMB: 0.5,
                    maxWidthOrHeight: 1024,
                    useWebWorker: true,
                };
                fileToUpload = await imageCompression(file, options);
            }

            const { data, error } = await supabase.storage
                .from(bucket)
                .upload(path, fileToUpload, { upsert: true });

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(path);

            return publicUrl;
        } catch (err) {
            console.error("Error uploading file:", err);
            throw err; // Re-lanzar para que handleFinalSubmit lo capture y muestre el alert
        }
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                let encoded = reader.result?.toString().replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
                if (encoded) resolve(encoded);
                else reject('Error encoding image');
            };
            reader.onerror = error => reject(error);
        });
    };



    const generateVCard = (data: typeof formData, photoBase64: string | null, galleryUrls: string[] = [], categories: string = '') => {
        // vCard 3.0 format
        // NOTA: Para máxima compatibilidad, la foto debe ser BASE64 y tener "Line Folding" (saltos de línea con espacio).

        let photoBlock = '';
        if (photoBase64) {
            // Dividir en trozos de 72 caracteres para respetar el estándar (RFC 2426)
            const folded = photoBase64.match(/.{1,72}/g)?.join('\r\n ') || photoBase64;
            photoBlock = `PHOTO;ENCODING=b;TYPE=JPEG:\r\n ${folded}`;
        }

        // Agregar galería al campo NOTA
        let noteContent = `${data.bio} - Generado con RegistrameYa`;
        if (galleryUrls.length > 0) {
            noteContent += `\n\nMis Trabajos:\n${galleryUrls.join('\n')}`;
        }

        const vcard = [
            'BEGIN:VCARD',
            'VERSION:3.0',
            `FN;CHARSET=UTF-8:${data.name}`,
            `N;CHARSET=UTF-8:${data.name.split(' ').reverse().join(';')};;;`,
            `TITLE;CHARSET=UTF-8:${data.profession}`,
            `ORG;CHARSET=UTF-8:${data.company}`,
            `TEL;TYPE=CELL,VOICE:${data.whatsapp}`,
            `EMAIL;TYPE=WORK,INTERNET:${data.email}`,
            `ADR;TYPE=WORK,POSTAL;CHARSET=UTF-8:;;${data.address};;;;`,
            `URL:${data.web}`,
            `NOTE;CHARSET=UTF-8:${noteContent}`,
            categories ? `CATEGORIES:${categories}` : '', // ← ETIQUETAS AQUÍ
            photoBlock,
            data.instagram ? `X-SOCIALPROFILE;TYPE=instagram:${data.instagram}` : '',
            data.linkedin ? `X-SOCIALPROFILE;TYPE=linkedin:${data.linkedin}` : '',
            `X-SOCIALPROFILE;TYPE=whatsapp:https://wa.me/${data.whatsapp.replace(/[^0-9]/g, '')}`,
            'END:VCARD'
        ].filter(Boolean).join('\n');

        return vcard;
    };

    const handleFinalSubmit = async () => {
        setIsSubmitting(true);
        try {
            let photoUrl = null;
            let galleryUrls: string[] = [];
            let receiptUrl = null;
            let photoBase64 = null;

            const timestamp = Date.now();

            // 0. CALCULAR ETIQUETAS (Una sola vez para usar en Upsert y vCard)
            // Esto asegura consistencia y evita errores de procesamiento doble
            const profession = formData.profession.toLowerCase().trim();
            const extraTags = INDUSTRY_TAGS[profession] || [];
            const userTags = formData.categories.split(',').map((t: string) => t.trim()).filter(Boolean);
            const combinedTags = new Set([
                ...userTags.map((t: string) => t.toLowerCase()),
                ...extraTags.map((t: string) => t.toLowerCase())
            ]);
            const finalCategories = Array.from(combinedTags)
                .map((t: string) => t.charAt(0).toUpperCase() + t.slice(1))
                .join(', ');

            // 1. Verificar si ya existe el usuario para mantener el slug
            const { data: existingUser, error: fetchError } = await supabase
                .from('registraya_vcard_registros')
                .select('slug, foto_url, comprobante_url, galeria_urls')
                .eq('email', formData.email)
                .maybeSingle();

            if (fetchError) {
                console.error("Error fetching existing user:", fetchError);
            }

            const slug = existingUser?.slug || generateSlug(formData.name);

            // 2. Subir imágenes (solo si hay nuevas)
            if (formData.photo) {
                try {
                    photoBase64 = await fileToBase64(formData.photo);
                } catch (e) { console.error("Error base64 photo", e); }
                photoUrl = await compressAndUpload(formData.photo, 'vcards', `photos/${timestamp}-${formData.photo.name}`);
            } else if (existingUser) {
                photoUrl = existingUser.foto_url;
            }

            if (formData.receipt) {
                receiptUrl = await compressAndUpload(formData.receipt, 'vcards', `receipts/${timestamp}-${formData.receipt.name}`);
            } else if (existingUser) {
                receiptUrl = existingUser.comprobante_url;
            }

            // 2b. Subir galería (solo si es Pro)
            if (formData.plan === 'pro') {
                if (formData.gallery.length > 0) {
                    for (const file of formData.gallery) {
                        const url = await compressAndUpload(file, 'vcards', `gallery/${timestamp}-${file.name}`);
                        galleryUrls.push(url);
                    }
                } else if (existingUser) {
                    galleryUrls = existingUser.galeria_urls || [];
                }
            }

            // 3. UPSERT: Inserta o Actualiza por email
            const upsertData = {
                nombre: formData.name,
                whatsapp: formData.whatsapp,
                email: formData.email,
                profesion: formData.profession,
                empresa: formData.company,
                bio: formData.bio,
                direccion: formData.address,
                web: formData.web,
                instagram: formData.instagram,
                linkedin: formData.linkedin,
                plan: formData.plan,
                foto_url: photoUrl,
                comprobante_url: receiptUrl,
                galeria_urls: galleryUrls,
                status: 'pendiente',
                slug: slug,
                etiquetas: finalCategories
            };

            const { error: upsertError } = await supabase
                .from('registraya_vcard_registros')
                .upsert(upsertData, { onConflict: 'email' });

            if (upsertError) {
                console.error("Supabase Upsert Error Detail:", upsertError);
                throw upsertError;
            }

            // 4a. GENERAR QR CODE (PNG) pointing to API for direct download
            const profileUrl = `${window.location.origin}/api/vcard/${slug}`;
            const qrDataUrl = await QRCode.toDataURL(profileUrl, { width: 500, margin: 2 });

            // Descargar QR
            const aQr = document.body.appendChild(document.createElement('a'));
            aQr.href = qrDataUrl;
            aQr.download = `qr-${slug}.png`;
            setTimeout(() => { aQr.click(); aQr.remove(); }, 500);

            // 4b. GENERAR Y DESCARGAR VCARD (Client-side version for immediate feedback)
            const vcardContent = generateVCard(formData, photoBase64 || null, galleryUrls, finalCategories);
            const blob = new Blob([vcardContent], { type: 'text/vcard;charset=utf-8' });
            const url = window.URL.createObjectURL(blob);
            const aVcard = document.body.appendChild(document.createElement('a'));
            aVcard.href = url;
            aVcard.download = `${slug}.vcf`;
            aVcard.click();
            setTimeout(() => { aVcard.remove(); window.URL.revokeObjectURL(url); }, 1000);

            setStep(6);
        } catch (err) {
            console.error("Full Error Context:", err);
            const msg = err instanceof Error ? err.message : JSON.stringify(err);
            alert(`Hubo un error al guardar tu pedido: ${msg}. Por favor intenta de nuevo o contáctanos.`);
            setIsSubmitting(false);
        }
    };

    const handleNext = () => {
        if (step === 1) {
            if (!formData.name || !formData.whatsapp || !validateEmail(formData.email)) {
                if (!validateEmail(formData.email)) setEmailError('Ingresa un correo válido');
                return;
            }
            setEmailError('');
        }
        if (step === 2) {
            if (!formData.profession) return;
        }
        if (step === 5) {
            handleFinalSubmit();
            return;
        }
        setStep(s => Math.min(s + 1, 6));
    };

    const handleBack = () => setStep(s => Math.max(s - 1, 1));

    const updateForm = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const currentPlanPrice = formData.plan === 'basic' ? 10 : 20;

    return (
        <div className="max-w-4xl mx-auto w-full px-4">
            {/* Progress Bar */}
            <div className="mb-12 relative">
                <div className="flex justify-between items-center relative z-10">
                    {steps.map((s) => (
                        <div key={s.id} className="flex flex-col items-center group">
                            <div
                                className={cn(
                                    "w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg",
                                    step >= s.id ? "bg-primary text-white scale-110" : "bg-white text-navy/20"
                                )}
                            >
                                <s.icon size={20} className="md:w-6 md:h-6" />
                            </div>
                            <span className={cn(
                                "mt-4 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] transition-colors",
                                step >= s.id ? "text-navy" : "text-navy/20"
                            )}>
                                {s.title}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="absolute top-5 md:top-7 left-0 h-1 bg-navy/5 w-full -z-0 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                        className="h-full bg-primary"
                    />
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                        "rounded-[40px] shadow-2xl overflow-hidden min-h-[550px] border border-white/20 relative",
                        step === 4 || step === 5 ? "bg-navy" : "glass-card p-8 md:p-12"
                    )}
                >
                    {isSubmitting && (
                        <div className="absolute inset-0 z-50 bg-navy/80 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                            <Loader2 className="animate-spin text-primary mb-6" size={60} />
                            <h3 className="text-2xl font-black uppercase italic tracking-tighter">Procesando tu orden...</h3>
                            <p className="text-white/60 font-medium mt-2">Personalizando tu identidad digital </p>
                        </div>
                    )}

                    {/* STEP 1: DATOS BÁSICOS */}
                    {step === 1 && (
                        <div className="max-w-xl mx-auto">
                            <div className="text-center mb-10">
                                <h2 className="text-3xl md:text-4xl font-black text-navy tracking-tighter uppercase italic">¡Empecemos!</h2>
                                <p className="text-navy/40 text-xs font-bold uppercase tracking-widest mt-2">Tus datos de contacto primarios</p>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 mb-8">
                                    <div className="flex gap-4 items-start">
                                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                                            <ShieldCheck className="text-primary" size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Tu Llave de Identidad</p>
                                            <p className="text-[11px] font-bold text-navy/60 leading-relaxed uppercase italic">
                                                Tu <span className="text-navy font-black">Email</span> y <span className="text-navy font-black">WhatsApp</span> son sagrados. Úsalos siempre igual para actualizar tu perfil sin cambiar tu link.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="group">
                                    <label className="block text-[10px] font-black text-navy/40 uppercase tracking-widest mb-3 ml-1">Nombre Completo</label>
                                    <div className="relative">
                                        <User className="absolute left-6 top-1/2 -translate-y-1/2 text-navy/20 group-focus-within:text-primary transition-colors" size={20} />
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => updateForm('name', e.target.value)}
                                            placeholder="Ej. Manuel Pérez"
                                            className="w-full bg-white/50 border-2 border-transparent focus:border-primary/20 rounded-2xl px-16 py-5 outline-none font-bold text-navy transition-all shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="block text-[10px] font-black text-navy/40 uppercase tracking-widest mb-3 ml-1">WhatsApp</label>
                                    <div className="relative">
                                        <Smartphone className="absolute left-6 top-1/2 -translate-y-1/2 text-navy/20 group-focus-within:text-primary transition-colors" size={20} />
                                        <input
                                            type="tel"
                                            value={formData.whatsapp}
                                            onChange={(e) => updateForm('whatsapp', e.target.value)}
                                            placeholder="+593 99 999 9999"
                                            className="w-full bg-white/50 border-2 border-transparent focus:border-primary/20 rounded-2xl px-16 py-5 outline-none font-bold text-navy transition-all shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="block text-[10px] font-black text-navy/40 uppercase tracking-widest mb-3 ml-1">Correo Electrónico (Para entrega)</label>
                                    <div className="relative">
                                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-navy/20 group-focus-within:text-primary transition-colors" size={20} />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => updateForm('email', e.target.value)}
                                            placeholder="ejemplo@correo.com"
                                            className={cn(
                                                "w-full bg-white/50 border-2 rounded-2xl px-16 py-5 outline-none font-bold text-navy transition-all shadow-sm",
                                                emailError ? "border-red-500 bg-red-50/50" : "border-transparent focus:border-primary/20"
                                            )}
                                        />
                                    </div>
                                    {emailError && <p className="mt-2 text-[10px] font-black text-red-500 uppercase italic tracking-widest ml-1">{emailError}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: PERFIL PROFESIONAL */}
                    {step === 2 && (
                        <div className="max-w-xl mx-auto">
                            <div className="text-center mb-10">
                                <h2 className="text-3xl md:text-4xl font-black text-navy tracking-tighter uppercase italic">Perfil Profesional</h2>
                                <p className="text-navy/40 text-xs font-bold uppercase tracking-widest mt-2">Cómo quieres aparecer en las búsquedas</p>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-navy/40 uppercase tracking-widest mb-3">Profesión / Título</label>
                                        <input
                                            type="text"
                                            value={formData.profession}
                                            onChange={(e) => updateForm('profession', e.target.value)}
                                            placeholder="Ej. Plomero Maestro"
                                            className="w-full bg-white/50 border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 py-5 outline-none font-bold text-navy transition-all shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-navy/40 uppercase tracking-widest mb-3">Empresa (Opcional)</label>
                                        <input
                                            type="text"
                                            value={formData.company}
                                            onChange={(e) => updateForm('company', e.target.value)}
                                            placeholder="Nombre de tu negocio"
                                            className="w-full bg-white/50 border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 py-5 outline-none font-bold text-navy transition-all shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-navy/40 uppercase tracking-widest mb-3">Tu Bio o Descripción</label>
                                    <textarea
                                        value={formData.bio}
                                        onChange={(e) => updateForm('bio', e.target.value)}
                                        placeholder="Cuéntales qué ofreces..."
                                        rows={3}
                                        className="w-full bg-white/50 border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 py-5 outline-none font-bold text-navy transition-all shadow-sm resize-none"
                                    />
                                </div>

                                {/* DATOS DE CONTACTO EXTRA */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-navy/5">
                                    <div>
                                        <label className="block text-[10px] font-black text-navy/40 uppercase tracking-widest mb-3">Dirección / Ubicación</label>
                                        <input
                                            type="text"
                                            value={formData.address}
                                            onChange={(e) => updateForm('address', e.target.value)}
                                            placeholder="Ej. Oficina 203, Edificio X"
                                            className="w-full bg-white/50 border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 py-5 outline-none font-bold text-navy transition-all shadow-sm text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-navy/40 uppercase tracking-widest mb-3">Sitio Web (Opcional)</label>
                                        <input
                                            type="url"
                                            value={formData.web}
                                            onChange={(e) => updateForm('web', e.target.value)}
                                            placeholder="www.tuempresa.com"
                                            className="w-full bg-white/50 border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 py-5 outline-none font-bold text-navy transition-all shadow-sm text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-navy/40 uppercase tracking-widest mb-3">Instagram (Link Completo)</label>
                                        <input
                                            type="url"
                                            value={formData.instagram}
                                            onChange={(e) => updateForm('instagram', e.target.value)}
                                            placeholder="https://instagram.com/tuusuario"
                                            className="w-full bg-white/50 border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 py-5 outline-none font-bold text-navy transition-all shadow-sm text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-navy/40 uppercase tracking-widest mb-3">LinkedIn (Link Completo)</label>
                                        <input
                                            type="url"
                                            value={formData.linkedin}
                                            onChange={(e) => updateForm('linkedin', e.target.value)}
                                            placeholder="https://linkedin.com/in/tuusuario"
                                            className="w-full bg-white/50 border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 py-5 outline-none font-bold text-navy transition-all shadow-sm text-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-navy/40 uppercase tracking-widest mb-3">Etiquetas de Búsqueda (Comas)</label>
                                    <div className="relative">
                                        <Tag className="absolute left-6 top-1/2 -translate-y-1/2 text-navy/20" size={20} />
                                        <input
                                            type="text"
                                            value={formData.categories}
                                            onChange={(e) => {
                                                updateForm('categories', e.target.value);
                                                setHasManualTags(true);
                                            }}
                                            placeholder="ej. goteras, fugas, tuberías"
                                            className="w-full bg-white/50 border-2 border-transparent focus:border-primary/20 rounded-2xl px-16 py-5 outline-none font-bold text-navy transition-all shadow-sm"
                                        />
                                    </div>
                                    <p className="text-[9px] font-bold text-navy/30 uppercase mt-2 tracking-widest">Lo que tus clientes escriben para buscarte</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: IDENTIDAD VISUAL */}
                    {step === 3 && (
                        <div className="max-w-xl mx-auto text-center">
                            <div className="mb-10">
                                <h2 className="text-3xl md:text-4xl font-black text-navy tracking-tighter uppercase italic">Identidad Visual</h2>
                                <p className="text-navy/40 text-xs font-bold uppercase tracking-widest mt-2">Sube tu mejor foto o logo</p>
                            </div>

                            <div className="flex flex-col items-center gap-8">
                                <div className="relative group">
                                    <div className="w-48 h-48 md:w-56 md:h-56 rounded-[48px] bg-white border-4 border-dashed border-navy/10 flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 transition-all overflow-hidden relative shadow-inner">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => updateForm('photo', e.target.files?.[0] || null)}
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        />
                                        {formData.photo ? (
                                            <img
                                                src={URL.createObjectURL(formData.photo)}
                                                alt="preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <>
                                                <Camera className="text-navy/10 group-hover:text-primary transition-colors mb-4" size={56} strokeWidth={1.5} />
                                                <span className="text-[10px] font-black text-navy/40 uppercase tracking-widest">Subir Imagen</span>
                                            </>
                                        )}
                                    </div>
                                    {formData.photo && (
                                        <button
                                            onClick={() => updateForm('photo', null)}
                                            className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg z-20 hover:scale-110 transition-transform"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                                <p className="text-sm text-navy/60 font-medium max-w-sm">
                                    Una foto profesional o un logo claro aumenta tu confianza en un <span className="text-primary font-black">200%</span>.
                                </p>

                                {formData.plan === 'pro' && (
                                    <div className="mt-8 pt-8 border-t border-navy/5 w-full">
                                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-navy/40 mb-6">Galería de Trabajos (Plan Pro - Hasta 3 fotos)</h3>
                                        <div className="grid grid-cols-3 gap-4">
                                            {[0, 1, 2].map((i) => (
                                                <div key={i} className="relative aspect-square rounded-2xl bg-white border-2 border-dashed border-navy/5 flex items-center justify-center overflow-hidden hover:border-primary/20 transition-all cursor-pointer group">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                const newGallery = [...formData.gallery];
                                                                newGallery[i] = file;
                                                                updateForm('gallery', newGallery);
                                                            }
                                                        }}
                                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                    />
                                                    {formData.gallery[i] ? (
                                                        <>
                                                            <img src={URL.createObjectURL(formData.gallery[i])} className="w-full h-full object-cover" />
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const newGallery = [...formData.gallery];
                                                                    newGallery.splice(i, 1);
                                                                    updateForm('gallery', newGallery);
                                                                }}
                                                                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center z-20"
                                                            >
                                                                ×
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <Camera size={20} className="text-navy/10 group-hover:text-primary transition-colors" />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* STEP 4: SELECCIÓN DE PLAN */}
                    {step === 4 && (
                        <div className="text-center text-white">
                            <h2 className="text-3xl md:text-5xl font-black text-primary tracking-tighter uppercase italic mb-10">Confirma y Elige</h2>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-4xl mx-auto">
                                {/* PREVIEW */}
                                <div className="relative order-2 lg:order-1">
                                    <div className="absolute -inset-10 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
                                    <div className="w-[280px] h-[500px] bg-white rounded-[48px] border-[12px] border-navy/90 mx-auto p-8 shadow-2xl relative z-10 overflow-hidden text-navy">
                                        <div className="h-4 w-16 bg-navy/5 rounded-full mx-auto mb-10" />
                                        <div className="flex flex-col items-center text-center">
                                            <div className="w-24 h-24 rounded-[32px] bg-primary/5 border-2 border-primary/20 mb-6 overflow-hidden flex items-center justify-center">
                                                {formData.photo ? (
                                                    <img src={URL.createObjectURL(formData.photo)} className="w-full h-full object-cover" />
                                                ) : <User className="text-primary/20" size={40} />}
                                            </div>
                                            <h4 className="text-xl font-black leading-none mb-1 text-navy">{formData.name || 'Tu Nombre'}</h4>
                                            <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-8">{formData.profession || 'Tu Profesión'}</p>

                                            <div className="w-full space-y-4">
                                                <div className="flex items-center gap-3 p-3 bg-cream rounded-2xl border border-navy/5">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><Smartphone size={14} className="text-primary" /></div>
                                                    <div className="h-2 w-20 bg-navy/10 rounded-full" />
                                                </div>
                                                <div className="flex items-center gap-3 p-3 bg-cream rounded-2xl border border-navy/5">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><Mail size={14} className="text-primary" /></div>
                                                    <div className="h-2 w-24 bg-navy/10 rounded-full" />
                                                </div>
                                            </div>

                                            <div className="mt-12 w-full py-4 bg-primary rounded-2xl text-[10px] font-black text-white uppercase tracking-widest shadow-orange">Guardar Contacto</div>
                                        </div>
                                    </div>
                                </div>

                                {/* PLANES */}
                                <div className="order-1 lg:order-2 space-y-4 text-left">
                                    {[
                                        { id: 'basic', title: 'Básico', price: '10', features: ['Tarjeta Digital Pro', 'Entrega 1hr'] },
                                        { id: 'pro', title: 'Premium (Pro)', price: '20', features: ['Todo el Básico', 'Código QR Manual', 'Botón WhatsApp Directo'] }
                                    ].map((p) => (
                                        <motion.div
                                            key={p.id}
                                            onClick={() => updateForm('plan', p.id)}
                                            className={cn(
                                                "p-8 rounded-[36px] border-4 transition-all cursor-pointer relative",
                                                formData.plan === p.id
                                                    ? "border-primary bg-white/10 shadow-orange"
                                                    : "border-white/5 bg-white/5 hover:border-white/10"
                                            )}
                                        >
                                            {p.id === 'pro' && <div className="absolute -top-3 right-8 bg-primary text-white px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">Recomendado</div>}
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-xl font-black uppercase tracking-tighter italic">{p.title}</h3>
                                                <div className={cn("w-6 h-6 rounded-full border-2", formData.plan === p.id ? "bg-primary border-primary" : "border-white/20")} />
                                            </div>
                                            <p className="text-4xl font-black mb-6">${p.price}</p>
                                            <ul className="space-y-2 opacity-40">
                                                {p.features.map(f => <li key={f} className="text-[9px] font-bold uppercase tracking-widest">✓ {f}</li>)}
                                            </ul>
                                        </motion.div>
                                    ))
                                    }
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 5: PAGO */}
                    {step === 5 && (
                        <div className="max-w-xl mx-auto text-center text-white">
                            <h2 className="text-3xl md:text-5xl font-black text-primary tracking-tighter uppercase italic mb-4">¡Casi Listo!</h2>
                            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-10 italic">Descarga tu tarjeta y finaliza el registro</p>

                            <div className="bg-white/5 p-10 rounded-[40px] border border-white/10 flex flex-col items-center justify-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-32 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />

                                <div className="w-24 h-24 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-6 animate-pulse">
                                    <Smartphone size={48} />
                                </div>

                                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4">Descarga tu vCard</h3>
                                <p className="text-white/60 text-sm font-medium mb-8 max-w-sm">
                                    Haz clic abajo para descargar tu archivo vCard (.vcf) y guardar tu registro.
                                </p>

                                <div className="w-full p-4 bg-navy/40 rounded-2xl border border-white/5 text-left mb-6">
                                    <p className="text-[10px] uppercase tracking-widest text-white/40 mb-2 font-black">Tu Enlace Personal</p>
                                    <p className="text-primary font-black text-lg tracking-tight">registrameya.com/card/{generateSlug(formData.name)}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SUCCESS STEP */}
                    {step === 6 && (
                        <div className="max-w-xl mx-auto text-center py-20 px-6">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-24 h-24 bg-accent/20 text-accent rounded-full flex items-center justify-center mx-auto mb-10"
                            >
                                <CheckCircle size={56} strokeWidth={2.5} />
                            </motion.div>
                            <h2 className="text-4xl md:text-5xl font-black text-navy mb-6 tracking-tighter uppercase italic">¡Orden en Marcha!</h2>
                            <p className="text-xl text-navy/60 font-medium leading-relaxed mb-12">
                                Estamos configurando tu <span className="text-navy font-bold">Tarjeta Digital de Presentación</span>. En <span className="text-primary font-black">exactamente 1 hora</span> recibirás tu entrega por WhatsApp y Correo.
                            </p>

                            <div className="inline-flex items-center gap-6 p-8 bg-white rounded-[40px] shadow-soft border-2 border-primary/5">
                                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center shadow-orange">
                                    <Zap size={32} />
                                </div>
                                <div className="text-left">
                                    <p className="font-black text-navy leading-none uppercase tracking-tighter italic text-2xl">Garantía 60 Minutos</p>
                                    <p className="text-[10px] text-navy/40 mt-1 uppercase font-black tracking-widest">Si no está a tiempo, el servicio es GRATIS.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    {step < 6 && (
                        <div className="mt-12 flex justify-between items-center max-w-xl mx-auto">
                            {step > 1 ? (
                                <button
                                    onClick={handleBack}
                                    className={cn(
                                        "px-10 py-5 rounded-button font-black text-xs uppercase tracking-widest transition-all",
                                        step >= 4 ? "text-white/40 hover:text-white" : "text-navy/40 hover:text-navy"
                                    )}
                                >
                                    ← Atrás
                                </button>
                            ) : <div />}

                            <button
                                onClick={handleNext}
                                disabled={isSubmitting}
                                className={cn(
                                    "px-12 py-6 rounded-button font-black text-xl shadow-lg flex items-center gap-4 transition-all hover:scale-105 active:scale-95",
                                    step >= 4 ? "bg-primary text-white shadow-orange" : "bg-navy text-white",
                                    isSubmitting && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                {step === 5 ? (isSubmitting ? 'Procesando...' : 'Descargar vCard') : 'Siguiente'} <ArrowRight size={20} />
                            </button>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
