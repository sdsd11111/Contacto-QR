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

const renderText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
            return <span key={i} className="text-primary font-black uppercase tracking-tight block text-4xl md:text-6xl mt-2 mb-2 leading-none">{part.slice(2, -2)}</span>;
        }
        return part;
    });
};

// --- CONFIGURACIÓN DEL QUIZ (ADN ACTIVA QR) ---
const QUESTIONS = {
    P1: {
        id: "P1",
        title: "¿Qué impacto real tiene en tu negocio que tus clientes potenciales no logren guardarte y **terminan en la competencia**?",
        description: "Número Desconocido",
        sidebarQuote: "El 82% de los clientes prefiere contactar a un negocio que ya tiene guardado antes que buscar uno nuevo en redes sociales.",
        options: [
            { id: "a", label: "Alto: Necesito llamadas de ventas constantes", value: 5, archetype: "fantasma" },
            { id: "b", label: "Medio: Los clientes solo me consultan telefónicamente", value: 15, archetype: "caos" },
            { id: "c", label: "Bajo: Mi clientela tiene que venir presencialmente", value: 30, archetype: "lider" }
        ],
        image: "/images/diagnostico/waiter-stressed.jpg"
    },
    P2: {
        id: "P2",
        title: "Si garantizas que tu Identidad aparezca en el buscador de contactos, ¿por qué crees que esta **visibilidad es vital**?",
        description: "Estatura Profesional",
        sidebarQuote: "El 80% de las recomendaciones se pierden porque el cliente potencial no logra guardar el contacto correctamente en el primer intento.",
        options: [
            { id: "a", label: "Todos tienen un teléfono en la mano siempre", value: 15, archetype: "caos" },
            { id: "b", label: "Buscan primero en sus contactos guardados", value: 30, archetype: "lider" },
            { id: "c", label: "Me permite estar presente en sus estados de WhatsApp", value: 5, archetype: "fantasma" }
        ],
        image: "/images/diagnostico/gourmet.jpg"
    },
    P3: {
        id: "P3",
        title: "¿Cómo implementarías Activa QR para ser un **contacto recurrente** siempre **siempre accesible**?",
        description: "Control de Agenda",
        sidebarQuote: "Facilitar el contacto reduce la fricción en un 65%, convirtiendo prospectos casuales en clientes recurrentes.",
        options: [
            { id: "a", label: "Código QR en mi local o tarjetas físicas", value: 15, archetype: "caos" },
            { id: "b", label: "Mensaje de WhatsApp para enviar mi contacto rápido", value: 30, archetype: "lider" },
            { id: "c", label: "Campaña WhatsApp para fidelizar clientes", value: 15, archetype: "caos" }
        ],
        image: "/images/diagnostico/contacts.jpg"
    },
    P4: {
        id: "P4",
        title: "¿Te parecería una **inversión ineficaz** destinar $20 al año para asegurar que puedan **encontrarte** siempre?",
        description: "Seguridad de Marca",
        sidebarQuote: "Recuperar un solo cliente perdido por falta de contacto cuesta 5 veces más que 1 año de Activa QR.",
        options: [
            { id: "a", label: "Sí: Me parece muy costoso invertir $20 dólares", value: 0, archetype: "fantasma" },
            { id: "b", label: "No: Es una inversión baja para vender más", value: 30, archetype: "lider" }
        ],
        image: "/images/diagnostico/competitor.jpg"
    },
    P_FINAL: {
        id: "PANTALLA_FINAL",
        title: "Analizando tu Identidad Digital...",
        description: "Calculando tu impacto en la agenda de tus clientes...",
        sidebarQuote: "La primera impresión es digital. La segunda es en la agenda.",
        options: [],
        image: "/images/diagnostico/success.jpg"
    }
};

// --- ARQUETIPOS (Resultados) ---
const ARCHETYPES = {
    fantasma: {
        title: "Identidad Invisible",
        description: "Tu marca es un 'fantasma' digital. Aunque tu servicio sea excelente, si no estás en la agenda de tu cliente, no existes en el momento de la decisión. Estás perdiendo el 100% de las oportunidades de recomendación directa porque nadie sabe cómo pasarte a otros.",
        lostSalesPercent: "90%",
        color: "text-slate-500",
        icon: Users,
        image: "/images/diagnostico/chef-digital.jpg"
    },
    caos: {
        title: "Identidad Intermitente",
        description: "Estás en el 'limbo' digital. Tu cliente sabe quién eres, pero no te tiene a mano. Cada vez que necesita tu servicio, tiene que buscarte desde cero en redes sociales. Estás regalando ventas a la competencia que sí está organizada en la agenda del cliente.",
        lostSalesPercent: "50%",
        color: "text-orange-500",
        icon: AlertCircle,
        image: "/images/diagnostico/chef-chaos.jpg"
    },
    lider: {
        title: "Identidad Memorable",
        description: "Dominas la agenda de tus clientes. Apareces con autoridad (foto y servicios) en el centro de su comunicación diaria. Eres la primera opción lógica y emocional cuando surge una necesidad. Ya estás listo para escalar tu marca profesional.",
        lostSalesPercent: "5%",
        color: "text-primary",
        icon: Star,
        image: "/images/diagnostico/chef-digital.jpg"
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
                        <h2 className="text-4xl md:text-5xl font-black text-navy mb-6">Tu Diagnóstico: <br /><span className={result.color}>{result.title}</span></h2>
                        <p className="text-xl text-navy/70 mb-8 leading-relaxed">
                            {result.description}
                        </p>

                        <div className="bg-slate-50 p-6 rounded-2xl border border-navy/5 mb-8 w-full">
                            <h4 className="font-bold text-navy mb-2 flex items-center gap-2">
                                <AlertCircle size={20} className="text-red-500" /> tu Riesgo Principal:
                            </h4>
                            <p className="text-sm text-navy/60">
                                {result.title === "Identidad Invisible" && "Tu mayor riesgo es el olvido. Sin presencia en la agenda, no hay recurrencia."}
                                {result.title === "Identidad Intermitente" && "Estás a un paso de ser olvidado. La fricción en el contacto está matando tus ventas."}
                                {result.title === "Identidad Memorable" && "Estás listo para escalar. Tu lugar en la agenda es tu activo más valioso."}
                            </p>
                        </div>

                        <Link href="/registro" className="group flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-all shadow-orange w-full md:w-auto justify-center">
                            <span>Solucionarlo Ahora con ActivaQR</span>
                            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                    <div className="w-full md:w-1/3 bg-navy p-12 flex flex-col justify-center items-center text-white relative overflow-hidden">
                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                        <result.icon size={80} className="mb-6 opacity-80" />
                        <div className="text-center">
                            <div className="text-6xl font-black mb-2">{result.lostSalesPercent}</div>
                            <div className="text-sm font-bold uppercase tracking-widest opacity-60">
                                {result.title === "Identidad Memorable" ? "Liderazgo de Mercado" : "Ventas Perdidas"}
                            </div>
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
                            <Target size={12} /> Diagnóstico de Identidad
                        </div>
                        <h3 className="text-6xl md:text-7xl font-black leading-none mb-6 text-white uppercase tracking-tighter">
                            {currentQuestion.description || "Número Desconocido"}
                        </h3>
                        <p className="text-xl text-white/80 font-medium leading-relaxed italic border-l-4 border-primary pl-6 py-2">
                            "{currentQuestion.sidebarQuote}"
                        </p>
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
                            <h1 className="text-2xl md:text-3xl font-bold text-navy mb-10 leading-snug tracking-tight">
                                {renderText(currentQuestion.title)}
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
