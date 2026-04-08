import { Activity, Clock, Flame, LogOut } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { motion, Variants } from "framer-motion";

export interface SessionData {
  id: string;
  task_id: string;
  duration: number;
  reason: string;
  category?: string;
  completed: boolean;
  xp_earned: number;
  created_at: string;
  tasks: { task_text: string } | null;
}

interface StatsDashboardProps {
  sessions: SessionData[];
}

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const RANKS = [
  { name: "Novice", minXp: 0, maxXp: 50, color: "text-slate-400 border-slate-700", emoji: "🌱" },
  { name: "Starter", minXp: 51, maxXp: 150, color: "text-brand-neon-blue border-brand-neon-blue/40 shadow-[0_0_10px_rgba(0,243,255,0.15)]", emoji: "🚀" },
  { name: "Momentum Builder", minXp: 151, maxXp: 300, color: "text-brand-neon-green border-brand-neon-green/40 shadow-[0_0_10px_rgba(57,255,20,0.15)]", emoji: "🔥" },
  { name: "Deep Worker", minXp: 301, maxXp: 600, color: "text-purple-400 border-purple-400/40 shadow-[0_0_10px_rgba(192,132,252,0.15)]", emoji: "🛡️" },
  { name: "Flow Master", minXp: 601, maxXp: Infinity, color: "text-orange-400 border-orange-400/40 shadow-[0_0_10px_rgba(251,146,60,0.15)] bg-orange-950/20", emoji: "👑" },
];

export default function StatsDashboard({ sessions: rawSessions }: StatsDashboardProps) {
  const { signOut } = useClerk();
  // Only count explicitly completed sessions towards the positive metrics
  const completedSessions = rawSessions.filter(s => s.completed);

  // XP calculation
  const totalXP = rawSessions.reduce((acc, s) => acc + (s.xp_earned || (s.completed ? 10 : 3)), 0);

  // Rank calculation
  const currentRankIndex = RANKS.findIndex(r => totalXP >= r.minXp && totalXP <= r.maxXp);
  const currentRank = currentRankIndex === -1 ? RANKS[RANKS.length - 1] : RANKS[currentRankIndex];
  const nextRank = currentRankIndex < RANKS.length - 1 ? RANKS[currentRankIndex + 1] : null;
  
  const xpIntoLevel = totalXP - currentRank.minXp;
  const levelRequirement = (nextRank ? nextRank.minXp : currentRank.maxXp) - currentRank.minXp;
  const progressPercent = Math.min(100, Math.max(0, (xpIntoLevel / levelRequirement) * 100));

  // Calculations
  const totalSessions = rawSessions.length;
  
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const todaySessions = rawSessions.filter(s => new Date(s.created_at) >= today).length;
  
  const totalFocusSeconds = rawSessions.reduce((acc, curr) => acc + curr.duration, 0);
  const totalFocusMinutes = Math.floor(Math.ceil(totalFocusSeconds / 60)); // Round up partial minutes if desired, or just floor

  // Streak logic - Streak counts any start (rawSessions), rewarding momentum
  const uniqueDates = [...new Set(rawSessions.map(s => 
    new Date(s.created_at).toISOString().split('T')[0]
  ))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime()); 

  let streak = 0;
  const currDate = new Date();
  
  const todayStr = currDate.toISOString().split('T')[0];
  const yesterday = new Date(currDate);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (uniqueDates.includes(todayStr) || uniqueDates.includes(yesterdayStr)) {
    let checkDate = new Date(uniqueDates[0]);
    
    for (const d of uniqueDates) {
      if (d === checkDate.toISOString().split('T')[0]) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  const statCards = [
    { label: "Today's Starts", value: todaySessions, icon: Activity, color: "text-brand-neon-green border-brand-neon-green/30 drop-shadow-[0_0_8px_rgba(57,255,20,0.5)]" },
    { label: "Current Streak", value: `${streak} Days`, icon: Flame, color: "text-orange-400 border-orange-400/30 drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]" },
    { label: "Focus Time", value: `${totalFocusMinutes}m`, icon: Clock, color: "text-brand-neon-blue border-brand-neon-blue/30 drop-shadow-[0_0_8px_rgba(0,243,255,0.5)]" },
  ];

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Rank & XP Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 rounded-3xl relative overflow-hidden border-slate-700/50"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-neon-blue via-brand-neon-green to-purple-500 opacity-50" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl bg-slate-900 border ${currentRank.color}`}>
              {currentRank.emoji}
            </div>
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                {currentRank.name}
              </h3>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
                Current Rank
              </p>
            </div>
          </div>

          <div className="flex-1 w-full max-w-md">
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-black text-white italic">
                {totalXP} <span className="text-slate-500">/ {nextRank ? nextRank.minXp : currentRank.maxXp} XP</span>
              </span>
              <span className="text-[10px] uppercase tracking-tighter text-slate-500 font-bold">
                {nextRank ? `${nextRank.minXp - totalXP} XP to ${nextRank.name}` : "Max Rank Reached"}
              </span>
            </div>
            
            <div className="relative h-3 w-full bg-slate-900/80 rounded-full overflow-hidden border border-slate-800 shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-brand-neon-blue to-brand-neon-green rounded-full shadow-[0_0_15px_rgba(0,243,255,0.4)]"
              />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="w-full">
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-xl font-bold text-white tracking-wide">Performance Summary</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 shadow-inner hidden sm:block">
              {rawSessions.length} Total Starts
            </span>
            <button
              onClick={() => signOut()}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <motion.div 
          variants={container} 
          initial="hidden" 
          animate="show" 
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {statCards.map((stat, i) => {
            const Icon = stat.icon;
            return (
               <motion.div 
                 variants={item} 
                 key={i} 
                 className="glass-card p-4 lg:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:gap-4 relative overflow-hidden group hover:border-slate-500/50 transition-all hover:bg-slate-800/40 shadow-lg hover:shadow-xl"
               >
                 <div className={`p-3 lg:p-4 rounded-xl bg-slate-900/80 border ${stat.color} group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                   <Icon className="w-5 h-5 lg:w-6 lg:h-6" />
                 </div>
                 <div className="flex flex-col flex-1 min-w-0">
                   <p className="text-xl lg:text-3xl font-black text-white drop-shadow-md truncate">{stat.value}</p>
                   <p className="text-[10px] sm:text-[11px] uppercase tracking-widest text-slate-400 font-bold mt-0.5 leading-snug truncate">{stat.label}</p>
                 </div>
               </motion.div>
            )
          })}
        </motion.div>
      </div>
    </div>
  );
}

