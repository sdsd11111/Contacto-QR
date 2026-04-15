'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { BLOG_POSTS, BLOG_CATEGORIES } from '@/lib/blog-data';
import { ChevronRight, Calendar, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BlogListingClient() {
    const [activeCategory, setActiveCategory] = useState<string>('Todos');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredPosts = useMemo(() => {
        return BLOG_POSTS.filter(post => {
            const matchesCategory = activeCategory === 'Todos' || post.category === activeCategory;
            const matchesSearch = searchQuery === '' ||
                post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [activeCategory, searchQuery]);

    const featuredPost = filteredPosts[0];
    const restPosts = filteredPosts.slice(1);

    return (
        <>
            {/* Category Tabs + Search */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-16 max-w-5xl mx-auto">
                {/* Category Pills */}
                <div className="flex gap-2 flex-wrap justify-center">
                    {BLOG_CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 border-2 ${activeCategory === cat
                                ? 'bg-primary text-white border-primary shadow-primary'
                                : 'bg-white text-navy/50 border-navy/10 hover:border-primary/30 hover:text-primary'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative w-full md:w-80">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/30" />
                    <input
                        type="text"
                        placeholder="Buscar artículos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-10 py-3 rounded-full border-2 border-navy/10 bg-white text-navy text-sm font-medium focus:outline-none focus:border-primary/50 transition-colors placeholder:text-navy/30"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-navy/30 hover:text-primary transition-colors"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Results Count */}
            {(activeCategory !== 'Todos' || searchQuery) && (
                <p className="text-center text-navy/40 text-xs font-bold uppercase tracking-widest mb-8">
                    {filteredPosts.length} artículo{filteredPosts.length !== 1 ? 's' : ''} encontrado{filteredPosts.length !== 1 ? 's' : ''}
                </p>
            )}

            {/* Empty State */}
            {filteredPosts.length === 0 && (
                <div className="text-center py-24">
                    <p className="text-6xl mb-6">🔍</p>
                    <h3 className="text-2xl font-black text-navy mb-2">Sin resultados</h3>
                    <p className="text-navy/40 font-medium">Intenta con otra búsqueda o categoría.</p>
                </div>
            )}

            {/* Featured Post (Hero) */}
            {featuredPost && (
                <Link href={`/blog/${featuredPost.slug}`} className="block mb-16 max-w-5xl mx-auto group">
                    <motion.article
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-navy/5 grid md:grid-cols-2 gap-0 hover:shadow-3xl transition-all duration-500"
                    >
                        <div className="aspect-[4/3] md:aspect-auto overflow-hidden relative">
                            <img
                                src={featuredPost.image}
                                alt={featuredPost.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute top-6 left-6">
                                <span className="bg-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg">
                                    ⭐ Destacado
                                </span>
                            </div>
                        </div>
                        <div className="p-8 md:p-12 flex flex-col justify-center">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="bg-navy/5 text-navy/40 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">{featuredPost.category}</span>
                                <span className="text-navy/30 text-[10px] font-bold flex items-center gap-1"><Calendar size={10} /> {featuredPost.date}</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-navy mb-4 leading-tight tracking-tight group-hover:text-primary transition-colors">
                                {featuredPost.title.split(/(QR)/).map((part, i) => (
                                    part === 'QR' ? <span key={i} className="text-primary">QR</span> : part
                                ))}
                            </h2>
                            <p className="text-navy/60 mb-8 leading-relaxed font-medium">
                                {featuredPost.excerpt}
                            </p>
                            <span className="inline-flex items-center gap-2 text-primary font-black uppercase text-xs tracking-widest">
                                Leer Artículo <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </span>
                        </div>
                    </motion.article>
                </Link>
            )}

            {/* Grid of remaining posts */}
            {restPosts.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    <AnimatePresence mode="popLayout">
                        {restPosts.map((post, index) => (
                            <motion.article
                                key={post.slug}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white rounded-[2rem] overflow-hidden shadow-xl border border-navy/5 group hover:scale-[1.02] transition-all duration-300 flex flex-col"
                            >
                                <div className="aspect-video overflow-hidden relative">
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-white/90 backdrop-blur-sm text-navy text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow">
                                            {post.category}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6 flex flex-col flex-1">
                                    <p className="text-navy/30 text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-1">
                                        <Calendar size={10} /> {post.date}
                                    </p>

                                    <h3 className="text-lg font-black text-navy mb-3 leading-tight group-hover:text-primary transition-colors">
                                        {post.title.split(/(QR)/).map((part, i) => (
                                            part === 'QR' ? <span key={i} className="text-primary">QR</span> : part
                                        ))}
                                    </h3>

                                    <p className="text-navy/50 text-sm mb-6 leading-relaxed font-medium line-clamp-3">
                                        {post.excerpt}
                                    </p>

                                    <div className="mt-auto">
                                        <Link
                                            href={`/blog/${post.slug}`}
                                            className="inline-flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest group/btn"
                                        >
                                            Leer más <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            </motion.article>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </>
    );
}
