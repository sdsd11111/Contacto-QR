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
    BrainCircuit,
    Ghost,
    Zap,
    Search
} from "lucide-react";
import Link from "next/link";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Tipos de datos
type QuestionId = "P1" | "P2A" | "P2B" | "P3" | "P4" | "P5" | "P6" | "LLENAR_NOMBRE" | "PANTALLA_FINAL";

interface Option {
    id: string;
    label: string;
    score: number;
}

interface Question {
    id: QuestionId;
    title: string;
    description?: string;
    dynamicTitle?: (answers: Record<string, string>) => string;
    options: Option[];
    next: (answerId: string, answers: Record<string, string>) => QuestionId;
    visualAnchor?: {
        icon: React.ReactNode;
        color: string;
        bgGradient: string;
    };
    image?: string;
}

// === CONFIGURACIÓN DE PREGUNTAS (Estilo Neuroventas) ===
const QUESTIONS: Record<string, Question> = {
    P1: {
        id: "P1",
        title: "Cuando un cliente nuevo te pide tu contacto, ¿sientes que proyectas profesionalismo?",
        visualAnchor: {
            icon: <Users className="w-16 h-16 md:w-20 md:h-20" />,
            color: "text-primary",
            bgGradient: "from-primary/20 to-transparent"
        },
        options: [
            { id: "A", label: "No, a veces busco una tarjeta y no tengo", score: 2 }, // Tarjetas
            { id: "B", label: "No, les dicto mi número y a veces se equivocan", score: 2 }, // Dictar
            { id: "C", label: "Más o menos, les mando un WhatsApp", score: 1 }, // WhatsApp
            { id: "D", label: "Sí, me buscan en redes sociales", score: 1 }, // Redes
            { id: "E", label: "No entrego contacto, soy muy conocido", score: 0 }, // No entrego
        ],
        next: (id) => (["A", "B", "C"].includes(id) ? "P2A" : "P2B"),
    },
    P2A: {
        id: "P2A",
        title: "¿Tu imagen digital actual refleja realmente la calidad (y el precio) de lo que vendes?",
        visualAnchor: {
            icon: <CheckCircle2 className="w-16 h-16 md:w-20 md:h-20" />,
            color: "text-royal",
            bgGradient: "from-royal/20 to-transparent"
        },
        options: [
            { id: "A", label: "Totalmente, mi imagen es premium", score: 2 }, // Info completa (Interpretado como bueno) -> Wait, logic was reversed in original? 
            // Original P2A: "Se la doy completa" (Score 2 - Good). 
            // Here "Totalmente" aligns with score 2 (High value customer).
            { id: "B", label: "Solo doy el teléfono, mi imagen es básica", score: 1 },
            { id: "C", label: "Les digo que vean mis redes (están desactualizadas)", score: 1 },
            { id: "D", label: "No aplica / No sé", score: 0 },
        ],
        next: () => "P3",
    },
    P2B: {
        id: "P2B",
        title: "¿Alguna vez has perdido la paciencia buscando el numero de un proveedor 'buenísimo' que no guardaste bien?",
        visualAnchor: {
            icon: <AlertCircle className="w-16 h-16 md:w-20 md:h-20" />,
            color: "text-red-500",
            bgGradient: "from-red-500/20 to-transparent"
        },
        options: [
            { id: "A", label: "Sí, es frustrante y termino llamando a otro", score: 2 },
            { id: "B", label: "A veces me pasa", score: 2 },
            { id: "C", label: "Casi nunca", score: 1 },
            { id: "D", label: "Soy muy organizado", score: 0 },
        ],
        next: () => "P3",
    },
    P3: {
        id: "P3",
        title: "Sé honesto: ¿Cómo crees que tus clientes te tienen guardado en su celular?",
        visualAnchor: {
            icon: <Target className="w-16 h-16 md:w-20 md:h-20" />,
            color: "text-primary",
            bgGradient: "from-primary/20 to-transparent"
        },
        options: [
            { id: "A", label: "Con mi Nombre y Apellido (ej: 'César Reyes')", score: 1 },
            { id: "B", label: "Con el Nombre de mi Negocio", score: 2 },
            { id: "C", label: "Por lo que vendo (ej: 'El de las Pizzas')", score: 3 },
            { id: "D", label: "Por una característica (ej: 'Restaurante rico')", score: 3 },
            { id: "E", label: "Ni idea / No me guardan", score: 1 },
        ],
        next: () => "P4",
    },
    P4: {
        id: "P4",
        title: "", // Dinámico
        dynamicTitle: (answers) => {
            const p3 = answers.P3_resp; // Mapped value
            // Neuro-copy: Paint the pain
            if (p3 === "producto_servicio") return "⚠️ Alerta Roja: Si buscan 'Pizzas' y salen 20 contactos sin foto... ¿Crees que podrían llamar a tu competencia por error?";
            if (p3 === "caracteristica") return "⚠️ Cuidado: Si te guardaron como 'Restaurante'... ¿cuántos otros restaurantes crees que tienen guardados antes que tú?";
            if (p3 === "nombre_negocio") return "Si olvidan el nombre exacto de tu negocio por un segundo... ¿qué tan fácil es que te encuentren en Google vs a tu competencia?";
            return "¿Alguna vez has pensado que un cliente quiso comprarte de nuevo, no te encontró en su lista, y se fue con otro?";
        },
        visualAnchor: {
            icon: <Search className="w-16 h-16 md:w-20 md:h-20" />,
            color: "text-orange-500",
            bgGradient: "from-orange-500/20 to-transparent"
        },
        options: [
            { id: "A", label: "Tienes razón, seguro me ha pasado", score: 2 },
            { id: "B", label: "No creo, soy inolvidable", score: 0 },
            { id: "C", label: "Tal vez, da miedo pensarlo", score: 1 },
            { id: "D", label: "Definitivamente he perdido ventas por eso", score: 3 },
        ],
        next: () => "P5",
    },
    P5: {
        id: "P5",
        title: "Para crecer como quieres este año, ¿cuántos clientes nuevos reales necesitas al mes?",
        visualAnchor: {
            icon: <Wallet className="w-16 h-16 md:w-20 md:h-20" />,
            color: "text-accent",
            bgGradient: "from-accent/20 to-transparent"
        },
        options: [
            { id: "A", label: "Solo unos pocos (1-5)", score: 1 },
            { id: "B", label: "Un flujo constante (5-20)", score: 2 },
            { id: "C", label: "Necesito escalar masivamente (20+)", score: 3 },
            { id: "E", label: "Estoy bien así", score: 0 },
        ],
        next: () => "P6",
    },
    P6: {
        id: "P6",
        title: "Si existiera una 'Vacuna Digital' que garantice que tus clientes te encuentren siempre... ¿valdría la pena invertir lo que cuesta una pizza?",
        visualAnchor: {
            icon: <BrainCircuit className="w-16 h-16 md:w-20 md:h-20" />,
            color: "text-royal",
            bgGradient: "from-royal/20 to-transparent"
        },
        options: [
            { id: "A", label: "Sí, obvio ($10-$20)", score: 3 },
            { id: "B", label: "Tal vez, si funciona", score: 3 },
            { id: "C", label: "Invertiría mucho más si trae ventas", score: 4 },
            { id: "E", label: "No gastaría nada", score: 0 },
        ],
        next: () => "LLENAR_NOMBRE",
    },
    LLENAR_NOMBRE: {
        id: "LLENAR_NOMBRE",
        title: "Estamos generando tu Diagnóstico...",
        visualAnchor: {
            icon: <Zap className="w-16 h-16 md:w-20 md:h-20" />,
            color: "text-primary",
            bgGradient: "from-primary/20 to-transparent"
        },
        options: [],
        next: () => "PANTALLA_FINAL",
    }
};

