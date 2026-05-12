import React from 'react';
import { X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TemplatePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    templateId: string;
    templateName: string;
}

export const TEMPLATE_DEMOS: Record<string, string> = {
    'classic': '/demo/classic',
    'hedkandi': '/demo/hedkandi-hype',
    'showcase': '/demo/chifa-tianjin',
    'industrial': '/demo/industrial',
    'carrocerias': '/demo/carrocerias',
    'nexus-logistics': '/demo/logistica',
    'grand-horizon': '/demo/hotel',
    'elite-taxi': '/demo/taxis'
};

export default function TemplatePreviewModal({ isOpen, onClose, templateId, templateName }: TemplatePreviewModalProps) {
    const [isLoading, setIsLoading] = React.useState(true);
    const demoUrl = TEMPLATE_DEMOS[templateId] || '/hedkandi-hype';

    // Reset loading state when template changes
    React.useEffect(() => {
        setIsLoading(true);
    }, [templateId]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-navy/80 backdrop-blur-md"
                    />
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg h-[80vh] bg-white border border-black/5 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-8 py-6 border-b border-black/5">
                            <div>
                                <h3 className="text-2xl font-black text-navy uppercase italic tracking-tighter leading-none">Vista Previa</h3>
                                <p className="text-[10px] font-bold text-navy/40 uppercase tracking-widest mt-1">{templateName}</p>
                            </div>
                            <button 
                                onClick={onClose}
                                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-navy/40 hover:bg-gray-200 hover:text-navy transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 relative bg-gray-50 p-4 overflow-hidden">
                            <div className="w-full h-full rounded-[2rem] overflow-hidden bg-white shadow-xl relative border border-black/5 mx-auto max-w-[375px] aspect-[9/19.5]">
                                {isLoading && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/80 backdrop-blur-sm z-10">
                                        <Loader2 className="animate-spin text-primary" size={40} />
                                        <p className="text-[10px] font-black text-navy/40 uppercase tracking-widest">Cargando Experiencia...</p>
                                    </div>
                                )}
                                <div 
                                    style={{
                                        width: '375px',
                                        height: '812px', // iPhone X standard height
                                        transform: 'scale(var(--preview-scale, 1))',
                                        transformOrigin: 'top center',
                                    }}
                                    className="absolute top-0 left-1/2 -translate-x-1/2"
                                    ref={(el) => {
                                        if (el) {
                                            const parent = el.parentElement;
                                            if (parent) {
                                                const scale = parent.offsetWidth / 375;
                                                el.style.setProperty('--preview-scale', String(scale));
                                            }
                                        }
                                    }}
                                >
                                    <iframe 
                                        src={demoUrl}
                                        className="w-full h-full border-none"
                                        onLoad={() => setIsLoading(false)}
                                        title={`Demo ${templateName}`}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer / CTA */}
                        <div className="px-8 py-6 bg-gray-50 border-t border-black/5 flex items-center justify-between">
                            <p className="text-[10px] font-bold text-navy/40 uppercase leading-tight max-w-[200px]">
                                Estás viendo una versión de demostración. Los colores se adaptarán a tu marca.
                            </p>
                            <button
                                onClick={onClose}
                                className="bg-primary text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                Seleccionar este Estilo
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
