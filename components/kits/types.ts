/**
 * components/kits/types.ts
 * Tipos compartidos para todos los Industry Kits.
 * Cada kit exporta secciones reutilizables que se inyectan en templates vía slots.
 */

// Un ítem individual del menú/servicio
export interface MenuItem {
    name: string;
    price: string;
    size?: string;
    desc?: string;
    image?: string;
}

// Una categoría del menú con sus ítems
export interface MenuCategory {
    name: string;
    items: MenuItem[];
}

// Props que recibe el componente MenuTabs
export interface MenuTabsProps {
    categories: MenuCategory[];
    /** Color de acento para resaltes (default: red-600) */
    accentColor?: string;
    /** Texto del CTA final */
    ctaText?: string;
    /** Callback del CTA final */
    onCtaClick?: () => void;
    /** Título de la sección */
    title?: string;
}

// Props para el kit de servicios genérico
export interface ServicesGridProps {
    services: { name: string; description?: string; price?: string; icon?: string }[];
    columns?: 2 | 3;
    accentColor?: string;
}

// Props para el kit de galería
export interface GallerySectionProps {
    images: { src: string; alt: string; caption?: string }[];
    title?: string;
    accentColor?: string;
}
