"use client";

import { useEffect, useState, useCallback } from "react";
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

    // ─── Construir slots para Hedkandi Template ────────────────────────────
    const buildHedkandiSlots = (): Partial<HedkandiTemplateProps> => {
        const slots: Partial<HedkandiTemplateProps> = {};

        // ── Menu Digital: si es JSON estructurado → MenuTabs; si es URL → link ──
        if (data?.menu_digital) {
            const parsed = safeParse<MenuCategory[] | null>(data.menu_digital, null);
            if (parsed && Array.isArray(parsed) && parsed.length > 0) {
                // Es un menú estructurado (categorías + ítems)
                slots.afterExperienceSlot = (
                    <MenuTabs
                        categories={parsed}
                        accentColor="#dc2626"
                        title="NUESTRA CARTA"
                        ctaText="ORDENAR POR WHATSAPP"
                        onCtaClick={() => window.open(data.whatsapp ? `https://wa.me/${data.whatsapp.replace(/\D/g, '')}` : '#', '_blank')}
                    />
                );
            } else if (typeof data.menu_digital === 'string' && (data.menu_digital.startsWith('http://') || data.menu_digital.startsWith('https://'))) {
                // Es una URL → botón de acceso al menú
                slots.beforeMarqueeSlot = (
                    <section className="bg-white py-16 px-4 text-center">
                        <a
                            href={data.menu_digital}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-red-600 text-white px-12 py-5 font-display-condensed text-2xl tracking-widest uppercase hover:bg-black transition-colors"
                            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                        >
                            VER MENÚ DIGITAL
                        </a>
                    </section>
                );
            }
        }

        return slots;
    };

    // ─── Selección de plantilla ───────────────────────────────────────────────
    const renderTemplate = () => {
        switch (data.template_id) {
            case 'showcase':
            case 'hedkandi':
                return <HedkandiTemplate {...baseProps} {...buildHedkandiSlots()} />;
            case 'luxury':
            case 'luxury_minimal':
            case 'minimal':
                return <MinimalTemplate {...baseProps} />;
            case 'industrial':
                return <IndustrialTemplate {...baseProps} />;
            case 'carrocerias':
                return <CarroceriasTemplate {...baseProps} />;
            // Templates externos (auditoría / sites existentes)
            case 'nexus-logistics':
            case 'grand-horizon':
            case 'elite-taxi':
                return <ClassicTemplate {...classicProps} />;
            case 'classic':
            default:
                return <ClassicTemplate {...classicProps} />;
        }
    };

    return (
        <div className="relative">
            {renderTemplate()}
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
