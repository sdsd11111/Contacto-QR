"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, ArrowRight, Play, CheckCircle2, Star, X, 
  ChevronDown, User, Smartphone, Mail, Briefcase, 
  Globe, MapPin, Share2, Search, Info, CreditCard, Receipt
} from "lucide-react";
import VideoModal from "@/components/VideoModal";
import RegisterWizard from "@/components/RegisterWizard";


// --- Tipos ---
type Step = 1 | 2 | 3; // 1: Hero, 2: Video, 3: Registro (Wizard)

type PaymentMethod = "transfer" | "payphone" | "paypal" | "crypto";

// --- Componentes de Apoyo ---

const StepWrapper = ({ children, isVisible }: { children: React.ReactNode; isVisible: boolean }) => (
  <AnimatePresence mode="wait">
    {isVisible && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full h-full flex flex-col items-center justify-center relative z-10"
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

const AccordionItem = ({ title, icon: Icon, children, isOpen, onClick }: any) => (
  <div className="border border-white/5 bg-[#111] rounded-xl overflow-hidden mb-4">
    <button 
      onClick={onClick}
      className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-[#FF6B2B]/10 rounded-full flex items-center justify-center">
          <Icon size={20} className="text-[#FF6B2B]" />
        </div>
        <span className="font-black uppercase tracking-widest text-sm">{title}</span>
      </div>
      <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
        <ChevronDown size={20} className="text-white/30" />
      </motion.div>
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden"
        >
          <div className="p-8 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-6">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const InputField = ({ label, icon: Icon, ...props }: any) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#FF6B2B] transition-colors">
        <Icon size={18} />
      </div>
      <input 
        {...props}
        className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white focus:border-[#FF6B2B]/50 focus:outline-none transition-all placeholder:text-white/10"
      />
    </div>
  </div>
);

export default function ContactoDigitalMicroFunnel() {
  const [step, setStep] = useState<Step>(1);
  const [videoFinished, setVideoFinished] = useState(false);


  return (
    <main className={`bg-[#0a0a0a] text-white font-sans selection:bg-[#FF6B2B] h-screen overflow-hidden relative ${step >= 3 ? "overflow-y-auto" : ""}`}>
      
      {/* --- PASO 1: HERO (Ajustado para evitar desproporción) --- */}
      <StepWrapper isVisible={step === 1}>
        <div className="absolute inset-0 z-0">
          <motion.div 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.6 }}
            className="w-full h-full bg-cover bg-center grayscale"
            style={{ backgroundImage: "url('/images/Reingenierìa/contacto-digital-portada.webp')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
        </div>

        <div className="container mx-auto px-12 md:px-20 text-left max-w-6xl relative z-10 pt-20">
          <p className="text-[#FF6B2B] text-[10px] md:text-xs font-black uppercase tracking-[0.4em] mb-4">
            CONTACTO DIGITAL · $35/AÑO
          </p>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter leading-[1.1] max-w-2xl">
            Paga ahora.<br />
            En minutos tendrás tu QR listo para que tu cliente te guarde.
          </h1>
          <p className="text-white/40 text-base md:text-lg font-bold mb-10 uppercase tracking-[0.2em] max-w-xl">
            Sin esperas. Sin técnicos. Sin complicaciones.
          </p>
          <button 
            onClick={() => setStep(2)}
            className="inline-flex items-center gap-4 bg-[#FF6B2B] text-white font-black text-lg px-12 py-6 rounded-2xl hover:scale-105 transition-all shadow-2xl shadow-[#FF6B2B]/20"
          >
            ¿Listo para empezar? <ArrowRight size={24} />
          </button>
        </div>
      </StepWrapper>

      {/* --- PASO 2: VIDEO --- */}
      <StepWrapper isVisible={step === 2}>
        <div className="container mx-auto px-6 text-center max-w-4xl py-20">
          <p onClick={() => setVideoFinished(true)} className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-4 cursor-pointer">
            Antes de pagar, mira esto. Son 60 segundos.
          </p>
          <h2 className="text-2xl md:text-4xl font-black mb-12 tracking-tighter uppercase">¿Qué pasa después de pagar?</h2>
          <div className="relative aspect-video bg-[#111] rounded-2xl overflow-hidden border border-white/5 shadow-2xl mb-10">
            <video controls onEnded={() => setVideoFinished(true)} className="w-full h-full object-cover">
              <source src="https://vz-789b942c-36ba.b-cdn.net/b473d784-04bc-47f4-bcae-c2bd51752b31/play_480p.mp4" type="video/mp4" />
            </video>
          </div>
          <button onClick={() => setStep(3)} className="inline-flex items-center gap-3 bg-[#FF6B2B] text-white font-black text-base px-12 py-5 rounded-xl hover:scale-105 transition-all">
            Ir al pago ahora <ArrowRight size={20} />
          </button>
        </div>
      </StepWrapper>

      {/* --- PASO 3: REGISTRO MAESTRO (PAGO PRIMERO) --- */}
      {step === 3 && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="container mx-auto px-6 py-12 min-h-screen flex flex-col items-center justify-start"
        >
          <div className="w-full max-w-5xl">
            <RegisterWizard paymentFirst={true} initialPlan="digital" />

          </div>
        </motion.div>
      )}


    </main>
  );
}
