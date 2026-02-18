"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { motion } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import {
    Download,
    User,
    Smartphone,
    Zap,
    CheckCircle,
    Phone,
    Mail,
    Briefcase,
    Clock,
    ShieldAlert
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function VCardClient() {
    const { slug } = useParams();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`/api/profile/${slug}`);
                if (response.ok) {
                    const record = await response.json();
                    setData(record);
                } else {
                    console.error("Profile fetch error:", response.status);
                    // Handle 404 or error state if needed
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };
        if (slug) fetchData();
    }, [slug]);

    const downloadVCF = async () => {
        if (!data || data.status === 'pendiente') return;

        // Feedback visual simple (opcional: podrías agregar un estado de 'generando...' si demora)
        const originalText = document.getElementById('btn-download-text')?.innerText;
        if (originalText) document.getElementById('btn-download-text')!.innerText = "Generando...";

        let photoBase64 = "";

        // Intentar descargar y convertir la foto a Base64
        if (data.foto_url) {
            try {
                const response = await fetch(data.foto_url);
                const blob = await response.blob();
                const reader = new FileReader();
                photoBase64 = await new Promise((resolve) => {
                    reader.onloadend = () => {
                        const base64 = (reader.result as string).split(',')[1];
                        resolve(base64);
                    };
                    reader.readAsDataURL(blob);
                });
            } catch (error) {
                console.error("Error al procesar la imagen para vCard", error);
            }
        }

        // Construcción manual robusta de vCard 3.0
        // Nota: Mantenemos 3.0 para máxima compatibilidad con iOS/Android nativos antiguos y nuevos.

        let fullName = '';
        let structuredName = ''; // Campo N:
        let organization = '';   // Campo ORG:

        if (data.tipo_perfil === 'negocio') {
            fullName = data.nombre_negocio || data.nombre;
            organization = data.nombre_negocio || data.nombre;
            if (data.contacto_nombre || data.contacto_apellido) {
                structuredName = `${data.contacto_apellido || ''};${data.contacto_nombre || ''};;;`;
            } else {
                structuredName = ';;;;';
            }
        } else {
            // Caso Persona (o legacy)
            const firstName = data.nombres || data.nombre.split(' ')[0] || '';
            const lastName = data.apellidos || data.nombre.split(' ').slice(1).join(' ') || '';
            fullName = `${firstName} ${lastName}`.trim();
            structuredName = `${lastName};${firstName};;;`;
            organization = data.empresa || "";
        }

        let vcard = `BEGIN:VCARD
VERSION:3.0
FN:${fullName}
N:${structuredName}
ORG:${organization}
TITLE:${data.profesion || ""}
TEL;TYPE=CELL,VOICE:${data.whatsapp}
EMAIL;TYPE=WORK,INTERNET:${data.email || ""}
URL:${currentUrl}
NOTE:${data.bio || "Experto en " + (data.etiquetas || "servicios profesionales")}. Generado por Regístrame Ya!`;

        // Agregar foto si existe
        if (photoBase64) {
            vcard += `
PHOTO;ENCODING=b;TYPE=JPEG:${photoBase64}`;
        }

        // Agregar dirección (aunque sea genérica si no hay)
        if (data.direccion) {
            vcard += `
ADR;TYPE=WORK:;;${data.direccion};;;;`;
        }

        // Agregar redes sociales como URLs adicionales (iOS a veces las lee mejor así en v3.0)
        if (data.instagram) vcard += `\nURL;type=Instagram:${data.instagram}`;
        if (data.linkedin) vcard += `\nURL;type=LinkedIn:${data.linkedin}`;
        if (data.web) vcard += `\nURL;type=Website:${data.web}`;

        vcard += `\nEND:VCARD`;

        const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        // Nombre de archivo limpio
        const filename = `${data.nombre.replace(/[^a-zA-Z0-9]/g, '_')}.vcf`;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        if (originalText) document.getElementById('btn-download-text')!.innerText = originalText;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-navy flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-navy flex flex-col items-center justify-center text-white p-6 text-center">
                <h1 className="text-4xl font-black mb-4 uppercase italic">404</h1>
                <p className="text-white/60 mb-8 font-medium">No hemos encontrado este perfil estratégico.</p>
                <a href="/" className="bg-primary px-8 py-4 rounded-button font-black uppercase tracking-widest shadow-orange">Volver al Inicio</a>
            </div>
        );
    }

    // PANTALLA DE VALIDACIÓN SI ES PENDIENTE
    if (data.status === 'pendiente') {
        return (
            <main className="min-h-screen bg-navy text-white flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full glass-card p-12 text-center rounded-[48px]"
                >
                    <div className="w-20 h-20 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                        <Clock size={40} />
                    </div>
                    <h1 className="text-3xl font-black uppercase italic tracking-tighter mb-4">Perfil en Validación</h1>
                    <p className="text-white/60 font-medium leading-relaxed mb-8">
                        Hola <span className="text-white font-bold">{data.nombre}</span>, estamos verificando tu comprobante de pago.
                    </p>
                    <div className="space-y-4">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-left">
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Estado de Orden</p>
                            <p className="text-sm font-bold uppercase italic">⏳ Pendiente de Aprobación</p>
                        </div>
                        <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">
                            Tiempo estimado: 60 minutos
                        </p>
                    </div>
                </motion.div>
            </main>
        );
    }

    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

    return (
        <main className="min-h-screen bg-navy text-white selection:bg-primary/30 py-12 px-6 relative overflow-hidden">
            {/* Elementos decorativos de fondo para reducir el blanco y dar profundidad */}
            <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-md mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-[48px] overflow-hidden shadow-2xl text-navy"
                >
                    {/* Header/Photo */}
                    <div className="h-48 bg-cream relative">
                        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                            <div className="w-32 h-32 rounded-[32px] bg-white border-4 border-white shadow-xl overflow-hidden flex items-center justify-center">
                                {data.foto_url ? (
                                    <img src={data.foto_url} className="w-full h-full object-cover" alt={data.nombre} />
                                ) : (
                                    <User className="text-navy/10" size={60} />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-16 pb-12 px-10 text-center">
                        <h1 className="text-3xl font-black tracking-tighter leading-none mb-2 uppercase italic">{data.nombre}</h1>
                        <p className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-8">{data.profesion}</p>

                        <div className="space-y-4 mb-10">
                            {data.whatsapp && (
                                <div className="flex items-center gap-4 p-4 bg-cream rounded-2xl border border-navy/5">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><Phone size={18} className="text-primary" /></div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-black text-navy/30 uppercase tracking-widest">WhatsApp</p>
                                        <p className="font-bold text-sm">{data.whatsapp}</p>
                                    </div>
                                </div>
                            )}
                            {data.email && (
                                <div className="flex items-center gap-4 p-4 bg-cream rounded-2xl border border-navy/5">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><Mail size={18} className="text-primary" /></div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-black text-navy/30 uppercase tracking-widest">Email</p>
                                        <p className="font-bold text-sm truncate max-w-[180px]">{data.email}</p>
                                    </div>
                                </div>
                            )}
                            {data.empresa && (
                                <div className="flex items-center gap-4 p-4 bg-cream rounded-2xl border border-navy/5">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><Briefcase size={18} className="text-primary" /></div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-black text-navy/30 uppercase tracking-widest">Empresa</p>
                                        <p className="font-bold text-sm">{data.empresa}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={downloadVCF}
                            className="w-full bg-primary text-white py-6 rounded-button font-black text-xl shadow-orange flex items-center justify-center gap-4 hover:scale-105 transition-all active:scale-95 mb-10"
                        >
                            <Download size={24} /> <span id="btn-download-text">Guardar Contacto</span>
                        </button>



                        {/* Bio / Descripción */}
                        {data.bio && (
                            <div className="text-left mt-10 p-6 bg-cream/50 rounded-3xl border border-navy/5">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3 italic">Sobre mí</h4>
                                <p className="text-sm font-medium leading-relaxed text-navy/70 whitespace-pre-wrap">{data.bio}</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* QR Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-12 text-center"
                >
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-8 italic">Tu Código QR Estratégico</p>
                    <div className="inline-block p-6 bg-white rounded-[40px] shadow-2xl mb-8">
                        <QRCodeCanvas
                            value={currentUrl}
                            size={200}
                            level="H"
                            includeMargin={false}
                        />
                    </div>
                    <p className="text-sm text-white/60 font-medium px-10 leading-relaxed mb-12">
                        Escanea este código para compartir tu perfil al instante o vuelve a esta página para descargar tu vCard.
                    </p>

                    <div className="inline-flex items-center gap-4 py-4 px-8 bg-white/5 border border-white/10 rounded-full">
                        <Zap size={16} className="text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Regístrame Ya! 2026</span>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
