"use client";

import { useEffect, useState } from "react";
import { Star, MessageSquare, ExternalLink, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Review {
  author_name: string;
  profile_photo_url: string;
  rating: number;
  relative_time_description: string;
  text: string;
}

interface ReviewsData {
  rating: number;
  user_ratings_total: number;
  reviews: Review[];
}

export default function ReviewsSection() {
  const [data, setData] = useState<ReviewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const PLACE_ID = process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID;
  const REVIEW_LINK = `https://search.google.com/local/writereview?placeid=${PLACE_ID}`;

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch("/api/reviews");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Error loading reviews:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, []);

  // Auto-slide reviews
  useEffect(() => {
    if (data && data.reviews.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % data.reviews.length);
      }, 8000);
      return () => clearInterval(timer);
    }
  }, [data]);

  if (loading || !data) return null;

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left: Overall Rating Card */}
          <div className="lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-cream p-10 rounded-[3rem] border border-navy/5 shadow-2xl relative overflow-hidden text-center lg:text-left"
            >
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-primary text-xs font-black uppercase tracking-widest mb-6">
                  <ShieldCheck size={14} /> Negocio Verificado
                </div>
                
                <h3 className="text-6xl md:text-7xl font-black text-navy leading-none mb-2 tabular-nums">
                  {data.rating.toFixed(1)}
                </h3>
                
                <div className="flex justify-center lg:justify-start gap-1 mb-6 text-primary">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={28} fill={i < Math.floor(data.rating) ? "currentColor" : "none"} strokeWidth={2.5} />
                  ))}
                </div>

                <p className="text-navy/50 font-bold uppercase tracking-tighter text-sm mb-8">
                  Basado en <span className="text-navy">{data.user_ratings_total} reseñas reales</span> de Google
                </p>

                <a 
                  href={REVIEW_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-navy text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-primary transition-all group scale-100 hover:scale-105 active:scale-95"
                >
                  Danos tu opinión <ExternalLink size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </a>
              </div>

              {/* Decorative Background Icon */}
              <div className="absolute -bottom-10 -right-10 text-primary/5 -rotate-12 pointer-events-none">
                <Star size={240} fill="currentColor" />
              </div>
            </motion.div>
          </div>

          {/* Right: Reviews Carousel */}
          <div className="lg:col-span-8 relative">
            <div className="relative min-h-[320px] flex items-center">
              <AnimatePresence mode="wait">
                {data.reviews.length > 0 && (
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    className="w-full"
                  >
                    <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-navy/10 relative">
                      <div className="absolute top-8 left-8 text-primary/20">
                        <MessageSquare size={80} strokeWidth={1} />
                      </div>
                      
                      <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-8">
                          <img 
                            src={data.reviews[currentIndex].profile_photo_url} 
                            alt={data.reviews[currentIndex].author_name}
                            className="w-14 h-14 rounded-full border-2 border-primary/20 p-0.5"
                          />
                          <div>
                            <h4 className="font-black text-navy uppercase tracking-tighter text-lg leading-tight">
                              {data.reviews[currentIndex].author_name}
                            </h4>
                            <p className="text-navy/40 text-xs font-bold uppercase tracking-widest">
                              {data.reviews[currentIndex].relative_time_description}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-1 mb-6 text-primary">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={16} 
                              fill={i < data.reviews[currentIndex].rating ? "currentColor" : "none"} 
                            />
                          ))}
                        </div>

                        <p className="text-xl md:text-2xl text-navy/80 font-medium italic leading-relaxed">
                          &quot;{data.reviews[currentIndex].text.slice(0, 240)}
                          {data.reviews[currentIndex].text.length > 240 ? "..." : ""}&quot;
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Carousel Indicators */}
            <div className="flex gap-3 justify-center lg:justify-start mt-8">
              {data.reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-2 rounded-full transition-all duration-500 ${currentIndex === i ? 'w-10 bg-primary' : 'w-2 bg-navy/10'}`}
                  aria-label={`Show review ${i + 1}`}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
