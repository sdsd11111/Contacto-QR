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
    Square,
    Store,
    Youtube,
    ExternalLink,
    Upload
} from "lucide-react";
import { supabase } from "@/lib/supabase";

import imageCompression from 'browser-image-compression';
import { cn } from "@/lib/utils";
import VideoStepGuide from "./VideoStepGuide";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { QRCodeSVG } from "qrcode.react";

const PRODUCT_PLANS = [
    { 
        id: 'digital', 
        name: 'Contacto Digital', 
        price: 20, 
        features: ['vCard profesional', 'Redes sociales', 'Bio y servicios', 'Soporte 24/7'] 
    },
    { 
        id: 'business', 
        name: 'Contacto Business', 
        price: 60, 
        features: ['Todo lo anterior', 'Imágenes Hero (Desktop/Móvil)', 'Diseño premium', 'Prioridad en soporte'] 
    },
    { 
        id: 'catalog', 
        name: 'Business + Catálogo', 
        price: 120, 
        features: ['Todo lo anterior', 'Catálogo interactivo', 'Gestión de productos', 'Gestión de categorías'] 
    }
];

const steps = [
    { id: 1, title: 'Plan', icon: Smartphone },
    { id: 2, title: 'Básico', icon: User },
    { id: 3, title: 'Perfil', icon: Briefcase },
    { id: 4, title: 'Visual', icon: Camera },
    { id: 5, title: 'Catálogo', icon: Store, conditional: (data: any) => data.plan === 'catalog' },
    { id: 6, title: 'Pago', icon: Smartphone },
    { id: 7, title: 'Final', icon: CheckCircle },
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
        youtube: '',
        x: '',
        menu_digital: '',
        productos_servicios: '',
        etiquetas: '',
        plan: 'digital' as 'digital' | 'business' | 'catalog',
        photo: null as File | null,
        hero_mobile: null as File | null,
        hero_desktop: null as File | null,
        portada_movil: '',
        portada_desktop: '',
        catalogo_json: '[]',
        receipt: null as File | null,
        receiptUrl: '',
        paymentMethod: 'transfer' as 'transfer' | 'payphone' | 'paypal' | 'crypto',
        seller_id: null as string | null,
        sellerCode: '',
        google_rating: '',
        google_reviews_count: '',
        youtube_video_url: '',
        hero_action: 'link',
        hero_button_text: '',
        hero_section_title: '',
        hero_file_url: '',
        hero_external_link: '',
        hero_step1_title: '',
        hero_step1_text: '',
        hero_step2_title: '',
        hero_step2_text: '',
        hero_step3_title: '',
        hero_step3_text: '',
        wifi_ssid: '', // Kept for legacy if needed, but hero_section_title replaces its usage in UI
        wifi_password: '', // Kept for legacy
    });

    const [catalogItems, setCatalogItems] = useState<any[]>([]);

    const [sellerName, setSellerName] = useState<string | null>(null);
    const [isValidatingCode, setIsValidatingCode] = useState(false);
    const [payphoneInitialized, setPayphoneInitialized] = useState(false);

    // Lead Footprint (Huella) States
    const [footprintSeller, setFootprintSeller] = useState<string | null>(null);
    const [isCheckingFootprint, setIsCheckingFootprint] = useState(false);

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
    const [transcriptionStatus, setTranscriptionStatus] = useState<'idle' | 'uploading' | 'processing' | 'extracting'>('idle');

    const startListening = (field: 'bio' | 'productos_servicios') => {
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
            const currentValue = field === 'bio' ? formData.bio : formData.productos_servicios;
            updateForm(field, currentValue ? `${currentValue} ${transcript}` : transcript);
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsListening(null);
        };

        recognition.start();
    };

    // --- AUTOSAVE TO LOCALSTORAGE ---
    useEffect(() => {
        // Restaurar estado al montar
        if (typeof window !== 'undefined') {
            const savedState = localStorage.getItem('vcard_register_backup');
            if (savedState) {
                try {
                    const parsed = JSON.parse(savedState);
                    // Si completó el flujo (step 5), no restaurantes
                    if (parsed.step < 5) {
                        setStep(parsed.step);
                        // Mezclar formData actual (que tiene defaults) con el guardado
                        setFormData(prev => ({ ...prev, ...parsed.formData, photo: null, receipt: null }));
                    } else {
                        localStorage.removeItem('vcard_register_backup');
                    }
                } catch (e) {
                    console.error("Error parsing saved register state", e);
                }
            }
        }
    }, []);

    // --- READ PLAN FROM URL ---
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const urlPlan = params.get('plan');
            if (urlPlan && ['digital', 'business', 'catalog'].includes(urlPlan)) {
                setFormData(prev => ({ ...prev, plan: urlPlan as 'digital' | 'business' | 'catalog' }));
            }
            // Optionally auto-advance to step 2 if plan is in URL, uncomment to enable
            // if (urlPlan) setStep(2);
        }
    }, []);

    // --- MAGIC LINK CONCIERGE ---
    useEffect(() => {
        const handleMagicLink = async () => {
            if (typeof window === 'undefined') return;
            const params = new URLSearchParams(window.location.search);
            const magic = params.get('magic');

            if (magic) {
                console.log("Magic Link Detected:", magic);
                try {
                    const res = await fetch(`/api/vcard/get-draft?magic=${magic}`);
                    if (!res.ok) return;
                    const json = await res.json();

                    if (json.success && json.data) {
                        const d = json.data;
                        setFormData(prev => ({
                            ...prev,
                            // WhatsApp from JID
                            whatsapp: json.whatsapp || prev.whatsapp,
                            // Tipo de perfil (persona o negocio)
                            tipo_perfil: (d.tipo_perfil === 'negocio' ? 'negocio' : 'persona') as 'persona' | 'negocio',
                            // Identidad - Persona
                            nombres: d.nombres || prev.nombres,
                            apellidos: d.apellidos || prev.apellidos,
                            // Identidad - Negocio
                            nombre_negocio: d.negocio || prev.nombre_negocio,
                            contacto_nombre: d.contacto_nombre || prev.contacto_nombre,
                            contacto_apellido: d.contacto_apellido || prev.contacto_apellido,
                            // Perfil Profesional
                            profession: d.profesion || prev.profession,
                            company: d.empresa || d.negocio || prev.company,
                            bio: d.bio || prev.bio,
                            productos_servicios: d.productos || prev.productos_servicios,
                            etiquetas: d.etiquetas || prev.etiquetas,
                            address: d.direccion || prev.address,
                            google_business: d.maps_link || prev.google_business,
                            // Contacto y Redes
                            email: d.email || prev.email,
                            web: d.website || prev.web,
                            menu_digital: d.menu_digital || prev.menu_digital,
                            instagram: d.instagram || prev.instagram,
                            tiktok: d.tiktok || prev.tiktok,
                            facebook: d.facebook || prev.facebook,
                            linkedin: d.linkedin || prev.linkedin,
                            youtube: d.youtube || prev.youtube,
                            x: d.x || prev.x,
                        }));

                        // Si ya completó los 3 bloques en WhatsApp, saltamos directo al diseño (Paso 3)
                        if (json.step === 'COMPLETED') {
                            setStep(3);
                            alert("¡Bienvenido! He pre-llenado su información del chat. Ahora solo suba su foto para finalizar.");
                        }
                    }
                } catch (err) {
                    console.error("Error loading magic link draft:", err);
                }
            }
        };
        handleMagicLink();
    }, []);

    useEffect(() => {
        const handleHydrateFromSeller = async () => {
            if (typeof window === 'undefined') return;
            const transferData = localStorage.getItem('vcard_transfer_data');
            if (transferData) {
                try {
                    const parsed = JSON.parse(transferData);
                    if (parsed.redirectedFromSeller) {
                        console.log("Hydrating VCard from Seller Panel:", parsed.email);

                        // Reconstruct photo File if base64 exists
                        let photoFile: File | null = null;
                        if (parsed.photoBase64 && parsed.photoName && parsed.photoType) {
                            try {
                                const base64Data = parsed.photoBase64.split(',')[1];
                                const byteString = atob(base64Data);
                                const ab = new ArrayBuffer(byteString.length);
                                const ia = new Uint8Array(ab);
                                for (let i = 0; i < byteString.length; i++) {
                                    ia[i] = byteString.charCodeAt(i);
                                }
                                const blob = new Blob([ab], { type: parsed.photoType });
                                photoFile = new File([blob], parsed.photoName, { type: parsed.photoType });
                            } catch (err) {
                                console.error("Error reconstructing photo file:", err);
                            }
                        }

                        setFormData(prev => ({
                            ...prev,
                            ...parsed,
                            photo: photoFile || prev.photo,
                            paymentMethod: parsed.paymentMethod || prev.paymentMethod,
                            seller_id: parsed.seller_id || prev.seller_id
                        }));

                        setStep(4); // Jump to payment
                        setShowVideoGuide(false);

                        // Clean up
                        localStorage.removeItem('vcard_transfer_data');

                        // Show a small toast or alert
                        alert("Datos de registro cargados correctamente desde tu panel de vendedor.");
                    }
                } catch (e) {
                    console.error("Error parsing seller transfer data:", e);
                }
            }
        };
        handleHydrateFromSeller();
    }, []);

    useEffect(() => {
        // Guardar estado cuando cambie formData o step
        if (typeof window !== 'undefined') {
            if (step === 5) {
                // Limpiar cuando termine el proceso con éxito
                localStorage.removeItem('vcard_register_backup');
            } else {
                const dataToSave = {
                    step,
                    // Evitar guardar objetos tipo File que rompen el stringify
                    formData: {
                        ...formData,
                        photo: null,
                        receipt: null
                    }
                };
                localStorage.setItem('vcard_register_backup', JSON.stringify(dataToSave));
            }
        }
    }, [formData, step]);

    // --- PAYPHONE REDIRECT HANDLING ---
    useEffect(() => {
        const handlePayPhoneRedirect = async () => {
            if (typeof window === 'undefined') return;
            const params = new URLSearchParams(window.location.search);
            const id = params.get('id');
            const clientTransactionId = params.get('clientTransactionId');

            if (id && clientTransactionId) {
                console.log("PayPhone Return Detected:", { id, clientTransactionId });
                const savedData = localStorage.getItem('payphone_form_backup');
                if (savedData) {
                    try {
                        const parsed = JSON.parse(savedData);
                        // Clean URL
                        window.history.replaceState({}, '', window.location.pathname);
                        localStorage.removeItem('payphone_form_backup');

                        // Restore for UI
                        setFormData(parsed);

                        // SECURITY: Use server-side verification instead of trusting the client
                        setIsSubmitting(true);
                        const verifyRes = await fetch('/api/payphone/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                id,
                                clientTransactionId,
                                email: parsed.email
                            })
                        });

                        const verifyData = await verifyRes.json();

                        if (verifyRes.ok && verifyData.success) {
                            console.log("PayPhone payment verified successfully!");
                            // Success! The server already updated the status to 'pagado'
                            setStep(7); // Move to Success step
                        } else {
                            console.error("Payment verification failed:", verifyData.error);
                            alert("No pudimos confirmar tu pago automáticamente. Un asesor revisará tu caso pronto.");
                            setStep(7); // Move to success step anyway, but it will show "pending" in the DB
                        }
                    } catch (err) {
                        console.error("Error processing PayPhone redirect:", err);
                    } finally {
                        setIsSubmitting(false);
                    }
                }
            }
        };
        handlePayPhoneRedirect();
    }, []);
    // ----------------------------------

    // Voice Interview Functions
    const startInterview = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            // Optimize: Lower bitrate (16kbps is plenty for voice transcription)
            const recorder = new MediaRecorder(stream, {
                audioBitsPerSecond: 16000
            });
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
        setTranscriptionStatus('uploading');
        try {
            const interviewFormData = new FormData();
            interviewFormData.append('audio', audioBlob, 'interview.webm');

            setTranscriptionStatus('processing');
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
            alert('Hubo un problema al procesar la entrevista por voz. Por favor intenta de nuevo.');
        } finally {
            setIsProcessingInterview(false);
            setTranscriptionStatus('idle');
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
                    products: formData.productos_servicios,
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
                        const currentText = formData.productos_servicios ? formData.productos_servicios + '\n\n' : '';
                        updateForm('productos_servicios', currentText + data.text);
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

    // REAL-TIME FOOTPRINT (HUELLA) CHECK
    useEffect(() => {
        const checkFootprint = async () => {
            if (!formData.whatsapp && (!formData.email || formData.email.length < 5)) {
                setFootprintSeller(null);
                return;
            }

            setIsCheckingFootprint(true);
            try {
                const params = new URLSearchParams();
                if (formData.whatsapp) params.append("whatsapp", formData.whatsapp);
                if (formData.email) params.append("email", formData.email);

                const res = await fetch(`/api/vcard/check-footprint?${params.toString()}`);
                const data = await res.json();

                if (data.found) {
                    setFootprintSeller(data.sellerName);
                    // Priority: If footprint is found, we use that seller's ID
                    // (The server does this anyway, but we update UI)
                    setSellerName(data.sellerName);
                } else {
                    setFootprintSeller(null);
                }
            } catch (err) {
                console.error("Error checking footprint:", err);
            } finally {
                setIsCheckingFootprint(false);
            }
        };

        const timer = setTimeout(checkFootprint, 800);
        return () => clearTimeout(timer);
    }, [formData.whatsapp, formData.email]);

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

    const prepareVCardPhoto = async (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            if (!file.type.startsWith('image/')) {
                // Si por alguna razón no es imagen, enviamos base64 normal
                const reader = new FileReader();
                reader.onload = () => {
                    const base64 = reader.result?.toString().split(',')[1] || '';
                    resolve(base64);
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
                return;
            }

            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                // Reducir tamaño para vCard (max 300px es estándar para fotos de contacto)
                let width = img.width;
                let height = img.height;
                const max = 300;
                if (width > max || height > max) {
                    if (width > height) {
                        height *= max / width;
                        width = max;
                    } else {
                        width *= max / height;
                        height = max;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject('Could not get canvas context');
                    return;
                }
                // Fondo blanco por si hay transparencias (PNG/WebP)
                ctx.fillStyle = "#FFFFFF";
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                resolve(dataUrl.split(',')[1]);
            };
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
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
                // Convert to WebP in browser using Canvas for better compatibility
                return await new Promise<File>((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const img = new Image();
                        img.onload = () => {
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d');
                            if (!ctx) {
                                resolve(file);
                                return;
                            }
                            // Scale down if too large
                            let width = img.width;
                            let height = img.height;
                            const max = 1200;
                            if (width > max || height > max) {
                                if (width > height) {
                                    height *= max / width;
                                    width = max;
                                } else {
                                    width *= max / height;
                                    height = max;
                                }
                            }
                            canvas.width = width;
                            canvas.height = height;
                            ctx.drawImage(img, 0, 0, width, height);
                            canvas.toBlob((blob) => {
                                if (blob) {
                                    resolve(new File([blob], `${file.name.split('.')[0]}.webp`, { type: 'image/webp' }));
                                } else {
                                    resolve(file);
                                }
                            }, 'image/webp', 0.8);
                        };
                        img.src = e.target?.result as string;
                    };
                    reader.readAsDataURL(file);
                });
            } catch (error) {
                console.error("Error al procesar imagen a WebP:", error);
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

        let noteContent = `${data.bio}${data.productos_servicios ? '\n\nProductos/Servicios:\n' + data.productos_servicios : ''} - Generado con ActivaQR`;

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
            data.youtube ? `X-SOCIALPROFILE;TYPE=youtube;LABEL=YouTube:${data.youtube}` : '',
            data.x ? `X-SOCIALPROFILE;TYPE=twitter;LABEL=X:${data.x}` : '',
            data.menu_digital ? `URL;type=MenuDigital:${data.menu_digital}` : '',
            `X-SOCIALPROFILE;TYPE=whatsapp;LABEL=WhatsApp:https://wa.me/${data.whatsapp.replace(/[^0-9]/g, '')}`,
            `REV:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
            'END:VCARD'
        ].filter(Boolean).join('\r\n');

        return vcard;
    };

    const handleFinalSubmit = async (forcedStatus?: string, overrideData?: any) => {
        const dataToSubmit = overrideData || formData;
        setIsSubmitting(true);
        try {
            let photoUrl = null;
            let receiptUrl = null;
            let photoBase64 = null;

            const timestamp = Date.now();

            // 0. CALCULAR ETIQUETAS (Una sola vez para usar en Upsert y vCard)
            // Esto asegura consistencia y evita errores de procesamiento doble
            const profession = (dataToSubmit.profession || "").toLowerCase().trim();
            const extraTags = INDUSTRY_TAGS[profession] || [];
            const userTags = (dataToSubmit.etiquetas || "").split(',').map((t: string) => t.trim()).filter(Boolean);
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
                const lookupRes = await fetch(`/api/vcard/lookup?email=${encodeURIComponent(dataToSubmit.email)}`);
                if (lookupRes.ok) {
                    existingUser = await lookupRes.json();
                }
            } catch (err) {
                console.error("Error fetching existing user:", err);
            }

            const slug = existingUser?.slug || generateSlug(dataToSubmit);
            const planDetails = PRODUCT_PLANS.find(p => p.id === dataToSubmit.plan);

            // 2. Subir imágenes localmente
            const uploadFile = async (file: File) => {
                const uploadFormData = new FormData();
                uploadFormData.append('file', file);
                const res = await fetch('/api/upload', { method: 'POST', body: uploadFormData });
                if (!res.ok) throw new Error('Upload failed');
                const data = await res.json();
                return data.url;
            };

            // Photo
            if (dataToSubmit.photo) {
                try {
                    photoUrl = await uploadFile(dataToSubmit.photo);
                    photoBase64 = await prepareVCardPhoto(dataToSubmit.photo);
                } catch (e) { console.error("Error uploading photo", e); }
            } else if (existingUser) {
                photoUrl = existingUser.foto_url;
            }

            // Hero Mobile
            let heroMobileUrl = dataToSubmit.portada_movil;
            if (dataToSubmit.hero_mobile) {
                try {
                    heroMobileUrl = await uploadFile(dataToSubmit.hero_mobile);
                } catch (e) { console.error("Error uploading hero mobile", e); }
            }

            // Hero Desktop
            let heroDesktopUrl = dataToSubmit.portada_desktop;
            if (dataToSubmit.hero_desktop) {
                try {
                    heroDesktopUrl = await uploadFile(dataToSubmit.hero_desktop);
                } catch (e) { console.error("Error uploading hero desktop", e); }
            }

            // Receipt
            if (dataToSubmit.receipt) {
                try {
                    receiptUrl = await uploadFile(dataToSubmit.receipt);
                } catch (e) { console.error("Error uploading receipt", e); }
            } else if (existingUser) {
                receiptUrl = existingUser.comprobante_url;
            }

            // 3. UPSERT: Inserta o Actualiza por email
            const upsertData = {
                tipo_perfil: dataToSubmit.tipo_perfil,
                nombres: dataToSubmit.nombres,
                apellidos: dataToSubmit.apellidos,
                nombre_negocio: dataToSubmit.nombre_negocio,
                contacto_nombre: dataToSubmit.contacto_nombre,
                contacto_apellido: dataToSubmit.contacto_apellido,
                whatsapp: dataToSubmit.whatsapp,
                email: dataToSubmit.email,
                profesion: dataToSubmit.profession,
                empresa: dataToSubmit.company,
                bio: dataToSubmit.bio,
                direccion: dataToSubmit.address,
                web: dataToSubmit.web,
                google_business: dataToSubmit.google_business,
                instagram: dataToSubmit.instagram,
                linkedin: dataToSubmit.linkedin,
                facebook: dataToSubmit.facebook,
                tiktok: dataToSubmit.tiktok,
                menu_digital: dataToSubmit.menu_digital,
                youtube: dataToSubmit.youtube,
                x: dataToSubmit.x,
                productos_servicios: dataToSubmit.productos_servicios,
                plan: dataToSubmit.plan,
                foto_url: photoUrl,
                portada_movil: heroMobileUrl,
                portada_desktop: heroDesktopUrl,
                catalogo_json: JSON.stringify({
                    categories: catalogItems.map(cat => cat.title || 'Todas'),
                    products: catalogItems.flatMap(cat => 
                        (cat.items || []).map((item: any, idx: number) => ({
                            id: `prod_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 9)}`,
                            nombre: item.name || 'Nuevo Producto',
                            name: item.name || 'Nuevo Producto',
                            precio: item.price || '0.00',
                            price: item.price || '0.00',
                            categoria: cat.title || 'Todas',
                            category: cat.title || 'Todas',
                            image: item.image || '',
                            descripcion: item.description || '',
                            description: item.description || ''
                        }))
                    )
                }),
                comprobante_url: receiptUrl,
                slug: slug,
                etiquetas: dataToSubmit.etiquetas, // Usar etiquetas directas del usuario para que el editor las vea bien
                seller_id: dataToSubmit.seller_id,
                status: forcedStatus || 'pendiente',
                payment_method: dataToSubmit.paymentMethod || 'transfer',
                wifi_ssid: dataToSubmit.wifi_ssid,
                wifi_password: dataToSubmit.wifi_password,
                hero_button_text: dataToSubmit.hero_button_text,
                hero_section_title: dataToSubmit.hero_section_title,
                hero_action: dataToSubmit.hero_action,
                hero_wifi_steps: dataToSubmit.hero_wifi_steps,
                hero_external_link: dataToSubmit.hero_external_link,
                hero_file_url: dataToSubmit.hero_file_url,
                hero_step1_title: dataToSubmit.hero_step1_title,
                hero_step1_text: dataToSubmit.hero_step1_text,
                hero_step2_title: dataToSubmit.hero_step2_title,
                hero_step2_text: dataToSubmit.hero_step2_text,
                hero_step3_title: dataToSubmit.hero_step3_title,
                hero_step3_text: dataToSubmit.hero_step3_text,
                google_rating: dataToSubmit.google_rating,
                google_reviews_count: dataToSubmit.google_reviews_count,
                youtube_video_url: dataToSubmit.youtube_video_url
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
                        name: dataToSubmit.tipo_perfil === 'negocio' ? dataToSubmit.nombre_negocio : `${dataToSubmit.nombres} ${dataToSubmit.apellidos}`,
                        email: dataToSubmit.email,
                        whatsapp: dataToSubmit.whatsapp,
                        plan: dataToSubmit.plan,
                        businessName: dataToSubmit.nombre_negocio,
                        profession: dataToSubmit.profession,
                        foto_url: photoUrl,
                        catalogo_json: JSON.stringify({ 
                            products: catalogItems.flatMap(cat => 
                                (cat.items || []).map((item: any) => ({ 
                                    nombre: item.name, 
                                    precio: item.price 
                                }))
                            ) 
                        }),
                        hero_button_text: dataToSubmit.hero_button_text,
                        hero_action: dataToSubmit.hero_action
                    })
                }).catch(err => console.error("Error silencioso en notificación WhatsApp:", err));
            } catch (notifyErr) {
                console.error("Error al disparar notificación WhatsApp:", notifyErr);
            }

            // Nota: El backup por email fue removido porque el endpoint
            // /api/send-vcard ahora requiere autenticación admin.
            // La notificación WhatsApp arriba ya sirve como alerta al admin.


            setIsSubmitting(false);
            setStep(7); // Ir a pantalla de Éxito (FINAL)
        } catch (err) {
            console.error("Full Error Context:", err);
            const msg = err instanceof Error ? err.message : JSON.stringify(err);
            alert(`Hubo un error al guardar tu pedido: ${msg}. Por favor intenta de nuevo o contáctanos.`);
            setIsSubmitting(false);
        }
    };

    const handleNext = () => {
        if (step === 1) {
            // Plan selection, always valid
        }
        if (step === 2) {
            const hasName = formData.tipo_perfil === 'negocio'
                ? !!formData.nombre_negocio
                : (!!formData.nombres && !!formData.apellidos);

            if (!hasName || !formData.whatsapp || !validateEmail(formData.email)) {
                if (!validateEmail(formData.email)) setEmailError('Ingresa un correo válido');
                return;
            }
            setEmailError('');
        }
        if (step === 3) {
            if (!formData.profession) return;
        }
        // Logic for catalog jump
        if (step === 4) {
            if (formData.plan === 'catalog') {
                setStep(5);
                return;
            } else {
                setStep(6);
                return;
            }
        }
        if (step === 5) {
            setStep(6);
            return;
        }
        if (step === 6) {
            handleFinalSubmit();
            return;
        }
        setStep(s => Math.min(s + 1, 7));
    };

    const handleBack = () => {
        if (step === 1) {
            window.location.href = '/';
            return;
        }
        if (step === 6) {
            if (formData.plan === 'catalog') {
                setStep(5);
                return;
            } else {
                setStep(4);
                return;
            }
        }
        setStep(s => Math.max(s - 1, 1));
    };


    const updateForm = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // PayPhone Button Initialization Effect (Box v1.1)
    useEffect(() => {
        if (step === 6 && formData.paymentMethod === 'payphone') { // Payment is now Step 6
            const initButton = () => {
                const PBox = (window as any).PPaymentButtonBox;
                if (PBox) {
                    const btnContainer = document.getElementById('pp-button');
                    if (btnContainer) {
                        // Limpiar el contenedor por si acaso
                        btnContainer.innerHTML = "";

                        const planInfo = PRODUCT_PLANS.find(p => p.id === formData.plan) || PRODUCT_PLANS[0];
                        const currentPlanPrice = planInfo.price;
                        const amountInCents = currentPlanPrice * 100;
                        const transactionId = `reg_${Date.now()}_${formData.name.replace(/\s+/g, '_')}`;

                        // GUARDAR RESPALDO ANTES DEL REDIRECT
                        // Guardamos todo el texto. Las fotos no se guardan en localStorage por tamaño,
                        // pero si el usuario vuelve podrá re-subirlas si falló algo.
                        const backup = { ...formData };
                        delete (backup as any).photo; // No serializable
                        delete (backup as any).receipt; // No serializable
                        localStorage.setItem('payphone_form_backup', JSON.stringify(backup));

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
                                responseUrl: typeof window !== 'undefined' ? `${window.location.origin}/registro` : "https://activaqr.com/registro",
                                cancellationUrl: typeof window !== 'undefined' ? `${window.location.origin}/registro` : "https://activaqr.com/registro",
                                onComplete: async (model: any, actions: any) => {
                                    console.log("Pago completado, verificando...", model);
                                    setIsSubmitting(true);
                                    try {
                                        const res = await fetch('/api/payphone/verify', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                id: model.id,
                                                clientTransactionId: model.clientTransactionId,
                                                email: formData.email
                                            })
                                        });
                                        const data = await res.json();
                                        if (res.ok && data.success) {
                                            setStep(7); // Final step
                                        } else {
                                            alert("Error confirmando pago: " + (data.error || "Desconocido"));
                                            setStep(7); // Final step
                                        }
                                    } catch (err) {
                                        console.error("Verification error:", err);
                                        setStep(7); // Final step
                                    } finally {
                                        setIsSubmitting(false);
                                    }
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

    const planInfo = PRODUCT_PLANS.find(p => p.id === formData.plan) || PRODUCT_PLANS[0];
    const currentPlanPrice = planInfo.price;

    return (
        <div className="max-w-4xl mx-auto w-full px-4">
            {/* Progress Bar */}
            <div className="mb-12 relative">
                <div className="flex justify-between items-center relative z-10">
                    {steps.filter(s => !s.conditional || s.conditional(formData)).map((s, idx, filteredSteps) => (
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
                        animate={{ 
                            width: `${(steps.filter(s => !s.conditional || s.conditional(formData)).findIndex(s => s.id === step) / (steps.filter(s => !s.conditional || s.conditional(formData)).length - 1)) * 100}%` 
                        }}
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
                        step === 6 || step === 7 ? "bg-navy" : "glass-card p-8 md:p-12"
                    )}
                >
                    {isSubmitting && (
                        <div className="absolute inset-0 z-50 bg-navy/80 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                            <Loader2 className="animate-spin text-primary mb-6" size={60} />
                            <h3 className="text-2xl font-black uppercase italic tracking-tighter">Procesando tu orden...</h3>
                            <p className="text-white/60 font-medium mt-2">Personalizando tu identidad digital </p>
                        </div>
                    )}

                    {/* STEP 1: SELECCIÓN DE PLAN */}
                    {step === 1 &&
                        <div className="max-w-3xl mx-auto">
                            <div className="text-center mb-10">
                                <h2 className="text-3xl md:text-4xl font-black text-navy tracking-tighter uppercase italic">Elige tu Plan</h2>
                                <p className="text-navy/40 text-xs font-bold uppercase tracking-widest mt-2">Potencia tu presencia digital</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {PRODUCT_PLANS.map((plan) => (
                                    <div
                                        key={plan.id}
                                        onClick={() => updateForm('plan', plan.id)}
                                        className={cn(
                                            "relative cursor-pointer group transition-all duration-500",
                                            "rounded-[32px] p-6 border-2 flex flex-col h-full",
                                            formData.plan === plan.id 
                                                ? "bg-navy border-primary shadow-2xl shadow-navy/20 scale-[1.02] text-white" 
                                                : "bg-white/50 border-white/20 hover:border-navy/10 text-navy"
                                        )}
                                    >
                                        {formData.plan === plan.id && (
                                            <div className="absolute -top-3 -right-3 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                                                <Check className="text-white" size={16} strokeWidth={4} />
                                            </div>
                                        )}
                                        
                                        <div className="mb-4">
                                            <div className={cn(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors",
                                                formData.plan === plan.id ? "bg-primary/20" : "bg-navy/5"
                                            )}>
                                                {plan.id === 'digital' && <Smartphone className={formData.plan === plan.id ? "text-primary" : "text-navy/40"} />}
                                                {plan.id === 'business' && <Star className={formData.plan === plan.id ? "text-primary" : "text-navy/40"} />}
                                                {plan.id === 'catalog' && <Store className={formData.plan === plan.id ? "text-primary" : "text-navy/40"} />}
                                            </div>
                                            <h3 className="font-black uppercase italic tracking-tighter text-xl leading-none mb-1">{plan.name}</h3>
                                            <p className={cn(
                                                "text-[10px] font-bold uppercase tracking-widest",
                                                formData.plan === plan.id ? "text-primary" : "text-navy/40"
                                            )}>${plan.price} / Pago único</p>
                                        </div>

                                        <ul className="space-y-3 mb-8 flex-grow">
                                            {plan.features.map((feature, i) => (
                                                <li key={i} className="flex gap-2 items-start text-[11px] font-bold leading-tight">
                                                    <div className={cn(
                                                        "w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                                                        formData.plan === plan.id ? "bg-primary/20 text-primary" : "bg-navy/5 text-navy/30"
                                                    )}>
                                                        <Check size={10} strokeWidth={4} />
                                                    </div>
                                                    <span className={formData.plan === plan.id ? "text-white/80" : "text-navy/60"}>
                                                        {feature}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>

                                        <div className={cn(
                                            "mt-auto py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-center transition-colors",
                                            formData.plan === plan.id ? "bg-primary text-white" : "bg-navy/5 text-navy/40 group-hover:bg-navy/10"
                                        )}>
                                            {formData.plan === plan.id ? "Seleccionado" : "Elegir Plan"}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    }

                    {/* STEP 2: DATOS BÁSICOS (WAS 1) */}
                    {step === 2 &&
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

                                {/* FOOTPRINT BANNER (ATENCION PERSONALIZADA) */}
                                <AnimatePresence>
                                    {footprintSeller && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="bg-[#25D366]/10 border-2 border-[#25D366]/30 rounded-3xl p-6 relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 p-2 opacity-10">
                                                <ShieldCheck size={40} className="text-[#25D366]" />
                                            </div>
                                            <div className="flex gap-4 items-center">
                                                <div className="w-12 h-12 rounded-2xl bg-[#25D366]/20 flex items-center justify-center shrink-0">
                                                    <Star className="text-[#25D366]" size={24} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#25D366] mb-1 italic">✨ Cliente ya captado</p>
                                                    <h4 className="text-sm font-black text-navy uppercase leading-none mb-1">Atención Personalizada Activa</h4>
                                                    <p className="text-[11px] font-bold text-navy/60 leading-tight uppercase italic">
                                                        Tu registro está siendo gestionado por <span className="text-[#25D366] font-black">{footprintSeller}</span>.
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Seller Code Field - Hidden or Disabled if footprint exists */}
                                {!footprintSeller && (
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
                                )}
                            </div>
                        </div>
                        }

                    {/* STEP 3: PERFIL PROFESIONAL (WAS 2) */}
                    {step === 3 &&
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
                                                <p className="text-sm font-black text-navy uppercase">
                                                    {transcriptionStatus === 'uploading' && 'Enviando audio...'}
                                                    {transcriptionStatus === 'processing' && 'Transcribiendo entrevista...'}
                                                    {transcriptionStatus === 'extracting' && 'Extrayendo información profesional...'}
                                                    {(!transcriptionStatus || transcriptionStatus === 'idle') && 'Procesando entrevista...'}
                                                </p>
                                                <p className="text-xs text-navy/50 font-medium mt-1">
                                                    {transcriptionStatus === 'uploading' && 'Estamos preparando el archivo para la IA'}
                                                    {transcriptionStatus === 'processing' && 'Abordando tu respuesta con Whisper'}
                                                    {transcriptionStatus === 'extracting' && 'Organizando tus datos con GPT-4'}
                                                    {(!transcriptionStatus || transcriptionStatus === 'idle') && 'Un momento por favor...'}
                                                </p>
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
                                                onClick={() => startListening('productos_servicios')}
                                                className={cn(
                                                    "text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all",
                                                    isListening === 'productos_servicios' ? "text-red-500 animate-pulse" : "text-primary hover:opacity-80"
                                                )}
                                            >
                                                <Mic size={12} />
                                                <span>{isListening === 'productos_servicios' ? 'Escuchando...' : 'Dictar'}</span>
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
                                        value={formData.productos_servicios}
                                        onChange={(e) => {
                                            updateForm('productos_servicios', e.target.value);
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
                                    <div>
                                        <label className="block text-[10px] font-black text-navy/40 uppercase tracking-widest mb-3">YouTube (Canal)</label>
                                        <input
                                            type="url"
                                            value={formData.youtube}
                                            onChange={(e) => updateForm('youtube', e.target.value)}
                                            placeholder="https://youtube.com/@tucanal"
                                            className="w-full bg-white/50 border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 py-5 outline-none font-bold text-navy transition-all shadow-sm text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-navy/40 uppercase tracking-widest mb-3">X / Twitter (Link)</label>
                                        <input
                                            type="url"
                                            value={formData.x}
                                            onChange={(e) => updateForm('x', e.target.value)}
                                            placeholder="https://x.com/tuusuario"
                                            className="w-full bg-white/50 border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 py-5 outline-none font-bold text-navy transition-all shadow-sm text-sm"
                                        />
                                    </div>
                                    { formData.plan === 'catalog' && (
                                        <div>
                                            <label className="block text-[10px] font-black text-navy/40 uppercase tracking-widest mb-3">🍽️ Menú Digital (Link)</label>
                                            <input
                                                type="url"
                                                value={formData.menu_digital}
                                                onChange={(e) => updateForm('menu_digital', e.target.value)}
                                                placeholder="https://menu.turestaurante.com"
                                                className="w-full bg-white/50 border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 py-5 outline-none font-bold text-navy transition-all shadow-sm text-sm"
                                            />
                                        </div>
                                    )}
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
                                            value={formData.etiquetas}
                                            onChange={(e) => {
                                                updateForm('etiquetas', e.target.value);
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
                    }

                    {/* STEP 4: IDENTIDAD VISUAL (WAS 3) */}
                    {step === 4 &&
                        <div className="max-w-xl mx-auto text-center">
                            <div className="mb-10">
                                <h2 className="text-3xl md:text-4xl font-black text-navy tracking-tighter uppercase italic">Identidad Visual</h2>
                                <p className="text-navy/40 text-xs font-bold uppercase tracking-widest mt-2">Sube tu mejor foto o logo</p>
                            </div>

                            <div className="flex flex-col items-center gap-8">
                                <div className="flex flex-col md:flex-row gap-8 items-start justify-center w-full">
                                    {/* Perfil Photo - All Plans */}
                                    <div className="flex flex-col items-center gap-4">
                                        <span className="text-[10px] font-black text-navy/60 uppercase tracking-widest">Foto de Perfil / Logo</span>
                                        <div className="relative group">
                                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-[32px] bg-white border-4 border-dashed border-navy/10 flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 transition-all overflow-hidden relative shadow-inner">
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
                                                        <Camera className="text-navy/10 group-hover:text-primary transition-colors mb-2" size={32} strokeWidth={1.5} />
                                                        <span className="text-[8px] font-black text-navy/40 uppercase tracking-widest">Subir</span>
                                                    </>
                                                )}
                                            </div>
                                            {formData.photo && (
                                                <button
                                                    onClick={() => updateForm('photo', null)}
                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg z-20 hover:scale-110 transition-transform text-xs"
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Hero Images - Only for Business and Catalog */}
                                    {(formData.plan === 'business' || formData.plan === 'catalog') && (
                                        <>
                                            {/* Hero Mobile */}
                                            <div className="flex flex-col items-center gap-4">
                                                <span className="text-[10px] font-black text-navy/60 uppercase tracking-widest">Hero Móvil (Business)</span>
                                                <div className="relative group">
                                                    <div className="w-32 h-48 rounded-[32px] bg-white border-4 border-dashed border-navy/10 flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 transition-all overflow-hidden relative shadow-inner">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={async (e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    const processed = await handleImageProcess(file);
                                                                    updateForm('hero_mobile', processed);
                                                                }
                                                            }}
                                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                        />
                                                        {formData.hero_mobile ? (
                                                            <img
                                                                src={URL.createObjectURL(formData.hero_mobile)}
                                                                alt="hero mobile"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <>
                                                                <Smartphone className="text-navy/10 group-hover:text-primary transition-colors mb-2" size={32} strokeWidth={1.5} />
                                                                <span className="text-[8px] font-black text-navy/40 uppercase tracking-widest text-center px-4">Subir Portada Móvil</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    {formData.hero_mobile && (
                                                        <button
                                                            onClick={() => updateForm('hero_mobile', null)}
                                                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg z-20 hover:scale-110 transition-transform text-xs"
                                                        >
                                                            ×
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Hero Desktop */}
                                            <div className="flex flex-col items-center gap-4">
                                                <span className="text-[10px] font-black text-navy/60 uppercase tracking-widest">Hero Desktop (Business)</span>
                                                <div className="relative group">
                                                    <div className="w-56 h-32 rounded-[32px] bg-white border-4 border-dashed border-navy/10 flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 transition-all overflow-hidden relative shadow-inner">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={async (e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    const processed = await handleImageProcess(file);
                                                                    updateForm('hero_desktop', processed);
                                                                }
                                                            }}
                                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                        />
                                                        {formData.hero_desktop ? (
                                                            <img
                                                                src={URL.createObjectURL(formData.hero_desktop)}
                                                                alt="hero desktop"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <>
                                                                <Camera className="text-navy/10 group-hover:text-primary transition-colors mb-2" size={32} strokeWidth={1.5} />
                                                                <span className="text-[8px] font-black text-navy/40 uppercase tracking-widest text-center px-4">Subir Portada PC</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    {formData.hero_desktop && (
                                                        <button
                                                            onClick={() => updateForm('hero_desktop', null)}
                                                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg z-20 hover:scale-110 transition-transform text-xs"
                                                        >
                                                            ×
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Configuración del Hero (Business y Catálogo) */}
                            {(formData.plan === 'business' || formData.plan === 'catalog') && (
                                <div className="mt-12 text-left max-w-xl mx-auto bg-primary/5 border border-primary/20 rounded-[32px] p-8 space-y-8">
                                    <h3 className="text-xl font-black text-navy uppercase italic tracking-tighter flex items-center gap-3">
                                        <Zap size={24} className="text-primary fill-primary" /> Botón de Acción (Hero)
                                    </h3>
                                    
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-[10px] font-black text-navy/40 uppercase tracking-widest mb-3 ml-1 italic">Título de la Oferta / Sección</label>
                                            <input
                                                type="text"
                                                value={formData.hero_section_title}
                                                onChange={(e) => updateForm('hero_section_title', e.target.value)}
                                                placeholder="Ej: ¡Gran Descuento de Temporada!"
                                                className="w-full bg-white border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 py-5 outline-none font-black text-navy transition-all shadow-sm text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black text-navy/40 uppercase tracking-widest mb-3 ml-1 italic">Texto del Botón Principal</label>
                                            <input
                                                type="text"
                                                value={formData.hero_button_text}
                                                onChange={(e) => updateForm('hero_button_text', e.target.value)}
                                                placeholder="Ej. DESCARGAR CATÁLOGO"
                                                className="w-full bg-white border-2 border-transparent focus:border-primary rounded-2xl px-6 py-5 outline-none font-black text-navy transition-all shadow-sm text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black text-navy/40 uppercase tracking-widest mb-3 ml-1 italic">Tipo de Acción</label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {[
                                                    { id: 'wifi', label: 'WIFI / PASOS', icon: Smartphone },
                                                    { id: 'link', label: 'ENLACE', icon: ArrowRight },
                                                    { id: 'file', label: 'ARCHIVO', icon: FileText }
                                                ].map((opt) => (
                                                    <button
                                                        key={opt.id}
                                                        type="button"
                                                        onClick={() => updateForm('hero_action', opt.id)}
                                                        className={cn(
                                                            "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
                                                            formData.hero_action === opt.id 
                                                                ? "bg-primary/20 border-primary text-primary" 
                                                                : "bg-white/50 border-navy/5 text-navy/30 hover:bg-white"
                                                        )}
                                                    >
                                                        <opt.icon size={20} />
                                                        <span className="text-[9px] font-black tracking-widest uppercase">{opt.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {formData.hero_action === 'wifi' && (
                                            <div className="p-6 bg-white/50 rounded-2xl border border-navy/5 space-y-6 animate-in fade-in slide-in-from-top-2">
                                                <p className="text-[10px] font-black text-navy uppercase tracking-widest">Configuración de Pasos Interactivos</p>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    <div className="space-y-3">
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-bold text-navy/40 uppercase ml-1">Paso 1: Título</label>
                                                            <input className="w-full bg-white border-2 border-transparent focus:border-primary/20 rounded-xl px-4 py-3 text-xs font-bold outline-none shadow-sm" value={formData.hero_step1_title} onChange={e => updateForm('hero_step1_title', e.target.value)} placeholder="Ej: Conéctate" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-bold text-navy/40 uppercase ml-1">Paso 1: Subtítulo</label>
                                                            <input className="w-full bg-white/50 border-2 border-transparent focus:border-primary/20 rounded-xl px-4 py-2 text-[10px] font-medium outline-none" value={formData.hero_step1_text} onChange={e => updateForm('hero_step1_text', e.target.value)} placeholder="Subtítulo corto" />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-bold text-navy/40 uppercase ml-1">Paso 2: Título</label>
                                                            <input className="w-full bg-white border-2 border-transparent focus:border-primary/20 rounded-xl px-4 py-3 text-xs font-bold outline-none shadow-sm" value={formData.hero_step2_title} onChange={e => updateForm('hero_step2_title', e.target.value)} placeholder="Ej: Descargar Archivo" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-bold text-navy/40 uppercase ml-1">Paso 2: Subtítulo</label>
                                                            <input className="w-full bg-white/50 border-2 border-transparent focus:border-primary/20 rounded-xl px-4 py-2 text-[10px] font-medium outline-none" value={formData.hero_step2_text} onChange={e => updateForm('hero_step2_text', e.target.value)} placeholder="Subtítulo corto" />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-bold text-navy/40 uppercase ml-1">Paso 3: Título</label>
                                                            <input className="w-full bg-white border-2 border-transparent focus:border-primary/20 rounded-xl px-4 py-3 text-xs font-bold outline-none shadow-sm" value={formData.hero_step3_title} onChange={e => updateForm('hero_step3_title', e.target.value)} placeholder="Ej: Disfruta la red" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-bold text-navy/40 uppercase ml-1">Paso 3: Subtítulo</label>
                                                            <input className="w-full bg-white/50 border-2 border-transparent focus:border-primary/20 rounded-xl px-4 py-2 text-[10px] font-medium outline-none" value={formData.hero_step3_text} onChange={e => updateForm('hero_step3_text', e.target.value)} placeholder="Subtítulo corto" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {formData.hero_action === 'file' && (
                                            <div className="animate-in fade-in slide-in-from-top-2 space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-navy/40 ml-1">URL del Archivo</label>
                                                    {formData.hero_file_url && (
                                                        <a href={formData.hero_file_url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1">
                                                            <ExternalLink size={10} /> Ver Archivo Actual
                                                        </a>
                                                    )}
                                                </div>
                                                <div className="flex gap-4">
                                                    <input
                                                        className="flex-1 bg-white border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 py-5 outline-none font-bold text-navy shadow-sm text-sm"
                                                        value={formData.hero_file_url}
                                                        onChange={e => updateForm('hero_file_url', e.target.value)}
                                                        placeholder="URL PDF o Imagen"
                                                    />
                                                    <label className="bg-primary text-navy px-6 py-5 rounded-2xl font-black uppercase text-[10px] flex items-center gap-2 cursor-pointer hover:bg-primary/90 transition-all shadow-sm">
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
                                                                    updateForm('hero_file_url', url);
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

                                        {formData.hero_action === 'link' && (
                                            <div className="animate-in fade-in slide-in-from-top-2">
                                                <input
                                                    type="url"
                                                    value={formData.hero_external_link}
                                                    onChange={(e) => updateForm('hero_external_link', e.target.value)}
                                                    placeholder="https://tu-pagina.com/oferta"
                                                    className="w-full bg-white border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 py-5 outline-none font-bold text-navy transition-all shadow-sm text-sm"
                                                />
                                            </div>
                                        )}

                                        <div className="bg-yellow-500/5 p-6 rounded-[32px] border border-yellow-500/10">
                                            <label className="block text-[10px] font-black text-yellow-600 uppercase tracking-widest mb-4">⭐ Reputación Google (Opcional)</label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <input type="number" step="0.1" value={formData.google_rating} onChange={(e) => updateForm('google_rating', e.target.value)} placeholder="Rating 4.9" className="w-full bg-white border-2 border-transparent focus:border-yellow-500/20 rounded-xl px-4 py-3 text-center font-black text-navy" />
                                                <input type="number" value={formData.google_reviews_count} onChange={(e) => updateForm('google_reviews_count', e.target.value)} placeholder="Total Reseñas" className="w-full bg-white border-2 border-transparent focus:border-yellow-500/20 rounded-xl px-4 py-3 text-center font-black text-navy" />
                                            </div>
                                        </div>

                                        <div className="bg-red-500/5 p-6 rounded-[32px] border border-red-500/10">
                                            <label className="block text-[10px] font-black text-red-600 uppercase tracking-widest mb-4">🎥 Video YouTube (Opcional)</label>
                                            <input type="url" value={formData.youtube_video_url} onChange={(e) => updateForm('youtube_video_url', e.target.value)} placeholder="https://youtube.com/embed/..." className="w-full bg-white border-2 border-transparent focus:border-red-500/20 rounded-2xl px-6 py-4 text-xs font-bold text-navy" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    }

                    {/* STEP 5: GESTIÓN DE CATÁLOGO */}
                    {step === 5 &&
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-10">
                                <h2 className="text-3xl md:text-4xl font-black text-navy tracking-tighter uppercase italic">Tu Catálogo</h2>
                                <p className="text-navy/40 text-xs font-bold uppercase tracking-widest mt-2 flex justify-between items-center w-full px-4">
                                    <span>Organiza tus productos y categorías</span>
                                    {(() => {
                                        const total = catalogItems.reduce((acc: number, cat: any) => acc + (cat.items?.length || 0), 0);
                                        return (
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[10px]",
                                                total >= 20 ? "bg-red-500/20 text-red-600" : "bg-primary/20 text-primary"
                                            )}>
                                                {total} / 20 Productos
                                            </span>
                                        );
                                    })()}
                                </p>
                            </div>



                            <div className="space-y-8">
                                <button
                                    onClick={() => {
                                        setCatalogItems([...catalogItems, { id: Date.now(), title: 'Nueva Categoría', items: [] }]);
                                    }}
                                    className="w-full py-4 border-2 border-dashed border-primary/20 rounded-2xl text-[10px] font-black uppercase text-primary tracking-widest hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
                                >
                                    <Zap size={16} />
                                    Agregar Categoría
                                </button>

                                {catalogItems.map((category, catIdx) => (
                                    <div key={category.id} className="bg-white/50 border-2 border-white/20 rounded-[32px] p-6 shadow-sm">
                                        <div className="flex justify-between items-center mb-6">
                                            <input
                                                type="text"
                                                value={category.title}
                                                onChange={(e) => {
                                                    const newCats = [...catalogItems];
                                                    newCats[catIdx].title = e.target.value;
                                                    setCatalogItems(newCats);
                                                }}
                                                className="bg-transparent border-b-2 border-primary/10 focus:border-primary outline-none text-lg font-black uppercase italic tracking-tight text-navy w-full mr-4"
                                            />
                                            <button
                                                onClick={() => {
                                                    setCatalogItems(catalogItems.filter((_, i) => i !== catIdx));
                                                }}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                            >
                                                <Zap size={16} className="rotate-45" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {category.items.map((item: any, itemIdx: number) => (
                                                <div key={itemIdx} className="bg-white rounded-2xl p-4 border border-navy/5 shadow-sm relative group">
                                                    <button
                                                        onClick={() => {
                                                            const newCats = [...catalogItems];
                                                            newCats[catIdx].items = newCats[catIdx].items.filter((_: any, i: number) => i !== itemIdx);
                                                            setCatalogItems(newCats);
                                                        }}
                                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                                    >
                                                        ×
                                                    </button>
                                                    <div className="flex gap-4">
                                                        <div className="w-20 h-20 rounded-xl bg-navy/5 border border-navy/5 overflow-hidden flex-shrink-0 relative">
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={async (e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (file) {
                                                                        const processed = await handleImageProcess(file);
                                                                        const uploadFormData = new FormData();
                                                                        uploadFormData.append('file', processed || file);
                                                                        const res = await fetch('/api/upload', { method: 'POST', body: uploadFormData });
                                                                        if (res.ok) {
                                                                            const data = await res.json();
                                                                            const newCats = [...catalogItems];
                                                                            newCats[catIdx].items[itemIdx].image = data.url;
                                                                            setCatalogItems(newCats);
                                                                        }
                                                                    }
                                                                }}
                                                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                            />
                                                            {item.image ? (
                                                                <img src={item.image} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <Camera className="m-auto text-navy/10" size={24} />
                                                            )}
                                                        </div>
                                                        <div className="flex-grow space-y-2">
                                                            <input
                                                                placeholder="Nombre del producto"
                                                                value={item.name}
                                                                onChange={(e) => {
                                                                    const newCats = [...catalogItems];
                                                                    newCats[catIdx].items[itemIdx].name = e.target.value;
                                                                    setCatalogItems(newCats);
                                                                }}
                                                                className="w-full text-xs font-black uppercase text-navy border-b border-navy/5 outline-none focus:border-primary"
                                                            />
                                                            <input
                                                                placeholder="Precio (ej. 10.00)"
                                                                value={item.price}
                                                                onChange={(e) => {
                                                                    const newCats = [...catalogItems];
                                                                    newCats[catIdx].items[itemIdx].price = e.target.value;
                                                                    setCatalogItems(newCats);
                                                                }}
                                                                className="w-full text-[10px] font-bold text-primary border-b border-navy/5 outline-none focus:border-primary"
                                                            />
                                                            <textarea
                                                                placeholder="Descripción corta"
                                                                value={item.description}
                                                                onChange={(e) => {
                                                                    const newCats = [...catalogItems];
                                                                    newCats[catIdx].items[itemIdx].description = e.target.value;
                                                                    setCatalogItems(newCats);
                                                                }}
                                                                className="w-full text-[9px] font-medium text-navy/60 bg-transparent resize-none outline-none border-b border-navy/5 focus:border-primary"
                                                                rows={2}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => {
                                                    const total = catalogItems.reduce((acc: number, cat: any) => acc + (cat.items?.length || 0), 0);
                                                    if (total >= 20) {
                                                        alert("Máximo 20 productos permitidos en total en todos las categorías.");
                                                        return;
                                                    }
                                                    const newCats = [...catalogItems];
                                                    newCats[catIdx].items.push({ name: '', price: '', description: '', image: '' });
                                                    setCatalogItems(newCats);
                                                }}
                                                className="border-2 border-dashed border-navy/10 rounded-2xl flex flex-col items-center justify-center py-4 hover:border-primary/20 transition-all group"
                                            >
                                                <Zap className="text-navy/10 group-hover:text-primary transition-colors mb-1" size={16} />
                                                <span className="text-[8px] font-black uppercase text-navy/20 group-hover:text-primary/60 tracking-widest">Nuevo Producto</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    }

                    {/* STEP 6: PAGO (WAS 4) */}
                    {step === 6 &&
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
                                                href={`https://wa.me/593963410409?text=Hola,%20estoy%20en%20el%20paso%20de%20pago%20con%20Cripto%20y%20necesito%20ayuda%20para%20pagar%20mi%20Perfil%20(Plan%20Pro%20$20).%20Mi%20correo:%20${formData.email}`}
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
                    }

                    {/* STEP 7: EN REVISIÓN (SUCCESS) */}
                    {step === 7 &&
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
                                        <span className="text-white font-black text-xs uppercase tracking-widest">Entrega al siguiente día hábil</span>
                                    </div>
                                </div>
                                <p className="text-2xl md:text-3xl font-black text-primary text-center mb-3 leading-tight">
                                    Tu perfil estará listo y enviado al siguiente día hábil
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
                                            <div className="text-left w-full overflow-hidden">
                                                <p className="font-black text-navy text-lg leading-tight uppercase italic mb-0.5">Revisa tu correo</p>
                                                <p className="text-sm font-bold text-primary break-all">{formData.email}</p>
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
                                                href="https://g.page/r/CecvMNpTAC7lEBM/review"
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
                        }

                    {/* Navigation */}
                    {step < 7 &&
                        <div className="mt-12 flex justify-between items-center max-w-xl mx-auto">
                                <button
                                    onClick={handleBack}
                                    className={cn(
                                        "px-10 py-5 rounded-button font-black text-xs uppercase tracking-widest transition-all",
                                        step >= 6 ? "text-white/40 hover:text-white" : "text-navy/60 hover:text-navy bg-navy/5 hover:bg-navy/10"
                                    )}
                                >
                                    ← Atrás
                                </button>

                                <button
                                    onClick={handleNext}
                                    disabled={isSubmitting}
                                    className={cn(
                                        "px-12 py-6 rounded-button font-black text-xl shadow-lg flex items-center gap-4 transition-all hover:scale-105 active:scale-95",
                                        step >= 4 ? "bg-primary text-white shadow-primary" : "bg-navy text-white",
                                        isSubmitting && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    {step === 6 ? (isSubmitting ? 'Procesando...' : 'Finalizar Registro') : 'Siguiente'} <ArrowRight size={20} />
                                </button>
                            </div>
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
