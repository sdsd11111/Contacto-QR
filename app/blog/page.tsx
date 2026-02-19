import type { Metadata } from 'next';
import BlogListingClient from '@/components/BlogListingClient';

export const metadata: Metadata = {
    title: "Blog ActivaQR — Estrategias de Visibilidad y Networking",
    description: "Aprende cómo destacar en la agenda de tus clientes, mejorar tu networking y utilizar el poder del código QR para cerrar más ventas.",
};

export default function BlogListing() {
    return (
        <main className="min-h-screen bg-cream py-24 px-6">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-black text-navy mb-6 tracking-tighter uppercase">
                        Blog de <span className="text-primary italic">Visibilidad</span>
                    </h1>
                    <p className="text-navy/60 text-lg md:text-xl max-w-2xl mx-auto font-medium">
                        Estrategias, consejos y guías para que dejes de ser un número olvidado y te conviertas en un contacto guardado.
                    </p>
                </header>

                <BlogListingClient />
            </div>
        </main>
    );
}
