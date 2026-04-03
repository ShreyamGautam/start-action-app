"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, RotateCcw, XCircle } from "lucide-react";
import { useSupabase } from "@/hooks/useSupabase";

interface CompletionProps {
  taskText: string;
  duration: number;
  reason: string;
  sessionId: string;
  onRestart: () => void;
}

export default function Completion({ taskText, sessionId, onRestart }: CompletionProps) {
  const supabase = useSupabase();
  const [marked, setMarked] = useState<boolean | null>(null);

  const markTask = async (completed: boolean) => {
    setMarked(completed);
    const xp = completed ? 10 : 3;
    if (sessionId && supabase) {
      try {
        const { data, error } = await supabase
          .from("sessions")
          .update({ completed, xp_earned: xp })
          .eq("id", sessionId)
          .select();
          
        if (error) {
          alert(`Database Error: ${error.message}`);
        } else if (!data || data.length === 0) {
          alert("Could not mark task as completed. You do not have UPDATE permissions. Please re-run the schema.sql in the Supabase SQL editor.");
        }
      } catch (err: any) {
        console.error("Failed to update status", err);
        alert(`Unexpected Error: ${err.message}`);
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
            exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            className="flex flex-col items-center gap-4 w-full"
          >
            <h2 className="text-3xl font-black text-white">Timer Finished!</h2>
            <p className="text-slate-300">Did you manage to complete the task or make meaningful progress?</p>
            
            <div className="bg-slate-900/50 w-full py-4 px-6 rounded-xl border border-slate-700/50 my-2 shadow-inner">
              <p className="text-base font-bold text-white truncate">{taskText}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full mt-2">
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => markTask(false)}
                className="flex items-center justify-center gap-2 p-4 rounded-xl font-bold bg-slate-800 text-slate-300 border border-slate-700 hover:border-red-500/50 transition-colors shadow-lg"
              >
                <XCircle className="w-5 h-5" />
                Not Really
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(57, 255, 20, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => markTask(true)}
                className="flex items-center justify-center gap-2 p-4 rounded-xl font-bold bg-brand-neon-green/10 text-brand-neon-green border border-brand-neon-green/30 hover:border-brand-neon-green transition-all shadow-[0_0_10px_rgba(57,255,20,0.1)]"
              >
                <CheckCircle className="w-5 h-5" />
                Yes I Did
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center w-full"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12, stiffness: 200 }}
            >
              {marked ? (
                <CheckCircle className="w-20 h-20 text-brand-neon-green drop-shadow-[0_0_15px_rgba(57,255,20,0.5)] mb-4" />
              ) : (
                <CheckCircle className="w-20 h-20 text-brand-neon-blue drop-shadow-[0_0_15px_rgba(0,243,255,0.5)] mb-4" />
              )}
            </motion.div>

            <div className="space-y-2 mb-4">
              <h2 className="text-3xl font-black text-white">
                {marked ? "Amazing work." : "You started."}
              </h2>
              <h3 className="text-xl text-slate-300 font-medium">
                {marked ? "Task completed." : "That's still a win."}
              </h3>
            </div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-brand-neon-blue/10 border border-brand-neon-blue/20 px-4 py-2 rounded-full mb-6"
            >
              <p className="text-sm font-black text-brand-neon-blue tracking-widest uppercase">
                +{marked ? 10 : 3} XP Earned
              </p>
            </motion.div>

            <p className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-brand-neon-blue to-brand-neon-green italic mb-8">
              Momentum &gt; Motivation
            </p>

            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(0, 243, 255, 0.2)" }}
              whileTap={{ scale: 0.98 }}
              onClick={onRestart}
              className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-all border border-slate-700 hover:border-brand-neon-blue/50"
            >
              <RotateCcw className="w-5 h-5 text-brand-neon-blue" />
              Start Another Task
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
