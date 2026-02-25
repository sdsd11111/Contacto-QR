"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, X, Loader2, CheckCircle, HeadphonesIcon } from "lucide-react";

export default function SupportModal({ isOpen, onClose, seller }: { isOpen: boolean; onClose: () => void; seller: any }) {
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [transcriptionData, setTranscriptionData] = useState<any>(null);

    // Recording timer
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRecording) {
            interval = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream, { audioBitsPerSecond: 16000 });
            const audioChunks: Blob[] = [];

            recorder.ondataavailable = (event) => audioChunks.push(event.data);

            recorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                await sendToAI(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
            setRecordingTime(0);

            // Auto disconnect at 90s
            setTimeout(() => {
                if (recorder.state === 'recording') stopRecording();
            }, 90000);
        } catch (error) {
            console.error('Error in mic access', error);
            alert('No pudimos acceder a tu micrófono. Revisa los permisos de tu navegador.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            setIsRecording(false);
            setIsProcessing(true);
        }
    };

    const sendToAI = async (audioBlob: Blob) => {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'interview.webm');

        try {
            const res = await fetch('/api/transcribe-interview', {
                method: 'POST',
                body: formData
            });
            const result = await res.json();
            if (res.ok && result.success) {
                setTranscriptionData(result.data);
                setIsProcessing(false);
                setIsSuccess(true);
            } else {
                throw new Error(result.error || "Fallo en el servidor");
            }
        } catch (e: any) {
            console.error('AI Interview error:', e);
            alert("No pudimos procesar tu entrevista. Intenta grabar de nuevo o hablar más claro.");
            setIsProcessing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-6 text-left">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 40 }} transition={{ type: "spring", damping: 25 }}
                    className="relative w-full sm:max-w-md bg-[#0A1229] border border-white/10 rounded-t-[32px] sm:rounded-[32px] shadow-2xl p-8"
                >
                    <button onClick={onClose} className="absolute right-6 top-6 p-2 text-white/40 hover:bg-white/10 hover:text-white rounded-full transition-all">
                        <X size={20} />
                    </button>

                    {isSuccess ? (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle size={40} className="text-green-400" />
                            </div>
                            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-green-400 mb-2">¡Entrevista Procesada!</h3>
                            <p className="text-white/60 text-sm font-medium mb-6">La IA ha generado el perfil comercial basado en tu audio.</p>

                            {transcriptionData && (
                                <div className="w-full space-y-4 text-left bg-white/5 p-4 rounded-2xl border border-white/10 max-h-[300px] overflow-y-auto custom-scrollbar">
                                    <div>
                                        <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Historia / Bio</p>
                                        <p className="text-xs text-white/80 leading-relaxed bg-black/20 p-2 rounded-lg">{transcriptionData.bio}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Productos</p>
                                        <p className="text-xs text-white/80 leading-relaxed bg-black/20 p-2 rounded-lg">{transcriptionData.products}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Etiquetas SEO</p>
                                        <p className="text-[10px] text-white/60 leading-relaxed bg-black/20 p-2 rounded-lg italic">{transcriptionData.etiquetas}</p>
                                    </div>
                                </div>
                            )}

                            <button onClick={onClose} className="mt-8 w-full py-4 bg-white/10 hover:bg-white/20 text-white font-black uppercase tracking-widest rounded-xl transition-all">
                                Volver al Panel
                            </button>
                        </div>
                    ) : (
                        <div>
                            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-6">
                                <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center flex-shrink-0 border border-primary/30 shadow-lg shadow-primary/20">
                                    <Mic className="text-white" size={28} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Asistente AI</h3>
                                    <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Entrevistador de Negocios</p>
                                </div>
                            </div>

                            <p className="text-sm text-white/50 font-medium mb-8 leading-relaxed">
                                Graba al dueño del negocio contando su historia y lo que vende. Yo redactaré su perfil profesional por ti.
                            </p>

                            <div className="flex flex-col items-center py-8 bg-white/5 rounded-3xl border border-white/10 mb-8 relative overflow-hidden">
                                {isProcessing ? (
                                    <div className="py-6 flex flex-col items-center">
                                        <Loader2 size={32} className="animate-spin text-primary mb-3" />
                                        <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">IA Redactando Perfil...</p>
                                    </div>
                                ) : (
                                    <>
                                        {isRecording && (
                                            <div className="absolute inset-0 bg-primary/10 animate-pulse pointer-events-none" />
                                        )}
                                        <p className="text-3xl font-black italic tracking-tighter text-white mb-6">
                                            {formatTime(recordingTime)}<span className="text-white/30"> / 1:30</span>
                                        </p>

                                        {!isRecording ? (
                                            <button onClick={startRecording}
                                                className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/90 transition-all shadow-[0_0_30px_rgba(255,107,0,0.3)] hover:scale-105 active:scale-95 group relative z-10"
                                            >
                                                <Mic size={32} className="group-hover:scale-110 transition-transform" />
                                            </button>
                                        ) : (
                                            <button onClick={stopRecording}
                                                className="w-20 h-20 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-400 transition-all shadow-[0_0_30px_rgba(239,68,68,0.4)] animate-pulse relative z-10"
                                            >
                                                <div className="w-8 h-8 bg-white rounded-sm" />
                                            </button>
                                        )}
                                        <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-white/40">
                                            {isRecording ? "Pulsar para procesar" : "Pulsar para entrevistar"}
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
