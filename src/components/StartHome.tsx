"use client";

import { useState, useEffect, useCallback } from "react";
import { Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import StatsDashboard, { SessionData } from "./StatsDashboard";
import ActivityTable from "./ActivityTable";
import ChartsDashboard from "./ChartsDashboard";

interface StartHomeProps {
  onStart: (task: string, duration: number, category: string) => void;
}

export default function StartHome({ onStart }: StartHomeProps) {
  const [task, setTask] = useState("");
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [category, setCategory] = useState("Work");
  const [customInput, setCustomInput] = useState("");
  const categoriesList = ["Work", "Study", "Coding", "Health", "Life", "Other"];

  const fetchAllData = useCallback(async () => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;

    try {
      const { data, error } = await supabase
        .from("sessions")
        .select(`
          *,
          tasks (
            task_text
          )
        `)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setSessions(data as SessionData[]);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleStart = (duration: number) => {
    if (!task.trim()) return;
    onStart(task, duration, category);
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center gap-14 py-8">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="w-full max-w-lg flex flex-col items-center z-10"
      >
        <h1 className="text-5xl md:text-6xl font-black mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-brand-neon-blue via-[#39ff14] to-brand-neon-green pb-2 drop-shadow-[0_0_25px_rgba(57,255,20,0.3)]">
          Start Action
        </h1>
        
        <div className="glass-card w-full p-8 rounded-[2rem] flex flex-col gap-8 relative overflow-hidden ring-1 ring-white/10 shadow-2xl backdrop-blur-xl">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-brand-neon-blue/30 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-brand-neon-green/20 blur-[100px] rounded-full pointer-events-none" />

          <div className="flex flex-col gap-3 relative z-10">
            <label htmlFor="task" className="text-sm text-slate-400 uppercase tracking-widest font-black ml-1">
              What will you start?
            </label>
            <input
              id="task"
              type="text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="e.g., Write the first paragraph"
              className="w-full bg-slate-900/60 border border-slate-700/80 rounded-2xl px-5 py-4 text-xl focus:outline-none focus:ring-2 focus:ring-brand-neon-blue/50 focus:border-brand-neon-blue transition-all placeholder:text-slate-600 shadow-inner block"
              autoComplete="off"
              autoFocus
            />
          </div>

          <div className="flex flex-wrap gap-2 relative z-10 -mt-2">
            {categoriesList.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`text-[10px] sm:text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wider transition-colors border ${category === c ? 'bg-brand-neon-blue/20 border-brand-neon-blue text-brand-neon-blue shadow-[0_0_8px_rgba(0,243,255,0.3)]' : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300'}`}
              >
                #{c}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
            <button
              onClick={() => handleStart(60)}
              disabled={!task.trim()}
              className="group relative flex items-center justify-center gap-2 bg-slate-800/80 hover:bg-slate-700 disabled:opacity-50 disabled:hover:bg-slate-800 text-white py-4 rounded-2xl font-black text-lg transition-all overflow-hidden border border-slate-700 hover:border-brand-neon-blue shadow-lg hover:shadow-brand-neon-blue/20"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Play className="w-5 h-5 text-brand-neon-blue group-hover:scale-125 transition-transform duration-300" />
                1 Min
              </span>
            </button>
            
            <button
              onClick={() => handleStart(300)}
              disabled={!task.trim()}
              className="group relative flex items-center justify-center gap-2 bg-brand-neon-green/10 hover:bg-brand-neon-green/20 disabled:opacity-50 disabled:hover:bg-brand-neon-green/10 text-brand-neon-green py-4 rounded-2xl font-black text-lg transition-all border border-brand-neon-green/40 hover:border-brand-neon-green shadow-[0_0_15px_rgba(57,255,20,0.1)] hover:shadow-[0_0_25px_rgba(57,255,20,0.4)]"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Play className="w-5 h-5 group-hover:scale-125 transition-transform duration-300 fill-current" />
                5 Min
              </span>
            </button>
            
            <div className="flex bg-slate-900/60 border border-slate-700 rounded-2xl overflow-hidden focus-within:border-purple-400/50 focus-within:ring-1 focus-within:ring-purple-400/50 transition-all shadow-inner">
               <input 
                 type="number"
                 placeholder="Custom"
                 value={customInput}
                 onChange={(e) => setCustomInput(e.target.value)}
                 className="bg-transparent text-white w-full px-3 py-4 text-center font-black text-base focus:outline-none placeholder:text-slate-600 appearance-none min-w-0"
               />
               <button
                 onClick={() => {
                   const mins = parseInt(customInput);
                   if (mins > 0) handleStart(mins * 60);
                 }}
                 disabled={!task.trim() || !parseInt(customInput) || parseInt(customInput) <= 0}
                 className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 px-4 font-black transition-colors border-l border-slate-700 disabled:opacity-50"
               >
                 Go
               </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Analytics & Table Section */}
      <AnimatePresence>
        {!loading && sessions.length > 0 && (
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0, scale: 0.9 }}
             transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
             className="w-full flex flex-col gap-10 px-2"
           >
              {/* Row 1: High level Stats */}
              <div className="w-full">
                <StatsDashboard sessions={sessions} />
              </div>

              {/* Row 2: Visual Charts */}
              <div className="w-full">
                <ChartsDashboard sessions={sessions} />
              </div>
              
              {/* Row 2: Deep dive table */}
              <div className="w-full">
                <ActivityTable sessions={sessions} onRefresh={fetchAllData} />
              </div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
