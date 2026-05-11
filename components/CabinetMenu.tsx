"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { 
  Scissors, 
  Sparkles, 
  User, 
  Paintbrush, 
  Zap, 
  ChevronRight,
  Clock,
  CheckCircle2,
  Gift,
  Star,
  Info,
  Camera,
  Image,
  ShoppingBag,
  Heart,
  Smile
} from "lucide-react";

interface ServiceItem {
  name: string;
  price: string;
  desc?: string;
  size?: string;
  highlight?: boolean;
  tags?: string[];
}

interface Category {
  name: string;
  items: ServiceItem[];
}

interface CabinetMenuProps {
  data?: Category[];
  businessName?: string;
  whatsapp?: string;
}

// Map icons based on category names or keywords
const getCategoryIcon = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("pelu") || lowerName.includes("cabello") || lowerName.includes("corte")) return Scissors;
  if (lowerName.includes("facial") || lowerName.includes("spa") || lowerName.includes("piel")) return Sparkles;
  if (lowerName.includes("masaje") || lowerName.includes("cuerpo")) return User;
  if (lowerName.includes("uña") || lowerName.includes("mani") || lowerName.includes("pedi")) return Paintbrush;
  if (lowerName.includes("foto") || lowerName.includes("video") || lowerName.includes("imagen")) return Camera;
  if (lowerName.includes("sublima") || lowerName.includes("estampa") || lowerName.includes("personaliza")) return Image;
  if (lowerName.includes("acc") || lowerName.includes("tienda") || lowerName.includes("regalo")) return ShoppingBag;
  if (lowerName.includes("salud") || lowerName.includes("medico") || lowerName.includes("clinica")) return Heart;
  if (lowerName.includes("comida") || lowerName.includes("restaurante") || lowerName.includes("menu")) return Smile;
  return Zap;
};

// Default services fallback
const DEFAULT_SERVICES: Category[] = [
  { 
    name: "Servicios Premium", 
    items: [
      { name: "Evaluación Inicial", price: "Gratis", desc: "Consultoría personalizada" },
      { name: "Servicio Estándar", price: "$25,00", tags: ["Popular"] },
      { name: "Paquete Gold", price: "$85,00", tags: ["Recomendado"], highlight: true }
    ]
  }
];

