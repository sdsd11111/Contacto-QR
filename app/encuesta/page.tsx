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
    Smartphone,
    Building2,
    UserPlus,
    HeartPulse,
    Search,
    CreditCard,
    MessageCircle,
    Share2,
    UserCircle,
    HelpCircle,
    MapPin,
    MousePointer2,
    Flame
} from "lucide-react";
import Link from "next/link";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// --- TIPOS ---
type QuestionId = "P1" | "P2A" | "P2B" | "P3" | "P4" | "P5" | "P6" | "P7" | "LLENAR_NOMBRE" | "PANTALLA_FINAL";

interface Option {
    id: string;
    label: string;
    score: number;
    trigger?: string;
    icon?: React.ElementType;
}

interface Question {
    id: QuestionId;
    title: string;
    description?: string;
    dynamicTitle?: (answers: Record<string, string>) => string;
    options: Option[];
    next: (answerId: string, answers: Record<string, string>) => QuestionId;
    image: string;
    icon: React.ElementType;
}

// --- VERSIÓN 2 UNIVERSAL ---
const QUESTIONS: Record<string, Question> = {
    P1: {
        id: "P1",
        title: "Cuando conoces a alguien que podría necesitar de tus trabajos, ¿cómo le das tu contacto?",
        description: "El momento de la verdad: ¿Serás memorable o invisible?",
        image: "/images/clientes_guardan.webp",
        icon: Users,
        options: [
            { id: "A", label: "Le doy mi tarjeta de presentación", score: 2, icon: CreditCard },
            { id: "B", label: "Le dicto mi número mientras anota", score: 4, icon: MousePointer2 },
            { id: "C", label: "Le envío mi contacto por WhatsApp", score: 1, icon: MessageCircle },
            { id: "D", label: "Le digo que me busque en redes sociales", score: 3, icon: Share2 },
            { id: "E", label: "Si realmente me necesita, me buscará", score: 5, icon: Search },
        ],
        next: (id) => (["A", "B", "C", "D"].includes(id) ? "P2A" : "P2B"),
    },
    P2A: {
        id: "P2A",
        title: "Cuando alguien te pide más datos (email, dirección, redes), ¿qué haces?",
        description: "Tu profesionalismo se nota en los detalles.",
        image: "/images/información_adicional.webp",
        icon: CheckCircle2,
        options: [
            { id: "A", label: "Le envío toda mi información completa", score: 0, icon: CheckCircle2 },
            { id: "B", label: "Solo le doy mi número, lo demás después", score: 3, icon: Smartphone },
            { id: "C", label: "Le digo 'búscame en Instagram/Facebook'", score: 3, icon: Share2 },
            { id: "D", label: "Casi nunca me piden más información", score: 5, icon: HelpCircle },
        ],
        next: () => "P3",
    },
    P2B: {
        id: "P2B",
        title: "¿Te ha pasado que buscas a alguien y NO lo encuentras?",
        description: "Si a TI te pasa... imagina cuando te buscan a ti.",
        image: "/images/información_adicional.webp",
        icon: Search,
        options: [
            { id: "A", label: "Sí, constantemente me frustra", score: 5, icon: AlertCircle },
            { id: "B", label: "Sí, de vez en cuando me pasa", score: 3, icon: Search },
            { id: "C", label: "Muy rara vez", score: 1, icon: CheckCircle2 },
            { id: "D", label: "No, siempre encuentro todo rápido", score: 0, icon: Target },
        ],
        next: () => "P3",
    },
    P3: {
        id: "P3",
        title: "¿Cómo crees que la gente te guarda en su teléfono?",
        description: "Tu identidad digital es cómo te recuerdan los demás.",
        image: "/images/como_te-registran.webp",
        icon: Smartphone,
        options: [
            { id: "A", label: "Con mi nombre y apellido", score: 1, trigger: "nombre", icon: UserCircle },
            { id: "B", label: "Con mi nombre + oficio (ej: Juan Carpintero)", score: 2, trigger: "nombre", icon: Building2 },
            { id: "C", label: "Como 'el carpintero', 'la abogada', etc.", score: 4, trigger: "oficio", icon: MousePointer2 },
            { id: "D", label: "Como 'el del centro' o alguna referencia", score: 3, trigger: "referencia", icon: MapPin },
            { id: "E", label: "Sinceramente, no tengo idea", score: 5, trigger: "no_idea", icon: HelpCircle },
        ],
        next: () => "P4",
    },
    P4: {
        id: "P4",
        title: "", // Dinámico
        dynamicTitle: (answers) => {
            const p3Choice = answers.P3_trigger;
            if (p3Choice === "oficio") {
                return "¿Y si al buscar tu oficio salen 10 contactos sin foto? ¿Llamaran al primero o a TI?";
            }
            if (p3Choice === "referencia") {
                return "Cuando buscan por referencia hay 20 resultados. Sin foto, ¿crees de verdad que te eligen a ti?";
            }
            if (p3Choice === "no_idea") {
                return "Si no sabes cómo te guardan, ¿cómo puedes estar seguro de que te encuentran?";
            }
            return "¿Y si olvidan tu nombre? ¿Te buscan 5 veces o llamaran a otro que SÍ tiene foto?";
        },
        description: "En la guerra de la atención, el que no destaca, desaparece.",
        image: "/images/clientes_guardan.webp",
        icon: AlertCircle,
        options: [
            { id: "A", label: "Definitivamente me ha pasado", score: 5, icon: AlertCircle },
            { id: "B", label: "Probablemente sí, nunca lo pensé", score: 3, icon: HelpCircle },
            { id: "C", label: "Tiene mucho sentido ahora", score: 3, icon: Target },
            { id: "D", label: "No creo, siempre me encuentran", score: 0, icon: CheckCircle2 },
        ],
        next: () => "P5",
    },
    P5: {
        id: "P5",
        title: "¿Cuántas nuevas oportunidades necesitas AL MES para crecer financieramente?",
        description: "Cada oportunidad perdida es un paso atrás.",
        image: "/images/clientes_nuevos.webp",
        icon: UserPlus,
        options: [
            { id: "A", label: "1-3 nuevas oportunidades", score: 2, icon: UserPlus },
            { id: "B", label: "3-7 nuevas oportunidades", score: 3, icon: UserPlus },
            { id: "C", label: "7-15 nuevas oportunidades", score: 4, icon: UserPlus },
            { id: "D", label: "Más de 15 nuevas oportunidades", score: 5, icon: Flame },
            { id: "E", label: "No necesito más clientes", score: -8, icon: Target },
        ],
        next: () => "P6",
    },
    P6: {
        id: "P6",
        title: "¿Cuánto invertirías por GARANTIZAR que todos te guarden con tu foto y nombre?",
        description: "Ponle precio a nunca más perder una oportunidad.",
        image: "/images/hombre_inteligente.webp",
        icon: Wallet,
        options: [
            { id: "A", label: "$5 o menos", score: 1, icon: Wallet },
            { id: "B", label: "$10-$20", score: 2, icon: Wallet },
            { id: "C", label: "$25-$40", score: 4, icon: Wallet },
            { id: "D", label: "$50 o más si funciona", score: 5, icon: Flame },
            { id: "E", label: "Nada, prefiero seguir como estoy", score: -10, icon: AlertCircle },
        ],
        next: () => "P7",
    },
    P7: {
        id: "P7",
        title: "¿Alguna vez supiste que alguien necesitaba lo que tú haces, pero NO te llamó?",
        description: "Ese momento en que te enteras que contrataron a otro.",
        image: "/images/hombre_pensativo.webp",
        icon: HeartPulse,
        options: [
            { id: "A", label: "Sí, y me molesta cada vez", score: 5, icon: AlertCircle },
            { id: "B", label: "Sí, me ha pasado un par de veces", score: 3, icon: HeartPulse },
            { id: "C", label: "Creo que sí, no estoy seguro", score: 2, icon: HelpCircle },
            { id: "D", label: "No, siempre me contactan", score: 0, icon: CheckCircle2 },
        ],
        next: () => "LLENAR_NOMBRE",
    },
    LLENAR_NOMBRE: {
        id: "LLENAR_NOMBRE",
        title: "¡Tu diagnóstico está listo!",
        description: "Ingresa tu nombre para personalizar los resultados.",
        image: "/images/logo.png",
        icon: Building2,
        options: [],
        next: () => "PANTALLA_FINAL",
    }
};

