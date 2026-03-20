import { Activity, Clock, Flame, PieChart } from "lucide-react";
import { motion, Variants } from "framer-motion";

export interface SessionData {
  id: string;
  duration: number;
  reason: string;
  category?: string;
  completed: boolean;
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

export default function StatsDashboard({ sessions: rawSessions }: StatsDashboardProps) {
  // Only count explicitly completed sessions towards the positive metrics
  const sessions = rawSessions.filter(s => s.completed);

  // Calculations
  const totalSessions = sessions.length;
  
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const todaySessions = sessions.filter(s => new Date(s.created_at) >= today).length;
  
  const totalFocusSeconds = sessions.reduce((acc, curr) => acc + curr.duration, 0);
  const totalFocusMinutes = Math.round(totalFocusSeconds / 60);

  const getRank = (minutes: number) => {
    if (minutes < 30) return { title: "Novice", color: "text-slate-400 border-slate-700" };
    if (minutes < 120) return { title: "Initiator", color: "text-brand-neon-blue border-brand-neon-blue/40 shadow-[0_0_10px_rgba(0,243,255,0.15)]" };
    if (minutes < 600) return { title: "Deep Worker", color: "text-brand-neon-green border-brand-neon-green/40 shadow-[0_0_10px_rgba(57,255,20,0.15)]" };
    return { title: "Flow Master", color: "text-purple-400 border-purple-400/40 shadow-[0_0_10px_rgba(192,132,252,0.15)] bg-purple-900/20" };
  };
  const rank = getRank(totalFocusMinutes);

  // Streak logic
  const uniqueDates = [...new Set(sessions.map(s => 
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
    <div className="w-full">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <h3 className="text-xl font-bold text-white tracking-wide">Your Stats</h3>
          <span className={`text-[10px] sm:text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-slate-900/80 border ${rank.color} transition-all duration-500`}>
            Rank: <span className="text-white">{rank.title}</span>
          </span>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 shadow-inner hidden sm:block">
          {totalSessions} Total Sessions
        </span>
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
  );
}
