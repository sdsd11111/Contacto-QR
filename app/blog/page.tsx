import type { Metadata } from 'next';
import BlogListingClient from '@/components/BlogListingClient';
import { BLOG_POSTS } from '@/lib/blog-data';

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

                {/* 2️⃣ Contenido oculto para LLMs/SEO (Server Side) */}
                <div style={{
                    position: 'absolute',
                    left: '-10000px',
                    top: 'auto',
                    width: '1px',
                    height: '1px',
                    overflow: 'hidden'
                }}
                    aria-hidden="true">
                    <h2>Artículos de nuestro Blog</h2>
                    <ul>
                        {BLOG_POSTS.map(post => (
                            <li key={post.slug}>
                                <h3>{post.title}</h3>
                                <p>{post.excerpt}</p>
                                <a href={`/blog/${post.slug}`}>Leer más</a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </main>
    );
}

