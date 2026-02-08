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
    UserPlus,
    Building2
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

const QUESTIONS: Record<string, Question> = {
    P1: {
        id: "P1",
        title: "¿Cómo entrega su contacto a los clientes actualmente?",
        image: "/images/entrega_contacto.webp",
        visualAnchor: {
            icon: <Users className="w-16 h-16 md:w-20 md:h-20" />,
            color: "text-primary",
            bgGradient: "from-primary/20 to-transparent"
        },
        options: [
            { id: "A", label: "Tarjetas físicas", score: 2 },
            { id: "B", label: "Les dicto mi número", score: 2 },
            { id: "C", label: "Les mando por WhatsApp", score: 1 },
            { id: "D", label: "Me buscan en redes sociales", score: 1 },
            { id: "E", label: "No entrego contacto, ellos me buscan", score: 0 },
        ],
        next: (id) => (["A", "B", "C"].includes(id) ? "P2A" : "P2B"),
    },
    P2A: {
        id: "P2A",
        title: "Cuando alguien le pide información adicional (email, redes, dirección), ¿qué hace?",
        image: "/images/información_adicional.webp",
        visualAnchor: {
            icon: <CheckCircle2 className="w-16 h-16 md:w-20 md:h-20" />,
            color: "text-royal",
            bgGradient: "from-royal/20 to-transparent"
        },
        options: [
            { id: "A", label: "Se la doy completa", score: 2 },
            { id: "B", label: "Solo doy el teléfono", score: 1 },
            { id: "C", label: "Les digo que me busquen en redes", score: 1 },
            { id: "D", label: "No me suelen pedir más datos", score: 0 },
        ],
        next: () => "P3",
    },
    P2B: {
        id: "P2B",
        title: "¿Le ha pasado que busca a un proveedor o cliente en su teléfono y no lo encuentra porque no recuerda cómo lo guardó?",
        image: "/images/ventas_perdidas.webp",
        visualAnchor: {
            icon: <AlertCircle className="w-16 h-16 md:w-20 md:h-20" />,
            color: "text-red-500",
            bgGradient: "from-red-500/20 to-transparent"
        },
        options: [
            { id: "A", label: "Sí, me pasa todo el tiempo", score: 2 },
            { id: "B", label: "A veces sí me ha pasado", score: 2 },
            { id: "C", label: "Casi nunca me pasa", score: 1 },
            { id: "D", label: "No, siempre los encuentro", score: 0 },
        ],
        next: () => "P3",
    },
    P3: {
        id: "P3",
        title: "¿Cómo cree que sus clientes guardan su contacto en el teléfono?",
        image: "/images/clientes_guardan.webp",
        visualAnchor: {
            icon: <Target className="w-16 h-16 md:w-20 md:h-20" />,
            color: "text-primary",
            bgGradient: "from-primary/20 to-transparent"
        },
        options: [
            { id: "A", label: "Con mi nombre completo", score: 1 },
            { id: "B", label: "Con el nombre del negocio", score: 2 },
            { id: "C", label: "Con producto/servicio que vendo (ej: 'el de las parrilladas')", score: 3 },
            { id: "D", label: "Con alguna característica (ej: 'restaurante del centro')", score: 3 },
            { id: "E", label: "No tengo idea", score: 1 },
        ],
        next: () => "P4",
    },
    P4: {
        id: "P4",
        title: "", // Dinámico
        dynamicTitle: (answers) => {
            const p3 = answers.P3_resp;
            if (p3 === "producto_servicio") {
                return "Supongamos que un cliente lo tiene guardado como 'el de las parrilladas'. Busca en su teléfono 'parrilladas' y salen 10 contactos sin foto. ¿Cree que es posible que haya llamado a otro porque no supo cuál era usted?";
            }
            if (p3 === "caracteristica") {
                return "Supongamos que lo tiene guardado como 'restaurante del centro'. Busca 'restaurante' y salen 15 contactos. ¿Cree que es posible que haya llamado a otro porque usted no aparecía primero?";
            }
            if (p3 === "nombre_negocio") {
                return "Supongamos que un cliente no recuerda el nombre exacto de su negocio. Busca palabras relacionadas y no lo encuentra. ¿Cree que es posible que haya perdido esa venta?";
            }
            if (p3 === "nombre_completo") {
                return "Supongamos que un cliente no recuerda su nombre exacto. ¿Cree que es posible que no lo haya encontrado y haya comprado a otro?";
            }
            return "¿Cree que es posible que un cliente haya querido contactarlo, no lo encontró en su teléfono, y terminó comprándole a otro?";
        },
        image: "/images/ventas_perdidas.webp",
        visualAnchor: {
            icon: <AlertCircle className="w-16 h-16 md:w-20 md:h-20" />,
            color: "text-orange-500",
            bgGradient: "from-orange-500/20 to-transparent"
        },
        options: [
            { id: "A", label: "Sí, probablemente me ha pasado", score: 2 },
            { id: "B", label: "No creo, mis clientes siempre me encuentran", score: 0 },
            { id: "C", label: "No lo había pensado, pero puede ser", score: 1 },
            { id: "D", label: "Seguro, me ha pasado varias veces", score: 3 },
        ],
        next: () => "P5",
    },
    P5: {
        id: "P5",
        title: "En promedio, ¿cuántos clientes nuevos necesita al mes para que su negocio crezca?",
        image: "/images/clientes_nuevos.webp",
        visualAnchor: {
            icon: <UserPlus className="w-16 h-16 md:w-20 md:h-20" />,
            color: "text-accent",
            bgGradient: "from-accent/20 to-transparent"
        },
        options: [
            { id: "A", label: "1-5", score: 1 },
            { id: "B", label: "5-10", score: 2 },
            { id: "C", label: "10-20", score: 3 },
            { id: "D", label: "Más de 20", score: 3 },
            { id: "E", label: "No necesito más clientes", score: 0 },
        ],
        next: () => "P6",
    },
    P6: {
        id: "P6",
        title: "Si existiera una forma de asegurarse que CADA cliente que lo guarde lo tenga con su foto, negocio, y palabras clave para encontrarlo fácil, ¿cuánto invertiría?",
        image: "/images/hombre_inteligente.webp",
        visualAnchor: {
            icon: <Wallet className="w-16 h-16 md:w-20 md:h-20" />,
            color: "text-royal",
            bgGradient: "from-royal/20 to-transparent"
        },
        options: [
            { id: "A", label: "$5 o menos", score: 1 },
            { id: "B", label: "$10-15", score: 3 },
            { id: "C", label: "$20-30", score: 4 },
            { id: "D", label: "$50 o más", score: 4 },
            { id: "E", label: "No invertiría nada", score: 0 },
        ],
        next: () => "LLENAR_NOMBRE",
    },
    LLENAR_NOMBRE: {
        id: "LLENAR_NOMBRE",
        title: "¡Análisis casi listo!",
        image: "/images/logo.png",
        visualAnchor: {
            icon: <Building2 className="w-16 h-16 md:w-20 md:h-20" />, // Mantener icono pero la imagen es la que se cambiará
            color: "text-primary",
            bgGradient: "from-primary/20 to-transparent"
        },
        options: [],
        next: () => "PANTALLA_FINAL",
    }
};

