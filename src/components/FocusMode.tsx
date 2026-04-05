"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Music, Volume2, VolumeX } from "lucide-react";
import { useSupabase } from "@/hooks/useSupabase";

const AMBIENT_TRACKS = [
  { id: 'lofi', name: 'Deep Focus', url: 'https://stream.zeno.fm/f3wvbbsc698uv' },
  { id: 'synth', name: 'Synthwave Night', url: 'https://p.scdn.co/mp3-preview/3807abf233480d195f269a83859f77f9859f37c9?cid=774b75d1d0044af78930432716c02978' },
  { id: 'rain', name: 'Cyber Rain', url: 'https://www.soundjay.com/nature/rain-07.mp3' }
];

interface FocusModeProps {
  taskText: string;
  duration: number;
  reason: string;
  category: string;
  onComplete: (sessionId: string | null) => void;
}

export default function FocusMode({ taskText, duration, reason, category, onComplete }: FocusModeProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isStarted, setIsStarted] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState(AMBIENT_TRACKS[0]);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement>(null);
  const supabase = useSupabase();

  // Use a ref to strictly avoid duplicate session creations in React Strict Mode
  const sessionCreated = useRef(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      if (!isMuted) {
        audioRef.current.play().catch(() => setIsMuted(true));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isMuted, currentTrack, volume]);

  useEffect(() => {
    const recordSession = async () => {
      if (!isStarted && supabase && !sessionCreated.current) {
        setIsStarted(true);
        sessionCreated.current = true;
        try {
          // 1. Insert Task
          const { data: taskData, error: taskError } = await supabase
            .from("tasks")
            .insert([{ task_text: taskText }])
            .select()
            .single();

          if (!taskError && taskData) {
            // 2. Insert Session
            const { data: sessionData, error: sessionError } = await supabase
              .from("sessions")
              .insert([
                {
                  task_id: taskData.id,
                  duration: duration,
                  reason: reason || "N/A",
                  category: category || "Other"
                }
              ])
              .select()
              .single();
              
             if (!sessionError && sessionData) {
               setSessionId(sessionData.id);
             }
          }
        } catch (error) {
          console.error("Failed to save session", error);
        }
      }
    };
    
    recordSession();
  }, [taskText, duration, reason, isStarted]);

  useEffect(() => {
    if (timeLeft <= 0) {
      // Detached audio synthesis to guarantee UI transition NEVER blocks
      setTimeout(() => {
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (!AudioContextClass) return;
          const audioCtx = new AudioContextClass();
          const oscillator = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
          oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.5);
          
          gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.05);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.5);
          
          oscillator.start(audioCtx.currentTime);
          oscillator.stop(audioCtx.currentTime + 1.5);
        } catch (e) {
          console.log("Audio not supported or interaction blocked by browser rules");
        }
      }, 0);

      onComplete(sessionId);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onComplete, sessionId]);

  const progress = ((duration - timeLeft) / duration) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-brand-bg flex items-center justify-center z-50 p-6"
    >
      <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
        <div className="w-[500px] h-[500px] rounded-full bg-brand-neon-blue/20 blur-[120px] mix-blend-screen" />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-2xl w-full">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-16"
        >
          <p className="text-brand-neon-green/80 uppercase tracking-widest text-sm font-semibold mb-2">Current Focus</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            {taskText}
          </h2>
        </motion.div>

        <motion.div 
          className="relative flex items-center justify-center mb-16"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
        >
          {/* Progress Ring */}
          <svg className="w-64 h-64 transform -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              className="text-slate-800"
            />
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 120}
              strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
              className="text-brand-neon-blue transition-all duration-1000 ease-linear drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]"
            />
          </svg>
          
          <div className="absolute flex flex-col items-center">
            <span className="text-6xl font-black tabular-nums text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              {minutes}:{seconds.toString().padStart(2, '0')}
            </span>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-6 mt-12 pt-8 border-t border-white/5"
          >
            <audio 
              ref={audioRef} 
              src={currentTrack.url} 
              loop 
              playsInline
            />
            
            <div className="flex flex-wrap justify-center gap-2">
              {AMBIENT_TRACKS.map(track => (
                <button
                  key={track.id}
                  onClick={() => setCurrentTrack(track)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentTrack.id === track.id ? 'bg-brand-neon-blue/20 text-brand-neon-blue border border-brand-neon-blue' : 'bg-white/5 text-slate-500 border border-transparent hover:text-slate-300'}`}
                >
                  {track.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-brand-neon-blue hover:bg-white/10 transition-all group"
              >
                {isMuted ? <VolumeX className="w-5 h-5 opacity-50 group-hover:opacity-100" /> : <Volume2 className="w-5 h-5 animate-pulse" />}
              </button>
              
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-slate-500" />
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.01" 
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-24 accent-brand-neon-blue h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                />
              </div>
            </div>
          </motion.div>
          
          {/* Pulse Effect */}
          <div className="absolute inset-0 rounded-full animate-glow-pulse pointer-events-none" />
        </motion.div>

        <button 
          onClick={() => onComplete(sessionId)}
          className="text-slate-500 hover:text-white transition-colors text-sm uppercase tracking-wider"
        >
          Skip Timer
        </button>
      </div>
    </motion.div>
  );
}
