"use client";

import React, { useState, useMemo } from 'react';
import HedkandiTemplate from '@/components/templates/HedkandiTemplate';
import CarroceriasTemplate from '@/components/templates/CarroceriasTemplate';
import IndustrialTemplate from '@/components/templates/IndustrialTemplate';
import { MenuTabs } from '@/components/kits';
import type { HedkandiTemplateProps, ExperienceImage } from '@/components/templates/types';
import type { MenuCategory } from '@/components/kits/types';

// ─── Tipos del Builder ───

export type TemplateId = 'hedkandi' | 'carrocerias' | 'industrial';

export interface KitConfig {
    /** ID del kit a usar */
    id: 'restaurant' | 'services' | 'gallery' | 'none';
    /** Props específicas del kit */
    props?: Record<string, any>;
}

export interface DemoBuilderProps {
    template: TemplateId;
    data: Record<string, any>;
    kit?: KitConfig;
    /** Slides del hero (opcional, usa data.portada_* si no se pasa) */
    slides?: HedkandiTemplateProps['activeSlides'];
    /** Imágenes personalizadas para la grilla de experiencia */
    experienceImages?: ExperienceImage[];
    /** Texto del botón SAVE CONTACT */
    heroCtaText?: string;
    /** URL del VCF para descargar */
    vcfUrl?: string;
    /** Callback del botón Save Contact */
    onSaveContact?: () => void;
}

// ─── Valores por defecto ───

const DEFAULT_SLIDES = [
    { id: '1', title: 'PREMIUM', description: 'EXPERIENCIA DIGITAL', portada_desktop: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=1920&auto=format&fit=crop', portada_movil: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=800&auto=format&fit=crop', active: true },
];

// ─── COMPONENTE ───

export default function DemoBuilder({
    template,
    data,
    kit = { id: 'none' },
    slides,
    experienceImages,
    vcfUrl,
    onSaveContact,
}: DemoBuilderProps) {
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

    const activeSlides = slides || (data.portada_desktop || data.portada_movil
        ? [{ id: '1', title: data.nombre_negocio, description: data.profesion, portada_desktop: data.portada_desktop, portada_movil: data.portada_movil, active: true }]
        : DEFAULT_SLIDES);

    // ── Construir props base del template ──
    const templateProps = useMemo(() => ({
        data,
        slug: data.slug || 'demo',
        extractedBg: data.extracted_bg || '#1A1A1A',
        themePrimary: data.theme_primary || '#1A1A1A',
        themeTextOnPrimary: data.theme_text_on_primary || '#FFFFFF',
        setIsEditModalOpen: () => {},
        setIsLightboxOpen: () => {},
        handleHeroClick: () => {},
        downloadVCF: onSaveContact || (() => {
            if (vcfUrl) {
                const link = document.createElement('a');
                link.href = vcfUrl;
                link.download = `${data.nombre_negocio || 'contacto'}.vcf`;
                link.click();
            }
        }),
        isPlaceholderUrl: (url: string | null | undefined) => !url || url.includes('placeholder'),
        activeSlides,
        currentSlideIndex,
        setCurrentSlideIndex,
        experienceImages,
    }), [data, activeSlides, currentSlideIndex, experienceImages, vcfUrl, onSaveContact]);

    // ── Construir slots según el kit ──
    const slots = useMemo(() => {
        const result: Partial<HedkandiTemplateProps> = {};

        if (kit.id === 'restaurant' && kit.props?.menuCategories) {
            const categories: MenuCategory[] = kit.props.menuCategories;
            result.afterExperienceSlot = (
                <MenuTabs
                    categories={categories}
                    accentColor={kit.props.accentColor || '#dc2626'}
                    title={kit.props.menuTitle || 'NUESTRA CARTA'}
                    ctaText={kit.props.menuCtaText}
                    onCtaClick={templateProps.downloadVCF}
                />
            );
        }

        return result;
    }, [kit, templateProps.downloadVCF]);

    // ── Renderizar template según tipo ──
    if (template === 'carrocerias') {
        return <CarroceriasTemplate data={data} />;
    }

    if (template === 'industrial') {
        return <IndustrialTemplate data={data} />;
    }

    // Default: Hedkandi
    return <HedkandiTemplate {...templateProps} {...slots} />;
}
