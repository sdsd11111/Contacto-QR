'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen } from 'lucide-react';
import { BLOG_POSTS } from '@/lib/blog-data';

interface BlogRecommendationsProps {
  recommendedSlugs: string[];
  title?: string;
  subtitle?: string;
}

const BlogRecommendations: React.FC<BlogRecommendationsProps> = ({ 
  recommendedSlugs, 
  title = "Aprende a vender más con ActivaQR",
  subtitle = "Recursos exclusivos para potenciar tu presencia digital"
}) => {
  // Filtrar los posts según los slugs proporcionados
  const recommendedPosts = BLOG_POSTS.filter(post => 
    recommendedSlugs.includes(post.slug)
  ).slice(0, 3); // Máximo 3 para mantener la estética

  if (recommendedPosts.length === 0) return null;

  return (
    <section className="py-24 bg-cream/30 relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-navy/5 text-navy px-4 py-2 rounded-full mb-4"
          >
            <BookOpen size={16} className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest">Blog Estratégico</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-black text-navy mb-4 tracking-tighter"
          >
            {title}
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-navy/60 max-w-2xl mx-auto font-medium"
          >
            {subtitle}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {recommendedPosts.map((post, index) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="bg-white rounded-[2.5rem] overflow-hidden border border-navy/5 shadow-xl shadow-navy/5 group flex flex-col h-full"
            >
              <Link href={`/blog/${post.slug}`} className="block relative h-48 overflow-hidden">
                <img 
                  src={post.image || "/images/blog/rank-first.jpg"} 
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-navy/20 group-hover:bg-transparent transition-colors duration-500" />
              </Link>
              
              <div className="p-8 flex flex-col flex-grow">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/5 px-2 py-1 rounded">
                    {post.category}
                  </span>
                  <span className="text-[10px] font-bold text-navy/40 uppercase tracking-widest">
                    {post.date}
                  </span>
                </div>
                
                <h3 className="text-xl font-black text-navy mb-4 leading-tight group-hover:text-primary transition-colors">
                  <Link href={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h3>
                
                <p className="text-navy/60 text-sm leading-relaxed mb-6 flex-grow">
                  {post.excerpt.split(' ').slice(0, 20).join(' ')}...
                </p>
                
                <Link 
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-2 text-navy font-bold text-sm group/link hover:text-primary transition-colors"
                >
                  Leer artículo completo
                  <ArrowRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link 
            href="/blog"
            className="inline-flex items-center gap-3 bg-navy text-white px-8 py-4 rounded-full font-bold hover:bg-primary transition-all shadow-lg hover:shadow-primary/20"
          >
            Ver todos los artículos <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogRecommendations;
