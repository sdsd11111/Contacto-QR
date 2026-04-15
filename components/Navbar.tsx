"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');
    const isVCard = pathname?.startsWith('/card/');
    const isCatalog = pathname?.startsWith('/catalog/');

    if (isAdmin || isVCard || isCatalog) return null;

    return (
        <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl">
            <div className="bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] rounded-[2.5rem] px-8 py-3 md:py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center group transition-transform hover:scale-105">
                    <Image
                        src="/images/logo_header.png"
                        alt="ActivaQR Logo"
                        width={160}
                        height={40}
                        priority
                        className="h-8 md:h-10 w-auto object-contain"
                    />
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    <Link href="/contacto-digital" className="text-[10px] font-black uppercase tracking-[0.2em] text-navy/60 hover:text-primary transition-colors">
                        Contacto Digital
                    </Link>
                    <a href="#precios" className="text-[10px] font-black uppercase tracking-[0.2em] text-navy/60 hover:text-primary transition-colors">
                        Planes
                    </a>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/registro" className="bg-navy text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-navy/20 hover:bg-primary transition-all hover:translate-y-[-2px]">
                        Crear mi ActivaQR
                    </Link>
                </div>
            </div>
        </nav>
    );
}