const respMapping: Record<string, string> = {
    P1_A: "tarjetas",
    P1_B: "dictar",
    P1_C: "whatsapp",
    P1_D: "redes",
    P1_E: "no_entrego",
    P3_A: "nombre_completo",
    P3_B: "nombre_negocio",
    P3_C: "producto_servicio",
    P3_D: "caracteristica",
    P3_E: "no_idea",
};

export default function SurveyPage() {
    const [currentStep, setCurrentStep] = useState<QuestionId>("P1");
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [totalScore, setTotalScore] = useState(0);
    const [isFinishing, setIsFinishing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [respondentName, setRespondentName] = useState("");

    const getTrafficLight = (score: number) => {
        if (score <= 6) return { color: "rojo", label: "Bajo Impacto", message: "Gracias por su tiempo. Si en el futuro le interesa, aquí está mi contacto." };
        if (score <= 12) return { color: "amarillo", label: "Potencial", message: "Basado en sus respuestas, creo que esto podría servirle. ¿Le muestro 30 segundos cómo funciona?" };
        return { color: "verde", label: "Crecimiento Crítico", message: "Perfecto, justo esto resuelve lo que me acaba de mencionar. Déjeme mostrarle..." };
    };

    const saveResults = async (finalScore: number, name: string) => {
        setIsSaving(true);
        try {
            const traffic = getTrafficLight(finalScore);
            const response = await fetch('/api/survey/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    p1: answers.P1,
                    p2a: answers.P2A || null,
                    p2b: answers.P2B || null,
                    p3: answers.P3,
                    p4: answers.P4,
                    p5: answers.P5,
                    p6: answers.P6,
                    total_score: finalScore,
                    color_semaforo: traffic.color,
                    p3_resp_custom: answers.P3_resp || null,
                    nombre_local: name,
                    user_metadata: {
                        timestamp: new Date().toISOString(),
                        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
                    }
                })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to save');
            console.log('Survey saved successfully:', result);
        } catch (error: any) {
            console.error('Failed to save survey:', error);
            alert(`Error al guardar: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleOptionSelect = async (option: Option) => {
        const nextStep = QUESTIONS[currentStep].next(option.id, answers);
        const newScore = totalScore + option.score;

        // Guardar respuesta para lógica dinámica
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

    const resetSurvey = () => {
        setCurrentStep("P1");
        setAnswers({});
        setTotalScore(0);
        setRespondentName("");
    };

    const trafficLight = getTrafficLight(totalScore);
    const question = QUESTIONS[currentStep] || QUESTIONS.P1;

    return (
        <div className="min-h-screen bg-cream selection:bg-primary/30 flex items-center justify-center p-4">
            {/* Background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-royal/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <main className="relative z-10 w-full max-w-6xl">
                <AnimatePresence mode="wait">
                    {currentStep !== "PANTALLA_FINAL" ? (
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 1.05, y: -30 }}
                            transition={{ duration: 0.5, ease: "circOut" }}
                            className="glass-card rounded-[40px] shadow-2xl overflow-hidden min-h-[600px] flex flex-col lg:flex-row"
                        >
                            {/* Left Side: Visual Image */}
                            <div className="w-full lg:w-1/2 relative bg-navy/5 flex items-center justify-center p-8 lg:p-0">
                                <motion.div
                                    key={`img-${currentStep}`}
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2, duration: 0.6 }}
                                    className="w-full h-full flex items-center justify-center relative"
                                >
                                    <div className={cn(
                                        "absolute inset-0 blur-3xl opacity-20 animate-pulse",
                                        question.visualAnchor?.bgGradient.split(' ')[0] || "bg-primary"
                                    )} />

                                    {question.image ? (
                                        <img
                                            src={question.image}
                                            alt="Visual context"
                                            className="w-full h-full object-cover lg:max-h-[700px] shadow-2xl relative z-10"
                                        />
                                    ) : (
                                        <div className={cn(
                                            "relative z-10 p-12 rounded-full shadow-2xl bg-white/40 border border-white/60",
                                            question.visualAnchor?.color
                                        )}>
                                            {question.visualAnchor?.icon}
                                        </div>
                                    )}
                                </motion.div>
                            </div>

                            {/* Right Side: Questions & Options */}
                            <div className="w-full lg:w-1/2 p-8 md:p-12 lg:p-12 flex flex-col justify-center bg-white/30 backdrop-blur-md relative">
                                <div className="space-y-6 max-w-lg mx-auto w-full">
                                    {/* Progress */}
                                    <div className="flex gap-2 mb-4">
                                        {Object.keys(QUESTIONS).filter(k => k !== "PANTALLA_FINAL").map((qId, idx) => (
                                            <div
                                                key={qId}
                                                className={cn(
                                                    "h-1.5 flex-1 rounded-full transition-all duration-700",
                                                    Object.keys(answers).includes(qId) || currentStep === qId ? "bg-primary" : "bg-navy/5"
                                                )}
                                            />
                                        ))}
                                    </div>

                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-[10px] uppercase tracking-widest">
                                        Fase {Object.keys(answers).length + 1}
                                    </div>

                                    <h1 className="text-2xl md:text-3xl font-extrabold text-navy leading-tight">
                                        {question.dynamicTitle ? question.dynamicTitle(answers) : question.title}
                                    </h1>

                                    <div className="grid gap-3 pt-2">
                                        {currentStep === "LLENAR_NOMBRE" ? (
                                            <div className="space-y-4">
                                                <p className="text-navy/60 font-medium text-sm">Ingrese el nombre del local o persona encuestada para guardar el análisis:</p>
                                                <div className="relative group">
                                                    <input
                                                        type="text"
                                                        value={respondentName}
                                                        onChange={(e) => setRespondentName(e.target.value)}
                                                        placeholder="Nombre del local / Persona"
                                                        className="w-full p-5 rounded-2xl bg-white border-2 border-primary/20 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-lg font-semibold text-navy shadow-inner"
                                                    />
                                                </div>
                                                <button
                                                    disabled={!respondentName || isSaving || isFinishing}
                                                    onClick={finalizeSurvey}
                                                    className="w-full bg-navy text-white p-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-navy/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-navy/20 disabled:opacity-50"
                                                >
                                                    {isSaving ? "Guardando..." : "Ver Diagnóstico"}
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ) : (
                                            question.options.map((option) => (
                                                <motion.button
                                                    key={option.id}
                                                    whileHover={{ scale: 1.01, x: 5 }}
                                                    whileTap={{ scale: 0.99 }}
                                                    onClick={() => handleOptionSelect(option)}
                                                    className="group flex items-center justify-between p-5 rounded-2xl bg-white border border-navy/5 hover:border-primary/40 hover:bg-primary/5 transition-all text-left shadow-sm hover:shadow-md"
                                                >
                                                    <span className="text-navy/80 group-hover:text-navy font-bold text-base md:text-lg">
                                                        {option.label}
                                                    </span>
                                                    <div className="w-8 h-8 rounded-full bg-navy/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                                        <ChevronRight className="w-5 h-5 text-navy/40 group-hover:text-primary transition-colors" />
                                                    </div>
                                                </motion.button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-card rounded-[50px] p-6 md:p-12 text-center shadow-2xl overflow-hidden relative max-w-2xl mx-auto"
                        >
                            <div className={cn(
                                "absolute inset-0 bg-gradient-to-b opacity-10 pointer-events-none",
                                trafficLight.color === 'verde' ? "from-accent/60 to-transparent" :
                                    trafficLight.color === 'amarillo' ? "from-primary/60 to-transparent" :
                                        "from-red-500/60 to-transparent"
                            )} />

                            <div className="relative z-10 space-y-6">
                                <div className="space-y-2">
                                    <h2 className="text-navy/40 font-bold tracking-[0.2em] uppercase text-[10px]">Análisis Completado</h2>
                                    <h1 className="text-3xl md:text-5xl font-black text-navy leading-tight">
                                        Diagnóstico para <br />
                                        <span className="text-primary truncate block px-4">{respondentName}</span>
                                    </h1>
                                </div>

                                {/* Traffic Light Visual - Compacted */}
                                <div className="relative h-40 md:h-48 flex justify-center items-center">
                                    <motion.div
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                        className="relative"
                                    >
                                        <div className={cn(
                                            "absolute inset-0 rounded-full blur-[60px] animate-pulse opacity-40",
                                            trafficLight.color === 'verde' ? "bg-accent" :
                                                trafficLight.color === 'amarillo' ? "bg-primary" :
                                                    "bg-red-500"
                                        )} />

                                        <div className={cn(
                                            "w-36 h-36 md:w-44 md:h-44 rounded-full border-[8px] border-white/80 shadow-2xl flex items-center justify-center transition-all duration-1000 bg-white relative z-10",
                                            trafficLight.color === 'verde' ? "text-accent" :
                                                trafficLight.color === 'amarillo' ? "text-primary text-glow" :
                                                    "text-red-500"
                                        )}>
                                            {trafficLight.color === 'verde' && <CheckCircle2 className="w-16 h-16 md:w-20 md:h-20" />}
                                            {trafficLight.color === 'amarillo' && <AlertCircle className="w-16 h-16 md:w-20 md:h-20" />}
                                            {trafficLight.color === 'rojo' && <AlertCircle className="w-16 h-16 md:w-20 md:h-20" />}
                                        </div>
                                    </motion.div>
                                </div>

                                <div className="space-y-2">
                                    <span className={cn(
                                        "text-xl md:text-3xl font-black uppercase tracking-wider block",
                                        trafficLight.color === 'verde' ? "text-accent" :
                                            trafficLight.color === 'amarillo' ? "text-primary" :
                                                "text-red-500"
                                    )}>
                                        {trafficLight.label}
                                    </span>
                                    <p className="text-navy/60 text-base font-bold">Puntuación: <span className="text-navy">{totalScore}/20</span></p>
                                </div>

                                <div className="bg-white/50 backdrop-blur-sm p-6 md:p-8 rounded-[28px] border border-navy/5 shadow-inner mx-auto max-w-lg">
                                    <p className="text-xl md:text-2xl text-navy font-bold leading-tight italic">
                                        "{trafficLight.message}"
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                                    <Link
                                        href="/registro"
                                        className="group bg-navy text-white px-8 py-5 rounded-[20px] font-black text-lg flex items-center gap-3 hover:bg-navy/90 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-navy/30 w-full sm:w-auto justify-center"
                                    >
                                        Continuar
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                                    </Link>

                                    <button
                                        onClick={resetSurvey}
                                        className="px-6 py-5 rounded-[20px] font-bold text-navy/40 hover:text-navy hover:bg-navy/5 transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        Reiniciar
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <footer className="fixed bottom-8 text-center w-full px-4 hidden md:block">
                <p className="text-navy text-sm font-bold tracking-widest opacity-40">
                    DISEÑADO POR <a href="https://www.cesarreyesjaramillo.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:opacity-100 transition-all font-black border-b-2 border-primary/20">CÉSAR REYES JARAMILLO</a>
                </p>
            </footer>
        </div>
    );
}
