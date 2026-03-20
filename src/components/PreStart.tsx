"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface PreStartProps {
  onContinue: (reason: string) => void;
}

const REASONS = [
  { id: "overwhelmed", label: "Overwhelmed", color: "border-orange-500/50 hover:bg-orange-500/10 hover:border-orange-500 text-orange-400" },
  { id: "lazy", label: "Lazy", color: "border-blue-500/50 hover:bg-blue-500/10 hover:border-blue-500 text-blue-400" },
  { id: "fear", label: "Fear", color: "border-red-500/50 hover:bg-red-500/10 hover:border-red-500 text-red-400" },
  { id: "distracted", label: "Distracted", color: "border-purple-500/50 hover:bg-purple-500/10 hover:border-purple-500 text-purple-400" },
];

const MOTIVATIONS: Record<string, string> = {
  overwhelmed: "Break it down. Just do the very first tiny step.",
  lazy: "Action creates motivation. Do it poorly, just start.",
  fear: "It doesn't have to be perfect. Be brave.",
  distracted: "Close the tabs. Phone away. For just a few minutes.",
};

export default function PreStart({ onContinue }: PreStartProps) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="w-full max-w-lg flex flex-col items-center gap-8"
    >
      <h2 className="text-3xl font-bold text-center">Why are you stuck?</h2>
      
      <div className="grid grid-cols-2 gap-4 w-full">
        {REASONS.map((reason) => (
          <button
            key={reason.id}
            onClick={() => setSelected(reason.id)}
            className={`p-4 rounded-xl border transition-all duration-300 font-medium ${
              selected === reason.id 
                ? `${reason.color.split(' ')[0]} bg-slate-800 scale-105 shadow-lg` 
                : `border-slate-800 bg-slate-900/50 hover:scale-105 text-slate-300 ${reason.color}`
            }`}
          >
            {reason.label}
          </button>
        ))}
      </div>

      <div className="min-h-[80px] w-full flex items-center justify-center">
        <AnimatePresence mode="wait">
          {selected && (
            <motion.p
              key={selected}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-xl text-center font-medium text-brand-neon-blue italic"
            >
              &quot;{MOTIVATIONS[selected]}&quot;
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: selected ? 1 : 0 }}
        disabled={!selected}
        onClick={() => selected && onContinue(selected)}
        className="group flex flex-row items-center gap-2 bg-brand-neon-green text-slate-900 font-bold py-4 px-8 rounded-full hover:bg-[#2fe012] transition-colors shadow-[0_0_20px_rgba(57,255,20,0.3)] hover:shadow-[0_0_30px_rgba(57,255,20,0.5)]"
      >
        <span>ENTER FOCUS MODE</span>
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </motion.button>
    </motion.div>
  );
}
