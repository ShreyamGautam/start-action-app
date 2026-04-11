"use client";

import { useState, useEffect, useCallback } from "react";
import { Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UserButton, useUser, Show } from "@clerk/nextjs";
import { useSupabase } from "@/hooks/useSupabase";
import StatsDashboard, { SessionData } from "./StatsDashboard";
import ActivityTable from "./ActivityTable";
import ChartsDashboard from "./ChartsDashboard";

interface StartHomeProps {
  onStart: (task: string, duration: number, category: string) => void;
}

const RANKS = [
  { name: "Novice", minXp: 0 },
  { name: "Starter", minXp: 51 },
  { name: "Momentum Builder", minXp: 151 },
  { name: "Deep Worker", minXp: 301 },
  { name: "Flow Master", minXp: 601 },
];

export default function StartHome({ onStart }: StartHomeProps) {
  const { user } = useUser();
  const { client: supabase, isReady } = useSupabase();

  const [task, setTask] = useState("");
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [prevRank, setPrevRank] = useState<string | null>(null);
  const [showLevelUp, setShowLevelUp] = useState<string | null>(null);
  const [category, setCategory] = useState("Work");
  const [customInput, setCustomInput] = useState("");
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTestLoading, setIsTestLoading] = useState(false);

  const categoriesList = ["Work", "Study", "Coding", "Health", "Life", "Other"];

  const fetchAllData = useCallback(async () => {
    if (!supabase || !isReady || !user) return;
    try {
      const { data, error } = await supabase
        .from("sessions")
        .select(`*, tasks(task_text)`)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Fetch error:", error.code, error.message);
        return;
      }

      if (data) {
        const newSessions = data as SessionData[];
        const totalXP = newSessions.reduce(
          (acc, s) => acc + (s.xp_earned || (s.completed ? 10 : 3)),
          0
        );
        const currentRank =
          [...RANKS].reverse().find((r) => totalXP >= r.minXp)?.name || "Novice";

        if (prevRank && currentRank !== prevRank) {
          const prevIdx = RANKS.findIndex((r) => r.name === prevRank);
          const currIdx = RANKS.findIndex((r) => r.name === currentRank);
          if (currIdx > prevIdx) {
            setShowLevelUp(currentRank);
            setTimeout(() => setShowLevelUp(null), 5000);
          }
        }
        setPrevRank(currentRank);
        setSessions(newSessions);
      }
    } catch (err) {
      console.error("fetchAllData crash:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase, user, prevRank]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleStart = (duration: number) => {
    if (!task.trim()) return;
    onStart(task, duration, category);
  };

  const runSyncTest = async () => {
    setTestResult("🔄 Testing...");
    if (!supabase || !isReady || !user) {
      setTestResult("❌ Not ready."); return;
    }
    try {
      const { data: tData, error: tErr } = await supabase
        .from("tasks")
        .insert([{ task_text: "DIAGNOSTIC TEST", user_id: user.id }])
        .select().single();
      
      if (tErr) {
        setTestResult(`❌ Task: ${tErr.code}`); return;
      }

      const { error: sErr } = await supabase
        .from("sessions")
        .insert([{ task_id: tData.id, duration: 1, user_id: user.id, reason: "Sync Test" }]);
      
      if (sErr) setTestResult(`❌ Session: ${sErr.code}`);
      else {
        setTestResult("✅ Success!");
        fetchAllData();
      }
    } catch (err: any) {
      setTestResult(`❌ Crash: ${err.message}`);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center gap-14 py-8 relative">
      {/* User Avatar */}
      <div className="fixed top-6 right-6 z-50 glass-card p-1.5 rounded-full border border-white/10 shadow-2xl backdrop-blur-xl hover:border-brand-neon-blue/50 transition-colors">
        <Show when="signed-in">
          <UserButton
            appearance={{
              elements: {
                avatarBox:
                  "w-10 h-10 ring-2 ring-brand-neon-blue/20 hover:ring-brand-neon-blue/50 transition-all",
              },
            }}
          />
        </Show>
      </div>

      {/* Rank-up Toast */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.5 }}
            animate={{ opacity: 1, y: 50, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, y: -100 }}
            className="fixed top-0 z-[100] bg-gradient-to-r from-brand-neon-blue to-brand-neon-green p-[2px] rounded-2xl shadow-[0_0_50px_rgba(0,243,255,0.5)]"
          >
            <div className="bg-slate-900 px-8 py-4 rounded-2xl flex flex-col items-center gap-1">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-neon-blue">
                Rank Up!
              </p>
              <h2 className="text-2xl font-black text-white">
                You are now{" "}
                <span className="text-brand-neon-green">{showLevelUp}</span> 🎉
              </h2>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task Input Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="w-full max-w-lg flex flex-col items-center z-10"
      >
        <motion.h1
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="text-4xl md:text-6xl font-black mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-brand-neon-blue via-[#39ff14] to-brand-neon-green pb-2 drop-shadow-[0_0_25px_rgba(57,255,20,0.3)]"
        >
          Start Action{user?.firstName ? `, ${user.firstName}` : ""}
        </motion.h1>

        <div className="glass-card w-full p-8 rounded-[2rem] flex flex-col gap-8 relative overflow-hidden ring-1 ring-white/10 shadow-2xl backdrop-blur-xl group">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-brand-neon-blue/30 blur-[100px] rounded-full pointer-events-none group-hover:bg-brand-neon-blue/40 transition-colors duration-700" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-brand-neon-green/20 blur-[100px] rounded-full pointer-events-none group-hover:bg-brand-neon-green/30 transition-colors duration-700" />

          {/* Task Input */}
          <div className="flex flex-col gap-3 relative z-10">
            <label className="text-sm text-slate-400 uppercase tracking-widest font-black ml-1">
              What will you start?
            </label>
            <motion.input
              type="text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleStart(300)}
              placeholder="e.g., Write the first paragraph"
              whileFocus={{
                scale: 1.01,
                borderColor: "rgba(0, 243, 255, 0.5)",
                boxShadow: "0 0 20px rgba(0, 243, 255, 0.1)",
              }}
              className="w-full bg-slate-900/60 border border-slate-700/80 rounded-2xl px-5 py-4 text-xl focus:outline-none transition-all placeholder:text-slate-600 shadow-inner outline-none"
              autoComplete="off"
              autoFocus
            />
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 relative z-10 -mt-2">
            {categoriesList.map((c) => (
              <motion.button
                key={c}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCategory(c)}
                className={`text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wider transition-colors border ${
                  category === c
                    ? "bg-brand-neon-blue/20 border-brand-neon-blue text-brand-neon-blue shadow-[0_0_8px_rgba(0,243,255,0.3)]"
                    : "bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300"
                }`}
              >
                #{c}
              </motion.button>
            ))}
          </div>

          {/* Duration Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(0, 243, 255, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleStart(60)}
              disabled={!task.trim()}
              className="flex items-center justify-center gap-2 bg-slate-800/80 hover:bg-slate-700 disabled:opacity-40 text-white py-4 rounded-2xl font-black text-lg transition-all border border-slate-700 hover:border-brand-neon-blue shadow-lg"
            >
              <Play className="w-5 h-5 text-brand-neon-blue" />
              1 Min
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(57, 255, 20, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleStart(300)}
              disabled={!task.trim()}
              className="flex items-center justify-center gap-2 bg-brand-neon-green/10 hover:bg-brand-neon-green/20 disabled:opacity-40 text-brand-neon-green py-4 rounded-2xl font-black text-lg transition-all border border-brand-neon-green/40 hover:border-brand-neon-green shadow-lg"
            >
              <Play className="w-5 h-5 fill-current" />
              5 Min
            </motion.button>

            <div className="flex bg-slate-900/60 border border-slate-700 rounded-2xl overflow-hidden focus-within:border-purple-400/50 transition-all shadow-inner">
              <input
                type="number"
                placeholder="Custom"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="bg-transparent text-white w-full px-3 py-4 text-center font-black text-base focus:outline-none placeholder:text-slate-600 appearance-none min-w-0"
              />
              <motion.button
                whileHover={{ backgroundColor: "rgba(168, 85, 247, 0.2)" }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  const mins = parseInt(customInput);
                  if (mins > 0) handleStart(mins * 60);
                }}
                disabled={!task.trim() || !parseInt(customInput) || parseInt(customInput) <= 0}
                className="bg-purple-500/10 text-purple-400 px-4 font-black transition-colors border-l border-slate-700 disabled:opacity-40"
              >
                Go
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Dashboard */}
      <AnimatePresence>
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="w-full flex flex-col gap-10 px-2"
          >
            <StatsDashboard sessions={sessions} />
            <ChartsDashboard sessions={sessions} />
            <ActivityTable sessions={sessions} onRefresh={fetchAllData} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sync Diagnostic Footer */}
      <div className="w-full mt-20 pt-10 border-t border-white/5 flex flex-col items-center gap-4 opacity-50 hover:opacity-100 transition-opacity pb-10">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Master Sync Diagnostics</p>
        <div className="flex flex-col items-center gap-4 text-[10px] font-bold text-slate-400">
          <div className="flex gap-6">
            <span className="text-brand-neon-green">Clerk Link: Verified</span>
            <span className={testResult === "✅ Success!" ? "text-brand-neon-green" : "text-brand-neon-pink"}>
              Supabase Sync: {testResult || "Idle"}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button onClick={runSyncTest} className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/5 text-white/50 hover:text-white transition-all uppercase tracking-widest text-[9px] font-black">Run Sync Test</button>
            
            <button 
              onClick={async () => {
                if (!supabase || !isReady) {
                  setTestResult("❌ Not ready."); return;
                }
                setTestResult("🔄 Checking RPC...");
                try {
                  const { data, error } = await supabase.rpc('debug_user_id');
                  if (error) setTestResult(`❌ RPC: ${error.code}`);
                  else setTestResult(data ? `✅ ID Found: ${data}` : '❌ NULL (Auth Failed)');
                } catch (err: any) {
                  setTestResult(`❌ RPC Error: ${err.message}`);
                }
              }} 
              className="px-5 py-2 rounded-full bg-brand-neon-blue/10 hover:bg-brand-neon-blue/20 border border-brand-neon-blue/20 text-brand-neon-blue hover:text-white transition-all uppercase tracking-widest text-[9px] font-black shadow-[0_0_15px_rgba(0,243,255,0.1)]"
            >
              Verify JWT RPC
            </button>
          </div>
        </div>
        {testResult?.includes("NULL") && (
          <p className="text-[9px] text-red-500 font-bold max-w-sm text-center border border-red-500/20 px-6 py-3 rounded-xl bg-red-500/5 mt-2 animate-pulse">
            ⚠️ CRITICAL: Supabase sees your ID as NULL. Ensure your Clerk Template "supabase" has aud: authenticated and sub: &#123;&#123;user.id&#125;&#125;
          </p>
        )}
      </div>
    </div>
  );
}

