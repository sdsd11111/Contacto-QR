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
    whatsapp?: string;
}

export default function CatalogGallery({ data, whatsapp }: CatalogGalleryProps) {
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
            <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[var(--theme-primary)] mb-2 flex items-center gap-2">
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
                                    ? "bg-[var(--theme-primary)] text-white shadow-lg shadow-[var(--theme-primary)]/30"
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
                            className="group relative aspect-square rounded-2xl md:rounded-[32px] overflow-hidden cursor-pointer border border-white/5 hover:border-[var(--theme-primary)]/50 shadow-lg hover:shadow-[var(--theme-primary)]/20"
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
                                    <p className="text-[var(--theme-primary)] font-black text-xs md:text-sm mt-1">
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
                            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-[var(--theme-primary)] text-white rounded-full transition-colors z-[101]"
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
                                        <div className="w-10 h-10 rounded-full bg-[var(--theme-primary)]/20 flex items-center justify-center text-[var(--theme-primary)]">
                                            <DollarSign size={20} />
                                        </div>
                                        <span className="text-xl md:text-2xl font-black text-[var(--theme-primary)]">{selectedItem.precio}</span>
                                    </div>
                                )}

                                {selectedItem.descripcion && (
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3 flex items-center gap-2">
                                            <Info size={12} /> DETALLES DEL PRODUCTO
                                        </h4>
                                        <div className="text-white/80 text-sm md:text-base leading-relaxed font-medium space-y-2 whitespace-pre-line">
                                            {selectedItem.descripcion}
                                        </div>
                                    </div>
                                )}

                                {whatsapp && (
                                    <div className="mt-10">
                                        <a
                                            href={`https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola, me interesa el producto: ${selectedItem.titulo}. Precio: ${selectedItem.precio || 'Consultar'}`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full bg-[#25D366] text-white py-4 rounded-2xl font-black text-sm md:text-base uppercase tracking-widest flex items-center justify-center gap-3 shadow-[0_10px_30px_-5px_rgba(37,211,102,0.4)] hover:scale-[1.02] active:scale-95 transition-all"
                                        >
                                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                                <path d="M19.057 4.298c-1.883-1.884-4.386-2.922-7.05-2.922-5.495 0-9.968 4.471-9.968 9.966 0 1.756.459 3.468 1.328 4.975l-1.41 5.148 5.266-1.381c1.455.794 3.09 1.211 4.78 1.212h.004c5.493 0 9.964-4.471 9.964-9.966 0-2.662-1.036-5.166-2.921-7.052zm-7.05 15.393h-.003c-1.488 0-2.946-.4-4.23-1.155l-.304-.18-3.146.825.839-3.067-.197-.314c-.829-1.321-1.267-2.854-1.267-4.43 0-4.43 3.605-8.036 8.04-8.036 2.148 0 4.167.837 5.684 2.355 1.517 1.518 2.352 3.538 2.352 5.686-.002 4.434-3.609 8.041-8.043 8.041zm4.412-6.03c-.242-.121-1.431-.707-1.652-.788-.221-.081-.383-.121-.544.121-.161.242-.625.787-.766.949-.141.161-.282.181-.524.061-.242-.121-1.02-.376-1.943-1.199-.718-.641-1.203-1.433-1.344-1.675-.141-.242-.015-.373.106-.493.109-.108.242-.282.363-.423.121-.141.161-.242.242-.403.081-.161.04-.303-.02-.424-.061-.121-.544-1.312-.746-1.796-.196-.472-.397-.407-.544-.415-.141-.007-.302-.008-.463-.008-.161 0-.423.061-.644.303-.221.242-.846.827-.846 2.018 0 1.191.866 2.336.987 2.5.121.164 1.706 2.605 4.133 3.651.577.249 1.027.397 1.378.508.579.185 1.107.158 1.523.096.465-.069 1.431-.585 1.632-1.15.201-.564.201-1.049.141-1.15-.06-.101-.221-.161-.463-.282z"/>
                                            </svg>
                                            Consultar por WhatsApp
                                        </a>
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
