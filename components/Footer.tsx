"use client";

import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="py-12 text-center text-white/60 text-xs font-bold uppercase tracking-widest bg-navy border-t border-white/10">
            <p className="mb-4">© 2026 · Activa<span className="bg-[#66bf19] text-white px-1 rounded ml-0.5">QR</span></p>
            <div className="flex justify-center gap-6 mb-4">
                <Link href="/blog" className="hover:text-primary transition-colors italic">Ver Blog</Link>
                <Link href="/registro" className="hover:text-primary transition-colors">Registro</Link>
                <Link href="/diagnostico" className="hover:text-primary transition-colors">Diagnóstico</Link>
            </div>
            <p className="text-[10px] opacity-50 hover:opacity-100 transition-opacity">
                Diseñado por <a href="https://www.cesarreyesjaramillo.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">César Reyes Jaramillo</a>
            </p>
        </footer>
    );
}
