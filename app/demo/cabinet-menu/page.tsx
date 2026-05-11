"use client";

import CabinetMenu from "@/components/CabinetMenu";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ROCIO_SERVICES = [
  {
    name: "Peluquería",
    items: [
      { name: "Alisado Vegano", price: "$95,00", tags: ["Estrella", "Orgánico"], highlight: true, desc: "Tratamiento premium 100% libre de químicos agresivos" },
      { name: "Alisado Permanente", price: "$80,00", tags: ["Popular"], highlight: true, desc: "Liso perfecto y duradero" },
      { name: "Coloración (Balayage/Tintes)", price: "Desde $45,00", tags: ["Técnico"] },
      { name: "Corte, Cepillado & Planchado", price: "Desde $15,00", desc: "Acabado profesional de tendencia" }
    ]
  },
  {
    name: "Spa & Facial",
    items: [
      { name: "Hidratación con Dermapen", price: "$45,00", tags: ["Recomendado"], highlight: true, desc: "Nutrición profunda para una piel radiante" },
      { name: "Limpieza Facial Profunda", price: "$25,00", desc: "Eliminación de impurezas e hidratación" },
      { name: "Quemado de Verrugas", price: "Consulta", tags: ["Especializado"], desc: "Procedimiento técnico con alta precisión" }
    ]
  },
  {
    name: "Masajes Corporales",
    items: [
      { name: "Masaje Relajante", price: "$30,00", desc: "Desconexión total y alivio de tensión" },
      { name: "Masaje Reductor & Drenaje", price: "$40,00", tags: ["Corporal"], desc: "Moldea tu figura y elimina toxinas" }
    ]
  },
  {
    name: "Cuidado de Uñas",
    items: [
      { name: "Uñas Acrílicas / Gel", price: "$25,00", tags: ["Nails"], desc: "Extensiones con acabado natural o diseño" },
      { name: "Pintado Semipermanente", price: "$12,00", desc: "Color duradero por más de 15 días" },
      { name: "Pedicura Completa", price: "$15,00" }
    ]
  },
  {
    name: "Complementarios",
    items: [
      { name: "Maquillaje Profesional", price: "$35,00", tags: ["Social/Novias"] },
      { name: "Depilaciones", price: "Desde $8,00", desc: "Cera o hilo según zona" }
    ]
  }
];

export default function CabinetDemoPage() {
  return (
    <main className="min-h-screen bg-[#FCF9F5]">
      <Navbar />
      
      {/* Hero simple para contexto */}
      <section className="pt-32 pb-16 px-6 text-center">
        <div className="container mx-auto">
          <h1 className="text-[#001549] font-black text-5xl md:text-7xl mb-4 italic">Gabinete Rocío</h1>
          <p className="text-[#001549]/60 text-xl font-medium uppercase tracking-[0.2em]">Servicios de Belleza & Bienestar</p>
        </div>
      </section>

      {/* El Componente Solicitado con data dinámica */}
      <CabinetMenu 
        data={ROCIO_SERVICES} 
        businessName="Gabinete Rocío" 
        whatsapp="593987654321" 
      />

      <Footer />
    </main>
  );
}
