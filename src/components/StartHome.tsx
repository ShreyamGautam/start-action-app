"use client";

import { useState, useEffect, useCallback } from "react";
import { Play, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UserButton, useUser, Show, useAuth } from "@clerk/nextjs";
import { useSupabase } from "@/hooks/useSupabase";
import StatsDashboard, { SessionData } from "./StatsDashboard";
import ActivityTable from "./ActivityTable";
import ChartsDashboard from "./ChartsDashboard";

interface StartHomeProps {
  onStart: (task: string, duration: number, category: string) => void;
}

export default function StartHome({ onStart }: StartHomeProps) {
  const { user } = useUser();
  const { getToken } = useAuth();
  const supabase = useSupabase();
  
  const [task, setTask] = useState("");
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [prevRank, setPrevRank] = useState<string | null>(null);
  const [showLevelUp, setShowLevelUp] = useState<string | null>(null);
  const [category, setCategory] = useState("Work");
  const [customInput, setCustomInput] = useState("");
  
  const [subClaim, setSubClaim] = useState<string | null>("Loading...");
  const [testResult, setTestResult] = useState<string | null>(null);

  const categoriesList = ["Work", "Study", "Coding", "Health", "Life", "Other"];
  const RANKS = [
    { name: "Novice", minXp: 0 },
    { name: "Starter", minXp: 51 },
    { name: "Momentum Builder", minXp: 151 },
    { name: "Deep Worker", minXp: 301 },
    { name: "Flow Master", minXp: 601 },
  ];

  // Diagnostic: Check Token & Sub claim
  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await getToken({ template: "supabase" });
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setSubClaim(payload.sub || "Missing 'sub' claim");
          console.log("Supabase JWT payload:", payload);
        } else {
          setSubClaim("No token (Template mismatch?)");
        }
      } catch (e) {
        setSubClaim("Error decoding token");
      }
    };
    if (user) checkToken();
  }, [getToken, user]);

  const fetchAllData = useCallback(async () => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !supabase) return;

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

      if (error) {
        console.error("Fetch error:", error);
      }

      if (data) {
        const newSessions = data as SessionData[];
        const totalXP = newSessions.reduce((acc, s) => acc + (s.xp_earned || (s.completed ? 10 : 3)), 0);
        
        const currentRank = [...RANKS].reverse().find(r => totalXP >= r.minXp)?.name || "Novice";
        
        if (prevRank && currentRank !== prevRank) {
          const prevIndex = RANKS.findIndex(r => r.name === prevRank);
          const currIndex = RANKS.findIndex(r => r.name === currentRank);
          if (currIndex > prevIndex) {
            setShowLevelUp(currentRank);
            setTimeout(() => setShowLevelUp(null), 5000);
          }
        }
        
        setPrevRank(currentRank);
        setSessions(newSessions);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  }, [prevRank, user, supabase]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const runSyncTest = async () => {
    setTestResult("🔄 Testing...");
    if (!supabase || !user) {
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

      if (tData) {
        const { error: sErr } = await supabase
          .from("sessions")
          .insert([{ task_id: tData.id, duration: 1, user_id: user.id, reason: "Sync Test" }]);
        
        if (sErr) setTestResult(`❌ Session: ${sErr.code}`);
        else {
          setTestResult("✅ Success!");
          fetchAllData();
        }
      }
    } catch (err: any) {
      setTestResult(`❌ Crash: ${err.message}`);
    }
  };

  const handleStart = (duration: number) => {
    if (!task.trim()) return;
    onStart(task, duration, category);
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center gap-14 py-8 relative">
      <div className="fixed top-6 right-6 z-50 glass-card p-1.5 rounded-full border border-white/10 shadow-2xl backdrop-blur-xl hover:border-brand-neon-blue/50 transition-colors">
        <Show when="signed-in">
          <UserButton 
            appearance={{ elements: { avatarBox: "w-10 h-10 ring-2 ring-brand-neon-blue/20 hover:ring-brand-neon-blue/50 transition-all" } }}
          />
        </Show>
      </div>

      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.5 }}
            animate={{ opacity: 1, y: 50, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, y: -100 }}
            className="fixed top-0 z-[100] bg-gradient-to-r from-brand-neon-blue to-brand-neon-green p-[2px] rounded-2xl shadow-[0_0_50px_rgba(0,243,255,0.5)]"
          >
            <div className="bg-slate-900 px-8 py-4 rounded-2xl flex flex-col items-center gap-1 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-neon-blue">Rank Up Achieved</p>
              <h2 className="text-2xl font-black text-white">You leveled up to <span className="text-brand-neon-green">{showLevelUp}</span> 🎉</h2>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg flex flex-col items-center z-10">
        <motion.h1 className="text-4xl md:text-6xl font-black mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-brand-neon-blue via-[#39ff14] to-brand-neon-green pb-2 drop-shadow-[0_0_25px_rgba(57,255,20,0.3)]">
          Start Action{user?.firstName ? `, ${user.firstName}` : ""}
        </motion.h1>
        
        <div className="glass-card w-full p-8 rounded-[2rem] flex flex-col gap-8 relative overflow-hidden ring-1 ring-white/10 shadow-2xl backdrop-blur-xl group">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-brand-neon-blue/30 blur-[100px] rounded-full pointer-events-none" />
          <div className="flex flex-col gap-3 relative z-10">
            <label className="text-sm text-slate-400 uppercase tracking-widest font-black ml-1">What will you start?</label>
            <input
              type="text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="e.g., Write the first paragraph"
              className="w-full bg-slate-900/60 border border-slate-700/80 rounded-2xl px-5 py-4 text-xl focus:outline-none transition-all placeholder:text-slate-600 block shadow-inner outline-none"
              autoFocus
            />
          </div>

          <div className="flex flex-wrap gap-2 relative z-10 -mt-2">
            {categoriesList.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wider transition-colors border ${category === c ? 'bg-brand-neon-blue/20 border-brand-neon-blue text-brand-neon-blue' : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-300'}`}
              >#{c}</button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
            <button onClick={() => handleStart(60)} disabled={!task.trim()} className="flex items-center justify-center gap-2 bg-slate-800/80 hover:bg-slate-700 text-white py-4 rounded-2xl font-black transition-all border border-slate-700">1 Min</button>
            <button onClick={() => handleStart(300)} disabled={!task.trim()} className="flex items-center justify-center gap-2 bg-brand-neon-green/10 hover:bg-brand-neon-green/20 text-brand-neon-green py-4 rounded-2xl font-black transition-all border border-brand-neon-green/40">5 Min</button>
            <div className="flex bg-slate-900/60 border border-slate-700 rounded-2xl overflow-hidden">
               <input type="number" placeholder="Custom" value={customInput} onChange={(e) => setCustomInput(e.target.value)} className="bg-transparent text-white w-full px-3 py-4 text-center font-black focus:outline-none min-w-0" />
               <button onClick={() => { const mins = parseInt(customInput); if (mins > 0) handleStart(mins * 60); }} disabled={!task.trim() || !parseInt(customInput)} className="bg-purple-500/10 text-purple-400 px-4 font-black border-l border-slate-700">Go</button>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {!loading && (
           <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="w-full flex flex-col gap-10 px-2">
              <StatsDashboard sessions={sessions} />
              <ChartsDashboard sessions={sessions} />
              <ActivityTable sessions={sessions} onRefresh={fetchAllData} />
              
              {/* Sync Diagnostic Footer */}
              <div className="mt-20 pt-10 border-t border-white/5 w-full flex flex-col items-center gap-4 opacity-30 hover:opacity-100 transition-opacity">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Sync Diagnostics</p>
                <div className="flex flex-col items-center gap-2 text-[10px] font-bold text-slate-400">
                  <div className="flex gap-6">
                    <span className={user?.id === subClaim ? "text-brand-neon-green" : "text-brand-neon-pink"}>Clerk: {user?.id || 'None'}</span>
                    <span className={user?.id === subClaim ? "text-brand-neon-green" : "text-brand-neon-pink"}>JWT: {subClaim}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <button onClick={runSyncTest} className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/5 text-white/50 hover:text-white transition-all uppercase tracking-widest text-[9px] font-black">Run Sync Test</button>
                    {testResult && <span className="animate-pulse font-black text-[10px] border border-white/10 px-3 py-1 rounded-lg">{testResult}</span>}
                  </div>
                </div>
                {user?.id !== subClaim && subClaim !== "Loading..." && (
                  <p className="text-[9px] text-red-500 font-bold max-w-xs text-center border border-red-500/20 px-4 py-2 rounded-lg bg-red-500/5">⚠️ MISMATCH: Templates must have sub: &#123;&#123;user.id&#125;&#125;</p>
                )}
              </div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
