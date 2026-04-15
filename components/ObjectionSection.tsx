"use client";

import React, { useState } from "react";
import { ObjectionAudio } from "./ObjectionAudio";
import { Headphones } from "lucide-react";
import { motion } from "framer-motion";

const OBJECTIONS = [
  {
    id: "facil",
    title: "¿Es difícil de usar?",
    duration: "0:12",
    audioPath: "/audio/objection-facil.mp3",
    script: "Mira, si sabes mandar un audio por WhatsApp, sabes usar ActivaQR. No hay nada que instalar, nada que aprender. Tu cliente apunta la cámara, toca una vez y listo — quedas guardado en su teléfono. Así de simple."
  },
  {
    id: "caro",
    title: "¿Y si me parece caro?",
    duration: "0:15",
    audioPath: "/audio/objection-caro.mp3",
    script: "Entiendo. Pero hazme un favor — suma cuánto gastaste el mes pasado en volantes, en diseños, en publicidad que no puedes medir. Ahora compara eso con $0.27 al día. La pregunta no es si ActivaQR es caro. La pregunta es cuánto te está costando seguir sin esto."
  },
  {
    id: "garantia",
    title: "¿Y si no funciona?",
    duration: "0:14",
    audioPath: "/audio/objection-garantia.mp3",
    script: "Por eso existe la garantía de 7 días. Si en una semana no ves que tus clientes lo usan, te devuelvo el dinero por WhatsApp. Sin formularios, sin explicaciones. El riesgo es mío, no tuyo."
  },
  {
    id: "socio",
    title: "Tengo que pensarlo con mi socio",
    duration: "0:18",
    audioPath: "/audio/objection-socio.mp3",
    script: "Claro, lo entiendo. Pero mientras lo piensan, esta semana van a seguir dependiendo de alguien para actualizar algo, o van a seguir mandando esa misma foto por WhatsApp. La única pregunta que tú y tu socio necesitan responder es una sola: ¿quieren más clientes o seguimos como estamos?"
  }
];

export const ObjectionSection = () => {
  const [playingId, setPlayingId] = useState<string | null>(null);

  const handlePlay = (id: string) => {
    setPlayingId(playingId === id ? null : id);
  };

  return (
    <div className="w-full py-12">
      <div className="flex flex-col items-center mb-10 text-center">
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4">
          <Headphones size={24} />
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-navy uppercase tracking-tighter mb-2">
          Resuelve tus dudas en <span className="text-primary italic">segundos</span>
        </h2>
        <p className="text-navy/50 text-xs font-bold uppercase tracking-widest">
            Dale play a la respuesta que necesitas
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {OBJECTIONS.map((objection) => (
          <ObjectionAudio
            key={objection.id}
            title={objection.title}
            duration={objection.duration}
            audioPath={objection.audioPath}
            script={objection.script}
            isGloballyPlaying={playingId === objection.id}
            onPlay={() => handlePlay(objection.id)}
          />
        ))}
      </div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="mt-8 text-center"
      >
        <p className="text-[10px] text-navy/30 font-medium italic">
          * Audios reales de nuestro equipo de soporte
        </p>
      </motion.div>
    </div>
  );
};
