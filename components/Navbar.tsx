"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');
    const isVCard = pathname?.startsWith('/card/');
    const isCatalog = pathname?.startsWith('/catalog/');

    if (isAdmin || isVCard || isCatalog) return null;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-navy/5">
            <div className="max-w-6xl mx-auto px-8 md:px-12 h-16 md:h-18 flex items-center justify-between">
                <Link href="/" className="flex items-center">
                    <img
                        src="/images/logo_header.png"
                        alt="ActivaQR"
                        className="h-10 md:h-12 w-auto object-contain"
                    />
                </Link>
                <a href="/registro" className="bg-primary text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-primary hover:scale-105 transition-transform">
                    Crear mi Contacto
                </a>
            </div>
        </nav>
    );
}
