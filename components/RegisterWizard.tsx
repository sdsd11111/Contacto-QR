"use client";

import { useState, useEffect } from "react";
import Script from "next/script";
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
    ArrowLeft,
    CheckCircle,
    FileText,
    Tag,
    Loader2,
    Mic,
    Star,
    Square
} from "lucide-react";
import { supabase } from "@/lib/supabase";

import imageCompression from 'browser-image-compression';
import { cn } from "@/lib/utils";
import VideoStepGuide from "./VideoStepGuide";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { QRCodeSVG } from "qrcode.react";

const steps = [
    { id: 1, title: 'Básico', icon: User },
    { id: 2, title: 'Perfil', icon: Briefcase },
    { id: 3, title: 'Visual', icon: Camera },
    // Plan selection removed - only one plan ($20)
    { id: 4, title: 'Pago', icon: Smartphone },
    { id: 5, title: 'Final', icon: CheckCircle },
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

// Utilidad para normalizar texto para comparación flexible
const normalizeText = (text: string) => {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Quitar acentos
        .trim();
};

export default function RegisterWizard() {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showVideoGuide, setShowVideoGuide] = useState(true);
    const [formData, setFormData] = useState({
        tipo_perfil: 'persona' as 'persona' | 'negocio',
        nombres: '',
        apellidos: '',
        nombre_negocio: '',
        contacto_nombre: '',
        contacto_apellido: '',
        name: '', // Legacy field for internal logic if needed
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
        plan: 'pro' as 'basic' | 'pro',
        photo: null as File | null,
        receipt: null as File | null,
        receiptUrl: '',
        paymentMethod: 'transfer' as 'transfer' | 'payphone' | 'paypal' | 'crypto',
        seller_id: null as string | null,
        sellerCode: '',
    });

    const [sellerName, setSellerName] = useState<string | null>(null);
    const [isValidatingCode, setIsValidatingCode] = useState(false);

    const [emailError, setEmailError] = useState('');
    const [hasManualTags, setHasManualTags] = useState(false);
    const [isListening, setIsListening] = useState<string | null>(null);
    const [cryptoPayment, setCryptoPayment] = useState<{ payAddress: string, payAmount: number, payCurrency: string } | null>(null);
    const [cryptoUrl, setCryptoUrl] = useState<string | null>(null);
    const [isCreatingCrypto, setIsCreatingCrypto] = useState(false);

    // Voice interview states
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [isProcessingInterview, setIsProcessingInterview] = useState(false);

    const startListening = (field: 'bio' | 'products') => {
        if (isListening) return; // Prevent double engagement

        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        if (!SpeechRecognition) {
            alert("Tu navegador no soporta dictado por voz. Por favor usa Chrome o Safari.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'es-EC';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.continuous = false; // Stop after one phrase

        recognition.onstart = () => setIsListening(field);
        recognition.onend = () => setIsListening(null);

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            const currentValue = field === 'bio' ? formData.bio : formData.products;
            updateForm(field, currentValue ? `${currentValue} ${transcript}` : transcript);
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsListening(null);
        };

        recognition.start();
    };

    // Voice Interview Functions
    const startInterview = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const audioChunks: Blob[] = [];

            recorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            recorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                await processInterview(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
            setRecordingTime(0);

            // Auto-stop after 90 seconds
            const maxDuration = 90000;
            setTimeout(() => {
                if (recorder.state === 'recording') {
                    stopInterview();
                }
            }, maxDuration);

        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('No se pudo acceder al micrófono. Por favor, verifica los permisos.');
        }
    };

    const stopInterview = () => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            setIsRecording(false);
        }
    };

    const processInterview = async (audioBlob: Blob) => {
        setIsProcessingInterview(true);
        try {
            const interviewFormData = new FormData();
            interviewFormData.append('audio', audioBlob, 'interview.webm');

            const response = await fetch('/api/transcribe-interview', {
                method: 'POST',
                body: interviewFormData,
            });

            if (!response.ok) {
                throw new Error('Error al procesar el audio');
            }

            const result = await response.json();
            if (result.success && result.data) {
                // Auto-fill fields with extracted data
                if (result.data.name) {
                    if (formData.tipo_perfil === 'negocio') {
                        updateForm('nombre_negocio', result.data.name);
                    } else {
                        updateForm('nombres', result.data.name);
                    }
                }
                if (result.data.profession) updateForm('profession', result.data.profession);
                if (result.data.bio) updateForm('bio', result.data.bio);
                if (result.data.products) updateForm('products', result.data.products);
                if (result.data.etiquetas) {
                    updateForm('categories', result.data.etiquetas);
                    setHasManualTags(true);
                }

                alert('¡Perfil completado exitosamente! Revisa los campos y ajusta si es necesario.');
            }
        } catch (error) {
            console.error('Error processing interview:', error);
            alert('Hubo un error al procesar tu entrevista. Por favor, intenta de nuevo.');
        } finally {
            setIsProcessingInterview(false);
        }
    };

    // Recording timer
    useEffect(() => {
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

    const [previewDevice, setPreviewDevice] = useState('android');
    const [isGeneratingTags, setIsGeneratingTags] = useState(false);

    const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
    const [payphoneInitialized, setPayphoneInitialized] = useState(false);
    const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);

    const generateWithAI = async () => {
        if (!formData.profession) {
            alert("Por favor ingresa tu profesión primero para poder generar etiquetas relevantes.");
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

            if (!response.ok) {
                throw new Error(data.details || data.error || 'Error en el servidor');
            }

            if (data.tags) {
                updateForm('categories', data.tags);
                setHasManualTags(true);
            } else {
                alert("No se pudieron generar etiquetas. Intenta de nuevo.");
            }
        } catch (err: any) {
            console.error("Error generating tags:", err);
            alert(`No pudimos conectar con la IA: ${err.message || 'Error de conexión'}. Revisa tu internet o intenta más tarde.`);
        } finally {
            setIsGeneratingTags(false);
        }
    };

    const analyzeImageFromPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsAnalyzingImage(true);
        try {
            // Convert to base64
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64Image = reader.result; // Data URL including header

                try {
                    const res = await fetch('/api/analyze-image', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ image: base64Image, profession: formData.profession })
                    });

                    if (!res.ok) throw new Error('Error al analizar imagen');

                    const data = await res.json();
                    if (data.text) {
                        const currentText = formData.products ? formData.products + '\n\n' : '';
                        updateForm('products', currentText + data.text);
                    }
                } catch (apiErr) {
                    console.error("API Error", apiErr);
                    alert("No pudimos analizar la imagen. Asegúrate que sea clara.");
                } finally {
                    setIsAnalyzingImage(false);
                    // Clear input
                    e.target.value = '';
                }
            };
        } catch (err) {
            console.error("File reading error", err);
            setIsAnalyzingImage(false);
        }
    };

    // Auto-suggest tags based on profession
    useEffect(() => {
        if (!hasManualTags) {
            const professionNormalized = normalizeText(formData.profession);
            // Buscar coincidencia exacta o parcial usando texto normalizado
            const key = Object.keys(INDUSTRY_TAGS).find(k =>
                professionNormalized.includes(normalizeText(k))
            );
            if (key) {
                updateForm('categories', INDUSTRY_TAGS[key].join(', '));
            }
        }
    }, [formData.profession, hasManualTags]);

    // Seller Attribution Logic
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const refId = params.get('ref') || params.get('seller');

        if (refId) {
            localStorage.setItem('vcard_attribution_id', refId);
        }

        const attributionId = localStorage.getItem('vcard_attribution_id');
        if (attributionId) {
            console.log("Seller Attribution Active:", attributionId);

            // Intentar validar ya sea por ID o por Código (ej: 001)
            const paramName = (attributionId.length === 3 && /^\d+$/.test(attributionId)) ? 'code' : 'id';

            fetch(`/api/vcard/validate-seller?${paramName}=${attributionId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setSellerName(data.nombre);
                        setFormData(prev => ({ ...prev, seller_id: data.id }));
                    } else {
                        // Si falla, intentamos el otro por si acaso
                        const otherParam = paramName === 'id' ? 'code' : 'id';
                        return fetch(`/api/vcard/validate-seller?${otherParam}=${attributionId}`);
                    }
                })
                .then(res => res?.json())
                .then(data => {
                    if (data?.success) {
                        setSellerName(data.nombre);
                        setFormData(prev => ({ ...prev, seller_id: data.id }));
                    }
                })
                .catch(err => console.error("Error fetching seller name:", err));
        }
    }, []);

    // Validar código de vendedor manual
    useEffect(() => {
        if (formData.sellerCode.length >= 3) {
            const validateCode = async () => {
                setIsValidatingCode(true);
                try {
                    const res = await fetch(`/api/vcard/validate-seller?code=${formData.sellerCode}`);
                    const data = await res.json();
                    if (data.success) {
                        setFormData(prev => ({ ...prev, seller_id: data.id }));
                        setSellerName(data.nombre);
                    } else {
                        setSellerName(null);
                        setFormData(prev => ({ ...prev, seller_id: null }));
                    }
                } catch (err) {
                    console.error("Error validating code:", err);
                } finally {
                    setIsValidatingCode(false);
                }
            };

            const timer = setTimeout(validateCode, 500);
            return () => clearTimeout(timer);
        } else if (formData.sellerCode === '') {
            setSellerName(null);
            // No resetear seller_id si vino por URL (atribución automática)
        }
    }, [formData.sellerCode]);

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

            // Limpiar nombre de archivo de caracteres especiales (acentos, ñ, espacios, etc)
            const cleanFileName = file.name
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9.]/g, "-")
                .replace(/-+/g, "-");

            const finalPath = path.replace(file.name, cleanFileName);

            const { data, error } = await supabase.storage
                .from(bucket)
                .upload(finalPath, fileToUpload, { upsert: false });

            if (error) throw error;
            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(finalPath);

            return publicUrl;
        } catch (error) {
            console.error("Upload Error:", error);
            throw error;
        }
    };

    const handleCryptoPayment = async (e?: any) => {
        if (e && typeof e.preventDefault === 'function') {
            e.preventDefault();
            e.stopPropagation();
        }
        console.log("[Crossmint Trigger] handleCryptoPayment llamado. Evento:", e?.type || 'No event', "Trace:", new Error().stack);
        setIsCreatingCrypto(true);
        try {
            const response = await fetch('/api/create-crypto-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: currentPlanPrice,
                    email: formData.email
                })
            });
            const data = await response.json();

            if (response.ok && data.paymentUrl) {
                setCryptoUrl(data.paymentUrl);
                // Abrir en ventana nueva para no perder el progreso del formulario
                window.open(data.paymentUrl, '_blank', 'width=500,height=700,scrollbars=yes');
            } else {
                console.error("Crossmint Error Completo:", data);
                alert(data.error || "Error al generar el portal de pago");
            }
        } catch (error) {
            console.error("Crypto Error:", error);
            alert("Error de conexión");
        } finally {
            setIsCreatingCrypto(false);
        }
    };

    const generateEditCode = () => {
        const year = new Date().getFullYear();
        // Use 2026 as requested by user
        const displayYear = 2026;
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        return `RYA-${displayYear}-${randomNum}`;
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

    const handleImageProcess = async (file: File): Promise<File | null> => {
        if (!file) return null;

        // Alerta si es muy pesada (> 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert(`La imagen "${file.name}" es muy pesada. La optimizaremos automáticamente para que no haya problemas.`);
        }

        if (file.type.startsWith('image/')) {
            try {
                const options = {
                    maxSizeMB: 0.7, // Un poco más permisivo para calidad
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



    const generateVCard = (data: typeof formData, photoBase64: string | null, categories: string = '') => {
        // vCard 4.0 format
        let photoBlock = '';
        if (photoBase64) {
            const folded = photoBase64.match(/.{1,72}/g)?.join('\r\n ') || photoBase64;
            photoBlock = `PHOTO;ENCODING=b;TYPE=JPEG:data:image/jpeg;base64,${folded}`;
        }

        let fullName = '';
        let structuredName = ''; // Campo N:
        let organization = '';   // Campo ORG:

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
            categories ? `CATEGORIES:${categories}` : '',
            photoBlock,
            data.instagram ? `X-SOCIALPROFILE;TYPE=instagram;LABEL=Instagram:${data.instagram}` : '',
            data.linkedin ? `X-SOCIALPROFILE;TYPE=linkedin;LABEL=LinkedIn:${data.linkedin}` : '',
            data.facebook ? `X-SOCIALPROFILE;TYPE=facebook;LABEL=Facebook:${data.facebook}` : '',
            data.tiktok ? `X-SOCIALPROFILE;TYPE=tiktok;LABEL=TikTok:${data.tiktok}` : '',
            `X-SOCIALPROFILE;TYPE=whatsapp;LABEL=WhatsApp:https://wa.me/${data.whatsapp.replace(/[^0-9]/g, '')}`,
            `REV:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
            'END:VCARD'
        ].filter(Boolean).join('\r\n');

        return vcard;
    };

    const handleFinalSubmit = async (forcedStatus?: string) => {
        setIsSubmitting(true);
        try {
            let photoUrl = null;
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
            let existingUser = null;
            try {
                const lookupRes = await fetch(`/api/vcard/lookup?email=${encodeURIComponent(formData.email)}`);
                if (lookupRes.ok) {
                    existingUser = await lookupRes.json();
                }
            } catch (err) {
                console.error("Error fetching existing user:", err);
            }

            const slug = existingUser?.slug || generateSlug(formData);

            // 2. Subir imágenes (solo si hay nuevas)
            // 2. Subir imágenes localmente
            const uploadFile = async (file: File) => {
                const formData = new FormData();
                formData.append('file', file);
                const res = await fetch('/api/upload', { method: 'POST', body: formData });
                if (!res.ok) throw new Error('Upload failed');
                const data = await res.json();
                return data.url;
            };

            if (formData.photo) {
                try {
                    photoUrl = await uploadFile(formData.photo);
                    // Generate base64 for vCard
                    photoBase64 = await fileToBase64(formData.photo);
                } catch (e) { console.error("Error uploading photo", e); }
            } else if (existingUser) {
                photoUrl = existingUser.foto_url;
            }

            if (formData.receipt) {
                try {
                    receiptUrl = await uploadFile(formData.receipt);
                } catch (e) { console.error("Error uploading receipt", e); }
            } else if (existingUser) {
                receiptUrl = existingUser.comprobante_url;
            }



            // 3. UPSERT: Inserta o Actualiza por email
            const upsertData = {
                tipo_perfil: formData.tipo_perfil,
                nombres: formData.nombres,
                apellidos: formData.apellidos,
                nombre_negocio: formData.nombre_negocio,
                contacto_nombre: formData.contacto_nombre,
                contacto_apellido: formData.contacto_apellido,
                whatsapp: formData.whatsapp,
                email: formData.email,
                profesion: formData.profession,
                empresa: formData.company,
                bio: formData.bio,
                direccion: formData.address,
                web: formData.web,
                google_business: formData.google_business,
                instagram: formData.instagram,
                linkedin: formData.linkedin,
                facebook: formData.facebook,
                tiktok: formData.tiktok,
                productos_servicios: formData.products,
                plan: formData.plan,
                foto_url: photoUrl,
                comprobante_url: receiptUrl,
                status: forcedStatus || 'pendiente',
                slug: slug,
                etiquetas: finalCategories,
                seller_id: formData.seller_id
            };

            console.log("3. UPSERT: Enviando a Supabase...");
            console.log("3. UPSERT: Enviando a API servidor (bypass RLS)...");
            const response = await fetch('/api/vcard/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(upsertData)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Error al guardar en el servidor');
            }

            console.log("4. REGISTRO COMPLETADO!");

            // 4b. NOTIFICAR POR WHATSAPP (Automático via Evolution API)
            try {
                fetch('/api/notify-whatsapp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: formData.name,
                        email: formData.email,
                        whatsapp: formData.whatsapp,
                        plan: formData.plan
                    })
                }).catch(err => console.error("Error silencioso en notificación WhatsApp:", err));
            } catch (notifyErr) {
                console.error("Error al disparar notificación WhatsApp:", notifyErr);
            }

            // Nota: El backup por email fue removido porque el endpoint
            // /api/send-vcard ahora requiere autenticación admin.
            // La notificación WhatsApp arriba ya sirve como alerta al admin.


            setIsSubmitting(false);
            setStep(5); // Ir a pantalla de Éxito (FINAL)
        } catch (err) {
            console.error("Full Error Context:", err);
            const msg = err instanceof Error ? err.message : JSON.stringify(err);
            alert(`Hubo un error al guardar tu pedido: ${msg}. Por favor intenta de nuevo o contáctanos.`);
            setIsSubmitting(false);
        }
    };

    const handleNext = () => {
        if (step === 1) {
            const hasName = formData.tipo_perfil === 'negocio'
                ? !!formData.nombre_negocio
                : (!!formData.nombres && !!formData.apellidos);

            if (!hasName || !formData.whatsapp || !validateEmail(formData.email)) {
                if (!validateEmail(formData.email)) setEmailError('Ingresa un correo válido');
                return;
            }
            setEmailError('');
        }
        if (step === 2) {
            if (!formData.profession) return;
        }
        if (step === 4) { // Payment Step is now 4
            handleFinalSubmit();
            return;
        }
        setStep(s => Math.min(s + 1, 5));
    };

    const handleBack = () => setStep(s => Math.max(s - 1, 1));


    const updateForm = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // PayPhone Button Initialization Effect (Box v1.1)
    useEffect(() => {
        if (step === 4 && formData.paymentMethod === 'payphone') { // Payment is now Step 4
            const initButton = () => {
                const PBox = (window as any).PPaymentButtonBox;
                if (PBox) {
                    const btnContainer = document.getElementById('pp-button');
                    if (btnContainer) {
                        // Limpiar el contenedor por si acaso
                        btnContainer.innerHTML = "";

                        const currentPlanPrice = formData.plan === 'pro' ? 20 : 10;
                        const amountInCents = currentPlanPrice * 100;
                        const transactionId = `reg_${Date.now()}_${formData.name.replace(/\s+/g, '_')}`;


                        try {
                            const ppb = new PBox({
                                token: process.env.NEXT_PUBLIC_PAYPHONE_TOKEN,
                                amount: amountInCents,
                                amountWithoutTax: amountInCents,
                                currency: "USD",
                                clientTransactionId: transactionId,
                                storeId: process.env.NEXT_PUBLIC_PAYPHONE_STORE_ID,
                                reference: `Pago Plan ${formData.plan.toUpperCase()} - ${formData.name}`,
                                lang: "es",
                                responseUrl: typeof window !== 'undefined' ? `${window.location.origin}/registro` : "https://www.activaqr.com/registro",
                                cancellationUrl: typeof window !== 'undefined' ? `${window.location.origin}/registro` : "https://www.activaqr.com/registro",
                                onComplete: async (model: any, actions: any) => {
                                    console.log("Pago completado con éxito:", model);
                                    handleFinalSubmit('pagado');
                                },
                                onCancel: (data: any) => {
                                    console.log("Pago cancelado por el usuario");
                                }
                            });

                            ppb.render("pp-button");
                            console.log("PayPhone Box renderizado con éxito");
                        } catch (err) {
                            console.error("Error al instanciar PayPhone Box:", err);
                        }
                    } else {
                        console.warn("No se encontró el contenedor #pp-button");
                    }
                } else {
                    console.warn("Script de PayPhone cargado pero PPaymentButtonBox no está disponible");
                }
            };

            // Intentar inicializar con un pequeño delay para asegurar render del DOM
            const timer = setTimeout(initButton, 500);
            return () => clearTimeout(timer);
        }
    }, [step, formData.paymentMethod, payphoneInitialized]);

    const currentPlanPrice = 20; // Single plan $20

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

                                {/* Perfil Type Toggle */}
                                <div className="flex bg-navy/5 p-1 rounded-2xl mb-8">
                                    <button
                                        onClick={() => updateForm('tipo_perfil', 'persona')}
                                        className={cn(
                                            "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                            formData.tipo_perfil === 'persona' ? "bg-white text-navy shadow-sm" : "text-navy/40 hover:text-navy/60"
                                        )}
                                    >
                                        <User size={14} />
                                        Persona
                                    </button>
                                    <button
                                        onClick={() => updateForm('tipo_perfil', 'negocio')}
                                        className={cn(
                                            "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                            formData.tipo_perfil === 'negocio' ? "bg-white text-navy shadow-sm" : "text-navy/40 hover:text-navy/60"
                                        )}
                                    >
                                        <Briefcase size={14} />
                                        Negocio / Local
                                    </button>
                                </div>

                                {formData.tipo_perfil === 'persona' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="group">
                                            <label className="block text-[10px] font-black text-navy/40 uppercase tracking-widest mb-3 ml-1">Nombres</label>
                                            <div className="relative">
                                                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-navy/20 group-focus-within:text-primary transition-colors" size={20} />
                                                <input
                                                    type="text"
                                                    value={formData.nombres}
                                                    onChange={(e) => updateForm('nombres', e.target.value)}
                                                    placeholder="Ej. Manuel"
                                                    className="w-full bg-white/50 border-2 border-transparent focus:border-primary/20 rounded-2xl px-16 py-5 outline-none font-bold text-navy transition-all shadow-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="group">
                                            <label className="block text-[10px] font-black text-navy/40 uppercase tracking-widest mb-3 ml-1">Apellidos</label>
                                            <div className="relative">
                                                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-navy/20 group-focus-within:text-primary transition-colors" size={20} />
                                                <input
                                                    type="text"
                                                    value={formData.apellidos}
                                                    onChange={(e) => updateForm('apellidos', e.target.value)}
                                                    placeholder="Ej. Pérez"
                                                    className="w-full bg-white/50 border-2 border-transparent focus:border-primary/20 rounded-2xl px-16 py-5 outline-none font-bold text-navy transition-all shadow-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="group">
                                            <label className="block text-[10px] font-black text-navy/40 uppercase tracking-widest mb-3 ml-1">Nombre del Negocio / Local</label>
                                            <div className="relative">
                                                <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 text-navy/20 group-focus-within:text-primary transition-colors" size={20} />
                                                <input
                                                    type="text"
                                                    value={formData.nombre_negocio}
                                                    onChange={(e) => updateForm('nombre_negocio', e.target.value)}
                                                    placeholder="Ej. Ferretería El Maestro"
                                                    className="w-full bg-white/50 border-2 border-transparent focus:border-primary/20 rounded-2xl px-16 py-5 outline-none font-black text-navy transition-all shadow-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="group">
                                                <label className="block text-[10px] font-black text-navy/40 uppercase tracking-widest mb-3 ml-1 text-primary/60">Nombre de Contacto (Opcional)</label>
                                                <input
                                                    type="text"
                                                    value={formData.contacto_nombre}
                                                    onChange={(e) => updateForm('contacto_nombre', e.target.value)}
                                                    placeholder="Ej. Juan (Opcional)"
                                                    className="w-full bg-white/50 border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 py-5 outline-none font-bold text-navy transition-all shadow-sm"
                                                />
                                            </div>
                                            <div className="group">
                                                <label className="block text-[10px] font-black text-navy/40 uppercase tracking-widest mb-3 ml-1 text-primary/60">Apellido de Contacto (Opcional)</label>
                                                <input
                                                    type="text"
                                                    value={formData.contacto_apellido}
                                                    onChange={(e) => updateForm('contacto_apellido', e.target.value)}
                                                    placeholder="Ej. Paz (Opcional)"
                                                    className="w-full bg-white/50 border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 py-5 outline-none font-bold text-navy transition-all shadow-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

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

                                {/* Seller Code Field */}
                                <div className="group pt-4 border-t border-navy/5">
                                    <label className="block text-[10px] font-black text-navy/40 uppercase tracking-widest mb-3 ml-1 flex justify-between items-center">
                                        <span>Código de Vendedor / Promocional</span>
                                        {sellerName && <span className="text-primary animate-pulse">Vendedor: {sellerName}</span>}
                                    </label>
                                    <div className="relative">
                                        <Tag className={cn(
                                            "absolute left-6 top-1/2 -translate-y-1/2 transition-colors",
                                            sellerName ? "text-primary" : "text-navy/20 group-focus-within:text-primary"
                                        )} size={20} />
                                        <input
                                            type="text"
                                            value={formData.sellerCode}
                                            onChange={(e) => updateForm('sellerCode', e.target.value)}
                                            placeholder="Ej. 001"
                                            className={cn(
                                                "w-full bg-white/50 border-2 rounded-2xl px-16 py-5 outline-none font-bold text-navy transition-all shadow-sm uppercase",
                                                sellerName ? "border-primary/20 bg-primary/5" : "border-transparent focus:border-primary/20"
                                            )}
                                        />
                                        {isValidatingCode && (
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2">
                                                <Loader2 className="animate-spin text-primary" size={20} />
                                            </div>
                                        )}
                                        {sellerName && (
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2">
                                                <CheckCircle className="text-primary" size={20} />
                                            </div>
                                        )}
                                    </div>
                                    <p className="mt-2 text-[9px] font-bold text-navy/30 uppercase tracking-widest ml-1">
                                        Si un asesor te ayudó, ingresa su código aquí.
                                    </p>
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
                                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-2 flex items-center gap-3">
                                    <Mic size={16} className="text-primary shrink-0" />
                                    <p className="text-[10px] font-bold text-navy/60 uppercase leading-tight tracking-widest">
                                        <span className="text-primary font-black">Pro Tip:</span> Puedes dictar tus textos con el micrófono 🎙️. Si se detiene, dale un espacio y pulsa el botón de nuevo.
                                    </p>
                                </div>

                                {/* Voice Interview Button */}
                                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary rounded-3xl p-6 mb-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
                                    <div className="relative">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
                                                <Mic className="text-white" size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-navy uppercase italic tracking-tight">Entrevista Inteligente</h3>
                                                <p className="text-[10px] text-navy/60 font-bold uppercase tracking-widest">Completa tu perfil en segundos con IA</p>
                                            </div>
                                        </div>

                                        {!isRecording && !isProcessingInterview && (
                                            <>
                                                <p className="text-sm text-navy/70 font-medium mb-4 leading-relaxed">
                                                    Graba un audio de 30-90 segundos respondiendo: <strong>¿Quién eres? ¿A qué te dedicas? ¿Qué servicios ofreces?</strong> La IA completará tu perfil automáticamente.
                                                </p>
                                                <button
                                                    onClick={startInterview}
                                                    className="w-full bg-primary text-white font-black uppercase text-sm py-4 px-6 rounded-2xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
                                                >
                                                    <Mic size={20} className="group-hover:scale-110 transition-transform" />
                                                    Empezar entrevista
                                                </button>
                                            </>
                                        )}

                                        {isRecording && (
                                            <div className="text-center">
                                                <div className="flex items-center justify-center gap-3 mb-4">
                                                    <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse"></div>
                                                    <span className="text-2xl font-black text-navy tabular-nums">{formatTime(recordingTime)}</span>
                                                </div>
                                                <p className="text-sm text-navy/60 font-medium mb-4">Grabando... Habla claro y natural</p>
                                                <button
                                                    onClick={stopInterview}
                                                    className="w-full bg-red-500 text-white font-black uppercase text-sm py-4 px-6 rounded-2xl hover:bg-red-600 transition-all shadow-lg flex items-center justify-center gap-2"
                                                >
                                                    <Square size={20} />
                                                    Detener grabación
                                                </button>
                                            </div>
                                        )}

                                        {isProcessingInterview && (
                                            <div className="text-center py-4">
                                                <Loader2 className="animate-spin text-primary mx-auto mb-3" size={40} />
                                                <p className="text-sm font-black text-navy uppercase">Procesando tu entrevista...</p>
                                                <p className="text-xs text-navy/50 font-medium mt-1">Transcribiendo y extrayendo información</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

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
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="block text-[10px] font-black text-navy/40 uppercase tracking-widest ml-1">Tu Bio o Descripción</label>
                                        <button
                                            onClick={() => startListening('bio')}
                                            className={cn(
                                                "text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all",
                                                isListening === 'bio' ? "text-red-500 animate-pulse" : "text-primary hover:opacity-80"
                                            )}
                                        >
                                            <Mic size={12} />
                                            <span>{isListening === 'bio' ? 'Escuchando...' : 'Dictar'}</span>
                                        </button>
                                    </div>
                                    <textarea
                                        value={formData.bio}
                                        onChange={(e) => {
                                            updateForm('bio', e.target.value);
                                            e.target.style.height = 'auto';
                                            e.target.style.height = `${e.target.scrollHeight}px`;
                                        }}
                                        placeholder="Cuéntales qué ofreces..."
                                        rows={2}
                                        className="w-full bg-white/50 border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 py-5 outline-none font-bold text-navy transition-all shadow-sm resize-none overflow-hidden"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="block text-[10px] font-black text-navy/40 uppercase tracking-widest">Productos o Servicios</label>
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => startListening('products')}
                                                className={cn(
                                                    "text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all",
                                                    isListening === 'products' ? "text-red-500 animate-pulse" : "text-primary hover:opacity-80"
                                                )}
                                            >
                                                <Mic size={12} />
                                                <span>{isListening === 'products' ? 'Escuchando...' : 'Dictar'}</span>
                                            </button>
                                            <label className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
                                                {isAnalyzingImage ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
                                                <span>{isAnalyzingImage ? 'Analizando...' : 'Escanear Foto'}</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={analyzeImageFromPhoto}
                                                    disabled={isAnalyzingImage}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                    <textarea
                                        value={formData.products}
                                        onChange={(e) => {
                                            updateForm('products', e.target.value);
                                            e.target.style.height = 'auto';
                                            e.target.style.height = `${e.target.scrollHeight}px`;
                                        }}
                                        placeholder="Ej. Cambio de tuberías, Instalación de grifos... (O dicta tu lista de precios)"
                                        rows={4}
                                        className="w-full bg-white/50 border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 py-5 outline-none font-bold text-navy transition-all shadow-sm resize-none overflow-hidden"
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
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-black text-primary uppercase tracking-widest mb-3">Enlace Google My Business / Maps (Recomendado)</label>
                                        <input
                                            type="url"
                                            value={formData.google_business}
                                            onChange={(e) => {
                                                let val = e.target.value;
                                                if (val && !val.startsWith('http')) val = 'https://' + val;
                                                updateForm('google_business', val);
                                            }}
                                            placeholder="https://maps.app.goo.gl/..."
                                            className="w-full bg-primary/5 border-2 border-primary/20 focus:border-primary rounded-2xl px-6 py-5 outline-none font-bold text-navy transition-all shadow-sm text-sm"
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
                                    <div>
                                        <label className="block text-[10px] font-black text-navy/40 uppercase tracking-widest mb-3">Facebook (Link Completo)</label>
                                        <input
                                            type="url"
                                            value={formData.facebook}
                                            onChange={(e) => updateForm('facebook', e.target.value)}
                                            placeholder="https://facebook.com/tupagina"
                                            className="w-full bg-white/50 border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 py-5 outline-none font-bold text-navy transition-all shadow-sm text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-navy/40 uppercase tracking-widest mb-3">TikTok (Link Completo)</label>
                                        <input
                                            type="url"
                                            value={formData.tiktok}
                                            onChange={(e) => updateForm('tiktok', e.target.value)}
                                            placeholder="https://tiktok.com/@tuusuario"
                                            className="w-full bg-white/50 border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 py-5 outline-none font-bold text-navy transition-all shadow-sm text-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="block text-[10px] font-black text-navy/40 uppercase tracking-widest ml-1">Etiquetas de Búsqueda (Comas)</label>
                                        <button
                                            onClick={generateWithAI}
                                            disabled={isGeneratingTags || !formData.profession}
                                            className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2 hover:opacity-80 transition-opacity disabled:opacity-50"
                                        >
                                            {isGeneratingTags ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
                                            {isGeneratingTags ? 'Generando...' : `Generar con IA (30 etiquetas)`}
                                        </button>
                                    </div>
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
                                    <p className="text-[9px] font-bold text-navy/30 uppercase mt-2 tracking-widest">Mejora tu SEO local y visibilidad</p>
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
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const processed = await handleImageProcess(file);
                                                    updateForm('photo', processed);
                                                }
                                            }}
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
                            </div>


                        </div>
                    )}

                    {/* STEP 4: PAGO */}
                    {step === 4 && (
                        <div className="max-w-3xl mx-auto text-white">
                            <div className="text-center mb-10">
                                <h2 className="text-3xl md:text-5xl font-black text-primary tracking-tighter uppercase italic mb-2">Método de Pago</h2>
                                <p className="text-white/60 text-sm">Tu inversión para tu nueva presencia digital: ${currentPlanPrice}.00</p>
                            </div>

                            <div className="flex bg-white/5 p-2 rounded-3xl mb-10 max-w-lg mx-auto overflow-x-auto no-scrollbar">
                                {[
                                    { id: 'transfer', label: 'Transferencia' },
                                    { id: 'payphone', label: 'PayPhone' },
                                    { id: 'paypal', label: 'PayPal' },
                                    { id: 'crypto', label: 'Cripto' },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            updateForm('paymentMethod', tab.id);
                                        }}
                                        className={cn(
                                            "flex-1 px-4 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap",
                                            formData.paymentMethod === tab.id ? "bg-primary text-white shadow-lg" : "text-white/40 hover:text-white/60"
                                        )}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            <AnimatePresence mode="wait">
                                {formData.paymentMethod === 'transfer' ? (
                                    <motion.div
                                        key="transfer"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-8"
                                    >
                                        <div className="bg-white/5 p-8 rounded-[40px] border border-white/10">
                                            <h3 className="text-primary font-black uppercase italic tracking-tighter text-xl mb-6">Datos del Banco</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Banco</p>
                                                    <p className="font-bold text-lg uppercase tracking-tight">Banco de Loja</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Tipo de Cuenta</p>
                                                    <p className="font-bold">Ahorros</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Número de Cuenta</p>
                                                    <p className="font-black text-xl text-primary">2901861882</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Titular</p>
                                                    <p className="font-bold">Cristhopher Abel Reyes Pardo</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Cédula</p>
                                                    <p className="font-bold">1105106866</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Correo para notificación</p>
                                                    <p className="text-xs font-bold leading-tight">cristhopheryeah113@gmail.com</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="bg-primary/10 p-6 rounded-3xl border border-primary/20">
                                                <p className="text-xs font-bold leading-relaxed">
                                                    Una vez realizada la transferencia, sube el comprobante aquí y haz clic en <span className="text-primary font-black uppercase">Finalizar Registro</span>.
                                                </p>
                                            </div>

                                            <div className="relative group">
                                                <div className="w-full h-40 rounded-3xl bg-white/5 border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 transition-all overflow-hidden relative">
                                                    <input
                                                        type="file"
                                                        accept="image/*,application/pdf"
                                                        onChange={async (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                const processed = await handleImageProcess(file);
                                                                updateForm('receipt', processed);
                                                                // Crear URL temporal para previsualización (solo si es imagen)
                                                                if (processed && processed.type.startsWith('image/')) {
                                                                    const url = URL.createObjectURL(processed);
                                                                    updateForm('receiptUrl', url);
                                                                } else {
                                                                    updateForm('receiptUrl', null); // PDF no tiene preview simple
                                                                }
                                                            }
                                                        }}
                                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                    />
                                                    {formData.receipt ? (
                                                        <div className="flex flex-col items-center">
                                                            {formData.receipt.type.startsWith('image/') && formData.receiptUrl ? (
                                                                <img
                                                                    src={formData.receiptUrl}
                                                                    alt="Comprobante"
                                                                    className="w-full h-full object-cover absolute inset-0 opacity-50"
                                                                />
                                                            ) : (
                                                                <FileText className="text-primary mb-2" size={32} />
                                                            )}
                                                            <div className="bg-black/50 p-2 rounded-lg relative z-20">
                                                                <Check className="text-green-400" size={24} strokeWidth={3} />
                                                            </div>
                                                            <p className="text-xs text-white z-20 mt-2 font-bold truncate max-w-[150px]">{formData.receipt.name}</p>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                                                                <ShieldCheck className="text-white/60 group-hover:text-primary transition-colors" size={24} />
                                                            </div>
                                                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest group-hover:text-white transition-colors">Subir Comprobante</span>
                                                        </>
                                                    )}
                                                </div>
                                                {formData.receipt && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            updateForm('receipt', null);
                                                            updateForm('receiptUrl', '');
                                                        }}
                                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-30"
                                                    >
                                                        ×
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : formData.paymentMethod === 'payphone' ? (
                                    <motion.div
                                        key="payphone"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        className="bg-white/5 p-8 rounded-[40px] border border-white/10 text-center max-w-md mx-auto"
                                    >
                                        <div className="mb-6">
                                            <div className="w-16 h-16 bg-[#ff6f00]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Smartphone className="text-[#ff6f00]" size={32} />
                                            </div>
                                            <h3 className="text-xl font-black uppercase italic tracking-tighter mb-2">Pago Seguro con PayPhone</h3>
                                            <p className="text-sm text-white/60 mb-6">Paga con cualquier tarjeta de crédito o débito de forma segura.</p>

                                            {/* Contenedor del Botón de PayPhone */}
                                            <div id="pp-button" className="min-h-[50px] flex justify-center">
                                                <div className="animate-pulse bg-white/10 h-12 w-full rounded-lg flex items-center justify-center">
                                                    <Loader2 className="animate-spin mr-2" /> Cargando botón de pago...
                                                </div>
                                            </div>
                                            <p className="text-xs text-white/30 mt-4">La transacción es procesada directamente por PayPhone.</p>
                                        </div>
                                    </motion.div>
                                ) : formData.paymentMethod === 'paypal' ? (
                                    <motion.div
                                        key="paypal"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        className="bg-white/5 p-8 rounded-[40px] border border-white/10 text-center max-w-md mx-auto"
                                    >
                                        <div className="mb-6">
                                            <h3 className="text-xl font-black uppercase italic tracking-tighter mb-2">Pago con PayPal</h3>
                                            <p className="text-sm text-white/60 mb-6">Paga de forma segura con tu cuenta PayPal.</p>
                                        </div>

                                        <div className="relative z-0">
                                            <PayPalScriptProvider options={{
                                                clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test",
                                                currency: "USD",
                                                intent: "capture",
                                                "disable-funding": "paylater,venmo",
                                                locale: "es_EC"
                                            }}>
                                                <PayPalButtons
                                                    style={{ layout: "vertical", shape: 'rect' }}
                                                    fundingSource="card"
                                                    createOrder={(data, actions) => {
                                                        return actions.order.create({
                                                            intent: "CAPTURE",
                                                            purchase_units: [
                                                                {
                                                                    amount: {
                                                                        currency_code: "USD",
                                                                        value: currentPlanPrice.toString(),
                                                                    },
                                                                    description: `Plan Profesional PRO - ActivaQR`,
                                                                    custom_id: formData.email
                                                                },
                                                            ],
                                                            application_context: {
                                                                shipping_preference: "NO_SHIPPING",
                                                                user_action: "PAY_NOW",
                                                            }
                                                        } as any);
                                                    }}
                                                    onApprove={async (data, actions) => {
                                                        if (actions.order) {
                                                            return actions.order.capture().then((details) => {
                                                                console.log("Pago PayPal completado:", details);
                                                                handleFinalSubmit('pagado');
                                                            });
                                                        }
                                                        return Promise.reject("Order action not available");
                                                    }}
                                                />
                                            </PayPalScriptProvider>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="crypto"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white/5 p-12 rounded-[40px] border border-white/10 text-center max-w-md mx-auto"
                                    >
                                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <Zap className="text-primary animate-pulse" size={32} />
                                        </div>
                                        <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Próximamente</h3>
                                        <p className="text-sm text-white/40 font-medium">Estamos trabajando para integrar pagos seguros con Criptomonedas (BTC, USDT, ETH).</p>

                                        <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                                            <p className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-bold">Disponible en la versión 2.0</p>

                                            <a
                                                href={`https://wa.me/593963410409?text=Hola,%20estoy%20en%20el%20paso%20de%20pago%20con%20Cripto%20y%20necesito%20ayuda%20para%20pagar%20mi%20vCard%20(Plan%20Pro%20$20).%20Mi%20correo:%20${formData.email}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full bg-green-500/10 text-green-400 font-bold text-[10px] py-4 rounded-xl flex items-center justify-center gap-2 border border-green-500/20 hover:bg-green-500/20 transition-all"
                                            >
                                                ¿Necesitas ayuda inmediata? Soporte por WhatsApp
                                            </a>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )
                    }

                    {/* STEP 5: EN REVISIÓN */}
                    {
                        step === 5 && (
                            <div className="max-w-2xl mx-auto text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-24 h-24 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-10"
                                >
                                    <CheckCircle size={56} strokeWidth={2.5} />
                                </motion.div>
                                <h2 className="text-3xl md:text-4xl font-black text-navy tracking-tighter uppercase italic mb-4">¡Registro Recibido!</h2>
                                <p className="text-navy/60 font-medium text-base mb-3 text-center">
                                    Tu solicitud ha sido enviada con éxito.
                                </p>
                                <div className="relative w-48 h-48 mx-auto mb-6 rounded-3xl overflow-hidden shadow-xl border-4 border-primary/20">
                                    <img
                                        src="/images/entrega_contacto.webp"
                                        className="w-full h-full object-cover"
                                        alt="Entrega en 24 horas"
                                    />
                                    <div className="absolute inset-x-0 bottom-0 bg-primary/90 backdrop-blur-sm py-2 flex items-center justify-center border-t border-white/20">
                                        <span className="text-white font-black text-xs uppercase tracking-widest">Entrega en 24 horas</span>
                                    </div>
                                </div>
                                <p className="text-2xl md:text-3xl font-black text-primary text-center mb-3 leading-tight">
                                    Tu perfil estará listo y enviado en máximo 24 horas
                                </p>
                                <p className="text-navy/60 font-medium text-base mb-8 text-center">
                                    Te enviaremos tu Contacto Digital (.vcf) y Código QR a tu correo electrónico y WhatsApp.
                                </p>

                                <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-navy/5 border border-navy/5 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-primary-dark to-primary" />
                                    <div className="flex flex-col md:flex-row items-center gap-6 justify-center">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                                                <Mail size={32} />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-black text-navy text-lg leading-tight uppercase italic mb-0.5">Revisa tu correo</p>
                                                <p className="text-sm font-bold text-navy/40 truncate max-w-[280px]">{formData.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* RECOMPENSA POR RESEÑA */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="mt-10 bg-gradient-to-br from-navy to-navy/90 p-8 rounded-[3rem] text-white border-2 border-primary/30 shadow-2xl relative overflow-hidden"
                                >
                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
                                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-left">
                                        <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center shrink-0 border border-white/5">
                                            <span className="text-4xl font-black text-primary">-50%</span>
                                            <span className="text-[8px] font-black uppercase tracking-widest">Descuento</span>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black uppercase tracking-tighter italic mb-2">¡Gana un 50% de Descuento en tu renovación!</h3>
                                            <p className="text-sm text-white/60 mb-6 font-medium leading-relaxed">
                                                Ayúdanos a crecer con una reseña en Google y te regalamos la mitad del costo de tu renovación el próximo año. ¡Solo te toma 15 segundos!
                                            </p>
                                            <a
                                                href="https://g.page/r/CRWzEc2rIpGjEAI/review"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest shadow-primary hover:scale-105 transition-all"
                                            >
                                                <Star size={16} fill="currentColor" /> Dejar mi Reseña <ArrowRight size={16} />
                                            </a>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Botón Volver al Inicio */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                    className="mt-12"
                                >
                                    <button
                                        onClick={() => window.location.href = '/'}
                                        className="inline-flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest shadow-primary hover:scale-105 transition-all"
                                    >
                                        <ArrowLeft size={16} /> Volver al Inicio
                                    </button>
                                </motion.div>
                            </div>
                        )
                    }

                    {/* Navigation */}
                    {
                        step < 5 && (
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
                                        step >= 4 ? "bg-primary text-white shadow-primary" : "bg-navy text-white",
                                        isSubmitting && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    {step === 5 ? (isSubmitting ? 'Procesando...' : 'Finalizar Registro') : 'Siguiente'} <ArrowRight size={20} />
                                </button>
                            </div>
                        )
                    }
                </motion.div>
            </AnimatePresence>

            <VideoStepGuide
                step={step}
                isVisible={showVideoGuide}
                onClose={() => setShowVideoGuide(false)}
            />

            <Script
                src="https://cdn.payphonetodoesposible.com/box/v1.1/payphone-payment-box.js"
                type="module"
                strategy="lazyOnload"
                onLoad={() => {
                    console.log("PayPhone Script (Oficial) cargado");
                    setPayphoneInitialized(true);
                }}
                onError={() => {
                    console.error("Error cargando script de PayPhone (Oficial)");
                }}
            />
            <link
                rel="stylesheet"
                href="https://cdn.payphonetodoesposible.com/box/v1.1/payphone-payment-box.css"
            />

        </div>
    );
}
