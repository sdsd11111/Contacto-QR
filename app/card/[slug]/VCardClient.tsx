"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";

import VCardEditModal from '@/components/card/VCardEditModal';
import ClassicTemplate from "@/components/templates/ClassicTemplate";
import MinimalTemplate from "@/components/templates/MinimalTemplate";
import HedkandiTemplate from "@/components/templates/HedkandiTemplate";
import IndustrialTemplate from "@/components/templates/IndustrialTemplate";
import CarroceriasTemplate from "@/components/templates/CarroceriasTemplate";
import { MenuTabs } from "@/components/kits";
import { safeParse } from "@/lib/jsonUtils";
import { getYouTubeID, getTikTokID } from "@/lib/videoUtils";
import type { ClassicTemplateProps, MinimalTemplateProps, HedkandiTemplateProps } from "@/components/templates/types";
import type { MenuCategory } from "@/components/kits/types";

// ─── Utilidades de módulo ────────────────────────────────────────────────────

const isPlaceholderUrl = (url: string | null | undefined): boolean => {
    if (!url) return true;
    if (url.startsWith('data:image')) return false;
    const PLACEHOLDERS = [
        'photo.com', 'example.com', 'placeholder.com', 'placehold.co',
        'placeholder.supabase.co', 'supabase.co/storage',
        '_default.png', 'hero_desktop_default', 'hero_mobile_default'
    ];
    return PLACEHOLDERS.some(p => url.toLowerCase().includes(p));
};

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface VCardClientProps {
    showCatalog?: boolean;
}

// ─── Componente ──────────────────────────────────────────────────────────────