// Mapeo para mantener compatibilidad con DB
const respMapping: Record<string, string> = {
    P1_A: "tarjetas", P1_B: "dictar", P1_C: "whatsapp", P1_D: "redes", P1_E: "no_entrego",
    P3_A: "nombre_completo", P3_B: "nombre_negocio", P3_C: "producto_servicio", P3_D: "caracteristica", P3_E: "no_idea",
};

export default function DiagnosticoPage() {
    const [currentStep, setCurrentStep] = useState<QuestionId>("P1");
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [totalScore, setTotalScore] = useState(0);
    const [isFinishing, setIsFinishing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [respondentName, setRespondentName] = useState("");

    // === LOGICA DE ARQUETIPOS ===
    const getArchetype = (score: number) => {
        if (score <= 6) return {
            title: "EL AGENTE INVISIBLE",
            color: "rojo",
            desc: "Eres bueno en lo que haces de forma presencial, pero digitalmente no existes. Tus clientes dependen de su memoria para encontrarte. Estás perdiendo dinero silenciosamente.",
            cta: "Hacerte Visible Ahora"
        };
        if (score <= 13) return {
            title: "EL CONECTOR CAÓTICO",
            color: "amarillo",
            desc: "Estás en redes, tienes WhatsApp, pero todo está disperso. Tus clientes se confunden o pierden tu contacto entre tantas opciones. Necesitas centralizar.",
            cta: "Centralizar mi Contacto"
        };
        return {
            title: "EL LÍDER OCULTO",
            color: "verde",
            desc: "Tienes una gran reputación y clientes fieles. Solo te falta esa herramienta profesional que haga que tu imagen coincida con la calidad de tu servicio.",
            cta: "Profesionalizar mi Imagen"
        };
    };

    const saveResults = async (finalScore: number, name: string) => {
        setIsSaving(true);
        try {
            const arch = getArchetype(finalScore);
            await fetch('/api/survey/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    p1: answers.P1, p2a: answers.P2A || null, p2b: answers.P2B || null,
                    p3: answers.P3, p4: answers.P4, p5: answers.P5, p6: answers.P6,
                    total_score: finalScore,
                    color_semaforo: arch.color, // Maps to DB column
                    p3_resp_custom: answers.P3_resp || null,
                    nombre_local: name,
                    user_metadata: { type: 'neuro_quiz', timestamp: new Date().toISOString() }
                })
            });
        } catch (error) {
            console.error('Error saving:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleOptionSelect = async (option: Option) => {
        const nextStep = QUESTIONS[currentStep].next(option.id, answers);
        const newScore = totalScore + option.score;
        const newAnswers = { ...answers, [`${currentStep}`]: option.id };
        if (respMapping[`${currentStep}_${option.id}`]) {
            newAnswers[`${currentStep}_resp`] = respMapping[`${currentStep}_${option.id}`];
        }
        setAnswers(newAnswers);
        setTotalScore(newScore);
        setCurrentStep(nextStep);
    };

    const finalizeSurvey = async () => {
        setIsFinishing(true);
        await saveResults(totalScore, respondentName);
        setTimeout(() => {
            setCurrentStep("PANTALLA_FINAL");
            setIsFinishing(false);
        }, 800);
    };

    const archetype = getArchetype(totalScore);
    const question = QUESTIONS[currentStep] || QUESTIONS.P1;

    return (
        <div className="min-h-screen bg-slate-50 selection:bg-primary/30 flex items-center justify-center p-4 font-sans text-navy">
            <main className="relative z-10 w-full max-w-5xl">
                <AnimatePresence mode="wait">
                    {currentStep !== "PANTALLA_FINAL" ? (
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white rounded-[40px] shadow-2xl overflow-hidden min-h-[600px] flex flex-col md:flex-row border border-slate-100"
                        >
                            {/* Left Side: Visual Context */}
                            <div className="w-full md:w-5/12 bg-navy p-10 flex flex-col justify-between text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                                <div className="relative z-10">
                                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-8">
                                        <BrainCircuit size={14} /> Neuro-Diagnóstico
                                    </div>
                                    <h3 className="text-2xl font-bold opacity-90 leading-relaxed">
                                        "Tu cerebro toma decisiones 7 segundos antes de que seas consciente de ellas."
                                    </h3>
                                </div>
                                <div className="relative z-10 mt-10">
                                    <div className="w-24 h-24 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                                        {question.visualAnchor?.icon}
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Question */}
                            <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center">
                                <div className="max-w-md mx-auto w-full">
                                    <div className="flex gap-2 mb-8">
                                        {Object.keys(QUESTIONS).filter(k => k !== "PANTALLA_FINAL").map((qId) => (
                                            <div key={qId} className={cn("h-1 flex-1 rounded-full transition-all",
                                                Object.keys(answers).Includes(qId) || currentStep === qId ? "bg-primary" : "bg-slate-200"
                                            )} />
                                        ))}
                                    </div>

                                    <h2 className="text-2xl md:text-3xl font-black text-navy mb-8 leading-tight">
                                        {question.dynamicTitle ? question.dynamicTitle(answers) : question.title}
                                    </h2>

                                    <div className="space-y-3">
                                        {currentStep === "LLENAR_NOMBRE" ? (
                                            <div className="space-y-4">
                                                <input
                                                    type="text"
                                                    value={respondentName}
                                                    onChange={(e) => setRespondentName(e.target.value)}
                                                    placeholder="Nombre de tu Negocio"
                                                    className="w-full p-5 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-lg font-bold transition-all"
                                                />
                                                <button
                                                    disabled={!respondentName || isSaving}
                                                    onClick={finalizeSurvey}
                                                    className="w-full bg-primary text-white p-5 rounded-xl font-black text-lg flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/30"
                                                >
                                                    {isSaving ? "Analizando..." : "Ver Mi Diagnóstico"} <ChevronRight />
                                                </button>
                                            </div>
                                        ) : (
                                            question.options.map((option) => (
                                                <button
                                                    key={option.id}
                                                    onClick={() => handleOptionSelect(option)}
                                                    className="w-full text-left p-5 rounded-xl border-2 border-slate-100 hover:border-primary hover:bg-primary/5 transition-all group flex items-center justify-between"
                                                >
                                                    <span className="font-bold text-navy/80 group-hover:text-primary transition-colors text-lg">{option.label}</span>
                                                    <ChevronRight className="text-slate-300 group-hover:text-primary" />
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white rounded-[40px] shadow-2xl p-8 md:p-16 text-center max-w-2xl mx-auto border border-slate-100 relative overflow-hidden"
                        >
                            <div className={cn("absolute inset-0 opacity-5",
                                archetype.color === 'rojo' ? "bg-red-500" : archetype.color === 'amarillo' ? "bg-amber-400" : "bg-emerald-500"
                            )} />

                            <div className="relative z-10">
                                <p className="text-xs font-black tracking-[0.3em] uppercase opacity-50 mb-4">Diagnóstico Completado</p>
                                <h1 className="text-4xl md:text-5xl font-black text-navy mb-2">Tu Arquetipo es:</h1>
                                <div className={cn("text-3xl md:text-5xl font-black mb-6 uppercase",
                                    archetype.color === 'rojo' ? "text-red-500" : archetype.color === 'amarillo' ? "text-amber-500" : "text-emerald-500"
                                )}>
                                    {archetype.title}
                                </div>

                                <div className="bg-slate-50 p-8 rounded-2xl mb-8 border border-slate-100">
                                    <p className="text-lg md:text-xl text-navy/80 italic leading-relaxed">"{archetype.desc}"</p>
                                </div>

                                <Link href="/registro" className="inline-flex w-full md:w-auto bg-navy text-white px-8 py-5 rounded-xl font-black text-xl hover:scale-105 transition-transform shadow-xl items-center justify-center gap-3">
                                    {archetype.cta} <ArrowRight />
                                </Link>

                                <button onClick={() => window.location.reload()} className="block mx-auto mt-6 text-sm font-bold text-navy/40 hover:text-navy transition-colors">
                                    Volver a empezar
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
