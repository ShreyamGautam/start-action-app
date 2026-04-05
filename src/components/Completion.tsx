"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Trophy, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSupabase } from "@/hooks/useSupabase";

interface CompletionProps {
  taskText: string;
  duration: number;
  reason: string;
  category?: string;
  sessionId: string | null;
  onRestart: () => void;
}

export default function Completion({ taskText, duration, reason, category, sessionId, onRestart }: CompletionProps) {
  const [xp, setXp] = useState(0);
  const [marked, setMarked] = useState<boolean | null>(null);
  const supabase = useSupabase();

  // Create neon particles for confetti effect
  const particles = Array.from({ length: 40 });

  useEffect(() => {
    const fetchSessionXp = async () => {
      if (sessionId && supabase) {
        const { data } = await supabase
          .from("sessions")
          .select("xp_earned")
          .eq("id", sessionId)
          .single();
        if (data) setXp(data.xp_earned);
      }
    };
    fetchSessionXp();
  }, [sessionId, supabase]);

  const markTask = async (completed: boolean) => {
    setMarked(completed);
    const xpValue = completed ? 10 : 3;
    if (sessionId && supabase) {
      try {
        await supabase
          .from("sessions")
          .update({ completed, xp_earned: xpValue })
          .eq("id", sessionId);
        setXp(xpValue);
      } catch (err: any) {
        console.error("Failed to update status", err);
      }
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh] px-4 overflow-hidden">
      {/* Neon Confetti Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: "50%", y: "50%", scale: 0, opacity: 1 }}
            animate={{ 
              x: `${Math.random() * 100}%`, 
              y: `${Math.random() * 100}%`, 
              scale: [0, 1, 0.5, 0],
              opacity: [1, 1, 0],
              rotate: Math.random() * 360
            }}
            transition={{ duration: 2 + Math.random() * 2, ease: "easeOut", delay: Math.random() * 0.2 }}
            className={`absolute w-1.5 h-1.5 rounded-full blur-[1px] ${
              ['bg-brand-neon-blue', 'bg-brand-neon-green', 'bg-purple-500'][i % 3]
            } shadow-[0_0_8px_currentColor]`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {marked === null ? (
          <motion.div 
            key="question"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            className="max-w-md w-full glass-card p-10 rounded-3xl flex flex-col items-center text-center gap-6 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-neon-green to-brand-neon-blue" />
            <h2 className="text-3xl font-black text-white italic">SESSION ENDED</h2>
            <p className="text-slate-300">Did you smash your goal for <span className="text-brand-neon-blue font-bold">"{taskText}"</span>?</p>
            
            <div className="grid grid-cols-2 gap-4 w-full mt-2">
              <button
                onClick={() => markTask(true)}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-brand-neon-green/10 border border-brand-neon-green/30 hover:bg-brand-neon-green/20 transition-all group"
              >
                <CheckCircle className="w-8 h-8 text-brand-neon-green group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase text-brand-neon-green tracking-widest">Yes, Smashed It</span>
              </button>
              <button
                onClick={() => markTask(false)}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
              >
                <XCircle className="w-8 h-8 text-slate-500 group-hover:text-white transition-colors" />
                <span className="text-[10px] font-black uppercase text-slate-500 group-hover:text-white tracking-widest">A Little Bit</span>
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="celebration"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="glass-card w-full p-8 sm:p-12 rounded-[3rem] relative overflow-hidden ring-1 ring-white/10 shadow-2xl backdrop-blur-3xl bg-slate-900/40 border border-white/5 text-center flex flex-col items-center gap-8"
          >
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-brand-neon-blue/10 blur-[130px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-brand-neon-green/10 blur-[130px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 w-full flex flex-col items-center gap-6">
              <motion.div 
                initial={{ rotate: -10, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                className="w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-neon-blue to-brand-neon-green p-[2px] shadow-[0_0_40px_rgba(0,243,255,0.3)]"
              >
                <div className="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center">
                  <Trophy className="w-12 h-12 text-brand-neon-blue drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]" />
                </div>
              </motion.div>

              <div className="space-y-2">
                <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tighter italic">MISSION <span className="text-brand-neon-blue">COMPLETE</span></h2>
                <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[10px]">Action Momentum Secured</p>
              </div>

              <div className="bg-white/5 border border-white/10 px-8 py-4 rounded-3xl backdrop-blur-md">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Focus Rewarded</p>
                <p className="text-4xl font-black text-brand-neon-blue drop-shadow-[0_0_15px_rgba(0,243,255,0.4)]">+{xp} <span className="text-sm tracking-tighter">XP</span></p>
              </div>

              <div className="w-full max-w-sm space-y-3">
                <div className="flex justify-between items-end px-1">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Momentum Level</span>
                  <span className="text-[10px] font-black text-brand-neon-green uppercase tracking-widest animate-pulse">Accelerating</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden p-[2px] ring-1 ring-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "75%" }} 
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-brand-neon-blue to-brand-neon-green rounded-full shadow-[0_0_15px_rgba(0,243,255,0.5)] relative"
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </motion.div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(0, 243, 255, 0.4)" }}
                whileTap={{ scale: 0.98 }}
                onClick={onRestart}
                className="relative z-10 w-full sm:w-auto px-12 py-5 rounded-[2rem] bg-brand-neon-blue text-brand-bg font-black uppercase tracking-[0.2em] text-sm shadow-[0_0_20px_rgba(0,243,255,0.2)] transition-all mt-4"
              >
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Start Next Action
                </div>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
