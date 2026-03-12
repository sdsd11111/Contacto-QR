"use client";

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, Info, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming this exists based on VCardClient.tsx

export interface CatalogItem {
    id: string;
    categoria: string;
    titulo: string;
    url: string;
    descripcion: string;
    precio?: string;
}

interface CatalogGalleryProps {
    data: CatalogItem[] | { categories: string[], products: CatalogItem[] };
}

export default function CatalogGallery({ data }: CatalogGalleryProps) {
    const [activeCategory, setActiveCategory] = useState<string>('Todas');
    const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);

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
        if (customCategories && customCategories.length > 0) {
            return ['Todas', ...customCategories];
        }
        const cats = new Set(items.map(item => item.categoria));
        return ['Todas', ...Array.from(cats)].filter(Boolean);
    }, [items, customCategories]);

    // Filter items based on active category
    const filteredItems = useMemo(() => {
        if (activeCategory === 'Todas') return items;
        return items.filter(item => item.categoria === activeCategory);
    }, [items, activeCategory]);

    if (!items || items.length === 0) {
        return null;
    }

    return (
        <div className="w-full mt-16 pt-10 border-t border-white/10 flex flex-col gap-8">
            <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#f66739] mb-2 flex items-center gap-2">
                <ZoomIn size={14} /> CATÁLOGO INTERACTIVO
            </h4>

            {/* Category Filters */}
            {categories.length > 2 && ( // Only show filters if there's more than 1 category besides 'Todas'
                <div className="flex flex-wrap gap-2 mb-6">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={cn(
                                "px-5 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300",
                                activeCategory === cat
                                    ? "bg-[#f66739] text-white shadow-lg shadow-[#f66739]/30"
                                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}

            {/* Image Grid */}
            <motion.div 
                layout 
                className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6"
            >
                <AnimatePresence mode="popLayout">
                    {filteredItems.map((item) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.3 }}
                            className="group relative aspect-square rounded-2xl md:rounded-[32px] overflow-hidden cursor-pointer border border-white/5 hover:border-[#f66739]/50 shadow-lg hover:shadow-[#f66739]/20"
                            onClick={() => setSelectedItem(item)}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={item.url}
                                alt={item.titulo}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 md:p-6">
                                <h3 className="text-white font-black text-sm md:text-lg uppercase tracking-wide truncate">
                                    {item.titulo}
                                </h3>
                                {item.precio && (
                                    <p className="text-[#f66739] font-black text-xs md:text-sm mt-1">
                                        {item.precio}
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/90 backdrop-blur-xl"
                        onClick={() => setSelectedItem(null)}
                    >
                        {/* Close Button */}
                        <button 
                            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-[#f66739] text-white rounded-full transition-colors z-[101]"
                            onClick={(e) => { e.stopPropagation(); setSelectedItem(null); }}
                        >
                            <X size={24} />
                        </button>

                        <motion.div
                            initial={{ y: 50, scale: 0.95 }}
                            animate={{ y: 0, scale: 1 }}
                            exit={{ y: 20, scale: 0.95 }}
                            className="relative max-w-5xl w-full flex flex-col md:flex-row bg-[#111322] rounded-[32px] md:rounded-[48px] overflow-hidden border border-white/10 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Image Section */}
                            <div className="w-full md:w-3/5 bg-black/50 aspect-square md:aspect-auto flex items-center justify-center relative p-8">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={selectedItem.url}
                                    alt={selectedItem.titulo}
                                    className="max-w-full max-h-[70vh] object-contain rounded-2xl md:rounded-[32px] shadow-2xl"
                                />
                            </div>

                            {/* Details Section */}
                            <div className="w-full md:w-2/5 p-8 md:p-12 flex flex-col justify-center border-t md:border-t-0 md:border-l border-white/5 bg-gradient-to-br from-white/5 to-transparent">
                                <div className="inline-block px-3 py-1 mb-6 rounded-full bg-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest w-fit">
                                    {selectedItem.categoria}
                                </div>
                                
                                <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight mb-4">
                                    {selectedItem.titulo}
                                </h2>
                                
                                {selectedItem.precio && (
                                    <div className="flex items-center gap-2 mb-8">
                                        <div className="w-10 h-10 rounded-full bg-[#f66739]/20 flex items-center justify-center text-[#f66739]">
                                            <DollarSign size={20} />
                                        </div>
                                        <span className="text-xl md:text-2xl font-black text-[#f66739]">{selectedItem.precio}</span>
                                    </div>
                                )}

                                {selectedItem.descripcion && (
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3 flex items-center gap-2">
                                            <Info size={12} /> DESCRIPCIÓN
                                        </h4>
                                        <p className="text-white/70 text-sm md:text-base leading-relaxed font-medium">
                                            {selectedItem.descripcion}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
