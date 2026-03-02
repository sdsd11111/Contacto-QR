"use client";

import React, { useState, useRef, useEffect } from "react";
import Script from "next/script";
import QRCode from "qrcode";
import { motion, AnimatePresence } from "framer-motion";
import {
    User,
    Briefcase,
    Smartphone,
    Camera,
    ChevronRight,
    ChevronLeft,
    Check,
    CheckCircle,
    Loader2,
    Save,
    Mic,
    Square,
    AlertCircle,
    Info,
    HelpCircle,
    ExternalLink,
    Zap,
    FileText,
    ShieldCheck
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import imageCompression from "browser-image-compression";
import { cn } from "@/lib/utils";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const steps = [
    { id: 1, title: 'Datos Básicos', icon: User },
    { id: 2, title: 'Perfil Comercial', icon: Briefcase },
    { id: 3, title: 'Identidad Visual', icon: Camera },
    { id: 4, title: 'Pago y Envío', icon: Smartphone },
];

const FIELD_HELPERS: Record<string, string> = {
    tipo_perfil: "Selecciona si el contacto es para una persona/profesional o para un negocio físico.",
    nombres: "Ingresa los nombres del cliente. Se usará para el nombre de contacto en el celular.",
    apellidos: "Ingresa los apellidos del cliente.",
    nombre_negocio: "Nombre comercial del local o empresa que aparecerá resaltado.",
    contacto_nombre: "Nombre de la persona encargada en el negocio.",
    contacto_apellido: "Apellido de la persona encargada.",
    whatsapp: "Número principal para chat y llamadas. Úsalo con formato internacional (ej: 0991234567).",
    email: "Correo para enviar notificaciones y respaldo de la tarjeta.",
    profession: "Título profesional o cargo que desempeña (ej: Abogado, Gerente de Ventas).",
    company: "Nombre de la empresa para la que trabaja el profesional.",
    bio: "Una biografía corta y atractiva de lo que hace el cliente o el negocio.",
    products: "Lista los productos o servicios principales que ofrece (uno por línea o separados por comas).",
    tags: "Palabras clave que ayudarán a encontrar el perfil en buscadores y el directorio.",
    address: "Ubicación física completa o ciudad de operación.",
    web: "Enlace a sitio web externo o sistema de reservas online.",
    google_business: "Link de Google Maps para que los clientes lleguen al local físico.",
    menu_digital: "Enlace directo a la carta o menú digital (PDF o Web) del establecimiento.",
    instagram: "Nombre de usuario o link directo a Instagram.",
    facebook: "Enlace directo a la página de Facebook.",
    linkedin: "Enlace directo al perfil profesional de LinkedIn.",
    tiktok: "Nombre de usuario o link directo a TikTok.",
    photo: "La imagen principal que verán los clientes. Se recomienda una foto clara o el logo de la empresa.",
    receipt: "Captura del comprobante de pago si el cliente pagó por medios externos.",
    status: "Estado administrativo del pago para este registro.",
};

export default function DirectVCardRegistration({
    seller,
    onSuccess,
    onCancel
}: {
    seller: any;
    onSuccess: () => void;
    onCancel: () => void;
}) {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    // Simplificamos el form para entrada rápida
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
        menu_digital: '',
        products: '',
        tags: '',
        categories: '',
        plan: 'pro' as 'basic' | 'pro', // Default a pro
        photo: null as File | null,
        receipt: null as File | null,
        seller_id: seller?.id || null,
        sellerCode: seller?.codigo || '', // Se usa internamente el código del vendedor actual
        pago_directo: true,
        status: 'pagado' as 'pagado' | 'pendiente' | 'cancelado',
        paymentMethod: 'transfer' as 'transfer' | 'payphone' | 'paypal',
    });
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [payphoneInitialized, setPayphoneInitialized] = useState(false);

    // PayPhone Button Initialization Effect (Box v1.1)
    useEffect(() => {
        if (step === 4 && formData.paymentMethod === 'payphone') {
            const initButton = () => {
                const PBox = (window as any).PPaymentButtonBox;
                if (PBox) {
                    const btnContainer = document.getElementById('pp-container-seller');
                    if (btnContainer) {
                        btnContainer.innerHTML = "";
                        const amountInCents = 20 * 100;
                        const transactionId = `seller_${Date.now()}_${formData.company.replace(/\s+/g, '_')}`;

                        try {
                            const ppb = new PBox({
                                token: process.env.NEXT_PUBLIC_PAYPHONE_TOKEN,
                                amount: amountInCents,
                                amountWithoutTax: amountInCents,
                                currency: "USD",
                                clientTransactionId: transactionId,
                                storeId: process.env.NEXT_PUBLIC_PAYPHONE_STORE_ID,
                                reference: `Registro Vendedor - ${formData.company || formData.nombres}`,
                                lang: "es",
                                responseUrl: typeof window !== 'undefined' ? `${window.location.origin}/admin/vendedor` : "",
                                cancellationUrl: typeof window !== 'undefined' ? `${window.location.origin}/admin/vendedor` : "",
                                onComplete: async (model: any) => {
                                    console.log("Pago completado, verificando...", model);
                                    updateForm('status', 'pagado');
                                    alert("¡Pago con PayPhone confirmado correctamente!");
                                },
                                onCancel: () => console.log("Pago cancelado")
                            });
                            ppb.render("pp-container-seller");
                        } catch (err) {
                            console.error("Error al instanciar PayPhone Box:", err);
                        }
                    }
                }
            };
            const timer = setTimeout(initButton, 500);
            return () => clearTimeout(timer);
        }
    }, [step, formData.paymentMethod, payphoneInitialized]);
    const [isProcessingInterview, setIsProcessingInterview] = useState(false);
    const [isGeneratingTags, setIsGeneratingTags] = useState(false);

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const generateSlug = (data: typeof formData) => {
        const nameToUse = data.tipo_perfil === 'negocio'
            ? data.nombre_negocio
            : `${data.nombres} ${data.apellidos}`.trim();

        const cleanName = nameToUse
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Quitar acentos
            .replace(/[^a-z0-9]/g, "-") // Reemplazar no-alfanuméricos por guiones
            .replace(/-+/g, "-") // Quitar guiones seguidos
            .replace(/^-|-$/g, ""); // Quitar guiones al inicio/final

        const shortId = Math.random().toString(36).substring(2, 6);
        return `${cleanName}-${shortId}`;
    };

    const handleImageProcess = async (file: File): Promise<File | null> => {
        if (!file) return null;
        if (file.type.startsWith('image/')) {
            try {
                const options = {
                    maxSizeMB: 0.7,
                    maxWidthOrHeight: 1200,
                    useWebWorker: true,
                };
                const compressedFile = await imageCompression(file, options);
                return new File([compressedFile], file.name, { type: file.type });
            } catch (error) {
                console.error("Error al comprimir imagen:", error);
                return file;
            }
        }
        return file;
    };

    const updateForm = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleExternalPaymentRedirect = async (method: 'payphone' | 'paypal') => {
        setIsSubmitting(true);
        try {
            // Empaquetar datos para transferencia
            const dataToTransfer = {
                ...formData,
                paymentMethod: method,
                redirectedFromSeller: true
            };

            // Convertir foto a Base64 para localStorage (si existe)
            if (formData.photo) {
                const reader = new FileReader();
                const base64Photo = await new Promise<string>((resolve) => {
                    reader.onload = () => resolve(reader.result as string);
                    reader.readAsDataURL(formData.photo!);
                });
                (dataToTransfer as any).photoBase64 = base64Photo;
                (dataToTransfer as any).photoName = formData.photo.name;
                (dataToTransfer as any).photoType = formData.photo.type;
                (dataToTransfer as any).photo = null; // No se puede stringificar un File
            }

            localStorage.setItem('vcard_transfer_data', JSON.stringify(dataToTransfer));
            // Redirigir a la página pública de registro
            window.location.href = `/registro?from=vendedor&method=${method}`;
        } catch (err) {
            console.error("Error al redirigir al pago:", err);
            alert("No se pudo preparar la redirección de pago. Por favor intenta de nuevo.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Recording logic
    React.useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRecording) {
            interval = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks: Blob[] = [];

            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = async () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                await sendToAI(blob);
                stream.getTracks().forEach(t => t.stop());
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
            setRecordingTime(0);
        } catch (e) {
            alert("No se pudo acceder al micrófono.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            setIsRecording(false);
            setIsProcessingInterview(true);
        }
    };

    const generateWithAI = async () => {
        if (!formData.profession) {
            alert("Por favor ingresa la profesión primero para generar etiquetas.");
            return;
        }
        setIsGeneratingTags(true);
        try {
            const response = await fetch('/api/generate-tags', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    company: formData.company,
                    profession: formData.profession,
                    bio: formData.bio,
                    products: formData.products,
                    plan: formData.plan
                })
            });
            const data = await response.json();
            if (response.ok && data.tags) {
                updateForm('tags', data.tags);
            } else {
                alert(`Error: ${data.details || data.error || "No se pudieron generar etiquetas automáticamente."}`);
            }
        } catch (err: any) {
            console.error("AI Tags Error:", err);
            alert("Error al conectar con la IA de etiquetas: " + (err.message || "Error desconocido"));
        } finally {
            setIsGeneratingTags(true);
            // Delay slight and set to false
            setTimeout(() => setIsGeneratingTags(false), 500);
        }
    };

    const sendToAI = async (audioBlob: Blob) => {
        try {
            const fd = new FormData();
            fd.append('audio', audioBlob, 'interview.webm');
            const res = await fetch('/api/transcribe-interview', { method: 'POST', body: fd });
            const result = await res.json();

            if (res.ok && result.success) {
                const { bio, products, etiquetas, name, profession } = result.data;
                setFormData(prev => ({
                    ...prev,
                    bio: bio || prev.bio,
                    products: products || prev.products,
                    tags: etiquetas || prev.tags,
                    profession: profession || prev.profession,
                    nombre_negocio: prev.tipo_perfil === 'negocio' && name ? name : prev.nombre_negocio,
                    nombres: prev.tipo_perfil === 'persona' && name ? name.split(' ')[0] : prev.nombres,
                    apellidos: prev.tipo_perfil === 'persona' && name ? name.split(' ').slice(1).join(' ') : prev.apellidos
                }));
            } else {
                alert("Error en la transcripción: " + (result.error || "Desconocido"));
            }
        } catch (e) {
            console.error("AI Error:", e);
            alert("Hubo un fallo al procesar la entrevista.");
        } finally {
            setIsProcessingInterview(false);
        }
    };

    const nextStep = () => {
        // Validaciones por paso
        if (step === 1) {
            if (formData.tipo_perfil === 'persona') {
                if (!formData.nombres || !formData.apellidos) return alert("Llena Nombres y Apellidos");
            } else {
                if (!formData.nombre_negocio) return alert("Llena el Nombre del Negocio");
            }
            if (!formData.whatsapp || !formData.email) return alert("Llena WhatsApp y Email");
            if (!validateEmail(formData.email)) return alert("Email inválido");
        }
        if (step === 3) {
            if (!formData.photo) return alert("Sube la foto del cliente/negocio.");
        }

        if (step < steps.length) setStep(step + 1);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
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

    const generateVCard = (data: typeof formData, photoBase64: string | null) => {
        let photoBlock = '';
        if (photoBase64) {
            const folded = photoBase64.match(/.{1,72}/g)?.join('\r\n ') || photoBase64;
            photoBlock = `PHOTO;ENCODING=b;TYPE=JPEG:data:image/jpeg;base64,${folded}`;
        }

        let fullName = '';
        let structuredName = '';
        let organization = '';

        if (data.tipo_perfil === 'negocio') {
            fullName = data.nombre_negocio;
            organization = data.nombre_negocio;
            if (data.contacto_nombre || data.contacto_apellido) {
                structuredName = `${data.contacto_apellido || ''};${data.contacto_nombre || ''};;;`;
            } else {
                structuredName = ';;;;';
            }
        } else {
            fullName = `${data.nombres} ${data.apellidos}`.trim();
            structuredName = `${data.apellidos};${data.nombres};;;`;
            organization = data.company || "";
        }

        let noteContent = `${data.bio}${data.products ? '\n\nProductos/Servicios:\n' + data.products : ''} - Generado con ActivaQR`;

        const vcard = [
            'BEGIN:VCARD',
            'VERSION:4.0',
            `FN;CHARSET=UTF-8:${fullName}`,
            `N;CHARSET=UTF-8:${structuredName}`,
            `TITLE;CHARSET=UTF-8:${data.profession}`,
            `ORG;CHARSET=UTF-8:${organization}`,
            `TEL;TYPE=cell,text,voice;VALUE=uri:tel:${data.whatsapp}`,
            `EMAIL;TYPE=work:${data.email}`,
            `ADR;TYPE=work;LABEL="${data.address.replace(/"/g, "'")}":;;${data.address};;;;`,
            `URL:${data.web}`,
            data.google_business ? `URL;type=GOOGLE_BUSINESS:${data.google_business}` : '',
            `NOTE:${noteContent.replace(/\n/g, '\\n')}${data.google_business ? '\\n\\nUbicación/Google Maps: ' + data.google_business : ''}`,
            data.categories ? `CATEGORIES:${data.categories}` : '',
            photoBlock,
            data.instagram ? `X-SOCIALPROFILE;TYPE=instagram;LABEL=Instagram:${data.instagram}` : '',
            data.linkedin ? `X-SOCIALPROFILE;TYPE=linkedin;LABEL=LinkedIn:${data.linkedin}` : '',
            data.facebook ? `X-SOCIALPROFILE;TYPE=facebook;LABEL=Facebook:${data.facebook}` : '',
            data.tiktok ? `X-SOCIALPROFILE;TYPE=tiktok;LABEL=TikTok:${data.tiktok}` : '',
            data.menu_digital ? `URL;type=MenuDigital:${data.menu_digital}` : '',
            `X-SOCIALPROFILE;TYPE=whatsapp;LABEL=WhatsApp:https://wa.me/${data.whatsapp.replace(/[^0-9]/g, '')}`,
            `REV:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
            'END:VCARD'
        ].filter(Boolean).join('\r\n');

        return vcard;
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            let photoUrl = null;
            let photoBase64 = null;

            const uploadFile = async (file: File) => {
                const uploadFormData = new FormData();
                uploadFormData.append('file', file);
                const res = await fetch('/api/upload', { method: 'POST', body: uploadFormData });
                if (!res.ok) throw new Error('Upload failed');
                const data = await res.json();
                return data.url;
            };

            if (formData.photo) {
                try {
                    photoUrl = await uploadFile(formData.photo);
                    photoBase64 = await fileToBase64(formData.photo);
                } catch (e) { console.error("Error uploading photo", e); }
            }

            let receiptUrl: string | null = null;
            if (formData.receipt) {
                try {
                    receiptUrl = await uploadFile(formData.receipt);
                } catch (e) {
                    console.error("Error uploading receipt", e);
                }
            }

            const slug = generateSlug(formData);
            const vcfContent = generateVCard(formData, photoBase64);
            const qrDataUrl = await QRCode.toDataURL(`https://activaqr.com/card/${slug}`, {
                width: 500, margin: 2, color: { dark: '#001549', light: '#ffffff' }
            });

            const dataToInsert = {
                tipo_perfil: formData.tipo_perfil || 'persona',
                nombre: formData.tipo_perfil === 'negocio' ? formData.nombre_negocio : `${formData.nombres} ${formData.apellidos}`.trim(),
                nombres: formData.nombres || null,
                apellidos: formData.apellidos || null,
                nombre_negocio: formData.nombre_negocio || null,
                contacto_nombre: formData.nombres || null, // Fallback for business
                contacto_apellido: formData.apellidos || null,
                email: formData.email,
                whatsapp: formData.whatsapp,
                profesion: formData.profession || null,
                empresa: formData.company || null,
                foto_url: photoUrl || null,
                status: formData.status,
                plan: formData.plan,
                slug: slug,
                qr_code_url: qrDataUrl,
                vcf_base64: Buffer.from(vcfContent).toString('base64'),
                vcf_version: '4.0',
                seller_id: formData.seller_id,
                direccion: formData.address || null,
                bio: formData.bio || null,
                productos_servicios: formData.products || null,
                etiquetas: formData.tags || null,
                web: formData.web || null,
                google_business: formData.google_business || null,
                instagram: formData.instagram || null,
                linkedin: formData.linkedin || null,
                facebook: formData.facebook || null,
                tiktok: formData.tiktok || null,
                menu_digital: formData.menu_digital || null,
                payment_method: formData.paymentMethod || 'seller_direct',
                comprobante_url: receiptUrl,
                galeria_urls: null
            };

            const response = await fetch('/api/vcard/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToInsert)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                alert("¡Contacto Digital Generado Exitosamente!");
                onSuccess(); // Close form and trigger refetch
            } else {
                throw new Error(result.error || "Error al crear el contacto digital");
            }

        } catch (error: any) {
            console.error("Submission error:", error);
            alert("Oops... algo salió mal: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-[#0A1229] border border-white/10 rounded-[32px] shadow-2xl p-6 md:p-10 mb-10 w-full max-w-5xl mx-auto flex flex-col lg:flex-row gap-8 items-stretch">
            <div className="flex-1">
                <div className="flex justify-between items-center mb-8 pb-6 border-b border-white/10">
                    <div>
                        <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">Generar Contacto Digital para Cliente</h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-1">Ingreso Rápido de Datos (Modo Vendedor)</p>
                    </div>
                    <button onClick={onCancel} className="text-white/40 hover:text-white text-xs uppercase font-bold tracking-widest px-4 py-2 border border-white/10 rounded-xl hover:bg-white/5 transition-all">
                        Cancelar
                    </button>
                </div>

                {/* Stepper Progress */}
                <div className="flex justify-between items-center mb-10 relative px-4">
                    <div className="absolute left-0 top-1/2 w-full h-[2px] bg-white/5 -z-10"></div>
                    <div
                        className="absolute left-0 top-1/2 h-[2px] bg-primary -z-10 transition-all duration-500 ease-out"
                        style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                    ></div>
                    {steps.map((s) => (
                        <div key={s.id} className="relative flex flex-col items-center">
                            <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center font-black transition-all duration-300 md:text-lg border-2",
                                s.id === step
                                    ? "bg-primary text-[#050B1C] border-primary shadow-[0_0_20px_rgba(255,107,0,0.4)] scale-110"
                                    : s.id < step
                                        ? "bg-[#0A1229] border-primary text-primary"
                                        : "bg-[#050B1C] border-white/10 text-white/30"
                            )}>
                                {s.id < step ? <Check strokeWidth={4} /> : React.createElement(s.icon, { size: 20 })}
                            </div>
                            <span className={cn(
                                "absolute md:-bottom-8 -bottom-7 text-[9px] md:text-[10px] font-black uppercase tracking-widest whitespace-normal w-16 text-center leading-[1.1] transition-colors duration-300",
                                s.id === step ? "text-primary" : "text-white/40"
                            )}>
                                {s.title}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="mt-12 bg-white/[0.02] border border-white/10 rounded-[24px] p-6 md:p-8 relative">
                    <AnimatePresence mode="wait">
                        {/* STEP 1: Datos Básicos */}
                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">

                                <div className="grid grid-cols-2 gap-4">
                                    <button type="button" onClick={() => updateForm('tipo_perfil', 'persona')}
                                        className={cn(
                                            "flex flex-col items-center p-6 border-2 rounded-2xl transition-all font-black uppercase tracking-widest text-[11px]",
                                            formData.tipo_perfil === 'persona' ? "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/20" : "border-white/10 bg-white/5 text-white/40 hover:bg-white/10"
                                        )}>
                                        <User size={32} className="mb-3" />
                                        Profesional / Persona
                                    </button>
                                    <button type="button" onClick={() => updateForm('tipo_perfil', 'negocio')}
                                        className={cn(
                                            "flex flex-col items-center p-6 border-2 rounded-2xl transition-all font-black uppercase tracking-widest text-[11px]",
                                            formData.tipo_perfil === 'negocio' ? "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/20" : "border-white/10 bg-white/5 text-white/40 hover:bg-white/10"
                                        )}>
                                        <Briefcase size={32} className="mb-3" />
                                        Negocio / Local
                                    </button>
                                </div>

                                {formData.tipo_perfil === 'persona' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black uppercase tracking-widest text-primary">Nombres *</label>
                                            <input type="text" value={formData.nombres}
                                                onChange={(e) => updateForm('nombres', e.target.value)}
                                                onFocus={() => setFocusedField('nombres')}
                                                onBlur={() => setFocusedField(null)}
                                                className="w-full bg-[#050B1C] border border-white/10 rounded-xl px-5 py-4 focus:border-primary/50 text-white outline-none"
                                                placeholder="Ej: Juan Carlos" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black uppercase tracking-widest text-primary">Apellidos *</label>
                                            <input type="text" value={formData.apellidos}
                                                onChange={(e) => updateForm('apellidos', e.target.value)}
                                                onFocus={() => setFocusedField('apellidos')}
                                                onBlur={() => setFocusedField(null)}
                                                className="w-full bg-[#050B1C] border border-white/10 rounded-xl px-5 py-4 focus:border-primary/50 text-white outline-none"
                                                placeholder="Ej: Pérez Gómez" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black uppercase tracking-widest text-primary">Nombre del Negocio *</label>
                                            <input type="text" value={formData.nombre_negocio}
                                                onChange={(e) => updateForm('nombre_negocio', e.target.value)}
                                                onFocus={() => setFocusedField('nombre_negocio')}
                                                onBlur={() => setFocusedField(null)}
                                                className="w-full bg-[#050B1C] border border-white/10 rounded-xl px-5 py-4 focus:border-primary/50 text-white outline-none"
                                                placeholder="Ej: Ferretería El Maestro" />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-black uppercase tracking-widest text-white/40">Nombre Contacto (Opcional)</label>
                                                <input type="text" value={formData.contacto_nombre}
                                                    onChange={(e) => updateForm('contacto_nombre', e.target.value)}
                                                    onFocus={() => setFocusedField('contacto_nombre')}
                                                    onBlur={() => setFocusedField(null)}
                                                    className="w-full bg-[#050B1C] border border-white/10 rounded-xl px-5 py-4 focus:border-white/30 text-white outline-none placeholder:text-white/20"
                                                    placeholder="Solo un nombre" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-black uppercase tracking-widest text-white/40">Apellido Contacto (Opcional)</label>
                                                <input type="text" value={formData.contacto_apellido}
                                                    onChange={(e) => updateForm('contacto_apellido', e.target.value)}
                                                    onFocus={() => setFocusedField('contacto_apellido')}
                                                    onBlur={() => setFocusedField(null)}
                                                    className="w-full bg-[#050B1C] border border-white/10 rounded-xl px-5 py-4 focus:border-white/30 text-white outline-none placeholder:text-white/20"
                                                    placeholder="Solo un apellido" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-primary">WhatsApp *</label>
                                        <input type="tel" value={formData.whatsapp}
                                            onChange={(e) => updateForm('whatsapp', e.target.value)}
                                            onFocus={() => setFocusedField('whatsapp')}
                                            onBlur={() => setFocusedField(null)}
                                            className="w-full bg-[#050B1C] border border-white/10 rounded-xl px-5 py-4 focus:border-primary/50 text-white outline-none pl-12"
                                            placeholder="0991234567" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-primary">Correo Electrónico *</label>
                                        <input type="email" value={formData.email}
                                            onChange={(e) => updateForm('email', e.target.value)}
                                            onFocus={() => setFocusedField('email')}
                                            onBlur={() => setFocusedField(null)}
                                            className="w-full bg-[#050B1C] border border-white/10 rounded-xl px-5 py-4 focus:border-primary/50 text-white outline-none"
                                            placeholder="correo@ejemplo.com" />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: Perfil */}
                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">

                                {/* Entrevista con IA */}
                                <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 relative overflow-hidden">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                            <Mic size={24} className="text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">🎙️ Entrevista con IA</h3>
                                            <p className="text-[10px] text-primary font-black uppercase tracking-widest">Auto-completa el perfil hablando</p>
                                        </div>
                                    </div>

                                    {isProcessingInterview ? (
                                        <div className="flex flex-col items-center py-4">
                                            <Loader2 className="animate-spin text-primary mb-2" size={32} />
                                            <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">La IA está redactando la historia...</p>
                                        </div>
                                    ) : isRecording ? (
                                        <div className="flex flex-col items-center py-2">
                                            <div className="text-2xl font-black text-white mb-4 tabular-nums animate-pulse">
                                                {formatTime(recordingTime)}
                                            </div>
                                            <button onClick={stopRecording}
                                                className="w-full bg-red-500 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg border-b-4 border-red-700 active:border-b-0 active:translate-y-1 transition-all">
                                                <Square size={18} className="inline mr-2" /> Detener y Procesar
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-xs text-white/50 leading-relaxed mb-6">
                                                Dile a la IA: <strong>¿Qué vende el negocio? ¿Cómo nació? ¿Qué servicios ofrece?</strong> Ella redactará la Bio, Productos y Etiquetas por ti.
                                            </p>
                                            <button onClick={startRecording}
                                                className="w-full bg-primary text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg border-b-4 border-primary-dark active:border-b-0 active:translate-y-1 transition-all group">
                                                <Mic size={18} className="inline mr-2 group-hover:scale-110 transition-transform" /> Iniciar Entrevista
                                            </button>
                                        </>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-primary">Profesión o Cargo *</label>
                                        <input type="text" value={formData.profession}
                                            onChange={(e) => updateForm('profession', e.target.value)}
                                            onFocus={() => setFocusedField('profession')}
                                            onBlur={() => setFocusedField(null)}
                                            className="w-full bg-[#050B1C] border border-white/10 rounded-xl px-5 py-4 focus:border-primary/50 text-white outline-none"
                                            placeholder="Ej: Ing. Civil / Gerente de Ventas" />
                                    </div>
                                    {formData.tipo_perfil === 'persona' && (
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black uppercase tracking-widest text-white/40">Empresa (Opcional)</label>
                                            <input type="text" value={formData.company}
                                                onChange={(e) => updateForm('company', e.target.value)}
                                                onFocus={() => setFocusedField('company')}
                                                onBlur={() => setFocusedField(null)}
                                                className="w-full bg-[#050B1C] border border-white/10 rounded-xl px-5 py-4 focus:border-white/30 text-white outline-none"
                                                placeholder="Ej: Constructora ABC" />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-primary">Descripción Corta / Especialidad *</label>
                                    <textarea value={formData.bio}
                                        onChange={(e) => updateForm('bio', e.target.value)}
                                        onFocus={() => setFocusedField('bio')}
                                        onBlur={() => setFocusedField(null)}
                                        rows={3}
                                        className="w-full bg-[#050B1C] border border-white/10 rounded-xl px-5 py-4 focus:border-primary/50 text-white outline-none resize-none"
                                        placeholder="Resume en qué ayudas a tus clientes..." />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-white/40">Productos / Servicios Destacados</label>
                                    <textarea value={formData.products}
                                        onChange={(e) => updateForm('products', e.target.value)}
                                        onFocus={() => setFocusedField('products')}
                                        onBlur={() => setFocusedField(null)}
                                        rows={2}
                                        className="w-full bg-[#050B1C] border border-white/10 rounded-xl px-5 py-4 focus:border-white/30 text-white outline-none resize-none"
                                        placeholder="Ej: Reparación de techos, Albañilería, Pintura..." />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-primary">Etiquetas de Búsqueda *</label>
                                        <button onClick={generateWithAI} disabled={isGeneratingTags}
                                            className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 hover:bg-primary/20 transition-all flex items-center gap-1.5 disabled:opacity-50">
                                            {isGeneratingTags ? <Loader2 size={10} className="animate-spin" /> : <Zap size={10} />} Generar con IA
                                        </button>
                                    </div>
                                    <input type="text" value={formData.tags}
                                        onChange={(e) => updateForm('tags', e.target.value)}
                                        onFocus={() => setFocusedField('tags')}
                                        onBlur={() => setFocusedField(null)}
                                        className="w-full bg-[#050B1C] border border-white/10 rounded-xl px-5 py-4 focus:border-primary/50 text-white outline-none"
                                        placeholder="Ej: plomero, reparacion, mantenimiento (separadas por coma)" />
                                    <p className="text-[9px] text-white/30 italic">Ayuda a encontrar este contacto en el directorio.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-primary">Ciudad y Dirección *</label>
                                    <input type="text" value={formData.address}
                                        onChange={(e) => updateForm('address', e.target.value)}
                                        onFocus={() => setFocusedField('address')}
                                        onBlur={() => setFocusedField(null)}
                                        className="w-full bg-[#050B1C] border border-white/10 rounded-xl px-5 py-4 focus:border-primary/50 text-white outline-none"
                                        placeholder="Ej: Loja, Av. Cuxibamba 12-34" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-white/40">Enlace Web o Reservas (Opcional)</label>
                                        <input type="text" value={formData.web}
                                            onChange={(e) => updateForm('web', e.target.value)}
                                            onFocus={() => setFocusedField('web')}
                                            onBlur={() => setFocusedField(null)}
                                            className="w-full bg-[#050B1C] border border-white/10 rounded-xl px-5 py-4 focus:border-white/30 text-white outline-none"
                                            placeholder="https://..." />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-white/40">Link de Google Maps (Opcional)</label>
                                        <input type="text" value={formData.google_business}
                                            onChange={(e) => updateForm('google_business', e.target.value)}
                                            onFocus={() => setFocusedField('google_business')}
                                            onBlur={() => setFocusedField(null)}
                                            className="w-full bg-[#050B1C] border border-white/10 rounded-xl px-5 py-4 focus:border-white/30 text-white outline-none"
                                            placeholder="https://maps.app.goo.gl/..." />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-[#FF8A33]">Link de Menú Digital / Carta (Opcional)</label>
                                        <input type="text" value={formData.menu_digital}
                                            onChange={(e) => updateForm('menu_digital', e.target.value)}
                                            onFocus={() => setFocusedField('menu_digital')}
                                            onBlur={() => setFocusedField(null)}
                                            className="w-full bg-[#050B1C] border border-white/10 rounded-xl px-5 py-4 focus:border-[#FF8A33]/30 text-white outline-none"
                                            placeholder="https://ejemplo.com/menu.pdf" />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: Imagen y Redes */}
                        {step === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">

                                <div className="bg-[#050B1C] border border-white/10 p-6 rounded-2xl flex flex-col md:flex-row items-center gap-6">
                                    <div className="w-24 h-24 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {formData.photo ? (
                                            <img src={URL.createObjectURL(formData.photo)} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={32} className="text-white/20" />
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-3 w-full">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-primary">Sube tu mejor Foto / Logo *</label>
                                        <p className="text-[10px] text-white/40 leading-relaxed mb-4">Recomendado: Cuadrada, clara y profesional. Este es el primer impacto visual de tu tarjeta.</p>

                                        <div className="relative group w-full sm:w-auto">
                                            <input
                                                type="file" accept="image/*"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const processed = await handleImageProcess(file);
                                                        updateForm('photo', processed);
                                                    }
                                                }}
                                                onFocus={() => setFocusedField('photo')}
                                                onBlur={() => setFocusedField(null)}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            <div className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 px-6 py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all">
                                                <Camera size={18} /> Subir Imagen
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-[#050B1C] border border-white/10 p-6 rounded-2xl">
                                    <h4 className="text-[11px] font-black uppercase tracking-widest text-white/60 mb-4 border-b border-white/10 pb-2">Redes Sociales (Solo Enlaces, Opcional)</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input type="text" value={formData.instagram}
                                            onChange={(e) => updateForm('instagram', e.target.value)}
                                            onFocus={() => setFocusedField('instagram')}
                                            onBlur={() => setFocusedField(null)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-white/30 text-white outline-none text-sm placeholder:text-white/20"
                                            placeholder="Instagram Link" />
                                        <input type="text" value={formData.facebook}
                                            onChange={(e) => updateForm('facebook', e.target.value)}
                                            onFocus={() => setFocusedField('facebook')}
                                            onBlur={() => setFocusedField(null)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-white/30 text-white outline-none text-sm placeholder:text-white/20"
                                            placeholder="Facebook Link" />
                                        <input type="text" value={formData.linkedin}
                                            onChange={(e) => updateForm('linkedin', e.target.value)}
                                            onFocus={() => setFocusedField('linkedin')}
                                            onBlur={() => setFocusedField(null)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-white/30 text-white outline-none text-sm placeholder:text-white/20"
                                            placeholder="LinkedIn Link" />
                                        <input type="text" value={formData.tiktok}
                                            onChange={(e) => updateForm('tiktok', e.target.value)}
                                            onFocus={() => setFocusedField('tiktok')}
                                            onBlur={() => setFocusedField(null)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-white/30 text-white outline-none text-sm placeholder:text-white/20"
                                            placeholder="TikTok Link" />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 4: Pago y Comprobante */}
                        {step === 4 && (
                            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <div className="flex bg-white/5 p-1 rounded-2xl mb-8 max-w-md overflow-x-auto no-scrollbar">
                                    {['transfer', 'payphone', 'paypal', 'crypto'].map((m) => (
                                        <button key={m} onClick={() => updateForm('paymentMethod', m)}
                                            className={cn(
                                                "flex-1 py-3 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap",
                                                formData.paymentMethod === m ? "bg-primary text-white shadow-lg" : "text-white/40 hover:text-white/60"
                                            )}>
                                            {m === 'transfer' ? 'Transf' : m === 'crypto' ? 'Cripto' : m}
                                        </button>
                                    ))}
                                </div>

                                <Script
                                    src="https://pay.payphonetodoesposible.com/api/button/v2/index.js"
                                    onLoad={() => setPayphoneInitialized(true)}
                                />

                                <AnimatePresence mode="wait">
                                    {formData.paymentMethod === 'transfer' ? (
                                        <motion.div key="pay_transfer" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-[#050B1C] border border-primary/20 p-6 rounded-3xl shadow-xl shadow-primary/5">
                                                <h3 className="text-primary font-black uppercase italic tracking-tighter text-lg mb-4">Datos del Banco de Loja</h3>
                                                <div className="space-y-4 text-sm">
                                                    <div>
                                                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Titular</p>
                                                        <p className="font-bold text-white">Cristhopher Abel Reyes Pardo</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Cédula</p>
                                                        <p className="font-bold text-white">1105106866</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Número de Cuenta (Ahorros)</p>
                                                        <p className="font-black text-lg text-primary">2901861882</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Correo para notificación</p>
                                                        <p className="text-xs font-bold text-white/60 leading-tight">cristhopheryeah113@gmail.com</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="bg-primary/10 border border-primary/20 p-6 rounded-3xl">
                                                    <p className="text-[10px] font-bold text-white/70 uppercase leading-relaxed tracking-widest">
                                                        Una vez realizada la transferencia o el pago en efectivo, sube el comprobante aquí.
                                                    </p>
                                                </div>

                                                <div className="relative group min-h-[160px] rounded-3xl bg-white/5 border border-dashed border-white/20 flex flex-col items-center justify-center p-6 hover:bg-white/10 transition-all cursor-pointer overflow-hidden">
                                                    <input type="file" accept="image/*"
                                                        onChange={async (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                const processed = await handleImageProcess(file);
                                                                updateForm('receipt', processed);
                                                            }
                                                        }}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />

                                                    {formData.receipt ? (
                                                        <div className="text-center space-y-2 relative z-20">
                                                            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                                                                <Check className="text-primary" size={24} />
                                                            </div>
                                                            <p className="text-[10px] font-black uppercase text-white tracking-widest">¡Comprobante Cargado!</p>
                                                        </div>
                                                    ) : (
                                                        <div className="text-center space-y-3 relative z-20">
                                                            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                                                                <ShieldCheck className="text-white/40" size={24} />
                                                            </div>
                                                            <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">Subir Comprobante</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : formData.paymentMethod === 'payphone' ? (
                                        <motion.div key="pay_payphone" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-[#050B1C] border border-white/10 p-10 rounded-[40px] text-center max-w-lg mx-auto shadow-2xl">
                                            <div className="w-16 h-16 bg-[#ff6f00]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <Smartphone className="text-[#ff6f00]" size={36} />
                                            </div>
                                            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-2">Pago Seguro con PayPhone</h3>
                                            <p className="text-sm text-white/40 mb-10 italic">Para procesar el pago con tarjeta de forma segura, te redirigiremos a nuestra pasarela oficial.</p>

                                            <button
                                                onClick={() => handleExternalPaymentRedirect('payphone')}
                                                disabled={isSubmitting}
                                                className="w-full bg-[#ff6f00] text-white font-black py-4 rounded-2xl uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl"
                                            >
                                                {isSubmitting ? <Loader2 className="animate-spin" /> : <ExternalLink size={20} />}
                                                Pagar con PayPhone
                                            </button>
                                            <p className="text-[9px] text-white/20 mt-6 uppercase tracking-widest font-black">Transacción procesada por PayPhone</p>
                                        </motion.div>
                                    ) : formData.paymentMethod === 'paypal' ? (
                                        <motion.div key="pay_paypal" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-[#050B1C] border border-white/10 p-10 rounded-[40px] text-center max-w-lg mx-auto shadow-2xl">
                                            <div className="w-16 h-16 bg-[#003087]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <Smartphone className="text-[#003087]" size={36} />
                                            </div>
                                            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-2">Pago con PayPal</h3>
                                            <p className="text-sm text-white/40 mb-10 italic">Paga de forma segura con tu cuenta PayPal o tarjeta de crédito.</p>

                                            <button
                                                onClick={() => handleExternalPaymentRedirect('paypal')}
                                                disabled={isSubmitting}
                                                className="w-full bg-[#0070ba] text-white font-black py-4 rounded-2xl uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl"
                                            >
                                                {isSubmitting ? <Loader2 className="animate-spin" /> : <ExternalLink size={20} />}
                                                Pagar con PayPal
                                            </button>
                                            <p className="text-[9px] text-white/20 mt-6 uppercase tracking-widest font-black">Tu seguridad es nuestra prioridad</p>
                                        </motion.div>
                                    ) : (
                                        <motion.div key="pay_crypto" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-[#050B1C] border border-white/10 p-12 rounded-[40px] text-center max-w-lg mx-auto">
                                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <Zap className="text-primary animate-pulse" size={36} />
                                            </div>
                                            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-2">Criptomonedas / Próximamente</h3>
                                            <p className="text-sm text-white/40 mb-8">Estamos integrando pagos seguros con USDT y BTC.</p>
                                            <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Disponible en V2.0</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="bg-[#050B1C] border border-white/10 p-6 rounded-2xl max-w-md">
                                    <h4 className="text-[11px] font-black uppercase tracking-widest text-[#FF8A33] mb-4 border-b border-white/10 pb-2">Estado Administrativo del Pago *</h4>
                                    <div className="space-y-3">
                                        <select value={formData.status} onChange={(e) => updateForm('status', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-[#FF8A33]/50 text-white outline-none text-sm appearance-none cursor-pointer">
                                            <option value="pagado" className="bg-[#050B1C]">✅ Pagada / Efectivo</option>
                                            <option value="pendiente" className="bg-[#050B1C]">⏳ Pendiente</option>
                                        </select>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Navegación */}
                <div className="flex justify-between items-center mt-8 pt-8 border-t border-white/10">
                    <button
                        onClick={prevStep}
                        className={cn(
                            "flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all",
                            step === 1 ? "opacity-0 pointer-events-none" : "bg-white/5 hover:bg-white/10 text-white"
                        )}
                    >
                        <ChevronLeft size={18} /> Atrás
                    </button>

                    {step < steps.length ? (
                        <button
                            onClick={nextStep}
                            className="flex items-center gap-2 px-8 py-4 bg-primary hover:bg-[#FF8A33] rounded-2xl font-black text-sm uppercase tracking-widest text-[#050B1C] transition-all shadow-[0_5px_15px_rgba(255,107,0,0.3)] hover:scale-105 active:scale-95"
                        >
                            Siguiente <ChevronRight size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !formData.photo}
                            className="flex items-center gap-2 px-8 py-4 bg-green-500 hover:bg-green-400 rounded-2xl font-black text-sm uppercase tracking-widest text-white transition-all shadow-[0_5px_15px_rgba(34,197,94,0.3)] hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <><Loader2 size={18} className="animate-spin" /> Procesando...</>
                            ) : (
                                <><Save size={18} /> Crear Tarjeta</>
                            )}
                        </button>
                    )}
                </div>
                {step === 3 && !formData.photo && (
                    <p className="text-right text-red-400 text-[10px] font-bold uppercase tracking-widest mt-2">La foto es obligatoria para finalizar</p>
                )}
            </div>

            {/* Helper Sidebar - Desktop */}
            <div className="hidden lg:block w-72 flex-shrink-0">
                <div className="sticky top-24 space-y-6">
                    <div className="bg-[#050B1C] border border-white/10 rounded-[28px] p-6 shadow-xl relative overflow-hidden group transition-all duration-500 hover:border-primary/30">
                        <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all"></div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-primary/20 rounded-xl text-primary">
                                    <HelpCircle size={20} />
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-white/60">Asistente de Llenado</h3>
                            </div>

                            <AnimatePresence mode="wait">
                                {focusedField ? (
                                    <motion.div
                                        key={focusedField}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="space-y-4"
                                    >
                                        <p className="text-sm font-bold text-white leading-relaxed">
                                            {FIELD_HELPERS[focusedField] || "Completa este campo con la información solicitada."}
                                        </p>
                                        <div className="flex items-center gap-2 py-2 px-3 bg-primary/5 border border-primary/20 rounded-lg">
                                            <Info size={12} className="text-primary" />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-primary/70">Consejo Pro</span>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="py-8 text-center space-y-3"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto text-white/20">
                                            <HelpCircle size={24} />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Haz clic en un campo para recibir ayuda</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Resumen del Progreso */}
                    <div className="bg-white/5 border border-white/5 rounded-[28px] p-6">
                        <h4 className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-4">Estado del Registro</h4>
                        <div className="space-y-3">
                            {steps.map((s) => (
                                <div key={s.id} className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-2 h-2 rounded-full",
                                        s.id === step ? "bg-primary animate-pulse" : s.id < step ? "bg-green-500" : "bg-white/10"
                                    )}></div>
                                    <span className={cn(
                                        "text-[10px] font-bold uppercase tracking-tight",
                                        s.id === step ? "text-white" : "text-white/30"
                                    )}>{s.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Helper Tooltip stack */}
            <AnimatePresence>
                {focusedField && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="lg:hidden fixed bottom-24 left-4 right-4 z-[60] bg-[#0A1229] border border-primary/30 rounded-2xl p-4 shadow-2xl flex items-start gap-3"
                    >
                        <div className="p-2 bg-primary/20 rounded-lg text-primary flex-shrink-0">
                            <Info size={16} />
                        </div>
                        <p className="text-xs font-bold text-white pr-6 leading-tight">
                            {FIELD_HELPERS[focusedField]}
                        </p>
                        <button onClick={() => setFocusedField(null)} className="absolute top-2 right-2 text-white/20">
                            <CheckCircle size={14} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
