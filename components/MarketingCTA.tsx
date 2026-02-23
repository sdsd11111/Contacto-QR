"use client";

import { ArrowRight, Star } from "lucide-react";
import Link from "next/link";

interface MarketingCTAProps {
    title?: string;
    description?: string;
}

export default function MarketingCTA({ title, description }: MarketingCTAProps) {
    return (
        <div className="my-14 relative bg-navy/5 border border-primary/20 rounded-[2.5rem] p-10 md:p-14 overflow-hidden group shadow-lg text-center">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none transform rotate-12 group-hover:rotate-45 transition-transform duration-700">
                <Star size={120} fill="currentColor" className="text-primary" />
            </div>

            <div className="flex flex-col items-center justify-center gap-6 relative z-10 max-w-2xl mx-auto">
                <h3 className="text-3xl md:text-4xl font-black text-navy leading-tight tracking-tight">
                    {title || "¿Listo para destacar?"}
                </h3>

                <p className="text-navy/80 text-lg font-medium leading-relaxed">
                    {description || "Deja de perder oportunidades de venta. Convierte cada interacción en un contacto real guardado con tu foto en el celular de tu cliente."}
                </p>

                <div className="mt-4 w-full sm:w-auto">
                    <Link href="/registro" className="inline-flex flex-col sm:flex-row items-center justify-center gap-3 bg-primary text-white px-10 py-5 rounded-full font-black uppercase tracking-widest shadow-primary hover:scale-105 transition-transform w-full">
                        <span>Crear Mi Contacto</span> <ArrowRight size={20} className="hidden sm:inline-block" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
