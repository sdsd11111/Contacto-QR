"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronRight,
    RotateCcw,
    CheckCircle2,
    AlertCircle,
    Target,
    Users,
    Wallet,
    ArrowRight,
    ArrowLeft,
    Utensils,
    Building2,
    Star
} from "lucide-react";
import Link from "next/link";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// --- CONFIGURACIÓN DEL QUIZ (NICHO: RESTAURANTES) ---
const QUESTIONS = {
    P1: {
        id: "P1",
        title: "¿Qué pasa cuando un cliente quiere tu contacto?",
        description: "Imagina un sábado por la noche, restaurante lleno.",
        options: [
            { id: "a", label: "Tengo tarjetas de papel (cuando encuentro)", value: 10, archetype: "fantasma" },
            { id: "b", label: "Les dicto mi número (a veces lo anotan mal)", value: 5, archetype: "fantasma" },
            { id: "c", label: "Les digo 'búscanos en Instagram'", value: 15, archetype: "caos" },
            { id: "d", label: "Escanean mi QR y se guarda automático", value: 30, archetype: "lider" }
        ],
        image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=1000" // Prompt: Waiter stressed looking for card
    },
    P2: {
        id: "P2",
        title: "¿Tu presencia digital refleja el sabor de tu comida?",
        description: "Sé honesto. Tu plato estrella es un 10.",
        options: [
            { id: "a", label: "No, mi digital se ve 'barato' vs mi comida", value: 5, archetype: "fantasma" },
            { id: "b", label: "Es funcional, pero no 'abre el apetito'", value: 15, archetype: "caos" },
            { id: "c", label: "Sí, se ve tan profesional como mi servicio", value: 30, archetype: "lider" }
        ],
        image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&q=80&w=1000" // Prompt: Gourmet dish vs broken phone
    },
    // Pregunta 3 removida/simplificada para flujo rápido
    P3: {
        id: "P3",
        title: "¿Cómo te tienen guardado tus clientes?",
        description: "Revisa el celular de un amigo.",
        options: [
            { id: "a", label: "Como 'El de las Pizzas' o 'Restaurante'", value: 5, archetype: "fantasma" },
            { id: "b", label: "No me tienen guardado", value: 0, archetype: "fantasma" },
            { id: "c", label: "Con nombre, logo y foto de perfil", value: 30, archetype: "lider" }
        ],
        image: "https://images.unsplash.com/photo-1512428559087-560fa5ce7d5b?auto=format&fit=crop&q=80&w=1000" // Prompt: Generic contact list
    },
    P4: {
        id: "P4",
        title: "Viernes noche. Tu cliente busca dónde cenar.",
        description: "¿A quién llama primero?",
        options: [
            { id: "a", label: "A mi competencia (aparece primero)", value: 0, archetype: "caos" },
            { id: "b", label: "A mí, porque tiene mi contacto a mano", value: 30, archetype: "lider" },
            { id: "c", label: "Busca en Google y se pierde", value: 10, archetype: "fantasma" }
        ],
        image: "https://images.unsplash.com/photo-1550966871-3ed3c47e2ce2?auto=format&fit=crop&q=80&w=1000" // Prompt: Customer looking at competitor
    },
    P5: {
        id: "P5",
        title: "¿Cómo gestionas tus reservas hoy?",
        description: "El flujo de entrada.",
        options: [
            { id: "a", label: "WhatsApp personal mezclado con familia", value: 10, archetype: "caos" },
            { id: "b", label: "Teléfono fijo (si alguien contesta)", value: 5, archetype: "fantasma" },
            { id: "c", label: "Sistema digital / Business automatizado", value: 30, archetype: "lider" }
        ],
        image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=1000" // Prompt: Empty vs Full tables
    },
    P_FINAL: {
        id: "PANTALLA_FINAL",
        title: "Analizando tu ADN Gastronómico...",
        description: "Calculando tu arquetipo digital...",
        options: [], // Fix TS error
        image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1000" // Prompt: Digital Success
    }
};