export default function SurveyPage() {
    const [currentStep, setCurrentStep] = useState<QuestionId>("P1");
    const [stepHistory, setStepHistory] = useState<QuestionId[]>([]);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [totalScore, setTotalScore] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [respondentName, setRespondentName] = useState("");

    const getTrafficLight = (score: number) => {
        if (score <= 9) return {
            color: "rojo",
            label: "Perfil: Sistema Estable",
            status: "Tu visibilidad es funcional",
            message: "Parece que tienes un sistema que te funciona. Pero si quieres optimizar cada contacto, aquí estaremos.",
            cta: "Guardar para Después"
        };
        if (score <= 17) return {
            color: "amarillo",
            label: "Zona de Riesgo: Mejora Necesaria",
            status: "Estás dejando oportunidades sobre la mesa",
            message: "Tienes una base, pero hay FUGAS. ¿Te muestro cómo convertir esas oportunidades 'tal vez' en SEGURAS?",
            cta: "Sí, Quiero Mejorar Esto"
        };
        return {
            color: "verde",
            label: "Alerta Crítica: Invisibilidad Activa",
            status: "Estás perdiendo oportunidades AHORA",
            message: "Tu perfil está en ALTO RIESGO. Las personas NO te encuentran fácilmente. ¿Solucionamos esto en 30 segundos?",
            cta: "Mostrarme la Solución"
        };
    };

    const handleOptionSelect = (option: Option) => {
        const nextStep = QUESTIONS[currentStep].next(option.id, answers);
        const newScore = totalScore + option.score;

        const newAnswers = { ...answers, [currentStep]: option.id };
        if (option.trigger) {
            newAnswers[`${currentStep}_trigger`] = option.trigger;
        }

        setAnswers(newAnswers);
        setTotalScore(newScore);
        setStepHistory(prev => [...prev, currentStep]);
        setCurrentStep(nextStep);
    };

    const handleGoBack = () => {
        if (stepHistory.length > 0) {
            const prevHistory = [...stepHistory];
            const prevStep = prevHistory.pop()!;

            const prevOptionId = answers[prevStep];
            const prevOption = QUESTIONS[prevStep].options.find(o => o.id === prevOptionId);
            if (prevOption) {
                setTotalScore(prev => prev - prevOption.score);
            }

            const newAnswers = { ...answers };
            delete newAnswers[prevStep];
            delete newAnswers[`${prevStep}_trigger`];

            setAnswers(newAnswers);
            setStepHistory(prevHistory);
            setCurrentStep(prevStep);
        }
    };

    const saveResults = async () => {
        setIsSaving(true);
        try {
            const traffic = getTrafficLight(totalScore);
            await fetch('/api/survey/submit', {
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
                    total_score: totalScore,
                    color_semaforo: traffic.color,
                    nombre_local: respondentName,
                    user_metadata: {
                        p7_bonus: answers.P7 || null,
                        timestamp: new Date().toISOString()
                    }
                })
            });
        } catch (error) {
            console.error('Failed to save survey:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const finalizeSurvey = async () => {
        await saveResults();
        setCurrentStep("PANTALLA_FINAL");
    };

    const resetSurvey = () => {
        setCurrentStep("P1");
        setStepHistory([]);
        setAnswers({});
        setTotalScore(0);
        setRespondentName("");
    };

    const trafficLight = getTrafficLight(totalScore);
    const question = QUESTIONS[currentStep] || QUESTIONS.P1;

    if (currentStep === "PANTALLA_FINAL") {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative font-sans">
                <button
                    onClick={resetSurvey}
                    className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 rounded-full shadow-lg border border-navy/10 text-navy font-bold text-sm transition-all hover:scale-105 group"
                >
                    <RotateCcw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                    <span>Reiniciar</span>
                </button>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-4xl w-full bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[500px]"
                >
                    <div className="flex-1 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                        <span className="text-xs font-bold uppercase tracking-widest text-navy/40 mb-4">Resultado Personalizado</span>
                        <h2 className="text-4xl md:text-5xl font-black text-navy mb-4 leading-tight">
                            <span className={cn(
                                trafficLight.color === 'verde' ? "text-red-600" :
                                    trafficLight.color === 'amarillo' ? "text-primary" :
                                        "text-emerald-600"
                            )}>{trafficLight.label}</span>
                        </h2>

                        <p className="text-xl font-black text-navy/80 mb-6 italic">{trafficLight.status}</p>

                        <div className="bg-slate-50 p-6 rounded-2xl border border-navy/5 mb-8 w-full">
                            <p className="text-lg text-navy/70 leading-relaxed font-medium">
                                <span className="text-navy font-black">{respondentName}</span>, {trafficLight.message}
                            </p>
                        </div>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="text-sm font-bold text-navy/40 uppercase tracking-widest">Nivel de Visibilidad:</div>
                            <div className="text-2xl font-black text-navy">{totalScore}/35</div>
                        </div>

                        <Link href="/#demo-video" className={cn(
                            "group flex items-center gap-3 px-8 py-5 rounded-full font-black text-xl hover:scale-105 transition-all shadow-2xl w-full md:w-auto justify-center",
                            trafficLight.color === 'verde' ? "bg-red-600 text-white shadow-red-500/30" :
                                trafficLight.color === 'amarillo' ? "bg-primary text-white shadow-primary/30" :
                                    "bg-emerald-600 text-white shadow-emerald-500/30"
                        )}>
                            <span>{trafficLight.cta}</span>
                            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className={cn(
                        "w-full md:w-1/3 p-12 flex flex-col justify-center items-center text-white relative overflow-hidden min-h-[200px]",
                        trafficLight.color === 'verde' ? "bg-red-600" :
                            trafficLight.color === 'amarillo' ? "bg-primary" :
                                "bg-emerald-600"
                    )}>
                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] animate-pulse"></div>
                        <div className="relative z-10 bg-white/20 p-8 rounded-full backdrop-blur-md mb-6 shadow-2xl">
                            {trafficLight.color === 'verde' && <AlertCircle size={60} strokeWidth={3} />}
                            {trafficLight.color === 'amarillo' && <Target size={60} strokeWidth={3} />}
                            {trafficLight.color === 'rojo' && <CheckCircle2 size={60} strokeWidth={3} />}
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col md:flex-row font-sans relative bg-white overflow-hidden">
            {/* BOTONES NAVEGACIÓN */}
            <div className="absolute top-6 left-6 z-50 flex gap-2">
                {currentStep !== "P1" && (
                    <button
                        onClick={handleGoBack}
                        className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-md hover:bg-white rounded-full shadow-lg border border-navy/5 text-navy font-bold text-sm transition-all hover:scale-105 group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Anterior</span>
                    </button>
                )}
                {currentStep === "P1" && (
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-md hover:bg-white rounded-full shadow-lg border border-navy/5 text-navy font-bold text-sm transition-all hover:scale-105 group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Volver</span>
                    </Link>
                )}
            </div>

            {/* IZQUIERDA: CONTENIDO VISUAL */}
            <div className="flex-1 bg-navy relative overflow-hidden hidden md:flex flex-col justify-center px-12 lg:px-20">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0"
                    >
                        <motion.img
                            src={question.image}
                            initial={{ scale: 1.2, filter: "brightness(0.6)" }}
                            animate={{ scale: 1, filter: "brightness(0.7)" }}
                            className="w-full h-full object-cover"
                            alt=""
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-navy/10 via-transparent to-navy/30"></div>
                    </motion.div>
                </AnimatePresence>

                <div className="relative z-10 w-full">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="space-y-8"
                    >
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest text-primary border border-white/20">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            Test de Visibilidad
                        </div>

                        <h1 className="text-4xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight drop-shadow-2xl">
                            {question.dynamicTitle ? question.dynamicTitle(answers) : question.title}
                        </h1>

                        <div className="flex items-start gap-4 p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 max-w-lg">
                            <div className="bg-primary/20 p-2 rounded-xl text-primary mt-1">
                                <Smartphone size={20} />
                            </div>
                            <p className="text-xl text-white/80 font-medium leading-relaxed italic">
                                &quot;{question.description}&quot;
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* DERECHA: SELECCIÓN (Contenedor Principal con Efecto Glass en Móvil) */}
            <div className="flex-1 relative min-h-screen flex flex-col justify-start md:justify-center overflow-y-auto">
                {/* Fondo Glass para Móvil */}
                <div className="absolute inset-0 md:hidden z-0">
                    <img
                        src={question.image}
                        className="w-full h-full object-cover blur-md scale-110 opacity-85"
                        alt=""
                    />
                    <div className="absolute inset-0 bg-navy/15"></div>
                </div>

                <div className="relative z-10 flex-1 bg-transparent md:bg-white p-6 md:p-12 lg:p-20 flex flex-col justify-start md:justify-center">
                    <div className="max-w-md mx-auto w-full pt-20 md:pt-0">
                        {/* Contenido Visual en Móvil (Título y Desc) */}
                        <div className="mb-8 md:hidden space-y-4">
                            <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-primary border border-primary/30">
                                Test de Visibilidad
                            </div>
                            <h1 className="text-3xl font-black text-white leading-tight">
                                {question.dynamicTitle ? question.dynamicTitle(answers) : question.title}
                            </h1>
                            <p className="text-lg text-white/60 font-medium italic leading-relaxed">
                                &quot;{question.description}&quot;
                            </p>
                        </div>

                        {/* Progress Indicator */}
                        <div className="flex items-center gap-3 mb-12">
                            <div className="flex flex-1 gap-1.5 h-1.5">
                                {["P1", "P2", "P3", "P4", "P5", "P6", "P7", "LL"].map((qId, idx) => {
                                    const stepsArr = ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "LL"];
                                    const currentVisualId = currentStep.startsWith("P2") ? "P2" :
                                        currentStep === "LLENAR_NOMBRE" ? "LL" : currentStep;
                                    const activeIdx = stepsArr.indexOf(currentVisualId);
                                    const isDone = activeIdx > idx;
                                    const isActive = activeIdx === idx;
                                    return (
                                        <div key={idx} className={cn(
                                            "flex-1 rounded-full transition-all duration-700",
                                            isDone ? "bg-white/20" : isActive ? "bg-primary" : "bg-white/10"
                                        )} />
                                    );
                                })}
                            </div>
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-tighter w-8 text-right">
                                {Math.round(((stepHistory.length + 1) / 8) * 100)}%
                            </span>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.4 }}
                            >
                                {currentStep === "LLENAR_NOMBRE" ? (
                                    <div className="space-y-8">
                                        <h2 className="text-4xl font-black text-white md:text-navy leading-tight">
                                            {question.title}
                                        </h2>
                                        <p className="text-white/60 md:text-navy/50 font-bold mb-8 italic text-lg leading-relaxed">
                                            {question.description}
                                        </p>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-6 flex items-center text-navy/20 group-focus-within:text-primary transition-colors">
                                                <Building2 size={24} />
                                            </div>
                                            <input
                                                type="text"
                                                value={respondentName}
                                                onChange={(e) => setRespondentName(e.target.value)}
                                                placeholder="Tu nombre o negocio..."
                                                className="w-full pl-16 pr-6 py-6 bg-slate-50 border-2 border-transparent rounded-[2rem] text-xl font-bold outline-none focus:border-primary/20 focus:bg-white transition-all shadow-inner"
                                                autoFocus
                                            />
                                        </div>
                                        <button
                                            disabled={!respondentName || isSaving}
                                            onClick={finalizeSurvey}
                                            className="w-full bg-navy text-white p-6 rounded-[2rem] font-black text-xl hover:bg-navy/90 hover:scale-[1.02] shadow-2xl transition-all disabled:opacity-30 disabled:scale-100 flex items-center justify-center gap-3"
                                        >
                                            {isSaving ? "Calculando..." : "Ver Mi Diagnóstico"}
                                            <ArrowRight size={24} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 mb-8">
                                            <div className="h-0.5 w-6 bg-primary opacity-30"></div>
                                            <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Elige una opción</p>
                                        </div>

                                        <div className="space-y-3.5">
                                            {question.options.map((option) => (
                                                <button
                                                    key={option.id}
                                                    onClick={() => handleOptionSelect(option)}
                                                    className="group w-full text-left p-6 rounded-[2rem] border-2 border-slate-50 bg-slate-50/30 hover:bg-white hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all flex items-center justify-between"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="bg-white p-3 rounded-2xl shadow-sm group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                                            {option.icon ? <option.icon size={22} /> : <Target size={22} />}
                                                        </div>
                                                        <span className="text-lg font-bold text-navy/80 tracking-tight group-hover:text-navy transition-colors leading-snug">
                                                            {option.label}
                                                        </span>
                                                    </div>
                                                    <div className="bg-navy/5 p-2 rounded-xl group-hover:bg-primary group-hover:text-white transition-all opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0">
                                                        <ChevronRight size={20} />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
            <p className="fixed bottom-6 right-10 text-[10px] font-black uppercase tracking-[0.4em] text-navy/20 hidden lg:block transform rotate-90 origin-right">
                Diagnóstico Universal v2.0
            </p>
        </div>
    );
}
