"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Zap } from "lucide-react";

export default function PresenceCounter() {
  const [activeUsers, setActiveUsers] = useState(12);
  const [recentWin, setRecentWin] = useState<{name: string, cat: string} | null>(null);

  // Simulate active user fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers(prev => {
        const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
        return Math.max(8, Math.min(24, prev + change));
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Simulate recent wins from "virtual" users to make the app feel alive
  useEffect(() => {
    const virtualNames = ["NeonRacer", "NullPointer", "FlowSeeker", "DeepDive", "Zenith", "Orbit"];
    const cats = ["Work", "Study", "Coding", "Health"];
    
    const showWin = () => {
      const name = virtualNames[Math.floor(Math.random() * virtualNames.length)];
      const cat = cats[Math.floor(Math.random() * cats.length)];
      setRecentWin({ name, cat });
      setTimeout(() => setRecentWin(null), 4000);
    };

    const interval = setInterval(() => {
      if (Math.random() > 0.6) showWin();
    }, 15000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-3 pointer-events-none">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3 glass-card px-4 py-2 rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl shadow-2xl"
      >
        <div className="relative">
          <Users className="w-4 h-4 text-brand-neon-blue" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand-neon-green rounded-full animate-ping" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          <span className="text-white font-black">{activeUsers}</span> Humans Focused
        </span>
      </motion.div>

      <AnimatePresence>
        {recentWin && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: -20 }}
            className="flex items-center gap-3 glass-card px-4 py-2 rounded-2xl border border-brand-neon-blue/20 bg-brand-neon-blue/5 backdrop-blur-xl shadow-lg"
          >
            <Zap className="w-3 h-3 text-brand-neon-blue animate-pulse" />
            <span className="text-[9px] font-bold text-slate-300">
              <span className="text-brand-neon-blue font-black uppercase">@{recentWin.name}</span> just finished <span className="italic">#{recentWin.cat}</span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
