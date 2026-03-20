import { useMemo } from "react";
import { SessionData } from "./StatsDashboard";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { motion } from "framer-motion";

interface ChartsDashboardProps {
  sessions: SessionData[];
}

export default function ChartsDashboard({ sessions: rawSessions }: ChartsDashboardProps) {
  // --- BAR CHART: Focus Time Last 7 Days ---
  const focusTimeData = useMemo(() => {
    // Only graph data for sessions marked 'Done'
    const sessions = rawSessions.filter(s => s.completed);

    const days: { dateStr: string; name: string; focusTime: number; starts: number }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const formatDateLocal = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      days.push({
        dateStr: formatDateLocal(d),
        name: d.toLocaleDateString("en-US", { weekday: "short" }),
        focusTime: 0,
        starts: 0,
      });
    }

    sessions.forEach(session => {
      const sessionDate = formatDateLocal(new Date(session.created_at));
      const match = days.find(d => d.dateStr === sessionDate);
      if (match) {
        match.starts += 1;
        match.focusTime += Math.round(session.duration / 60);
      }
    });

    return days;
  }, [rawSessions]);

  // --- PIE CHART: Obstacles Breakdown ---
  const obstaclesData = useMemo(() => {
    const sessions = rawSessions.filter(s => s.completed);
    
    const reasonCounts: Record<string, number> = {};
    sessions.forEach(s => {
      if (s.reason && s.reason !== "N/A" && s.reason !== "Unknown") {
        const key = s.reason.charAt(0).toUpperCase() + s.reason.slice(1);
        reasonCounts[key] = (reasonCounts[key] || 0) + 1;
      }
    });

    const data = Object.keys(reasonCounts).map(key => ({
      name: key,
      value: reasonCounts[key]
    }));
    
    return data.sort((a, b) => b.value - a.value);
  }, [rawSessions]);

  // --- PIE CHART: Categories Breakdown ---
  const categoriesData = useMemo(() => {
    const sessions = rawSessions.filter(s => s.completed);
    
    const catCounts: Record<string, number> = {};
    sessions.forEach(s => {
      const cat = s.category || "Other";
      catCounts[cat] = (catCounts[cat] || 0) + 1;
    });

    const data = Object.keys(catCounts).map(key => ({
      name: key,
      value: catCounts[key]
    }));
    
    return data.sort((a, b) => b.value - a.value);
  }, [rawSessions]);

  // Bright, distinguishable colors for the pie chart
  const COLORS = ['#39ff14', '#00f3ff', '#f97316', '#c084fc', '#facc15', '#f43f5e'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 rounded-lg border border-slate-700 shadow-xl bg-slate-900/95 text-sm z-50">
          <p className="font-bold text-white mb-1">{label || payload[0].name}</p>
          <p className="font-bold flex items-center gap-2" style={{ color: payload[0].payload.fill || '#39ff14' }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].payload.fill || '#39ff14' }} />
            {payload[0].name === "Focus Time" ? `Focus: ${payload[0].value} min` : `Occurrences: ${payload[0].value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex items-center justify-between px-1 mb-2">
        <h3 className="text-xl font-bold text-white tracking-wide">Trends & Insights</h3>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full min-h-[340px]">
        {/* Bar Chart Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 rounded-2xl relative overflow-hidden group hover:border-slate-500/50 transition-all flex flex-col h-full min-h-[300px]"
        >
          <h4 className="text-[11px] uppercase tracking-widest text-slate-400 font-bold mb-4">Focus Time (7 Days)</h4>
          <div className="flex-1 w-full relative z-10 -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={focusTimeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}m`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
                <Bar dataKey="focusTime" name="Focus Time" fill="url(#colorNeonBlue)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <defs>
                  <linearGradient id="colorNeonBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f3ff" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#00f3ff" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Categories Pie Chart Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 rounded-2xl relative overflow-hidden group hover:border-slate-500/50 transition-all flex flex-col h-full min-h-[300px]"
        >
          <h4 className="text-[11px] uppercase tracking-widest text-slate-400 font-bold mb-2">Category Split</h4>
          <div className="flex-1 w-full relative z-10 flex flex-col items-center justify-center">
            {categoriesData.length === 0 ? (
              <p className="text-slate-500 text-sm">No formatted categories tracked yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoriesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoriesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle" 
                    formatter={(value, entry: any) => <span className="text-slate-300 font-medium ml-1 text-xs uppercase tracking-wider">{value} ({entry.payload.value})</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Obstacles Pie Chart Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 rounded-2xl relative overflow-hidden group hover:border-slate-500/50 transition-all flex flex-col h-full min-h-[300px]"
        >
          <h4 className="text-[11px] uppercase tracking-widest text-slate-400 font-bold mb-2">Top Obstacles</h4>
          <div className="flex-1 w-full relative z-10 flex flex-col items-center justify-center">
            {obstaclesData.length === 0 ? (
              <p className="text-slate-500 text-sm">No formatted obstacles tracked yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={obstaclesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {obstaclesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle" 
                    formatter={(value, entry: any) => <span className="text-slate-300 font-medium ml-1 text-xs uppercase tracking-wider">{value} ({entry.payload.value})</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