// --- ARQUETIPOS (Resultados) ---
const ARCHETYPES = {
    fantasma: {
        title: "El Fantasma Gastronómico",
        description: "Tu comida es increíble, pero digitalmente eres invisible. Pierdes el 40% de reservas porque los clientes no encuentran tu número rápido.",
        color: "text-slate-500",
        icon: Users,
        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1000"
    },
    caos: {
        title: "El Chef Caótico",
        description: "Tienes redes y ganas, pero tu proceso de reserva es fricción pura. El cliente se frustra antes de pedir.",
        color: "text-orange-500",
        icon: AlertCircle,
        image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=1000"
    },
    lider: {
        title: "El Magnate Digital",
        description: "Tienes el control. Tus mesas se llenan porque es FACIL encontrarte y reservarte. Solo necesitas escalar.",
        color: "text-primary",
        icon: Star,
        image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=1000"
    }
};

export default function QuizPage() {
    const [currentStep, setCurrentStep] = useState("P1");
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleOptionSelect = async (option: any) => {
        const newAnswers = { ...answers, [currentStep]: option };
        setAnswers(newAnswers);

        // Lógica de navegación
        const questionKeys = Object.keys(QUESTIONS);
        const currentIndex = questionKeys.indexOf(currentStep);

        if (currentIndex < questionKeys.length - 2) { // -2 porque P_FINAL es el ultimo y P5 es el anteultimo
            setCurrentStep(questionKeys[currentIndex + 1]);
        } else {
            // Finalizar
            finishQuiz(newAnswers);
        }
    };

    const finishQuiz = async (finalAnswers: any) => {
        setIsSubmitting(true);
        setCurrentStep("P_FINAL");

        // Calcular Arquetipo (Lógica simple de mayoría)
        let counts = { fantasma: 0, caos: 0, lider: 0 };
        Object.values(finalAnswers).forEach((ans: any) => {
            if (ans.archetype) counts[ans.archetype as keyof typeof counts]++;
        });

        const winner = Object.entries(counts).reduce((a, b) => a[1] > b[1] ? a : b)[0];
        const archetypeData = ARCHETYPES[winner as keyof typeof ARCHETYPES];

        // Simular proceso de análisis
        setTimeout(async () => {
            setResult(archetypeData);

            // Aquí iría el guardado en DB (Mapeo a P1..P6)
            // await saveToDb(...)

            setIsSubmitting(false);
        }, 2000);
    };

    const handleGoBack = () => {
        const questionKeys = Object.keys(QUESTIONS);
        const currentIndex = questionKeys.indexOf(currentStep);

        if (currentIndex > 0) {
            const prevStep = questionKeys[currentIndex - 1];
            setCurrentStep(prevStep);
            // Opcional: Eliminar la respuesta actual al retroceder
            const newAnswers = { ...answers };
            delete newAnswers[prevStep];
            setAnswers(newAnswers);
        }
    };

    const currentQuestion = QUESTIONS[currentStep as keyof typeof QUESTIONS];

    // --- RENDER DE RESULTADO ---
    if (result) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative">
                {/* BOTÓN DE REINICIAR (En resultados tiene más sentido que Volver al Inicio o Reintentar) */}
                <button
                    onClick={() => window.location.reload()}
                    className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 rounded-full shadow-lg border border-navy/10 text-navy font-bold text-sm transition-all hover:scale-105 group"
                >
                    <RotateCcw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                    <span className="hidden sm:inline">Reiniciar Test</span>
                </button>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
                >
                    <div className="flex-1 p-12 flex flex-col justify-center items-start text-left">
                        <span className="text-xs font-bold uppercase tracking-widest text-navy/40 mb-4">Diagnóstico Completado</span>
                        <h2 className="text-4xl md:text-5xl font-black text-navy mb-6">Eres un <br /><span className={result.color}>{result.title}</span></h2>
                        <p className="text-xl text-navy/70 mb-8 leading-relaxed">
                            {result.description}
                        </p>

                        <div className="bg-slate-50 p-6 rounded-2xl border border-navy/5 mb-8 w-full">
                            <h4 className="font-bold text-navy mb-2 flex items-center gap-2">
                                <AlertCircle size={20} className="text-red-500" /> tu Riesgo Principal:
                            </h4>
                            <p className="text-sm text-navy/60">
                                {result.title === "El Fantasma Gastronómico" && "Tus clientes se van a la competencia porque Google Maps los envía allí."}
                                {result.title === "El Chef Caótico" && "Pierdes reservas por no contestar WhatsApp a tiempo."}
                                {result.title === "El Magnate Digital" && "Estás listo para franquiciar, pero necesitas automatizar más."}
                            </p>
                        </div>

                        <Link href="/registro" className="group flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-all shadow-orange w-full md:w-auto justify-center">
                            <span>Solucionarlo Ahora con VCard</span>
                            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                    <div className="w-full md:w-1/3 bg-navy p-12 flex flex-col justify-center items-center text-white relative overflow-hidden">
                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                        <result.icon size={80} className="mb-6 opacity-80" />
                        <div className="text-center">
                            <div className="text-6xl font-black mb-2">40%</div>
                            <div className="text-sm font-bold uppercase tracking-widest opacity-60">Ventas Perdidas</div>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col md:flex-row font-sans relative">
            {/* BOTÓN DE REGRESO A PREGUNTA ANTERIOR */}
            {currentStep !== "P1" && currentStep !== "P_FINAL" && (
                <button
                    onClick={handleGoBack}
                    className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full shadow-lg border border-navy/10 text-navy font-bold text-sm transition-all hover:scale-105 group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="hidden sm:inline">Anterior</span>
                </button>
            )}

            {/* BOTÓN AL INICIO (Solo en P1) */}
            {currentStep === "P1" && (
                <Link
                    href="/"
                    className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full shadow-lg border border-navy/10 text-navy font-bold text-sm transition-all hover:scale-105 group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="hidden sm:inline">Volver</span>
                </Link>
            )}

            {/* IZQUIERDA: IMAGEN DINÁMICA */}
            <div className="flex-1 bg-navy relative overflow-hidden hidden md:flex flex-col justify-center items-center">
                <AnimatePresence mode="wait">
                    <motion.img
                        key={currentStep}
                        src={currentQuestion.image}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 0.6, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.7 }}
                        className="absolute inset-0 w-full h-full object-cover"
                        alt="Context visualization"
                    />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/50 to-transparent"></div>

                <div className="relative z-10 p-12 text-white max-w-lg">
                    <motion.div
                        key={currentQuestion.description}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                            <Utensils size={12} /> Diagnóstico Restaurante
                        </div>
                        <h3 className="text-3xl font-bold leading-tight mb-4 text-white/90">
                            "{currentQuestion.description}"
                        </h3>
                    </motion.div>
                </div>
            </div>

            {/* DERECHA: PREGUNTAS */}
            <div className="flex-1 bg-white p-8 md:p-12 lg:p-20 flex flex-col justify-center relative">
                <div className="max-w-lg mx-auto w-full">
                    {/* Progress */}
                    <div className="flex gap-2 mb-8">
                        {Object.keys(QUESTIONS).filter(k => k !== "P_FINAL").map((qId) => (
                            <div key={qId} className={cn("h-1 flex-1 rounded-full transition-all",
                                Object.keys(answers).includes(qId) || currentStep === qId ? "bg-primary" : "bg-slate-200"
                            )} />
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                        >
                            <h1 className="text-3xl md:text-4xl font-black text-navy mb-8 leading-tight">
                                {currentQuestion.title}
                            </h1>

                            <div className="space-y-4">
                                {currentQuestion.options && currentQuestion.options.map((option: any) => (
                                    <button
                                        key={option.id}
                                        onClick={() => handleOptionSelect(option)}
                                        className="w-full text-left p-6 rounded-2xl border-2 border-navy/5 hover:border-primary/30 hover:bg-primary/5 hover:shadow-lg transition-all group flex items-center justify-between"
                                    >
                                        <span className="text-lg font-medium text-navy/80 group-hover:text-navy">
                                            {option.label}
                                        </span>
                                        <ChevronRight className="text-navy/20 group-hover:text-primary transition-colors" />
                                    </button>
                                ))}
                            </div>

                            {/* Loading State */}
                            {currentStep === "P_FINAL" && (
                                <div className="text-center py-12">
                                    <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-6"></div>
                                    <p className="text-navy/60 font-bold animate-pulse">Procesando tus respuestas...</p>
                                </div>
                            )}

                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