export default function CabinetMenu({ data, businessName, whatsapp }: CabinetMenuProps) {
  const menuData = useMemo(() => data && data.length > 0 ? data : DEFAULT_SERVICES, [data]);
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const activeCategory = menuData[activeTabIndex] || menuData[0];

  const handleBooking = (serviceName?: string) => {
    if (whatsapp) {
      const text = encodeURIComponent(`Hola, me interesa el servicio: ${serviceName || 'Consulta General'}`);
      window.open(`https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${text}`, '_blank');
    }
  };

  return (
    <section className="py-24 bg-[#FCF9F5] overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-[#001549] text-white px-4 py-2 rounded-full shadow-lg mb-6"
          >
            <span className="flex h-2 w-2 rounded-full bg-[#66bf19] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">Catálogo Digital {businessName ? `• ${businessName}` : ""}</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-[#001549] leading-[1.05] tracking-tighter mb-6"
          >
            Excelencia en cada <span className="text-[#f66739]">detalle.</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-[#001549]/70 text-lg md:text-xl max-w-2xl font-medium"
          >
            Explora nuestros servicios y productos diseñados con los más altos estándares de calidad y atención profesional.
          </motion.p>
        </div>

        {/* Categories Tab Selector */}
        <div className="flex overflow-x-auto pb-4 mb-12 gap-4 justify-start md:justify-center scrollbar-hide no-scrollbar">
          {menuData.map((cat, idx) => {
            const Icon = getCategoryIcon(cat.name);
            return (
              <button
                key={idx}
                onClick={() => setActiveTabIndex(idx)}
                className={`flex-shrink-0 flex items-center gap-3 px-8 py-5 rounded-full font-bold text-lg transition-all duration-300 border-2 ${
                  activeTabIndex === idx 
                  ? "bg-[#001549] text-white border-[#001549] shadow-xl scale-105" 
                  : "bg-white text-[#001549]/60 border-[#001549]/5 hover:border-[#001549]/20"
                }`}
              >
                <Icon size={22} className={activeTabIndex === idx ? "text-[#f66739]" : "text-[#001549]/30"} />
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="grid lg:grid-cols-[1fr_350px] gap-8 items-start">
          
          {/* Services List */}
          <div className="space-y-6">
            <motion.div
              key={activeTabIndex}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white/40 backdrop-blur-xl p-8 md:p-12 rounded-[3.5rem] border border-white/60 shadow-2xl shadow-[#001549]/5"
            >
              <div className="mb-10 flex justify-between items-end">
                <div>
                  <h3 className="text-3xl font-black text-[#001549] mb-2">
                    {activeCategory?.name}
                  </h3>
                  <div className="h-1 w-20 bg-[#f66739] rounded-full" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#001549]/30">
                  {activeCategory?.items.length} Opciones disponibles
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {activeCategory?.items.map((service, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => handleBooking(service.name)}
                    className={`relative p-6 rounded-3xl border transition-all duration-300 group hover:shadow-lg cursor-pointer ${
                      service.highlight 
                      ? "bg-[#f66739]/5 border-[#f66739]/30" 
                      : "bg-white border-[#001549]/5"
                    }`}
                  >
                    {service.highlight && (
                      <div className="absolute -top-3 -right-3 bg-[#66bf19] text-white text-[10px] font-black px-3 py-1 rounded-full shadow-md z-10 uppercase tracking-widest flex items-center gap-1">
                        <Star size={10} fill="currentColor" /> Recomendado
                      </div>
                    )}
                    
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-xl font-bold text-[#001549] group-hover:text-[#f66739] transition-colors leading-tight">
                        {service.name}
                      </h4>
                      <span className="text-lg font-black text-[#001549] shrink-0 ml-4">
                        {service.price}
                      </span>
                    </div>

                    {service.desc && (
                      <p className="text-[#001549]/50 text-sm mb-4 font-medium italic">
                        {service.desc}
                      </p>
                    )}

                    {service.size && (
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#001549]/30 mb-4 block">
                        {service.size}
                      </span>
                    )}
                    
                    <div className="flex flex-wrap gap-2">
                      {service.tags?.map((tag, tIdx) => (
                        <span 
                          key={tIdx} 
                          className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                            service.highlight 
                            ? "bg-[#f66739] text-white" 
                            : "bg-[#001549]/5 text-[#001549]/40"
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-6 flex items-center gap-2 text-xs font-bold text-[#001549]/30 group-hover:text-[#001549]/60 transition-colors uppercase tracking-[0.15em]">
                      Solicitar info <ChevronRight size={14} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Promotions/Info Sidebar */}
          <aside className="space-y-6">
            <div className="bg-[#001549] text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#f66739]/20 blur-[60px]" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-[#66bf19] mb-6">
                  <Zap size={24} />
                  <span className="text-sm font-black uppercase tracking-widest">Atención VIP</span>
                </div>
                
                <h3 className="text-3xl font-black mb-8 leading-[1.1]">Cotiza tu proyecto hoy</h3>
                
                <p className="text-white/60 text-sm mb-8 leading-relaxed">
                  Ofrecemos atención personalizada para garantizar que cada servicio se adapte perfectamente a tus necesidades y expectativas.
                </p>

                <button 
                  onClick={() => handleBooking()}
                  className="w-full py-5 bg-[#f66739] hover:bg-[#e5562d] text-white rounded-full font-black text-lg shadow-xl shadow-[#f66739]/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  WhatsApp Directo <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* Quality Commitment Card */}
            <div className="bg-white border border-[#001549]/5 p-8 rounded-[3rem] shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-[#66bf19]/10 rounded-2xl flex items-center justify-center text-[#66bf19]">
                  <CheckCircle2 size={24} />
                </div>
                <h4 className="text-lg font-black text-[#001549] leading-tight">Garantía ActivaQR</h4>
              </div>
              <ul className="space-y-3">
                {[
                  "Calidad certificada",
                  "Atención profesional",
                  "Resultados garantizados",
                  "Soporte inmediato"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium text-[#001549]/60">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#f66739]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </aside>

        </div>
      </div>
    </section>
  );
}

