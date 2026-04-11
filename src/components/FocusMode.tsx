"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Music, Volume2, VolumeX } from "lucide-react";
import { useSupabase } from "@/hooks/useSupabase";
import { useAuth } from "@clerk/nextjs";

const AMBIENT_TRACKS = [
  { id: "rain",  name: "Ambient Rain", url: "https://assets.mixkit.co/active_storage/sfx/2431/2431-preview.mp3" },
  { id: "lofi",  name: "Focus Lofi",   url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { id: "synth", name: "Cyber Synth",  url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" },
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
  const [dbError, setDbError] = useState<string | null>(null);

  // Audio
  const [currentTrack, setCurrentTrack] = useState(AMBIENT_TRACKS[0]);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.4);
  const audioRef = useRef<HTMLAudioElement>(null);

  const { client: supabase, isReady } = useSupabase();
  const { userId } = useAuth();
  const sessionCreated = useRef(false);

  // Save session to DB on mount
  useEffect(() => {
    const recordSession = async () => {
      if (isStarted || !supabase || !isReady || sessionCreated.current || !userId) return;
      setIsStarted(true);
      sessionCreated.current = true;

      try {
        const { data: taskData, error: taskError } = await supabase
          .from("tasks")
          .insert([{ task_text: taskText, user_id: userId }])
          .select()
          .single();

        if (taskError || !taskData) {
          // DEEP DIAGNOSTIC: Compare Hook ID vs Token ID
          const { data: tokenId } = await supabase.rpc('debug_user_id');
          const msg = `RLS Failure (42501). Logic Check: Hook[${userId || 'None'}] ↔ Token[${tokenId || 'NULL'}]. Ensure they match!`;
          console.error(msg);
          setDbError(msg);
          return;
        }

        const { data: sessionData, error: sessionError } = await supabase
          .from("sessions")
          .insert([{
            task_id:  taskData.id,
            user_id:  userId,
            duration: duration,
            reason:   reason || "N/A",
            category: category || "Other",
          }])
          .select()
          .single();

        if (sessionError) {
          const msg = `Session save failed: ${sessionError?.code} — ${sessionError?.message}`;
          console.error(msg);
          setDbError(msg);
          return;
        }

        if (sessionData) {
          setSessionId(sessionData.id);
          setDbError(null); // clear any previous error
        }
      } catch (err: any) {
        const msg = `Crash: ${err?.message}`;
        console.error(msg);
        setDbError(msg);
      }
    };

    recordSession();
  }, [supabase, userId]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete(sessionId);
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onComplete, sessionId]);

  // Audio: play/pause + volume
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    if (!isMuted) {
      audio.load();          // ← ensures new track loads before playing
      audio.play().catch(() => {}); // catch autoplay block silently
    } else {
      audio.pause();
    }
  }, [isMuted, currentTrack, volume]);

  const progress = ((duration - timeLeft) / duration) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-brand-bg z-50 overflow-y-auto"
    >
      {/* DB Error Banner */}
      {dbError && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] bg-red-900/90 border border-red-500 text-red-200 text-xs font-mono px-6 py-3 rounded-xl max-w-lg text-center shadow-2xl">
          ⚠️ {dbError}
        </div>
      )}

      <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
        <div className="w-[500px] h-[500px] rounded-full bg-brand-neon-blue/20 blur-[120px] mix-blend-screen" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen w-full py-20 px-6">
        {/* Task Name */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <p className="text-brand-neon-green/80 uppercase tracking-widest text-sm font-semibold mb-2">
            Current Focus
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">{taskText}</h2>
        </motion.div>

        {/* Timer Ring */}
        <motion.div
          className="relative flex items-center justify-center mb-10"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
        >
          <svg className="w-56 h-56 sm:w-64 sm:h-64 transform -rotate-90">
            <circle cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-800" />
            <circle
              cx="128" cy="128" r="120"
              stroke="currentColor" strokeWidth="4" fill="transparent"
              strokeDasharray={2 * Math.PI * 120}
              strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
              className="text-brand-neon-blue transition-all duration-1000 ease-linear drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-5xl sm:text-6xl font-black tabular-nums text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              {minutes}:{seconds.toString().padStart(2, "0")}
            </span>
          </div>
          <div className="absolute inset-0 rounded-full animate-glow-pulse pointer-events-none" />
        </motion.div>

        {/* Radio Panel */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full max-w-sm flex flex-col items-center gap-6 mb-10 bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-md"
        >
          <audio ref={audioRef} src={currentTrack.url} loop playsInline />

          {/* Track Selector */}
          <div className="flex flex-wrap justify-center gap-2">
            {AMBIENT_TRACKS.map((track) => (
              <button
                key={track.id}
                onClick={() => setCurrentTrack(track)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  currentTrack.id === track.id
                    ? "bg-brand-neon-blue/20 text-brand-neon-blue border border-brand-neon-blue"
                    : "bg-white/5 text-slate-500 border border-transparent hover:text-slate-300"
                }`}
              >
                {track.name}
              </button>
            ))}
          </div>

          {/* Mute + Volume Row */}
          <div className="flex items-center gap-6 w-full px-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
                !isMuted ? "bg-brand-neon-blue/20 text-brand-neon-blue" : "bg-white/5 text-slate-500"
              }`}
            >
              {!isMuted ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            <div className="flex-1 flex items-center gap-3">
              <Music className="w-4 h-4 text-slate-500" />
              <input
                type="range"
                min="0" max="1" step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="flex-1 accent-brand-neon-blue h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
              />
            </div>
          </div>
        </motion.div>

        {/* Skip Button */}
        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onComplete(sessionId)}
          className="px-10 py-4 rounded-full border border-white/20 text-white/60 hover:text-white font-black uppercase tracking-[0.3em] text-sm transition-all bg-white/5"
        >
          Skip Timer & Complete
        </motion.button>
      </div>
    </motion.div>
  );
}
