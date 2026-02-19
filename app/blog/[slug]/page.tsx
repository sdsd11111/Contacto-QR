import { BLOG_POSTS } from '@/lib/blog-data';
import { notFound } from 'next/navigation';
import { ChevronLeft, Calendar, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';
import React from 'react';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const slug = (await params).slug;
    const post = BLOG_POSTS.find(p => p.slug === slug);

    if (!post) return { title: 'Artículo no encontrado' };

    return {
        title: `${post.title} | Blog ActivaQR`,
        description: post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            images: [post.image],
            type: 'article',
        }
    };
}

// Helper: parse inline markdown (bold + links)
function renderInline(text: string): React.ReactNode[] {
    const parts: React.ReactNode[] = [];
    // Match **bold** and [text](url)
    const regex = /(\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\))/g;
    let lastIndex = 0;
    let match;
    let key = 0;

    while ((match = regex.exec(text)) !== null) {
        // Push text before match
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }
        if (match[2]) {
            // Bold
            parts.push(<strong key={key++} className="text-primary font-bold">{match[2]}</strong>);
        } else if (match[3] && match[4]) {
            // Link
            parts.push(
                <Link key={key++} href={match[4]} className="text-primary font-bold underline underline-offset-4 hover:text-navy transition-colors">
                    {match[3]}
                </Link>
            );
        }
        lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }
    return parts;
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
    const slug = (await params).slug;
    const post = BLOG_POSTS.find(p => p.slug === slug);

    if (!post) notFound();

    // Get related posts for "read more" section
    const relatedPosts = BLOG_POSTS.filter(p => p.slug !== slug).slice(0, 2);

    return (
        <main className="min-h-screen bg-cream py-24 px-6 md:px-0">
            <article className="max-w-3xl mx-auto bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-navy/5">
                {/* Hero Header */}
                <div className="relative aspect-[21/9] w-full overflow-hidden">
                    <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-navy/40 backdrop-blur-[2px]"></div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                        <span className="bg-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full mb-6">
                            {post.category}
                        </span>
                        <h1 className="text-4xl md:text-6xl font-black text-navy leading-tight tracking-tighter mb-8">
                            {post.title.split(/(QR)/).map((part, i) => (
                                part === 'QR' ? <span key={i} className="text-primary">QR</span> : part
                            ))}
                        </h1>
                    </div>
                </div>

                <div className="p-8 md:p-16">
                    <div className="flex items-center justify-between mb-12 border-b border-navy/5 pb-8 flex-wrap gap-4">
                        <Link href="/blog" className="flex items-center gap-2 text-navy/40 hover:text-primary transition-colors font-bold text-xs uppercase tracking-widest">
                            <ChevronLeft size={16} /> Volver al blog
                        </Link>
                        <div className="flex items-center gap-4 text-navy/40 text-[10px] font-bold uppercase tracking-widest">
                            <span className="flex items-center gap-1"><Calendar size={12} /> {post.date}</span>
                            <span className="flex items-center gap-1"><User size={12} /> ActivaQR Team</span>
                        </div>
                    </div>

                    {/* Content Renderer */}
                    <div className="text-navy/80 space-y-6 leading-relaxed text-lg font-medium">
                        {post.content.split('\n\n').map((block, i) => {
                            const trimmed = block.trim();
                            if (!trimmed) return null;

                            // Skip H1 (shown in hero)
                            if (trimmed.startsWith('# ') && !trimmed.startsWith('## ')) return null;

                            // H2
                            if (trimmed.startsWith('## ')) {
                                return <h2 key={i} className="text-3xl font-black text-navy tracking-tight uppercase border-l-4 border-primary pl-6 pt-4">{trimmed.replace('## ', '')}</h2>;
                            }
                            // H3
                            if (trimmed.startsWith('### ')) {
                                return <h3 key={i} className="text-2xl font-bold text-navy">{trimmed.replace('### ', '')}</h3>;
                            }

                            // HR
                            if (trimmed === '---') {
                                return <hr key={i} className="border-t-2 border-navy/10 my-8" />;
                            }

                            // Table
                            if (trimmed.includes('|') && trimmed.split('\n').length > 2) {
                                const rows = trimmed.split('\n').filter(r => !r.match(/^[\|\s-]+$/));
                                return (
                                    <div key={i} className="overflow-x-auto my-8">
                                        <table className="w-full border-collapse bg-navy/5 rounded-2xl overflow-hidden">
                                            <tbody>
                                                {rows.map((row, ri) => (
                                                    <tr key={ri} className={ri === 0 ? "bg-navy text-white font-bold" : "border-b border-navy/10"}>
                                                        {row.split('|').filter(c => c.trim()).map((cell, ci) => (
                                                            <td key={ci} className="p-4 text-sm">{renderInline(cell.trim())}</td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                );
                            }

                            // Unordered list
                            if (trimmed.split('\n').every(l => l.trim().startsWith('* ') || l.trim().startsWith('- '))) {
                                return (
                                    <ul key={i} className="space-y-3 list-none">
                                        {trimmed.split('\n').map((li, liidx) => (
                                            <li key={liidx} className="flex items-start gap-3">
                                                <span className="text-primary mt-1">●</span>
                                                <span>{renderInline(li.replace(/^[\*-]\s*/, ''))}</span>
                                            </li>
                                        ))}
                                    </ul>
                                );
                            }

                            // Ordered list
                            if (trimmed.split('\n').every(l => /^\d+\.\s/.test(l.trim()))) {
                                return (
                                    <ol key={i} className="space-y-4">
                                        {trimmed.split('\n').map((li, liidx) => (
                                            <li key={liidx} className="flex items-start gap-4">
                                                <span className="bg-primary text-white w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shrink-0">{liidx + 1}</span>
                                                <span className="pt-1">{renderInline(li.replace(/^\d+\.\s*/, ''))}</span>
                                            </li>
                                        ))}
                                    </ol>
                                );
                            }

                            // Generic paragraph with inline formatting
                            return <p key={i}>{renderInline(trimmed)}</p>;
                        })}
                    </div>

                    {/* CTA Banner */}
                    <div className="bg-primary p-8 rounded-[2rem] text-white shadow-primary my-12 text-center">
                        <h4 className="text-2xl font-black uppercase mb-4">¿Listo para destacar?</h4>
                        <p className="mb-8 font-bold italic opacity-90">Deja de ser un link olvidado y conviértete en un contacto guardado.</p>
                        <Link href="/registro" className="inline-flex items-center gap-3 bg-white text-primary px-8 py-4 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-transform">
                            Crear mi Contacto QR <ArrowRight size={18} />
                        </Link>
                    </div>

                    {/* Related Posts */}
                    {relatedPosts.length > 0 && (
                        <div className="mt-16 pt-16 border-t border-navy/5">
                            <h4 className="text-xl font-black text-navy uppercase tracking-tight mb-8">También te puede interesar</h4>
                            <div className="grid md:grid-cols-2 gap-6">
                                {relatedPosts.map(rp => (
                                    <Link key={rp.slug} href={`/blog/${rp.slug}`} className="group bg-cream rounded-2xl overflow-hidden border border-navy/5 hover:border-primary/20 transition-colors">
                                        <div className="aspect-video overflow-hidden">
                                            <img src={rp.image} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        </div>
                                        <div className="p-5">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-primary">{rp.category}</span>
                                            <h5 className="text-sm font-bold text-navy mt-1 leading-tight group-hover:text-primary transition-colors">{rp.title}</h5>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Author Box */}
                    <div className="mt-12 pt-12 border-t border-navy/5">
                        <div className="bg-cream p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8 border border-navy/5">
                            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center p-4 shrink-0">
                                <img src="/images/logo.png" alt="ActivaQR" className="object-contain" />
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h4 className="text-xl font-black text-navy uppercase tracking-tight mb-2">Sobre ActivaQR</h4>
                                <p className="text-navy/60 text-sm font-medium leading-relaxed">
                                    Tu contacto profesional es tu activo más valioso. Nuestra misión es asegurarnos de que tus clientes siempre te encuentren a un clic de distancia en su propia agenda.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </article>
        </main>
    );
}
