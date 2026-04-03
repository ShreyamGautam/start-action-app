"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/hooks/useSupabase";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Medal, Crown, TrendingUp } from "lucide-react";

interface Profile {
  user_id: string;
  display_name: string;
  avatar_url: string;
  total_xp: number;
  current_rank: string;
}

export default function Leaderboard() {
  const supabase = useSupabase();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("total_xp", { ascending: false })
        .limit(10);

      if (!error && data) {
        setProfiles(data as Profile[]);
      }
    } catch (err) {
      console.error("Leaderboard fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [supabase]);

  if (loading) return null;

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-brand-neon-blue/10 border border-brand-neon-blue/20">
          <Trophy className="w-5 h-5 text-brand-neon-blue" />
        </div>
        <h3 className="text-xl font-bold text-white tracking-wide">Elite Performers</h3>
        <div className="ml-auto flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700">
           <TrendingUp className="w-3 h-3 text-brand-neon-green" />
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Global Rank</span>
        </div>
      </div>

      <div className="glass-card rounded-[2rem] overflow-hidden border-slate-700/50 shadow-2xl">
        <div className="grid grid-cols-1 divide-y divide-slate-800/50">
          <AnimatePresence>
            {profiles.map((profile, index) => (
              <motion.div
                key={profile.user_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 px-6 hover:bg-slate-800/40 transition-colors group"
              >
                <div className="flex items-center gap-5">
                  <div className="w-8 text-center font-black italic text-slate-500 group-hover:text-brand-neon-blue transition-colors">
                    {index === 0 ? <Crown className="w-5 h-5 text-yellow-400 mx-auto" /> : 
                     index === 1 ? <Medal className="w-5 h-5 text-slate-300 mx-auto" /> :
                     index === 2 ? <Medal className="w-5 h-5 text-amber-600 mx-auto" /> :
                     `#${index + 1}`}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-2 border-slate-700 overflow-hidden ring-2 ring-transparent group-hover:ring-brand-neon-blue/30 transition-all">
                        <img 
                          src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.display_name}`} 
                          alt={profile.display_name}
                          className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white group-hover:text-brand-neon-blue transition-colors">{profile.display_name}</span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{profile.current_rank}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-sm font-black text-brand-neon-green italic">
                    {profile.total_xp.toLocaleString()} XP
                  </span>
                  <div className="w-16 h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((profile.total_xp / 1000) * 100, 100)}%` }}
                      className="h-full bg-brand-neon-green"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {profiles.length === 0 && (
          <div className="p-10 text-center text-slate-500 font-bold italic">
            No performers found yet. Be the first to climb!
          </div>
        )}
      </div>
    </div>
  );
}
