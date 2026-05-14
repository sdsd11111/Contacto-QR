"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Download, Key, AlertCircle, CheckCircle, Loader2, Edit, Image as ImageIcon, Zap, Phone, User, ChevronDown, Store, Library, Plus, Trash2, Activity, Video } from 'lucide-react';
import { formatPhoneEcuador, cn } from '@/lib/utils';

interface VCardEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialSlug: string;
    allowCatalog?: boolean;
    initialSection?: 'perfil' | 'contacto' | 'hero' | 'portada' | 'catalogo';
    isSetup?: boolean;
}

const safeParse = <T,>(str: string | null | undefined, fallback: T): T => {
    if (!str) return fallback;
    try {
        return JSON.parse(str) as T;
    } catch (e) {
        return fallback;
    }
};

const getYouTubeID = (url: string) => {
    if (!url) return null;
    // If it's already an 11-character ID, return it
    if (url.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
    
    // Regex updated to support /shorts/ and various existing formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

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
    const [activeSection, setActiveSection] = useState<'perfil' | 'contacto' | 'hero' | 'portada' | 'categorias' | 'catalogo' | 'autoridad' | 'industrial' | 'code' | 'success' | null>(initialSection);
    const [catalogTab, setCatalogTab] = useState<'config' | 'products'>('config');
    const [productCategoryFilter, setProductCategoryFilter] = useState<string>('Todas');
    const productCategoryFilterRef = useRef('Todas');

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
        productos_servicios: '',
        etiquetas: '',
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
        google_rating: '',
        google_reviews_count: '',
        template_id: 'classic',
        hero_slides_json: [] as Array<{ id: string, portada_desktop: string, portada_movil: string, title: string, active: boolean, description?: string }>,
        catalogo_json: { categories: [], products: [] } as { categories: string[], products: any[] },
        json_override: {} as any
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
                body: JSON.stringify({ code: cleanedCode, slug: initialSlug })
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
                    productos_servicios: data.data.productos_servicios || '',
                    etiquetas: data.data.etiquetas || '',
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

                    google_rating: data.data.google_rating || '',
                    google_reviews_count: data.data.google_reviews_count || '',
                    template_id: data.data.template_id || 'classic',
                    hero_slides_json: (() => {
                        const raw = data.data.hero_slides_json ? (typeof data.data.hero_slides_json === 'string' ? JSON.parse(data.data.hero_slides_json) : data.data.hero_slides_json) : null;
                        if (!raw || !Array.isArray(raw) || raw.length === 0) {
                            if (data.data.portada_desktop || data.data.portada_movil) {
                                return [{
                                    id: `slide_${Math.random().toString(36).substr(2, 9)}`,
                                    portada_desktop: data.data.portada_desktop || '',
                                    portada_movil: data.data.portada_movil || '',
                                    title: data.data.hero_section_title || 'Oferta del Hero',
                                    active: true
                                }];
                            }
                            return [];
                        }
                        return raw;
                    })(),
                    catalogo_json: (() => {
                        const raw = data.data.catalogo_json ? (typeof data.data.catalogo_json === 'string' ? JSON.parse(data.data.catalogo_json) : data.data.catalogo_json) : null;
                        if (!raw) return { categories: [], products: [] };
                        
                        let products = [];
                        let categories = [];

                        if (Array.isArray(raw)) {
                            products = raw;
                        } else if (raw.products) {
                            products = raw.products;
                            categories = raw.categories || [];
                        }

                        // Normalize all fields from Spanish or English
                        products = products.map((p: any) => ({
                            id: p.id || `prod_${Math.random().toString(36).substr(2, 9)}`,
                            name: p.name || p.nombre || p.titulo || '',
                            price: p.price || p.precio || '',
                            description: p.description || p.descripcion || '',
                            image: p.image || p.imagen || p.foto || p.url || '',
                            category: p.category || p.categoria || 'Sin Categoría'
                        }));

                        // If categories empty, infer from products
                        if (categories.length === 0) {
                            categories = Array.from(new Set(products.map((p: any) => p.category)));
                        }

                        return { categories, products };
                    })(),
                    json_override: (() => {
                        if (!data.data.json_override) return {};
                        try {
                            return typeof data.data.json_override === 'string' 
                                ? JSON.parse(data.data.json_override) 
                                : data.data.json_override;
                        } catch (e) {
                            console.error("Error parsing json_override:", e);
                            return {};
                        }
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
        // Removiendo confirm para evitar bloqueos del navegador en ciertos entornos
        setLoading(true);
        try {
            const formattedData = {
                ...formData,
                whatsapp: formatPhoneEcuador(formData.whatsapp),
                template_id: formData.template_id || 'classic',
                // Asegurar que json_override sea string para la API
                json_override: typeof formData.json_override === 'object' 
                    ? JSON.stringify(formData.json_override) 
                    : (formData.json_override || '{}')
            };

            const res = await fetch('/api/edit/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: editCode,
                    data: formattedData,
                    slug: initialSlug
                })
            });
            const result = await res.json();

            if (res.ok) {
                setStep('success');
            } else {
                alert(result.error || 'Error al guardar cambios');
            }
        } catch (err) {
            console.error('Error in handleSave:', err);
            alert('Error de conexión al intentar guardar');
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
                alert('Error al subir imagen');
            }
        } catch (err) {
            alert('Error al subir imagen');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleHeroSlideImage = async (e: React.ChangeEvent<HTMLInputElement>, id: string, type: 'portada_desktop' | 'portada_movil') => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingImage(true);
        const fd = new FormData();
        fd.append('file', file);
        try {
            const res = await fetch('/api/upload', { method: 'POST', body: fd });
            if (res.ok) {
                const { url } = await res.json();
                setFormData({
                    ...formData,
                    hero_slides_json: formData.hero_slides_json.map(slide => slide.id === id ? { ...slide, [type]: url } : slide)
                });
            } else {
                alert('Error al subir imagen de slide');
            }
        } catch (err) {
            alert('Error al subir imagen de slide');
        } finally {
            setUploadingImage(false);
        }
    };

    const addHeroSlide = () => {
        if (formData.hero_slides_json.length >= 10) {
            alert('Máximo 10 Banners permitidos');
            return;
        }
        const newSlide = {
            id: `slide_${Math.random().toString(36).substr(2, 9)}`,
            portada_desktop: formData.portada_desktop || '', // Use current single portadas as default to avoid empty initially if possible
            portada_movil: formData.portada_movil || '',
            title: 'Nuevo Banner',
            active: true
        };
        setFormData({
            ...formData,
            hero_slides_json: [...formData.hero_slides_json, newSlide]
        });
    };

    const toggleHeroSlideActive = (id: string, currentlyActive: boolean) => {
        if (currentlyActive) {
            const activeCount = formData.hero_slides_json.filter(s => s.active).length;
            if (activeCount <= 1) {
                alert('Debes mantener al menos 1 Banner Hero activo.');
                return;
            }
        }
        setFormData({
            ...formData,
            hero_slides_json: formData.hero_slides_json.map(slide => 
                slide.id === id ? { ...slide, active: !currentlyActive } : slide
            )
        });
    };

    const removeHeroSlide = (id: string) => {
        const slideToRemove = formData.hero_slides_json.find(s => s.id === id);
        if (slideToRemove?.active) {
            const activeCount = formData.hero_slides_json.filter(s => s.active).length;
            if (activeCount <= 1) {
                alert('No puedes eliminar este banner activo porque debe haber al menos 1 Banner Hero activo. Apaga u enciende otros primero.');
                return;
            }
        }
        setFormData({
            ...formData,
            hero_slides_json: formData.hero_slides_json.filter(s => s.id !== id)
        });
    };

    const updateHeroSlideTitle = (id: string, title: string) => {
        setFormData({
            ...formData,
            hero_slides_json: formData.hero_slides_json.map(slide => 
                slide.id === id ? { ...slide, title } : slide
            )
        });
    };

    const updateHeroSlideDescription = (id: string, description: string) => {
        setFormData({
            ...formData,
            hero_slides_json: formData.hero_slides_json.map(slide => 
                slide.id === id ? { ...slide, description } : slide
            )
        });
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

    // --- Helper Logic for Categories ---
    const experienceCategories = (() => {
        let title = "";
        let subtitle = "";
        let images: any[] = [];
        try {
            const raw = formData.json_override;
            const parsed = typeof raw === 'string' ? safeParse(raw, {}) : (raw || {});
            title = parsed.experienceTitle || (formData.nombre_negocio ? `THE ${formData.nombre_negocio} EXPERIENCE` : "THE NEW GUEST EXPERIENCE");
            subtitle = parsed.experienceSubtitle || "Especialidad";
            images = parsed.experienceImages || [];
        } catch (e) {}
        
        const rawLines = formData?.productos_servicios
            ?.split('\n')
            .filter((l: string) => l.trim().length > 0)
            .slice(0, 6) || [];
            
        const replacements = (() => {
            const raw = formData.json_override;
            if (!raw) return {};
            try {
                const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
                return parsed || {};
            } catch (e) { return {}; }
        })();

        const descriptions = (() => {
            const raw = formData.json_override;
            if (!raw) return {};
            try {
                const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
                return parsed.experienceDescriptions || {};
            } catch (e) { return {}; }
        })();
            
        return {
            title,
            subtitle,
            categories: rawLines.map((cat: string, index: number) => {
                const customImg = images.find((i: any) => i.index === index);
                const displayTitle = replacements[cat] || cat;
                const description = descriptions[cat] || "";
                
                return {
                    index,
                    originalTitle: cat,
                    title: displayTitle,
                    description: description,
                    img: customImg?.url || ''
                }
            })
        };
    })();

    const updateCategoryDescription = (originalTitle: string, newDesc: string) => {
        setFormData(prev => {
            const raw = prev.json_override;
            const parsed = typeof raw === 'string' ? safeParse(raw, {}) : (raw || {});
            
            const nextDescriptions = { ...(parsed.experienceDescriptions || {}) };
            if (newDesc) {
                nextDescriptions[originalTitle] = newDesc;
            } else {
                delete nextDescriptions[originalTitle];
            }
            
            return { 
                ...prev, 
                json_override: {
                    ...parsed,
                    experienceDescriptions: nextDescriptions
                } 
            };
        });
    };

    const updateExperienceCategories = (newTitle?: string, newImages?: any[], newSubtitle?: string) => {
        setFormData(prev => {
            const raw = prev.json_override;
            const parsed = typeof raw === 'string' ? safeParse(raw, {}) : (raw || {});
            
            const nextObj = {
                ...parsed,
                experienceTitle: newTitle !== undefined ? newTitle : (parsed.experienceTitle),
                experienceImages: newImages !== undefined ? newImages : (parsed.experienceImages),
                experienceSubtitle: newSubtitle !== undefined ? newSubtitle : (parsed.experienceSubtitle)
            };
            
            return { ...prev, json_override: nextObj };
        });
    };

    const updateCategoryTitle = (originalTitle: string, newTitle: string) => {
        setFormData(prev => {
            const raw = prev.json_override;
            const parsed = typeof raw === 'string' ? safeParse(raw, {}) : (raw || {});
            
            const nextParsed = { ...parsed };
            if (newTitle && newTitle !== originalTitle) {
                nextParsed[originalTitle] = newTitle;
            } else {
                delete nextParsed[originalTitle];
            }
            
            return { ...prev, json_override: nextParsed };
        });
    };

    const handleCategoryImage = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingImage(true);
        const fd = new FormData();
        fd.append('file', file);
        try {
            const res = await fetch('/api/upload', { method: 'POST', body: fd });
            if (res.ok) {
                const { url } = await res.json();
                setFormData(prev => {
                    const raw = prev.json_override;
                    const parsed = typeof raw === 'string' ? safeParse(raw, {}) : (raw || {});
                    const currentImages = parsed.experienceImages || [];
                    const nextImages = [...currentImages.filter((img: any) => img.index !== index), { index, url }];
                    
                    return {
                        ...prev,
                        json_override: {
                            ...parsed,
                            experienceImages: nextImages
                        }
                    };
                });
            }
        } catch (err) {
            console.error("Error uploading category image:", err);
        } finally {
            setUploadingImage(false);
        }
    };

    // --- Industrial Template Config ---
    const industrialConfig = (() => {
        const raw = formData.json_override;
        const parsed = typeof raw === 'string' ? safeParse(raw, {}) : (raw || {});
        const config = parsed.industrialConfig || {};
        
        return {
            badge: config.badge || "Garantía de Calidad",
            title: config.title || "Por qué elegirnos",
            description: config.description || "Nuestra infraestructura y equipo están preparados para los desafíos más exigentes. La eficiencia de su flota u operación es nuestra prioridad absoluta.",
            metrics: config.metrics || [
                { label: "Capacidad Operativa", value: "100" },
                { label: "Cumplimiento de Tiempos", value: "98" }
            ],
            stats: config.stats || [
                { label: "Experiencia", value: "10+" },
                { label: "Proyectos", value: "200+" },
                { label: "Efectividad", value: "99%" },
                { label: "Soporte", value: "24/7" }
            ]
        };
    })();

    const authorityModule = (() => {
        const raw = formData.json_override;
        const parsed = typeof raw === 'string' ? safeParse(raw, {}) : (raw || {});
        return parsed.authorityModule || {
            enabled: false,
            badge: 'Garantía de Calidad',
            title: 'Por qué Elegirnos',
            description: '',
            stats: [
                { label: 'Experiencia', value: '10+' },
                { label: 'Proyectos', value: '200+' },
                { label: 'Efectividad', value: '99%' },
                { label: 'Soporte', value: '24/7' }
            ],
            metrics: [
                { label: 'Capacidad Operativa', value: '100' },
                { label: 'Cumplimiento de Tiempos', value: '98' }
            ]
        };
    })();

    const updateIndustrialConfig = (updates: any) => {
        setFormData(prev => {
            const raw = prev.json_override;
            const parsed = typeof raw === 'string' ? safeParse(raw, {}) : (raw || {});
            const currentConfig = parsed.industrialConfig || industrialConfig;
            
            return {
                ...prev,
                json_override: {
                    ...parsed,
                    industrialConfig: {
                        ...currentConfig,
                        ...updates
                    }
                }
            };
        });
    };

    const updateAuthorityModule = (updates: any) => {
        setFormData(prev => {
            const raw = prev.json_override;
            const parsed = typeof raw === 'string' ? safeParse(raw, {}) : (raw || {});
            const currentModule = parsed.authorityModule || {};
            return {
                ...prev,
                json_override: {
                    ...parsed,
                    authorityModule: {
                        ...currentModule,
                        ...updates
                    }
                }
            };
        });
    };

    const menuTitle = (() => {
        const raw = formData.json_override;
        const parsed = typeof raw === 'string' ? safeParse(raw, {}) : (raw || {});
        return parsed.menuTitle || '';
    })();

    const updateMenuTitle = (title: string) => {
        setFormData(prev => {
            const raw = prev.json_override;
            const parsed = typeof raw === 'string' ? safeParse(raw, {}) : (raw || {});
            return {
                ...prev,
                json_override: {
                    ...parsed,
                    menuTitle: title
                }
            };
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                    {/* Header */}
                    <div className="bg-primary p-6 flex justify-between items-center text-white shrink-0">
                        <div>
                            <h2 className="text-xl font-black uppercase italic tracking-tight flex items-center gap-2">
                                <Edit size={24} />
                                Configuración de VCard
                            </h2>
                            <p className="text-white/80 text-xs font-bold uppercase tracking-widest mt-1">
                                Edita Hero, Ofertas y perfil directamente
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
                                        className="w-full border-2 border-gray-100 rounded-2xl p-4 text-center text-xl font-black text-gray-900 tracking-[0.2em] focus:border-primary outline-none transition-all uppercase"
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

                                <button 
                                    onClick={onClose}
                                    className="mt-6 text-gray-400 font-bold uppercase tracking-widest text-[10px] hover:text-primary transition-colors flex items-center gap-2"
                                >
                                    <X size={12} /> Cerrar y Volver
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
                                                                        <input className="w-full border rounded-lg p-3 text-gray-900 text-sm font-bold bg-gray-50" value={formData.nombres} onChange={(e) => setFormData({ ...formData, nombres: e.target.value })} placeholder="Nombres" />
                                                                        <input className="w-full border rounded-lg p-3 text-gray-900 text-sm font-bold bg-gray-50" value={formData.apellidos} onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })} placeholder="Apellidos" />
                                                                    </div>
                                                                ) : (
                                                                    <input className="w-full border rounded-lg p-3 text-gray-900 text-sm font-bold bg-gray-50" value={formData.nombre_negocio} onChange={(e) => setFormData({ ...formData, nombre_negocio: e.target.value })} placeholder="Nombre del Negocio" />
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-1">
                                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Profesión / Rubro</label>
                                                                <input className="w-full border rounded-lg p-3 text-gray-900 text-sm font-bold bg-gray-50" value={formData.profession} onChange={(e) => setFormData({ ...formData, profession: e.target.value })} placeholder="Ej. Arquitecto" />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Empresa (Opcional)</label>
                                                                <input className="w-full border rounded-lg p-3 text-gray-900 text-sm font-bold bg-gray-50" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} placeholder="Tu empresa" />
                                                            </div>
                                                            <div className="col-span-full space-y-1">
                                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sobre Mí / Bio</label>
                                                                <textarea className="w-full border rounded-lg p-3 text-gray-900 text-sm font-medium bg-gray-50" rows={3} value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} placeholder="Cuéntales qué haces..." />
                                                            </div>
                                                            {/* Soluciones Destacadas - Visible for professional plans except Catalog (as it has its own catalog) */}
                                                             {(userData?.plan === 'business' || userData?.plan === 'pro' || userData?.plan === 'digital' || (!userData?.plan && userData?.tipo_perfil === 'negocio')) && userData?.plan !== 'catalog' && (
                                                                 <div className="col-span-full space-y-1">
                                                                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Soluciones Destacadas</label>
                                                                     <textarea 
                                                                         className="w-full border rounded-lg p-3 text-gray-900 text-sm font-medium bg-gray-50" 
                                                                         rows={3} 
                                                                         value={formData.productos_servicios} 
                                                                         onChange={(e) => setFormData({ ...formData, productos_servicios: e.target.value })} 
                                                                         placeholder="Lista tus soluciones o servicios principales..." 
                                                                     />
                                                                 </div>
                                                             )}
                                                             {formData.tipo_perfil === 'negocio' && (
                                                                 <div className="col-span-full grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                                                     <div className="space-y-1">
                                                                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nombres Responsable</label>
                                                                         <input className="w-full border rounded-lg p-3 text-gray-900 text-sm font-bold bg-white" value={formData.contacto_nombre} onChange={(e) => setFormData({ ...formData, contacto_nombre: e.target.value })} placeholder="Ej. Juan" />
                                                                     </div>
                                                                     <div className="space-y-1">
                                                                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Apellidos Responsable</label>
                                                                         <input className="w-full border rounded-lg p-3 text-gray-900 text-sm font-bold bg-white" value={formData.contacto_apellido} onChange={(e) => setFormData({ ...formData, contacto_apellido: e.target.value })} placeholder="Ej. Perez" />
                                                                     </div>
                                                                 </div>
                                                             )}
                                                             <div className="col-span-full space-y-1">
                                                                 <label className="text-[10px] font-black text-primary uppercase tracking-widest">Etiquetas / Tags (Separados por coma)</label>
                                                                 <input className="w-full border rounded-lg p-3 text-gray-900 text-sm font-bold bg-primary/5 border-primary/20" value={formData.etiquetas} onChange={(e) => setFormData({ ...formData, etiquetas: e.target.value })} placeholder="Ej. Parrillada, Eventos, Gourmet" />
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
                                                            <input className="w-full border rounded-lg p-3 text-gray-900 text-sm font-bold bg-gray-50" value={formData.whatsapp} onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })} placeholder="+593..." />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Email</label>
                                                            <input className="w-full border rounded-lg p-3 text-gray-900 text-sm font-bold bg-gray-50" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="email@ejemplo.com" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Instagram (Link)</label>
                                                            <input className="w-full border rounded-lg p-3 text-gray-900 text-sm font-bold bg-gray-50" value={formData.instagram} onChange={(e) => setFormData({ ...formData, instagram: e.target.value })} placeholder="https://..." />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-black text-[#0077B5] uppercase tracking-widest">LinkedIn (Link)</label>
                                                            <input className="w-full border rounded-lg p-3 text-gray-900 text-sm font-bold bg-gray-50" value={formData.linkedin} onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })} placeholder="https://..." />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-black text-black uppercase tracking-widest">TikTok (Social)</label>
                                                            <input className="w-full border rounded-lg p-3 text-gray-900 text-sm font-bold bg-gray-50" value={formData.tiktok} onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })} placeholder="Link a perfil TikTok..." />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-black text-[#FF0000] uppercase tracking-widest">YouTube (Social)</label>
                                                            <input className="w-full border rounded-lg p-3 text-gray-900 text-sm font-bold bg-gray-50" value={formData.youtube} onChange={(e) => setFormData({ ...formData, youtube: e.target.value })} placeholder="Link a canal YouTube..." />
                                                        </div>
                                                        <div className="col-span-full space-y-1">
                                                            <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest text-[#1DA1F2]">X (Twitter - Link)</label>
                                                            <input className="w-full border rounded-lg p-3 text-gray-900 text-sm font-bold bg-gray-50 border-blue-100" value={formData.x} onChange={(e) => setFormData({ ...formData, x: e.target.value })} placeholder="https://x.com/tuperfil" />
                                                        </div>
                                                        <div className="col-span-full space-y-1">
                                                            <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest decoration-primary decoration-2 underline-offset-4 flex items-center gap-2">
                                                                <Video size={14} /> Video Promocional (YouTube, TikTok, IG, FB)
                                                            </label>
                                                            <input className="w-full border rounded-lg p-3 text-gray-900 text-sm font-bold bg-gray-50 border-indigo-200" value={formData.youtube_video_url} onChange={(e) => setFormData({ ...formData, youtube_video_url: e.target.value })} placeholder="Pega aquí el link de YouTube, TikTok, Instagram o Facebook..." />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Título de Catálogo / Carta</label>
                                                            <input className="w-full border rounded-lg p-3 text-gray-900 text-sm font-bold bg-gray-50" value={menuTitle} onChange={(e) => updateMenuTitle(e.target.value)} placeholder="Ej. NUESTRA CARTA" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Menú Digital (Link)</label>
                                                            <input className="w-full border rounded-lg p-3 text-gray-900 text-sm font-bold bg-gray-50" value={formData.menu_digital} onChange={(e) => setFormData({ ...formData, menu_digital: e.target.value })} placeholder="https://..." />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-black text-primary uppercase tracking-widest">Sitio Web</label>
                                                            <input className="w-full border rounded-lg p-3 text-gray-900 text-sm font-bold bg-gray-50" value={formData.web} onChange={(e) => setFormData({ ...formData, web: e.target.value })} placeholder="https://..." />
                                                        </div>
                                                        <div className="col-span-full space-y-1">
                                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dirección Física</label>
                                                            <input className="w-full border rounded-lg p-3 text-gray-900 text-sm font-bold bg-gray-50" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Ej. Calle Principal #123" />
                                                        </div>
                                                        <div className="col-span-full space-y-1">
                                                            <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Google Business / Maps</label>
                                                            <input className="w-full border rounded-lg p-3 text-gray-900 text-sm font-bold bg-gray-50" value={formData.google_business} onChange={(e) => setFormData({ ...formData, google_business: e.target.value })} placeholder="Link a Maps" />
                                                        </div>
                                                        {(userData?.plan === 'business' || userData?.plan === 'catalog') && (
                                                         <div className="grid grid-cols-2 gap-4 col-span-full">
                                                             <div className="space-y-1">
                                                                 <label className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Puntaje Google (Estrellas)</label>
                                                                 <input className="w-full border rounded-lg p-3 text-gray-900 text-sm font-bold bg-gray-50 border-yellow-100" type="number" step="0.1" min="1" max="5" value={formData.google_rating} onChange={(e) => setFormData({ ...formData, google_rating: e.target.value })} placeholder="Ej. 4.9" />
                                                             </div>
                                                             <div className="space-y-1">
                                                                 <label className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Número de Reseñas</label>
                                                                 <input className="w-full border rounded-lg p-3 text-gray-900 text-sm font-bold bg-gray-50 border-yellow-100" type="number" value={formData.google_reviews_count} onChange={(e) => setFormData({ ...formData, google_reviews_count: e.target.value })} placeholder="Ej. 128" />
                                                             </div>
                                                         </div>
                                                         )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* SECCIÓN 2.5: CATEGORÍAS E IMÁGENES (PROTOCOLO VIP) */}
                                    <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                        <button 
                                            onClick={() => setActiveSection(activeSection === 'categorias' ? null : 'categorias')}
                                            className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-500">
                                                    <Edit size={18} />
                                                </div>
                                                <span className="font-black text-navy uppercase text-sm tracking-tighter">Editar Categorías e Imágenes</span>
                                            </div>
                                            <ChevronDown size={20} className={cn("text-navy/30 transition-transform", activeSection === 'categorias' && "rotate-180")} />
                                        </button>
                                        <AnimatePresence>
                                            {activeSection === 'categorias' && (
                                                <motion.div 
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden bg-white border-t border-gray-100"
                                                >
                                                    <div className="p-6 space-y-6">
                                                        {/* Global Section Titles */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-1">
                                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Título de Sección (Experiencia)</label>
                                                                <input 
                                                                    className="w-full border rounded-lg p-3 text-gray-900 text-sm font-bold bg-gray-50" 
                                                                    value={experienceCategories.title} 
                                                                    onChange={(e) => updateExperienceCategories(e.target.value)} 
                                                                    placeholder="Ej. NUESTRAS CATEGORÍAS" 
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <label className="text-[10px] font-black text-primary uppercase tracking-widest">Especialidad / Subtítulo</label>
                                                                <input 
                                                                    className="w-full border rounded-lg p-3 text-gray-900 text-sm font-bold bg-primary/5 border-primary/20" 
                                                                    value={experienceCategories.subtitle} 
                                                                    onChange={(e) => updateExperienceCategories(undefined, undefined, e.target.value)} 
                                                                    placeholder="Ej. Especialistas en Color y Corte" 
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Categories Grid */}
                                                        <div className="space-y-4">
                                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Categorías Individuales (Máx 6)</label>
                                                            <div className="grid grid-cols-1 gap-3">
                                                                {experienceCategories.categories.map((cat, idx) => (
                                                                    <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                                        {/* Thumbnail / Upload */}
                                                                        <div className="relative w-16 h-16 rounded-lg bg-gray-200 overflow-hidden shrink-0 group cursor-pointer border-2 border-dashed border-gray-300 hover:border-primary transition-all">
                                                                            {cat.img ? (
                                                                                <img src={cat.img} alt={cat.title} className="w-full h-full object-cover" />
                                                                            ) : (
                                                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                                    <Download size={20} />
                                                                                </div>
                                                                            )}
                                                                            <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                                                                                {uploadingImage ? <Loader2 size={16} className="text-white animate-spin" /> : <Edit size={16} className="text-white" />}
                                                                                <input 
                                                                                    type="file" 
                                                                                    className="hidden" 
                                                                                    onChange={(e) => handleCategoryImage(e, idx)}
                                                                                    accept="image/*"
                                                                                    disabled={uploadingImage}
                                                                                />
                                                                            </label>
                                                                        </div>

                                                                        {/* Title and Description Editor */}
                                                                        <div className="grow space-y-2">
                                                                            <div className="space-y-1">
                                                                                <p className="text-[10px] font-black text-navy/40 uppercase tracking-tighter">Título Categoría {idx + 1}</p>
                                                                                <input 
                                                                                    className="w-full bg-transparent border-b border-gray-200 focus:border-primary outline-none py-1 text-sm font-bold text-navy"
                                                                                    value={cat.title}
                                                                                    onChange={(e) => updateCategoryTitle(cat.originalTitle, e.target.value)}
                                                                                    placeholder={cat.originalTitle}
                                                                                />
                                                                            </div>
                                                                            <div className="space-y-1">
                                                                                <p className="text-[10px] font-black text-navy/40 uppercase tracking-tighter">Descripción (Opcional)</p>
                                                                                <textarea 
                                                                                    className="w-full bg-gray-100/50 rounded-lg p-2 text-[10px] font-medium text-navy/70 border border-transparent focus:border-primary/30 outline-none resize-none"
                                                                                    rows={2}
                                                                                    value={cat.description}
                                                                                    onChange={(e) => updateCategoryDescription(cat.originalTitle, e.target.value)}
                                                                                    placeholder="Breve descripción del servicio..."
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* SECCIÓN 2.7: MÓDULO INDUSTRIAL (Sólo si template es industrial) */}
                                    {formData.template_id === 'industrial' && (
                                        <div className="border-2 border-[#FF5C00]/20 rounded-2xl overflow-hidden shadow-sm">
                                            <button 
                                                onClick={() => setActiveSection(activeSection === 'industrial' ? null : 'industrial')} 
                                                className="w-full flex items-center justify-between p-4 bg-[#FF5C00]/5 hover:bg-[#FF5C00]/10 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-[#FF5C00] flex items-center justify-center text-white">
                                                        <Activity size={18} />
                                                    </div>
                                                    <div className="text-left">
                                                        <span className="font-black text-navy uppercase text-sm tracking-tighter block">Módulo Industrial / Confianza</span>
                                                        <span className="text-[10px] font-bold text-[#FF5C00] uppercase tracking-widest">Personaliza métricas y estadísticas</span>
                                                    </div>
                                                </div>
                                                <ChevronDown size={20} className={cn("text-navy/30 transition-transform", activeSection === 'industrial' && "rotate-180")} />
                                            </button>
                                            <AnimatePresence>
                                                {activeSection === 'industrial' && (
                                                    <motion.div 
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden bg-white border-t border-[#FF5C00]/10"
                                                    >
                                                        <div className="p-6 space-y-6">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div className="space-y-1">
                                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Etiqueta Superior</label>
                                                                    <input className="w-full border rounded-lg p-3 text-gray-900 text-sm font-bold bg-gray-50" value={industrialConfig.badge} onChange={(e) => updateIndustrialConfig({ badge: e.target.value })} placeholder="Garantía de Calidad" />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Título Principal</label>
                                                                    <input className="w-full border rounded-lg p-3 text-gray-900 text-sm font-bold bg-gray-50" value={industrialConfig.title} onChange={(e) => updateIndustrialConfig({ title: e.target.value })} placeholder="Por qué elegirnos" />
                                                                </div>
                                                                <div className="col-span-full space-y-1">
                                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Descripción de Confianza</label>
                                                                    <textarea className="w-full border rounded-lg p-3 text-gray-900 text-sm font-medium bg-gray-50" rows={2} value={industrialConfig.description} onChange={(e) => updateIndustrialConfig({ description: e.target.value })} placeholder="Nuestra infraestructura..." />
                                                                </div>
                                                            </div>

                                                            <div className="space-y-4">
                                                                <label className="text-[10px] font-black text-[#FF5C00] uppercase tracking-widest block border-b pb-2">Barras de Progreso (Métricas %)</label>
                                                                <div className="grid grid-cols-1 gap-3">
                                                                    {industrialConfig.metrics.map((m: any, i: number) => (
                                                                        <div key={i} className="flex gap-2">
                                                                            <input 
                                                                                className="flex-1 border rounded-lg p-2 text-xs font-bold" 
                                                                                value={m.label} 
                                                                                onChange={(e) => {
                                                                                    const next = [...industrialConfig.metrics];
                                                                                    next[i].label = e.target.value;
                                                                                    updateIndustrialConfig({ metrics: next });
                                                                                }}
                                                                            />
                                                                            <input 
                                                                                className="w-20 border rounded-lg p-2 text-xs font-bold text-center text-[#FF5C00]" 
                                                                                type="number"
                                                                                value={m.value} 
                                                                                onChange={(e) => {
                                                                                    const next = [...industrialConfig.metrics];
                                                                                    next[i].value = e.target.value;
                                                                                    updateIndustrialConfig({ metrics: next });
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <div className="space-y-4">
                                                                <label className="text-[10px] font-black text-[#FF5C00] uppercase tracking-widest block border-b pb-2">Cuadros de Estadísticas (Kpis)</label>
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    {industrialConfig.stats.map((s: any, i: number) => (
                                                                        <div key={i} className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                                                                            <input 
                                                                                className="w-full bg-transparent font-black text-navy text-lg outline-none" 
                                                                                value={s.value} 
                                                                                placeholder="Valor (ej: 10+)"
                                                                                onChange={(e) => {
                                                                                    const next = [...industrialConfig.stats];
                                                                                    next[i].value = e.target.value;
                                                                                    updateIndustrialConfig({ stats: next });
                                                                                }}
                                                                            />
                                                                            <input 
                                                                                className="w-full bg-transparent font-bold text-gray-400 text-[10px] uppercase tracking-widest outline-none" 
                                                                                value={s.label} 
                                                                                placeholder="Etiqueta (ej: EXPERIENCIA)"
                                                                                onChange={(e) => {
                                                                                    const next = [...industrialConfig.stats];
                                                                                    next[i].label = e.target.value;
                                                                                    updateIndustrialConfig({ stats: next });
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )}

                                    {/* SECCIÓN 3: OFERTA DEL HERO (BOTÓN PRINCIPAL) */}

                                     {(userData?.plan === 'business' || userData?.plan === 'catalog') && (
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
                                                                className="w-full border rounded-lg p-3 text-gray-900 text-sm font-bold bg-gray-50" 
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
                                                                    className="w-full border rounded-lg p-3 text-gray-900 text-sm font-bold bg-gray-50" 
                                                                    value={formData.hero_section_title} 
                                                                    onChange={(e) => setFormData({ ...formData, hero_section_title: e.target.value })} 
                                                                    placeholder="Ej. Configuración WiFi, Oferta Especial, etc." 
                                                                />
                                                            </div>
                                                        </div>

                                                        {formData.hero_action === 'wifi' && (
                                                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-6">
                                                                <div className="space-y-4 pb-4 border-b border-gray-200">
                                                                    <h5 className="text-[10px] font-black text-navy uppercase tracking-widest">Datos de la Oferta / Promoción</h5>
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                        <input className="w-full border rounded-lg p-2 text-gray-900 text-sm font-bold" value={formData.wifi_ssid} onChange={(e) => setFormData({ ...formData, wifi_ssid: e.target.value })} placeholder="Título de la Oferta" />
                                                                        <input className="w-full border rounded-lg p-2 text-gray-900 text-sm font-bold" value={formData.wifi_password} onChange={(e) => setFormData({ ...formData, wifi_password: e.target.value })} placeholder="Subtítulo / Descripción" />
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
                                                                            className="w-full border rounded-lg p-2 text-gray-900 text-xs font-bold bg-gray-50" 
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
                                                                            className="w-full border rounded-lg p-2 text-gray-900 text-xs font-bold bg-gray-50" 
                                                                            value={formData.hero_step2_title} 
                                                                            onChange={(e) => setFormData({ ...formData, hero_step2_title: e.target.value })} 
                                                                            placeholder="Título Paso 2" 
                                                                        />
                                                                        <textarea 
                                                                            className="w-full border rounded-lg p-2 text-gray-900 text-xs font-medium bg-gray-50" 
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
                                                                            className="w-full border rounded-lg p-2 text-gray-900 text-xs font-bold bg-gray-50" 
                                                                            value={formData.hero_step3_title} 
                                                                            onChange={(e) => setFormData({ ...formData, hero_step3_title: e.target.value })} 
                                                                            placeholder="Título Paso 3" 
                                                                        />
                                                                        <textarea 
                                                                            className="w-full border rounded-lg p-2 text-gray-900 text-xs font-medium bg-gray-50" 
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
                                                                    className="w-full border rounded-lg p-3 text-gray-900 text-sm font-bold bg-white" 
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
                                     )}

                                    {/* SECCIÓN 4: CARRUSEL DE BANNERS (HERO) */}
                                    <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                        <button 
                                            onClick={() => setActiveSection(activeSection === 'portada' ? null : 'portada')}
                                            className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                    <ImageIcon size={18} />
                                                </div>
                                                <div className="text-left leading-none">
                                                    <span className="font-black text-navy uppercase text-sm tracking-tighter">Banners Dinámicos Hero</span>
                                                    <p className="text-[9px] font-black text-navy/40 uppercase tracking-widest mt-0.5">{formData.hero_slides_json?.length || 0}/10 Banners Creados</p>
                                                </div>
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
                                                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 text-blue-800">
                                                            <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                                            <div className="text-xs">
                                                                <p className="font-bold">Mínimo 1 Banner Activo</p>
                                                                <p className="opacity-80 mt-1">El sistema requiere que siempre haya al menos una imagen activa para mostrar en el inicio.</p>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-6">
                                                            {formData.hero_slides_json?.map((slide, index) => (
                                                                <div key={slide.id} className={cn("border rounded-2xl p-4 transition-colors relative", slide.active ? "border-navy/10 bg-white shadow-sm" : "border-gray-200 bg-gray-50 opacity-80")}>
                                                                    <div className="flex justify-between items-start mb-4">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="bg-navy text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">{index + 1}</span>
                                                                            <span className="text-sm font-bold text-navy uppercase">Banner</span>
                                                                        </div>
                                                                        
                                                                        <div className="flex items-center gap-3">
                                                                             <button 
                                                                                type="button"
                                                                                onClick={() => toggleHeroSlideActive(slide.id, slide.active)}
                                                                                className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase transition-colors", slide.active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500")}
                                                                            >
                                                                                {slide.active ? 'Activo' : 'Inactivo'}
                                                                            </button>
                                                                            <button 
                                                                                type="button"
                                                                                onClick={() => removeHeroSlide(slide.id)}
                                                                                className="w-7 h-7 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"
                                                                                title="Eliminar Banner"
                                                                            >
                                                                                <Trash2 size={12} />
                                                                            </button>
                                                                        </div>
                                                                    </div>

                                                                    <div className="space-y-4">
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                        <div>
                                                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2 block mb-1">Título / Frase</label>
                                                                            <input 
                                                                                className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-2 text-sm font-bold text-navy placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                                                                value={slide.title}
                                                                                onChange={(e) => updateHeroSlideTitle(slide.id, e.target.value)}
                                                                                placeholder="Ej. NUEVA COLECCIÓN"
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2 block mb-1">Descripción</label>
                                                                            <input 
                                                                                className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-2 text-sm font-bold text-navy placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                                                                value={slide.description || ''}
                                                                                onChange={(e) => updateHeroSlideDescription(slide.id, e.target.value)}
                                                                                placeholder="Ej. Soluciones premium"
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                            {/* Desktop */}
                                                                            <div className="space-y-2">
                                                                                <div className="flex justify-between items-center">
                                                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Desktop (PC) - 16:9</label>
                                                                                    <label className="cursor-pointer text-primary hover:text-primary/70 text-[10px] font-black uppercase transition-colors">
                                                                                        Cambiar
                                                                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleHeroSlideImage(e, slide.id, 'portada_desktop')} />
                                                                                    </label>
                                                                                </div>
                                                                                <div className="aspect-[21/9] bg-gray-100 rounded-xl overflow-hidden border-2 border-dashed border-gray-200 relative group">
                                                                                    {slide.portada_desktop ? (
                                                                                        <img src={slide.portada_desktop} className="w-full h-full object-cover" />
                                                                                    ) : (
                                                                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 p-2">
                                                                                            <ImageIcon size={20} className="mb-2 opacity-50" />
                                                                                            <span className="text-[10px] font-bold text-center">Subir Imagen Ordenador</span>
                                                                                        </div>
                                                                                    )}
                                                                                    {!slide.portada_desktop && (
                                                                                        <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => handleHeroSlideImage(e, slide.id, 'portada_desktop')} />
                                                                                    )}
                                                                                </div>
                                                                            </div>

                                                                            {/* Movil */}
                                                                            <div className="space-y-2">
                                                                                <div className="flex justify-between items-center">
                                                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Móvil - Vertical</label>
                                                                                    <label className="cursor-pointer text-primary hover:text-primary/70 text-[10px] font-black uppercase transition-colors">
                                                                                        Cambiar
                                                                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleHeroSlideImage(e, slide.id, 'portada_movil')} />
                                                                                    </label>
                                                                                </div>
                                                                                <div className="aspect-[4/5] w-24 sm:w-32 bg-gray-100 rounded-xl overflow-hidden border-2 border-dashed border-gray-200 relative group">
                                                                                    {slide.portada_movil ? (
                                                                                        <img src={slide.portada_movil} className="w-full h-full object-cover" />
                                                                                    ) : (
                                                                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 p-2">
                                                                                            <ImageIcon size={20} className="mb-2 opacity-50" />
                                                                                            <span className="text-[9px] font-bold text-center leading-tight">Subir Imagen Móvil</span>
                                                                                        </div>
                                                                                    )}
                                                                                    {!slide.portada_movil && (
                                                                                        <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => handleHeroSlideImage(e, slide.id, 'portada_movil')} />
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {formData.hero_slides_json?.length < 10 && (
                                                            <button
                                                                type="button"
                                                                onClick={addHeroSlide}
                                                                className="w-full py-4 border-2 border-dashed border-primary/20 rounded-2xl flex items-center justify-center gap-2 text-primary hover:bg-primary/5 transition-colors font-bold uppercase tracking-wide text-xs"
                                                            >
                                                                <Plus size={16} /> Agregar Nuevo Banner Hero
                                                            </button>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* SECCIÓN 5: CATÁLOGO DE PRODUCTOS (VISIBLE SI EL PLAN ES CATALOG O SI SE PERMITE EXPLÍCITAMENTE) */}
                                     {(userData?.plan === 'catalog' || allowCatalog) && (
                                    <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
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
                                                    {!allowCatalog && userData?.plan !== 'catalog' && <p className="text-[9px] font-black text-navy/40 uppercase tracking-widest">Exclusivo Plan BIZ + CAT</p>}
                                                </div>
                                            </div>
                                            <ChevronDown size={20} className={cn("text-navy/30 transition-transform", activeSection === 'catalogo' && "rotate-180")} />
                                        </button>
                                        <AnimatePresence>
                                            {activeSection === 'catalogo' && (userData?.plan === 'catalog' || allowCatalog) && (
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
                                                                            onChange={(e) => { setProductCategoryFilter(e.target.value); productCategoryFilterRef.current = e.target.value; }}
                                                                            className="bg-gray-200 border border-gray-300 rounded-lg text-[10px] font-black uppercase py-2 px-3 outline-none text-navy focus:border-primary/60"
                                                                        >
                                                                            <option value="Todas">Todas las Categorías</option>
                                                                            {formData.catalogo_json.categories.map(c => (
                                                                                <option key={c} value={c}>{c}</option>
                                                                            ))}
                                                                        </select>
                                                                        <button 
                                                                            onClick={() => {
                                                                                const currentFilter = productCategoryFilterRef.current;
                                                                                const categories = formData.catalogo_json.categories;
                                                                                
                                                                                // Find the exact category string that matches the normalized filter
                                                                                const normalize = (s: string) => s.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                                                                                const targetNorm = normalize(currentFilter);
                                                                                
                                                                                let assignedCategory = '';
                                                                                if (currentFilter !== 'Todas') {
                                                                                    // Try to find the exact string from the list that matches the normalized filter
                                                                                    const exactMatch = categories.find(c => normalize(c) === targetNorm);
                                                                                    assignedCategory = exactMatch || currentFilter;
                                                                                } else {
                                                                                    assignedCategory = categories[0] || 'Sin Categoría';
                                                                                }

                                                                                const newProduct = {
                                                                                    id: `prod_${Date.now()}`,
                                                                                    name: 'Nuevo Producto',
                                                                                    description: 'Descripción aquí',
                                                                                    price: '0.00',
                                                                                    category: assignedCategory,
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
                                                                            className="bg-primary text-white py-2 px-4 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group"
                                                                            title={`Agregar a ${productCategoryFilter !== 'Todas' ? productCategoryFilter : 'la primera categoría'}`}
                                                                        >
                                                                            <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                                                                            <span className="text-[10px] font-black uppercase">
                                                                                {productCategoryFilter !== 'Todas' ? `Añadir a ${productCategoryFilter}` : 'Añadir Producto'}
                                                                            </span>
                                                                        </button>
                                                                    </div>

                                                                    {/* Lista de Productos */}
                                                                    <div className="space-y-4">
                                                                        {formData.catalogo_json.products
                                                                            .filter(p => !p.isHidden)
                                                                            .filter(p => {
                                                                                if (productCategoryFilter === 'Todas') return true;
                                                                                const normalize = (s: string) => s.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                                                                                const pCat = normalize(p.category || '');
                                                                                const filterCat = normalize(productCategoryFilter || '');
                                                                                return pCat === filterCat;
                                                                            })
                                                                            .map((prod, pIdx) => (
                                                                                <div key={prod.id || pIdx} className="bg-gray-50 p-4 rounded-2xl border border-gray-200 relative group animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                                                    <button 
                                                                                        onClick={() => {
                                                                                            if (confirm('¿Eliminar producto?')) {
                                                                                                const updatedProducts = formData.catalogo_json.products.filter(p => p.id !== prod.id);
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
                                                                                            {(prod.image || prod.url || prod.foto || prod.imagen) ? (
                                                                                                <img src={prod.image || prod.url || prod.foto || prod.imagen} className="w-full h-full object-cover" />
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
                                                                                                            const updatedProducts = formData.catalogo_json.products.map(p => p.id === prod.id ? { ...p, image: url } : p);
                                                                                                            setFormData({ ...formData, catalogo_json: { ...formData.catalogo_json, products: updatedProducts } });
                                                                                                        }
                                                                                                    }} 
                                                                                                />
                                                                                            </label>
                                                                                        </div>
                                                                                        <div className="space-y-2">
                                                                                            <input 
                                                                                                className="w-full bg-white border border-gray-300 rounded-lg p-2 text-sm font-black uppercase text-navy outline-none italic placeholder:text-navy/30 focus:border-primary/60 transition-all shadow-sm" 
                                                                                                value={prod.name} 
                                                                                                onChange={(e) => {
                                                                                                    const updatedProducts = formData.catalogo_json.products.map(p => p.id === prod.id ? { ...p, name: e.target.value } : p);
                                                                                                    setFormData({ ...formData, catalogo_json: { ...formData.catalogo_json, products: updatedProducts } });
                                                                                                }}
                                                                                                placeholder="Nombre Producto" 
                                                                                            />
                                                                                            
                                                                                            <div className="flex gap-2">
                                                                                                <div className="flex-1">
                                                                                                    <p className="text-[8px] font-black uppercase opacity-60 mb-1">Precio</p>
                                                                                                    <input 
                                                                                                        className="w-full bg-white border border-gray-300 rounded-lg p-2 text-xs font-black text-navy outline-none focus:border-primary/60 transition-all shadow-sm" 
                                                                                                        value={prod.price} 
                                                                                                        onChange={(e) => {
                                                                                                            const updatedProducts = formData.catalogo_json.products.map(p => p.id === prod.id ? { ...p, price: e.target.value } : p);
                                                                                                            setFormData({ ...formData, catalogo_json: { ...formData.catalogo_json, products: updatedProducts } });
                                                                                                        }}
                                                                                                        placeholder="0.00" 
                                                                                                    />
                                                                                                </div>
                                                                                                <div className="flex-[1.5]">
                                                                                                    <p className="text-[8px] font-black uppercase opacity-60 mb-1">Categoría</p>
                                                                                                    <select 
                                                                                                        className="w-full bg-white border border-gray-300 rounded-lg p-2 text-[10px] font-black uppercase text-navy outline-none focus:border-primary/60 transition-all shadow-sm"
                                                                                                        value={prod.category}
                                                                                                        onChange={(e) => {
                                                                                                            const updatedProducts = formData.catalogo_json.products.map(p => p.id === prod.id ? { ...p, category: e.target.value } : p);
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
                                                                                                className="w-full bg-white border border-gray-300 rounded-lg p-3 text-[10px] font-medium text-navy min-h-[60px] resize-none outline-none focus:border-primary/60 transition-all shadow-sm" 
                                                                                                value={prod.description} 
                                                                                                onChange={(e) => {
                                                                                                    const updatedProducts = formData.catalogo_json.products.map(p => p.id === prod.id ? { ...p, description: e.target.value } : p);
                                                                                                    setFormData({ ...formData, catalogo_json: { ...formData.catalogo_json, products: updatedProducts } });
                                                                                                }}
                                                                                                placeholder="Describe tu producto..." 
                                                                                            />
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                            {formData.catalogo_json.products.filter(p => {
                                                                                if (productCategoryFilter === 'Todas') return true;
                                                                                const norm = (s: string) => s.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                                                                                return norm(p.category || '') === norm(productCategoryFilter || '');
                                                                            }).length === 0 && (
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
                                )}
                                    {/* SECCIÓN: MÓDULO DE AUTORIDAD */}
                                    <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                        <button
                                            onClick={() => setActiveSection(activeSection === 'autoridad' ? null : 'autoridad')}
                                            className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-[#FF5C00]/10 flex items-center justify-center text-[#FF5C00] font-black italic uppercase text-xs">
                                                    AU
                                                </div>
                                                <span className="font-black text-navy uppercase text-sm tracking-tighter">Módulo de Autoridad</span>
                                            </div>
                                            <ChevronDown size={20} className={cn("text-navy/30 transition-transform", activeSection === 'autoridad' && "rotate-180")} />
                                        </button>
                                        <AnimatePresence>
                                            {activeSection === 'autoridad' && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden bg-white border-t border-gray-100"
                                                >
                                                    <div className="p-6 space-y-6">
                                                        {/* Toggle Activar/Desactivar */}
                                                        <div className="flex items-center justify-between p-4 bg-[#FF5C00]/5 rounded-xl border border-[#FF5C00]/20">
                                                            <div>
                                                                <p className="font-black text-navy text-sm uppercase tracking-tight">Activar Módulo</p>
                                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                                                                    Muestra la sección "Por qué elegirnos" en tu perfil
                                                                </p>
                                                            </div>
                                                            <button
                                                                onClick={() => updateAuthorityModule({ enabled: !authorityModule.enabled })}
                                                                className={cn(
                                                                    "w-12 h-6 rounded-full transition-colors relative",
                                                                    authorityModule.enabled ? "bg-[#FF5C00]" : "bg-gray-200"
                                                                )}
                                                            >
                                                                <div className={cn(
                                                                    "absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform",
                                                                    authorityModule.enabled ? "translate-x-7" : "translate-x-1"
                                                                )} />
                                                            </button>
                                                        </div>

                                                        {/* Campos de texto principales */}
                                                        <div className="space-y-4">
                                                            <div className="space-y-1">
                                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Badge / Etiqueta superior</label>
                                                                <input
                                                                    className="w-full border rounded-lg p-3 text-gray-900 text-sm font-bold bg-gray-50"
                                                                    value={authorityModule.badge}
                                                                    onChange={(e) => updateAuthorityModule({ badge: e.target.value })}
                                                                    placeholder="Ej. Garantía de Calidad"
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Título principal</label>
                                                                <input
                                                                    className="w-full border rounded-lg p-3 text-gray-900 text-sm font-bold bg-gray-50"
                                                                    value={authorityModule.title}
                                                                    onChange={(e) => updateAuthorityModule({ title: e.target.value })}
                                                                    placeholder="Ej. Por qué Elegirnos"
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Descripción</label>
                                                                <textarea
                                                                    className="w-full border rounded-lg p-3 text-gray-900 text-sm font-medium bg-gray-50"
                                                                    rows={3}
                                                                    value={authorityModule.description}
                                                                    onChange={(e) => updateAuthorityModule({ description: e.target.value })}
                                                                    placeholder="Describe por qué tus clientes deben elegirte..."
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Hitos / Stats máximo 4 */}
                                                        <div className="space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hitos / Estadísticas (máx. 4)</label>
                                                                {authorityModule.stats.length < 4 && (
                                                                    <button
                                                                        onClick={() => updateAuthorityModule({
                                                                            stats: [...authorityModule.stats, { label: 'Nuevo Hito', value: '0+' }]
                                                                        })}
                                                                        className="text-[10px] font-black text-[#FF5C00] uppercase tracking-widest flex items-center gap-1 hover:opacity-70"
                                                                    >
                                                                        <Plus size={12} /> Agregar
                                                                    </button>
                                                                )}
                                                            </div>
                                                            {authorityModule.stats.map((stat: any, i: number) => (
                                                                <div key={i} className="flex gap-2 items-center">
                                                                    <input
                                                                        className="flex-1 border rounded-lg p-2 text-gray-900 text-sm font-black bg-gray-50"
                                                                        value={stat.value}
                                                                        onChange={(e) => {
                                                                            const newStats = [...authorityModule.stats];
                                                                            newStats[i] = { ...newStats[i], value: e.target.value };
                                                                            updateAuthorityModule({ stats: newStats });
                                                                        }}
                                                                        placeholder="Ej. 10+"
                                                                    />
                                                                    <input
                                                                        className="flex-[2] border rounded-lg p-2 text-gray-900 text-sm font-medium bg-gray-50"
                                                                        value={stat.label}
                                                                        onChange={(e) => {
                                                                            const newStats = [...authorityModule.stats];
                                                                            newStats[i] = { ...newStats[i], label: e.target.value };
                                                                            updateAuthorityModule({ stats: newStats });
                                                                        }}
                                                                        placeholder="Ej. Experiencia"
                                                                    />
                                                                    <button
                                                                        onClick={() => updateAuthorityModule({
                                                                            stats: authorityModule.stats.filter((_: any, idx: number) => idx !== i)
                                                                        })}
                                                                        className="text-red-400 hover:text-red-600 p-2"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Métricas / Barras máximo 4 */}
                                                        <div className="space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Métricas / Barras % (máx. 4)</label>
                                                                {authorityModule.metrics.length < 4 && (
                                                                    <button
                                                                        onClick={() => updateAuthorityModule({
                                                                            metrics: [...authorityModule.metrics, { label: 'Nueva Métrica', value: '90' }]
                                                                        })}
                                                                        className="text-[10px] font-black text-[#FF5C00] uppercase tracking-widest flex items-center gap-1 hover:opacity-70"
                                                                    >
                                                                        <Plus size={12} /> Agregar
                                                                    </button>
                                                                )}
                                                            </div>
                                                            {authorityModule.metrics.map((metric: any, i: number) => (
                                                                <div key={i} className="flex gap-2 items-center">
                                                                    <input
                                                                        className="w-16 border rounded-lg p-2 text-gray-900 text-sm font-black bg-gray-50 text-center"
                                                                        value={metric.value}
                                                                        onChange={(e) => {
                                                                            const newMetrics = [...authorityModule.metrics];
                                                                            newMetrics[i] = { ...newMetrics[i], value: e.target.value };
                                                                            updateAuthorityModule({ metrics: newMetrics });
                                                                        }}
                                                                        placeholder="90"
                                                                    />
                                                                    <span className="text-[10px] font-black text-gray-400">%</span>
                                                                    <input
                                                                        className="flex-1 border rounded-lg p-2 text-gray-900 text-sm font-medium bg-gray-50"
                                                                        value={metric.label}
                                                                        onChange={(e) => {
                                                                            const newMetrics = [...authorityModule.metrics];
                                                                            newMetrics[i] = { ...newMetrics[i], label: e.target.value };
                                                                            updateAuthorityModule({ metrics: newMetrics });
                                                                        }}
                                                                        placeholder="Ej. Capacidad Operativa"
                                                                    />
                                                                    <button
                                                                        onClick={() => updateAuthorityModule({
                                                                            metrics: authorityModule.metrics.filter((_: any, idx: number) => idx !== i)
                                                                        })}
                                                                        className="text-red-400 hover:text-red-600 p-2"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            ))}
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
                        <div className="p-6 bg-white border-t flex justify-center gap-4 shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] relative z-[60]">
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
                                 {loading ? 'Guardando...' : (uploadingImage ? 'Procesando...' : 'Confirmar y Guardar')}
                             </button>
                        </div>
                    )}
                </motion.div>
            </div>
            )}
        </AnimatePresence>
    );
}