export default function VCardClient({ showCatalog = false }: VCardClientProps) {
    const { slug } = useParams();

    // Data
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // UI States — Classic template
    const [isAccordionOpen, setIsAccordionOpen] = useState(false);
    const [wifiStep, setWifiStep] = useState(1);
    const [isProductsExpanded, setIsProductsExpanded] = useState(false);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [isFooterVisible, setIsFooterVisible] = useState(false);

    // UI States — Shared
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [setupSection, setSetupSection] = useState<'perfil' | 'contacto' | 'hero' | 'portada' | 'catalogo'>('perfil');
    const [isSetupMode, setIsSetupMode] = useState(false);

    // ─── Query Param detection ───────────────────────────────────────────────
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            if (params.get('edit') === 'true') {
                setIsEditModalOpen(true);
            }
        }
    }, []);

    // Theme Colors
    const [extractedBg, setExtractedBg] = useState<string>('#001549');
    const [themePrimary, setThemePrimary] = useState<string>('#f66739');
    const [themeTextOnPrimary, setThemeTextOnPrimary] = useState<string>('#ffffff');

    // ─── Data Fetching ────────────────────────────────────────────────────────
    useEffect(() => {
        if (!slug) return;
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/profile/${slug}`);
                if (res.ok) {
                    const result = await res.json();
                    setData(result); // API devuelve el objeto directamente, sin wrapper {data:}
                }
            } catch (err) {
                console.error("[VCardClient] Error fetching card data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [slug]);

    // ─── Color Extraction ─────────────────────────────────────────────────────
    useEffect(() => {
        if (!data?.foto_url) return;

        const isActivaQR =
            (typeof slug === 'string' && slug.includes('activaqr')) ||
            data?.nombre_negocio?.toLowerCase().includes('activaqr');

        if (isActivaQR) {
            setExtractedBg('#001549');
            setThemePrimary('#f66739');
            setThemeTextOnPrimary('#ffffff');
            return;
        }

        import('node-vibrant/browser').then((module: any) => {
            const Vibrant = module.Vibrant || module.default || module;
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.src = data.foto_url;
            img.onload = () => {
                try {
                    const v = new Vibrant(img, { colorCount: 64, quality: 3 });
                    v.getPalette().then((palette: any) => {
                        if (palette?.DarkVibrant) setExtractedBg(palette.DarkVibrant.hex);
                        else if (palette?.DarkMuted) setExtractedBg(palette.DarkMuted.hex);

                        if (palette?.Vibrant) {
                            setThemePrimary(palette.Vibrant.hex);
                            setThemeTextOnPrimary(palette.Vibrant.titleTextColor ?? '#ffffff');
                        } else if (palette?.LightVibrant) {
                            setThemePrimary(palette.LightVibrant.hex);
                            setThemeTextOnPrimary(palette.LightVibrant.titleTextColor ?? '#000000');
                        }
                    });
                } catch (e) {
                    console.warn("[VCardClient] Vibrant extraction error:", e);
                }
            };
        }).catch(err => console.warn("[VCardClient] Could not load node-vibrant:", err));
    }, [data?.foto_url, slug, data?.nombre_negocio]);

    // ─── Acciones ─────────────────────────────────────────────────────────────
    const downloadVCF = useCallback(() => {
        if (!data) return;
        const vcfContent = [
            'BEGIN:VCARD',
            'VERSION:3.0',
            `FN:${data.nombres ?? ''} ${data.apellidos ?? ''}`.trim(),
            `ORG:${data.nombre_negocio || data.company || ''}`,
            `TITLE:${data.profession || ''}`,
            `TEL;TYPE=CELL,VOICE:${data.whatsapp || ''}`,
            `EMAIL:${data.email || ''}`,
            `URL:${data.web || ''}`,
            `ADR;TYPE=WORK:;;${data.address || ''};;;;`,
            `NOTE:${data.bio || ''}`,
            'END:VCARD'
        ].join('\n');

        const blob = new Blob([vcfContent], { type: 'text/vcard' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${data.nombres}_${data.apellidos}.vcf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url); // Evita memory leak
    }, [data]);

    const handleHeroClick = useCallback(() => {
        if (!data) return;
        if (data.hero_action === 'wifi') {
            setIsAccordionOpen(true);
            setTimeout(() => {
                document.getElementById('oferta-hero')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        } else if (data.hero_action === 'file' && data.hero_file_url) {
            window.open(data.hero_file_url, '_blank');
        } else if (data.hero_action === 'link' && data.hero_external_link) {
            window.open(data.hero_external_link, '_blank');
        }
    }, [data]);

    // ─── Loading / Error States ───────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen bg-[#001549] flex flex-col items-center justify-center p-4">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full mb-4"
                />
                <p className="text-white/40 font-black uppercase tracking-[0.2em] text-[10px]">Cargando Experiencia...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-[#001549] flex items-center justify-center">
                <p className="text-white/40 font-black uppercase tracking-widest text-sm">Perfil no encontrado</p>
            </div>
        );
    }

    // ─── Preparar datos para las plantillas ───────────────────────────────────
    const rawSlides = safeParse<any[]>(data.hero_slides_json, []);
    const activeSlides = rawSlides.filter((s: any) => s.active);

    // Props base compartidos por TODOS los templates
    const baseProps: MinimalTemplateProps = {
        data,
        slug: slug as string,
        extractedBg,
        themePrimary,
        themeTextOnPrimary,
        setIsEditModalOpen,
        setIsLightboxOpen,
        handleHeroClick,
        downloadVCF,
        isPlaceholderUrl,
        activeSlides,
        currentSlideIndex,
        setCurrentSlideIndex,
    };

    // Props extendidos para Classic (que usa carousel, wifi, etc.)
    const classicProps: ClassicTemplateProps = {
        ...baseProps,
        activeSlides,
        currentSlideIndex,
        setCurrentSlideIndex,
        isAccordionOpen,
        setIsAccordionOpen,
        wifiStep,
        setWifiStep,
        isProductsExpanded,
        setIsProductsExpanded,
        setIsFooterVisible,
        showCatalog,
        getYouTubeID,
        getTikTokID,
    };

    // ─── Menú Digital: parsear una sola vez ───────────────────────────────────────────
    const menuCategories = safeParse<any[] | null>(data.menu_digital, null);
    const hasMenu = Array.isArray(menuCategories) && menuCategories.length > 0;

    const menuNode = hasMenu ? (
        <MenuTabs
            categories={menuCategories!}
            accentColor="#dc2626"
            title="NUESTRA CARTA"
            ctaText="ORDENAR POR WHATSAPP"
            onCtaClick={() => window.open(
                data.whatsapp ? `https://wa.me/${data.whatsapp.replace(/\D/g, '')}` : '#',
                '_blank'
            )}
        />
    ) : null;

    // ─── Selección de plantilla ───────────────────────────────────────────────
    const renderTemplate = () => {
        // Extraer overrides (VIP Protocol)
        const overrides = safeParse<any>(data.json_override, {});

        switch (data.template_id) {
            case 'showcase':
            case 'hedkandi':
                // overrides BEFORE slot so the menu slot always wins
                return <HedkandiTemplate {...baseProps} {...overrides} afterExperienceSlot={menuNode} />;
            case 'luxury':
            case 'luxury_minimal':
            case 'minimal':
                return <MinimalTemplate {...baseProps} {...overrides} />;
            case 'industrial':
                return <IndustrialTemplate {...baseProps} {...overrides} />;
            case 'carrocerias':
                return <CarroceriasTemplate {...baseProps} {...overrides} />;
            // Templates externos (auditoría / sites existentes)
            case 'nexus-logistics':
            case 'grand-horizon':
            case 'elite-taxi':
                return <ClassicTemplate {...classicProps} {...overrides} />;
            case 'classic':
            default:
                return <ClassicTemplate {...classicProps} {...overrides} />;
        }
    };

    return (
        <div className="relative">
            {renderTemplate()}

            {/* Menú Digital directo: para templates que NO son Hedkandi */}
            {data?.template_id !== 'hedkandi' && data?.template_id !== 'showcase' && menuNode}

            {/* Botón flotante de edición sutil */}
            <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.4, scale: 1 }}
                whileHover={{ opacity: 1, scale: 1.1 }}
                onClick={() => setIsEditModalOpen(true)}
                className="fixed bottom-6 right-6 z-[9999] bg-black/20 backdrop-blur-md border border-white/10 p-3 rounded-full text-white/50 hover:text-white hover:bg-black/50 transition-all shadow-xl"
                title="Editar Perfil"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
            </motion.button>

            <VCardEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                initialSlug={slug as string}
                allowCatalog={showCatalog}
                initialSection={setupSection}
                isSetup={isSetupMode}
            />
        </div>
    );
}
