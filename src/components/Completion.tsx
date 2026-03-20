"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, RotateCcw, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface CompletionProps {
  taskText: string;
  duration: number;
  reason: string;
  sessionId: string;
  onRestart: () => void;
}

export default function Completion({ taskText, sessionId, onRestart }: CompletionProps) {
  const [marked, setMarked] = useState<boolean | null>(null);

  const markTask = async (completed: boolean) => {
    setMarked(completed);
    if (sessionId && supabase) {
      try {
        await supabase
          .from("sessions")
          .update({ completed })
          .eq("id", sessionId);
      } catch (err) {
        console.error("Failed to update status", err);
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md w-full glass-card p-10 rounded-3xl flex flex-col items-center text-center gap-6 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-neon-green to-brand-neon-blue" />
      
      <AnimatePresence mode="wait">
        {marked === null ? (
          <motion.div 
            key="question"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center gap-4 w-full"
          >
            <h2 className="text-3xl font-black text-white">Timer Finished!</h2>
            <p className="text-slate-300">Did you manage to complete the task or make meaningful progress?</p>
            
            <div className="bg-slate-900/50 w-full py-4 px-6 rounded-xl border border-slate-700/50 my-2">
              <p className="text-base font-bold text-white truncate">{taskText}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full mt-2">
              <button
                onClick={() => markTask(false)}
                className="flex items-center justify-center gap-2 p-4 rounded-xl font-bold bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-500/50 transition-all"
              >
                <XCircle className="w-5 h-5" />
                Not Really
              </button>
              <button
                onClick={() => markTask(true)}
                className="flex items-center justify-center gap-2 p-4 rounded-xl font-bold bg-brand-neon-green/10 hover:bg-brand-neon-green/20 text-brand-neon-green border border-brand-neon-green/30 hover:border-brand-neon-green transition-all shadow-[0_0_10px_rgba(57,255,20,0.1)]"
              >
                <CheckCircle className="w-5 h-5" />
                Yes I Did
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center w-full"
          >
            {marked ? (
              <CheckCircle className="w-20 h-20 text-brand-neon-green drop-shadow-[0_0_15px_rgba(57,255,20,0.5)] mb-4" />
            ) : (
              <CheckCircle className="w-20 h-20 text-brand-neon-blue drop-shadow-[0_0_15px_rgba(0,243,255,0.5)] mb-4" />
            )}

            <div className="space-y-2 mb-6">
              <h2 className="text-3xl font-black text-white">
                {marked ? "Amazing work." : "You started."}
              </h2>
              <h3 className="text-xl text-slate-300 font-medium">
                {marked ? "Task completed." : "That's still a win."}
              </h3>
            </div>

            <p className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-brand-neon-blue to-brand-neon-green italic mb-8">
              Momentum &gt; Motivation
            </p>

            <button
              onClick={onRestart}
              className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-all border border-slate-700 hover:border-brand-neon-blue/50"
            >
              <RotateCcw className="w-5 h-5 text-brand-neon-blue" />
              Start Another Task
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
