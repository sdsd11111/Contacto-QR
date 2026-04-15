"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');
    const isCatalog = false; // Disable hiding on catalog as per user request

    return (
        <footer className="py-24 bg-navy relative overflow-hidden">
            <div className="max-w-6xl mx-auto px-6 relative z-10">
                <div className="flex flex-col items-center">
                    <img 
                        src="/images/logo_header.png" 
                        alt="ActivaQR" 
                        className="h-12 w-auto mb-8 grayscale invert opacity-50"
                    />
                    
                    <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 mb-12">
                        <Link href="/blog" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-primary transition-colors italic">Ver Blog</Link>
                        <Link href="/contacto-digital" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-primary transition-colors">Contacto Digital</Link>
                        <Link href="/diagnostico" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-primary transition-colors">Diagnóstico</Link>
                        <Link href="/ventas" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:text-white transition-colors">Ventas Directas</Link>
                    </div>

                    <div className="w-full h-px bg-white/5 mb-12"></div>

                    <div className="flex flex-col md:flex-row items-center justify-between w-full gap-8">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
                            © 2026 · Activa<span className="text-primary italic">QR</span> · Todos los derechos reservados.
                        </p>
                        
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
                            Diseñado por <a href="https://www.cesarreyesjaramillo.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-white transition-colors">César Reyes Jaramillo</a>
                        </p>
                    </div>
                </div>
            </div>
            
            {/* Background Decorative Element */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/5 blur-[120px] rounded-full translate-y-1/2"></div>
        </footer>
    );
}
