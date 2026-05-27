"use client";

import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, Info, DollarSign, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CatalogItem {
    id: string;
    category?: string;
    categoria?: string;
    name?: string;
    titulo?: string;
    image?: string;
    images?: string[]; // Array de imágenes para el carrusel
    url?: string;
    description?: string;
    descripcion?: string;
    price?: string;
    precio?: string;
    foto?: string;
    imagen?: string;
}

interface CatalogProGalleryProps {
    data: CatalogItem[] | { categories: string[], products: CatalogItem[] };
    whatsapp?: string;
    onLightboxToggle?: (isOpen: boolean) => void;
    themeColor?: string; // Para adaptar el color principal al de la plantilla
}

export default function CatalogProGallery({ data, whatsapp, onLightboxToggle, themeColor = "var(--theme-primary)" }: CatalogProGalleryProps) {
    const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const handleOpenItem = (item: CatalogItem) => {
        setSelectedItem(item);
        setCurrentImageIndex(0);
        if (onLightboxToggle) onLightboxToggle(true);
    };

    const handleCloseItem = () => {
        setSelectedItem(null);
        if (onLightboxToggle) onLightboxToggle(false);
    };

    // Normalize data
    const items = useMemo(() => {
        if (Array.isArray(data)) return data;
        return data?.products || [];
    }, [data]);

    const customCategories = useMemo(() => {
        if (Array.isArray(data)) return null;
        return data?.categories || null;
    }, [data]);

    // Extract categories
    const categories = useMemo(() => {
        const cats = Array.from(new Set(items.map(item => item.category || item.categoria))).filter(Boolean) as string[];
        if (customCategories && customCategories.length > 0) {
            return customCategories.filter(c => c !== 'Nueva Categoría');
        }
        return cats;
    }, [items, customCategories]);

    const [activeCategory, setActiveCategory] = useState<string>('');

    // Leer categoría inicial desde URL (?cat=) solo UNA VEZ al cargar
    const urlCatApplied = useRef(false);
    useEffect(() => {
        if (urlCatApplied.current || categories.length === 0) return;
        const urlCat = new URLSearchParams(window.location.search).get('cat');
        if (urlCat) {
            const match = categories.find(c => c.toLowerCase() === urlCat.toLowerCase());
            if (match) { setActiveCategory(match); urlCatApplied.current = true; return; }
        }
        setActiveCategory(categories[0]);
        urlCatApplied.current = true;
    }, [categories]);

    // Filter items based on active category
    const filteredItems = useMemo(() => {
        if (!activeCategory) return items;
        return items.filter(item => (item.category || item.categoria) === activeCategory);
    }, [items, activeCategory]);

    if (!items || items.length === 0) {
        return null;
    }

    // Placeholder SVG inline (no depende de servicios externos)
    const PLACEHOLDER_SVG = 'data:image/svg+xml,' + encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
            <rect fill="#1a1d33" width="600" height="600"/>
            <g transform="translate(300,260)" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2">
                <rect x="-40" y="-30" width="80" height="60" rx="4"/>
                <circle cx="-10" cy="-10" r="6"/>
                <circle cx="10" cy="-10" r="6"/>
                <path d="M-25,15 L-10,0 L0,12 L10,0 L25,15"/>
            </g>
            <text x="300" y="330" text-anchor="middle" fill="rgba(255,255,255,0.2)" font-family="sans-serif" font-size="14" font-weight="bold">Sin imagen</text>
        </svg>`
    );

    // Helper to get all images for an item
    const getItemImages = (item: CatalogItem) => {
        if (item.images && item.images.length > 0) return item.images;
        const mainImg = item.image || item.url || item.foto || item.imagen;
        return mainImg ? [mainImg] : [PLACEHOLDER_SVG];
    };

    return (
        <div className="w-full flex flex-col gap-8">
            {/* Naluz-style Sticky Category Tabs */}
            {categories.length > 1 && (
                <div className="sticky top-20 z-40 bg-[#F5F7FA]/90 backdrop-blur-md py-4 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-gray-200">
                    <div className="flex gap-6 overflow-x-auto pb-2 scrollbar-hide snap-x">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={cn(
                                    "whitespace-nowrap pb-2 text-sm md:text-base font-bold uppercase tracking-wider transition-all relative snap-start touch-manipulation cursor-pointer select-none",
                                    activeCategory === cat
                                        ? "text-navy"
                                        : "text-gray-400 hover:text-navy/70"
                                )}
                            >
                                {cat}
                                {activeCategory === cat && (
                                    <motion.div
                                        layoutId="activeCategory"
                                        className="absolute -bottom-[1px] left-0 right-0 h-1 rounded-t-full"
                                        style={{ backgroundColor: themeColor }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Product Grid */}
            <motion.div 
                layout 
                className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8 mt-4"
            >
                <AnimatePresence mode="popLayout">
                    {filteredItems.map((item) => {
                        const images = getItemImages(item);
                        const mainImage = images[0];
                        
                        return (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.4 }}
                                className="group bg-white rounded-2xl md:rounded-[32px] overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-2xl hover:shadow-navy/5 cursor-pointer flex flex-col transition-all duration-300"
                                onClick={() => handleOpenItem(item)}
                            >
                                {/* Image Container */}
                                <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-50">
                                    <img
                                        src={mainImage}
                                        alt={item.name || item.titulo}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    {/* Action Overlay */}
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="bg-white text-navy px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                            <ZoomIn size={14} /> Ver Detalles
                                        </div>
                                    </div>
                                    
                                    {/* Multi-image indicator */}
                                    {images.length > 1 && (
                                        <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md">
                                            {images.length} Fotos
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-4 md:p-6 flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-bold text-navy text-sm md:text-base leading-tight mb-2 line-clamp-2">
                                            {item.name || item.titulo}
                                        </h3>
                                    </div>
                                    {(item.price || item.precio) && (
                                        <p className="font-black text-lg mt-2" style={{ color: themeColor }}>
                                            {item.price || item.precio}
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
            </motion.div>

            {/* Showcase Modal */}
            <AnimatePresence>
                {selectedItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 bg-black/50 backdrop-blur-sm"
                        onClick={handleCloseItem}
                    >
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                            className="relative w-full h-full md:h-auto md:max-h-[90vh] md:max-w-6xl bg-white md:rounded-[2rem] overflow-hidden flex flex-col md:flex-row shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <button 
                                className="absolute top-4 right-4 z-50 p-2 bg-black/10 hover:bg-black/20 text-navy rounded-full transition-colors"
                                onClick={handleCloseItem}
                            >
                                <X size={24} />
                            </button>

                            {/* Image Showcase (Left) */}
                            <div className="w-full md:w-3/5 bg-gray-50 relative flex items-center justify-center h-[50vh] md:h-[90vh]">
                                {(() => {
                                    const images = getItemImages(selectedItem);
                                    return (
                                        <>
                                            <AnimatePresence mode="wait">
                                                <motion.img
                                                    key={currentImageIndex}
                                                    src={images[currentImageIndex]}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="max-w-full max-h-full object-contain"
                                                />
                                            </AnimatePresence>

                                            {images.length > 1 && (
                                                <>
                                                    <button 
                                                        onClick={() => setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
                                                        className="absolute left-4 p-3 bg-white/80 hover:bg-white text-navy rounded-full shadow-lg transition-colors backdrop-blur-sm"
                                                    >
                                                        <ChevronLeft size={24} />
                                                    </button>
                                                    <button 
                                                        onClick={() => setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
                                                        className="absolute right-4 p-3 bg-white/80 hover:bg-white text-navy rounded-full shadow-lg transition-colors backdrop-blur-sm"
                                                    >
                                                        <ChevronRight size={24} />
                                                    </button>
                                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/20 backdrop-blur-md px-3 py-2 rounded-full">
                                                        {images.map((_, i) => (
                                                            <button 
                                                                key={i}
                                                                onClick={() => setCurrentImageIndex(i)}
                                                                className={cn(
                                                                    "w-2 h-2 rounded-full transition-all",
                                                                    i === currentImageIndex ? "bg-white w-4" : "bg-white/50"
                                                                )}
                                                            />
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>

                            {/* Details (Right) */}
                            <div className="w-full md:w-2/5 p-6 md:p-12 flex flex-col h-[50vh] md:h-auto overflow-y-auto">
                                <div className="mb-8">
                                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-500 text-xs font-bold uppercase tracking-wider rounded-md mb-4">
                                        {selectedItem.category || selectedItem.categoria}
                                    </span>
                                    <h2 className="text-3xl md:text-4xl font-black text-navy leading-tight mb-4">
                                        {selectedItem.name || selectedItem.titulo}
                                    </h2>
                                    {(selectedItem.price || selectedItem.precio) && (
                                        <div className="text-3xl font-black" style={{ color: themeColor }}>
                                            {selectedItem.price || selectedItem.precio}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
                                        <Info size={16} /> Descripción
                                    </h4>
                                    <div className="text-gray-600 leading-relaxed whitespace-pre-line text-sm md:text-base">
                                        {selectedItem.description || selectedItem.descripcion || "Sin descripción disponible."}
                                    </div>
                                </div>

                                {/* Action Bottom */}
                                <div className="mt-8 pt-8 border-t border-gray-100">
                                    {whatsapp ? (
                                        <a
                                            href={`https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola, me interesa el producto: ${selectedItem.name || selectedItem.titulo}.`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full flex items-center justify-center gap-3 py-4 rounded-xl text-white font-black uppercase tracking-widest transition-transform hover:scale-[1.02] active:scale-95 shadow-lg"
                                            style={{ backgroundColor: themeColor }}
                                        >
                                            <MessageCircle size={20} /> Solicitar Info
                                        </a>
                                    ) : (
                                        <div className="text-center text-sm text-gray-400 italic">
                                            Contacto no disponible
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
