"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, CheckCheck, Mic } from "lucide-react";
import { motion } from "framer-motion";

interface ObjectionAudioProps {
  title: string;
  audioPath: string;
  script: string;
  duration?: string;
  onPlay?: () => void;
  isGloballyPlaying?: boolean;
}

export const ObjectionAudio = ({ 
  title, 
  audioPath, 
  script,
  duration = "0:15", 
  onPlay, 
  isGloballyPlaying = false
}: ObjectionAudioProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync with global state (only one audio should play at a time)
  useEffect(() => {
    if (!isGloballyPlaying && isPlaying) {
      pauseAudio();
    }
  }, [isGloballyPlaying]);

  const playAudio = () => {
    if (onPlay) onPlay();
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // Fallback or mute issue
        console.warn("Audio playback delayed or blocked");
      });
    }
  };

  const pauseAudio = () => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(p || 0);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="flex flex-col gap-2 w-full"
    >
      <span className="text-[10px] font-black text-navy/40 ml-4 uppercase tracking-[0.2em]">
        {title}
      </span>
      
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-3 shadow-xl shadow-navy/5 flex items-center gap-4 border border-navy/5 relative group hover:border-primary/20 transition-all duration-300">
        {/* Play Button */}
        <button 
          onClick={togglePlay}
          className="w-12 h-12 flex-shrink-0 rounded-full bg-[#53bdeb] hover:scale-105 active:scale-95 flex items-center justify-center text-white transition-all shadow-lg shadow-blue-500/20"
        >
          {isPlaying ? (
            <Pause size={20} fill="currentColor" />
          ) : (
            <Play size={20} className="ml-1" fill="currentColor" />
          )}
        </button>
        
        {/* Waveform & Info */}
        <div className="flex-grow flex flex-col gap-1 justify-center pr-2">
          <div className="flex items-end gap-[2px] h-6 mb-1">
            {[...Array(24)].map((_, i) => (
              <motion.div 
                key={i}
                animate={isPlaying ? {
                  height: [8, Math.random() * 20 + 4, 8]
                } : { height: 8 }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 0.8 + Math.random() * 0.5,
                  delay: i * 0.05
                }}
                style={{ 
                  height: 8,
                  width: "3px",
                  borderRadius: "2px",
                  backgroundColor: progress > (i / 24) * 100 ? "#53bdeb" : "#e2e8f0"
                }}
              />
            ))}
          </div>
          
          <div className="flex justify-between items-center text-[10px] font-bold text-navy/30">
            <span className={isPlaying ? "text-[#53bdeb]" : ""}>
              {isPlaying ? "Reproduciendo..." : duration}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="opacity-50">14:20</span>
              <CheckCheck size={14} className="text-[#53bdeb]" />
            </div>
          </div>
        </div>

        {/* User Avatar Placeholder */}
        <div className="w-10 h-10 rounded-full bg-navy/5 flex items-center justify-center text-navy/20 border border-navy/5 overflow-hidden">
             <Mic size={18} />
        </div>

        <audio 
          ref={audioRef}
          src={audioPath}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
        />
      </div>

      {/* Script Tooltip (Invisible but good for SEO/ARIA) */}
      <p className="sr-only">{script}</p>
    </motion.div>
  );
};
