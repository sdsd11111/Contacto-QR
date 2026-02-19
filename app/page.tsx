"use client";

import { useState, useRef, useEffect } from "react";
import Link from 'next/link';
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Phone,
  ArrowRight,
  Smartphone,
  Users,
  Star,
  ShieldCheck,
  ChevronRight,
  QrCode,
  BarChart3
} from "lucide-react";
import VideoModal from "@/components/VideoModal";
import PopupManager from "@/components/PopupManager";
import EditPortalModal from "@/components/EditPortalModal";
import { Edit } from "lucide-react";

export default function Home() {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    // Check if URL has #editar and open modal
    if (typeof window !== 'undefined' && window.location.hash === '#editar') {
      setIsEditModalOpen(true);
      // Clean up hash to avoid reopening on refresh if not desired, 
      // but usually for direct links it's fine to keep it.
    }
  }, []);

  return (
    <main className="min-h-screen bg-cream selection:bg-primary/30 scroll-smooth relative overflow-x-hidden font-sans text-navy">

      {/* Navbar Minimalista */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-navy/5">
        <div className="max-w-6xl mx-auto px-8 md:px-12 h-16 md:h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img
              src="/images/logo_header.png"
              alt="ActivaQR"
              className="h-10 md:h-12 w-auto object-contain"
            />
          </Link>
          <a href="/registro" className="bg-primary text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-primary hover:scale-105 transition-transform">
            Crear mi Contacto
          </a>
        </div>
      </nav>

      {/* Hero Section: Full Screen Video (Alternative) */}
      <section className="relative h-screen min-h-[800px] w-full overflow-hidden flex items-center justify-center">
        {/* Video Background Full Screen */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="https://cdn.coverr.co/videos/coverr-people-scanning-qr-code-in-meeting-5264/1080p.mp4" type="video/mp4" />
          </video>
          {/* Gradiente sutil inferior para legibilidad del texto si es necesario, pero respetando "sin opacidad" general */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/40 to-transparent z-10"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-20 px-6 pt-20">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-navy/10 shadow-sm mb-8"
          >
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-navy/60">Sistema Validado</span>
          </motion.div>

          {/* Social Proof Avatars */}
          <div className="flex justify-center -space-x-4 mb-8">
            <img className="w-10 h-10 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" alt="Emprendedor utilizando ActivaQR" />
            <img className="w-10 h-10 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop" alt="Profesional con tarjeta digital" />
            <img className="w-10 h-10 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" alt="Dueña de negocio usando código QR" />
            <div className="w-10 h-10 rounded-full border-2 border-white bg-navy text-white flex items-center justify-center text-xs font-bold">+500</div>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-navy leading-[1.1] mb-8 tracking-tighter drop-shadow-sm"
          >
            Que tus clientes te guarden en su teléfono <span className="text-primary italic">y no te olviden.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-navy/80 mb-12 leading-relaxed max-w-2xl mx-auto font-bold"
          >
            Deja de perder dinero porque no encuentran tu número. <span className="bg-[#66bf19] text-white px-2 rounded">Escaneas el QR</span>, <span className="text-navy font-black bg-white/50 backdrop-blur-sm px-2 rounded">se guarda tu contacto con foto</span> y apareces cuando busquen tu servicio.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <a
              href="/registro"
              className="w-full sm:w-auto bg-primary text-white px-8 py-5 rounded-full font-black text-xl shadow-primary hover:translate-y-[-2px] transition-transform flex items-center justify-center gap-3"
            >
              Crear mi Contacto Digital (Desde $20) <ArrowRight size={24} />
            </a>
            <a
              href="#demo-video"
              className="w-full sm:w-auto bg-white/90 backdrop-blur-md text-navy px-8 py-5 rounded-full font-bold text-xl border border-navy/10 shadow-lg hover:bg-white transition-colors flex items-center justify-center gap-3"
            >
              <Phone size={24} className="text-primary" /> Ver cómo funciona
            </a>
          </motion.div>



          {/* Social Proof Text */}
          <p className="mt-8 text-sm text-navy/60 font-black uppercase tracking-widest bg-white/30 inline-block px-4 py-1 rounded-full backdrop-blur-sm">
            <span className="text-primary">★</span> Únete a cientos de profesionales
          </p>
        </div>
      </section>

      {/* Sección Separadora con Imagen Fija (Fixed Background) */}
      <section
        className="relative h-screen md:h-[500px] w-full bg-fixed bg-center bg-cover bg-no-repeat"
        style={{ backgroundImage: 'url("/images/ActivaQR_hero.webp")' }}
      >
        {/* Sin capas de opacidad ni degradados */}
      </section>

      {/* Nueva Sección: Video Demo (ID Ancla para Encuesta) */}
      <section id="demo-video" className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest text-primary border border-primary/20 mb-6"
            >
              Obtenlo hoy mismo
            </motion.div>
            <h2 className="text-3xl md:text-5xl font-black text-navy tracking-tighter uppercase mb-6">
              Mira cómo funciona <span className="text-primary italic">en menos de 1 minuto</span>
            </h2>
            <p className="text-navy/60 max-w-2xl mx-auto text-lg font-medium">
              Te mostramos cómo esta herramienta elimina la informalidad al entregar tu contacto y asegura que tus clientes siempre te encuentren.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative aspect-video w-full max-w-5xl mx-auto rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white group"
          >
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/Iy69aXd7MFI?autoplay=0&rel=0"
              title="Cómo funciona ActivaQR"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            ></iframe>

            {/* Overlay decorativo en bordes para estética premium */}
            <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-navy/5 rounded-[2.5rem]"></div>
          </motion.div>

          <div className="mt-12 flex justify-center">
            <div className="flex items-center gap-6 p-4 bg-navy/5 rounded-3xl border border-navy/5 max-w-lg">
              <div className="bg-primary/20 p-3 rounded-2xl text-primary">
                <CheckCircle2 size={24} />
              </div>
              <p className="text-sm font-bold text-navy/70 uppercase tracking-widest leading-tight">
                Ideal para <span className="text-primary font-black">profesionales, dueños de negocios y artesanos</span> que no quieren perder ni un cliente más.
              </p>
            </div>
          </div>
        </div>

        {/* Decoración de fondo para la sección */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-navy/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      </section>

      {/* Sección: ¿Cómo funcionaría en tu negocio? */}
      <section className="py-24 bg-navy text-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase mb-6">
              ¿Cómo funcionaría esto <span className="text-primary italic">en tu negocio?</span>
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto text-lg font-medium">
              Elimina la informalidad y asegura que cada contacto se convierta en una relación comercial a largo plazo.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-md p-8 rounded-[2.5rem] shadow-xl border border-white/5 relative group"
            >
              <div className="bg-primary/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-all duration-500 text-primary">
                <QrCode size={32} />
              </div>
              <h3 className="text-xl font-black text-white mb-4 uppercase tracking-tight">Paso 1: Escaneo</h3>
              <p className="text-white/60 leading-relaxed font-medium italic">
                &quot;Tu cliente apunta con su cámara al código QR en tu local, tarjeta o mostrador. Sin descargar nada.&quot;
              </p>
              <div className="absolute top-8 right-8 text-4xl font-black text-white/5">01</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-md p-8 rounded-[2.5rem] shadow-xl border border-white/5 relative group"
            >
              <div className="bg-primary/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-all duration-500 text-primary">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-black text-white mb-4 uppercase tracking-tight">Paso 2: Guardado</h3>
              <p className="text-white/60 leading-relaxed font-medium italic">
                &quot;Con un solo toque, toda tu información profesional (foto, nombre, servicios) se guarda directamente en su agenda.&quot;
              </p>
              <div className="absolute top-8 right-8 text-4xl font-black text-white/5">02</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-primary p-8 rounded-[2.5rem] shadow-xl border-4 border-white/20 relative group overflow-hidden"
            >
              {/* Brillo decorativo para la card principal */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/20 rounded-full blur-3xl"></div>

              <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mb-8 text-primary shadow-lg">
                <Star size={32} fill="currentColor" />
              </div>
              <h3 className="text-xl font-black text-white mb-4 uppercase tracking-tight">Paso 3: Presencia</h3>
              <p className="text-white leading-relaxed font-bold italic">
                &quot;¡Listo! Ahora verá tus estados de WhatsApp y aparecerás TÚ cuando busque tu servicio en su buscador de contactos.&quot;
              </p>
              <div className="absolute top-8 right-8 text-4xl font-black text-white/10">03</div>
            </motion.div>
          </div>
        </div>

        {/* Decoración de fondo adaptada al modo oscuro */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-navy/20 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>
        </div>
      </section>      {/* Social Proof + Beneficios */}
      <section className="py-24 bg-navy text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-16 tracking-tighter">No es una página web.<br /><span className="text-primary italic">Es tu contacto en su agenda.</span></h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 p-8 rounded-3xl backdrop-blur-sm border border-white/5">
              <div className="bg-primary w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-6 text-2xl">📸</div>
              <h3 className="text-xl font-bold mb-3">Tu Cara = Memoria</h3>
              <p className="text-white/60 text-sm leading-relaxed">Nadie guarda números sin nombre. Con ActivaQR quedarás registrado con foto y profesión en su agenda personal.</p>
            </div>
            <div className="bg-white/10 p-8 rounded-3xl backdrop-blur-sm border border-white/5">
              <div className="bg-primary w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-6 text-2xl">🔍</div>
              <h3 className="text-xl font-bold mb-3">Buscador de Contactos</h3>
              <p className="text-white/60 text-sm leading-relaxed">Cuando busquen "Abogado" o "Técnico" en su propio celular, aparecerás TÚ antes que cualquier papel.</p>
            </div>
            <div className="bg-white/10 p-8 rounded-3xl backdrop-blur-sm border border-white/5">
              <div className="bg-primary w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-6 text-2xl">🚀</div>
              <h3 className="text-xl font-bold mb-3">Descarga Cloud</h3>
              <p className="text-white/60 text-sm leading-relaxed">Tus clientes descargan tu contacto directo desde la nube. Siempre actualizado, siempre disponible.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing: 3 Planes (Regla de 3) */}
      <section className="py-24 bg-cream" id="precios" style={{ position: 'relative', zIndex: 10 }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-navy tracking-tighter uppercase">Elige tu Plan</h2>
            <p className="text-navy/60 mt-4 text-lg">Todo incluido. Sin sorpresas. Sin mensualidades.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-end max-w-6xl mx-auto">

            {/* Plan 1: Profesional */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
              className="bg-white p-8 rounded-[2rem] shadow-lg border-2 border-navy/10 flex flex-col relative overflow-hidden hover:shadow-xl transition-shadow"
            >
              <h3 className="text-lg font-black text-navy uppercase tracking-widest mb-4">Profesional</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-5xl font-black text-navy">$20</span>
                <span className="text-navy/40 text-xs font-bold uppercase tracking-widest">/año</span>
              </div>
              <p className="text-navy/50 text-sm font-medium mb-6 border-b border-navy/10 pb-6">1 contacto digital profesional</p>

              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-center gap-3 text-navy font-medium text-sm">
                  <CheckCircle2 size={18} className="text-primary shrink-0" /> Tarjeta Digital con Foto
                </li>
                <li className="flex items-center gap-3 text-navy font-medium text-sm">
                  <QrCode size={18} className="text-primary shrink-0" /> Código QR Dinámico
                </li>
                <li className="flex items-center gap-3 text-navy font-medium text-sm">
                  <CheckCircle2 size={18} className="text-primary shrink-0" /> Botones de Contacto
                </li>
                <li className="flex items-center gap-3 text-navy font-medium text-sm">
                  <CheckCircle2 size={18} className="text-primary shrink-0" /> Galería de Fotos
                </li>
                <li className="flex items-center gap-3 text-navy font-medium text-sm">
                  <ShieldCheck size={18} className="text-primary shrink-0" /> Soporte WhatsApp
                </li>
              </ul>

              <a href="/registro" className="block w-full bg-navy text-white py-4 rounded-full font-black text-base uppercase tracking-widest text-center hover:bg-navy/90 transition-colors">
                Empezar
              </a>
              <p className="text-[10px] text-center text-navy/40 leading-tight font-medium mt-3">
                Renovación anual de $10
              </p>
            </motion.div>

            {/* Plan 2: Equipo (⭐ MÁS POPULAR - Elevated) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white p-8 md:p-10 rounded-[2rem] shadow-2xl border-4 border-primary flex flex-col relative overflow-hidden hover:shadow-xl transition-shadow md:-mt-8 md:mb-0"
            >
              {/* Badge Más Popular */}
              <div className="absolute top-0 left-0 right-0 bg-primary text-white text-center text-[10px] font-black uppercase tracking-[0.2em] py-2">
                ⭐ Más Popular
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-black text-navy uppercase tracking-widest mb-4">Equipo</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-6xl font-black text-primary">$80</span>
                  <span className="text-navy/40 text-xs font-bold uppercase tracking-widest">/año</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-navy/30 text-sm line-through font-bold">$100</span>
                  <span className="bg-[#66bf19] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full">Ahorra 20%</span>
                </div>
                <p className="text-navy/50 text-sm font-medium mb-6 border-b border-primary/20 pb-6">5 contactos · <span className="text-primary font-black">$16 c/u</span></p>

                <ul className="space-y-3 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-navy font-medium text-sm">
                    <CheckCircle2 size={18} className="text-primary shrink-0" /> Todo del Plan Profesional
                  </li>
                  <li className="flex items-center gap-3 text-navy font-medium text-sm">
                    <QrCode size={18} className="text-primary shrink-0" /> <span className="bg-[#66bf19] text-white px-2 py-0.5 rounded-lg">5 Códigos QR Dinámicos</span>
                  </li>
                  <li className="flex items-center gap-3 text-navy font-medium text-sm">
                    <Users size={18} className="text-primary shrink-0" /> Ideal para equipos de trabajo
                  </li>
                  <li className="flex items-center gap-3 text-navy font-medium text-sm">
                    <BarChart3 size={18} className="text-primary shrink-0" /> Dashboard de equipo
                  </li>
                  <li className="flex items-center gap-3 text-navy font-medium text-sm">
                    <ShieldCheck size={18} className="text-primary shrink-0" /> Soporte Prioritario
                  </li>
                </ul>

                <a href="/registro" className="block w-full bg-primary text-white py-5 rounded-full font-black text-lg uppercase tracking-widest shadow-primary hover:shadow-xl transition-all text-center">
                  Elegir Equipo
                </a>
                <p className="text-[10px] text-center text-navy/40 leading-tight font-medium mt-3">
                  Renovación anual de $50
                </p>
              </div>
            </motion.div>

            {/* Plan 3: Empresa */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-navy p-8 rounded-[2rem] shadow-lg border-2 border-white/10 flex flex-col relative overflow-hidden hover:shadow-xl transition-shadow"
            >
              <h3 className="text-lg font-black text-white uppercase tracking-widest mb-4">Empresa</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-5xl font-black text-white">$140</span>
                <span className="text-white/40 text-xs font-bold uppercase tracking-widest">/año</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-white/30 text-sm line-through font-bold">$200</span>
                <span className="bg-[#66bf19] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full">Ahorra 30%</span>
              </div>
              <p className="text-white/50 text-sm font-medium mb-6 border-b border-white/10 pb-6">10 contactos · <span className="text-primary font-black">$14 c/u</span></p>

              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-center gap-3 text-white/80 font-medium text-sm">
                  <CheckCircle2 size={18} className="text-primary shrink-0" /> Todo del Plan Equipo
                </li>
                <li className="flex items-center gap-3 text-white/80 font-medium text-sm">
                  <QrCode size={18} className="text-primary shrink-0" /> 10 Códigos QR Dinámicos
                </li>
                <li className="flex items-center gap-3 text-white/80 font-medium text-sm">
                  <Users size={18} className="text-primary shrink-0" /> Para franquicias y sucursales
                </li>
                <li className="flex items-center gap-3 text-white/80 font-medium text-sm">
                  <BarChart3 size={18} className="text-primary shrink-0" /> Reportes consolidados
                </li>
                <li className="flex items-center gap-3 text-white/80 font-medium text-sm">
                  <ShieldCheck size={18} className="text-primary shrink-0" /> Soporte VIP Dedicado
                </li>
              </ul>

              <a href="/registro" className="block w-full bg-white text-navy py-4 rounded-full font-black text-base uppercase tracking-widest text-center hover:bg-white/90 transition-colors">
                Contactar Ventas
              </a>
              <p className="text-[10px] text-center text-white/40 leading-tight font-medium mt-3">
                Renovación anual de $80
              </p>
            </motion.div>

          </div>

          <p className="text-center text-navy/40 text-xs mt-10 font-medium max-w-lg mx-auto">
            *Todos los planes incluyen hosting, dominio, mantenimiento y actualizaciones por 1 año.
          </p>
        </div>
      </section>

      {/* Demo Visual: Antes vs Después (Optimizado para Impacto) */}
      <section className="py-24 bg-navy relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary rounded-full blur-[120px] -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-royal rounded-full blur-[100px] translate-y-1/2"></div>
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase mb-4">
              La diferencia entre <span className="text-white/20 italic line-through">ser uno más</span><br />
              y <span className="text-primary italic">ser recordado.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-stretch">
            {/* Antes: El olvido digital */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-sm p-10 rounded-[3rem] border border-white/10 flex flex-col justify-between"
            >
              <div>
                <div className="inline-block bg-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-8">
                  🔴 Situación Actual
                </div>
                <h3 className="text-3xl font-black text-white/30 mb-6 uppercase italic tracking-tighter">&quot;¿Dónde anoté su número?&quot;</h3>
                <p className="text-white/40 font-medium leading-relaxed mb-10">
                  Tu cliente te buscó hace una semana, pero tu número está perdido entre cientos de mensajes o en un papel que terminó en la basura.
                </p>
              </div>

              <div className="bg-white/5 border border-white/5 p-6 rounded-2xl opacity-30 grayscale rounded-[2rem]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-xl">👤</div>
                  <div className="space-y-2 flex-1">
                    <div className="h-2 bg-white/20 rounded w-2/3"></div>
                    <div className="h-2 bg-white/10 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Después: El activo digital premium */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-white to-cream p-1 rounded-[3rem] shadow-2xl relative"
            >
              <div className="bg-cream h-full w-full rounded-[2.9rem] p-8 md:p-10 relative overflow-hidden">
                {/* Badge de éxito */}
                <div className="absolute top-8 right-8 bg-[#66bf19] text-white text-[10px] font-black uppercase px-4 py-2 rounded-full shadow-lg z-20 animate-bounce">
                  ✅ ACTIVADO
                </div>

                <div className="inline-block bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-8">
                  ⭐ Con ActivaQR
                </div>

                <h3 className="text-3xl font-black text-navy mb-8 uppercase italic tracking-tighter leading-none">Apareces en su agenda <br /><span className="text-primary">al instante.</span></h3>

                <div className="relative">
                  {/* Simulación de Card de Contacto Premium */}
                  <div className="bg-white p-6 rounded-[2rem] shadow-2xl border border-navy/5 relative z-10">
                    <div className="flex items-center gap-5 mb-6">
                      <div className="w-20 h-20 bg-primary/10 rounded-[2rem] overflow-hidden border-4 border-white shadow-xl flex items-center justify-center p-3 relative">
                        <img src="/images/logo.png" alt="ActivaQR Logo" className="w-full h-full object-contain" />
                        <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center">
                          <CheckCircle2 size={10} className="text-white" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-black text-navy text-xl uppercase tracking-tighter">Tu Perfil Pro</h4>
                        <p className="text-primary text-[10px] font-black uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-md inline-block mt-1">Guardado con éxito</p>
                        <div className="flex gap-1 mt-2 text-yellow-500">
                          <Star size={14} fill="currentColor" />
                          <Star size={14} fill="currentColor" />
                          <Star size={14} fill="currentColor" />
                          <Star size={14} fill="currentColor" />
                          <Star size={14} fill="currentColor" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-green-500 text-white text-center py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 hover:scale-105 transition-transform cursor-pointer">
                        <Phone size={14} fill="currentColor" /> Llamar Ahora
                      </div>
                      <div className="bg-navy text-white text-center py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-navy/90 transition-colors cursor-pointer">
                        Ver Servicios
                      </div>
                    </div>
                  </div>

                  {/* Elementos decorativos flotantes para darle "vida" */}
                  <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-xl animate-pulse z-20">📱</div>
                  <div className="absolute -top-4 -right-2 w-10 h-10 bg-primary rounded-full shadow-lg flex items-center justify-center text-white text-sm font-black z-20">1</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>



      {/* FAQ Section Restaurada (Vital para SEO y Confianza) */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-navy uppercase tracking-tighter">Preguntas Frecuentes</h2>
          </div>
          <div className="space-y-4">
            {[
              {
                q: "¿Por qué necesito esto si ya tengo redes sociales?",
                a: "Las redes son para entretenimiento. Cuando alguien necesita un servicio urgente, busca en su agenda o contactos. Con esto, te aseguras de estar ahí, guardado con foto y profesión, listo para que te llamen."
              },
              {
                q: "¿El Código QR funciona para siempre?",
                a: "Sí, el código QR es dinámico. Si cambias de número, actualizamos tu contacto y el mismo QR impreso sigue funcionando."
              },
              {
                q: "¿Cómo recibo mi contacto?",
                a: "Es automático. Llenas tus datos, realizas el pago y recibes en tu correo el enlace a tu contacto y tus archivos listos para usar."
              },
              {
                q: "¿Tengo que pagar mensualidades?",
                a: "No. Es un pago anual de $20 que incluye hosting, mantenimiento y actualizaciones. La renovación es de solo $10 al año."
              }
            ].map((item, i) => (
              <details key={i} className="group bg-gray-50 rounded-2xl p-6 cursor-pointer border border-gray-100 hover:bg-gray-100 transition-colors">
                <summary className="flex items-center justify-between font-bold text-navy list-none text-base md:text-lg">
                  {item.q}<ChevronRight size={20} className="group-open:rotate-90 transition-transform text-primary" />
                </summary>
                <p className="mt-4 text-navy/70 leading-relaxed text-sm">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Mejorado */}
      <footer className="py-12 text-center text-white/60 text-xs font-bold uppercase tracking-widest bg-navy border-t border-white/10">
        <p className="mb-4">© 2026 · Activa<span className="bg-[#66bf19] text-white px-1 rounded ml-0.5">QR</span></p>
        <div className="flex justify-center gap-6 mb-4">
          <Link href="/blog" className="hover:text-primary transition-colors italic">Ver Blog</Link>
          <Link href="/registro" className="hover:text-primary transition-colors">Registro</Link>
        </div>
        <p className="text-[10px] opacity-50 hover:opacity-100 transition-opacity">
          Diseñado por <a href="https://www.cesarreyesjaramillo.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">César Reyes Jaramillo</a>
        </p>
      </footer>

      <VideoModal isOpen={isVideoModalOpen} onClose={() => setIsVideoModalOpen(false)} videoId="Iy69aXd7MFI" />
      <PopupManager />

      {/* Edit Portal Modal */}
      <EditPortalModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />

      {/* Floating Edit Button (Bottom Left) */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsEditModalOpen(true)}
        className="fixed bottom-6 left-6 z-40 bg-white/90 backdrop-blur-md border border-navy/10 text-navy px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 group hover:bg-white transition-colors"
      >
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
          <Edit size={20} className="text-primary group-hover:text-white transition-colors" />
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-[10px] font-bold uppercase tracking-widest text-navy/50">¿Datos desactualizados?</p>
          <p className="text-xs font-black text-navy uppercase leading-tight">Solicita tu modificación</p>
        </div>
      </motion.button>

    </main>
  );
}
