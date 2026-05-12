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
        <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl">
            <div className="bg-[#0a0a0a]/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-full px-8 py-3 flex items-center justify-between ring-1 ring-white/5">
                <Link href="/" className="flex items-center group transition-transform hover:scale-105 shrink-0">
                    <Image
                        src="/images/logo_header.png"
                        alt="ActivaQR Logo"
                        width={120}
                        height={28}
                        priority
                        className="h-6 w-auto object-contain brightness-0 invert"
                    />
                </Link>

                <div className="hidden md:flex items-center gap-6">
                    <Link href="/contacto-digital-v2" className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50 hover:text-white transition-all">
                        vCards
                    </Link>
                    <Link href="/contacto-business-catalogo-v2" className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50 hover:text-white transition-all">
                        Catálogo
                    </Link>
                    <Link href="/sitio-web-completo-v2" className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50 hover:text-white transition-all">
                        Sitio Web
                    </Link>
                    <Link href="/auditoria-operativa" className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50 hover:text-white transition-all">
                        Auditoría
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/registro" className="bg-[#FF6B2B] text-white px-6 py-2.5 rounded-full font-black text-[11px] uppercase tracking-[0.15em] shadow-lg shadow-[#FF6B2B]/20 hover:scale-105 transition-all">
                        Activar Ahora
                    </Link>
                </div>
            </div>
        </nav>
    );
}
