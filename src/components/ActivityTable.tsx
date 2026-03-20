import { useState } from "react";
import { SessionData } from "./StatsDashboard";
import { CheckCircle, Clock, XCircle, Trash2, Edit2, Check, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

interface ActivityTableProps {
  sessions: SessionData[];
  onRefresh: () => void;
}

export default function ActivityTable({ sessions, onRefresh }: ActivityTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Edit form state
  const [editReason, setEditReason] = useState("");
  const [editCategory, setEditCategory] = useState("Other");
  const [editCompleted, setEditCompleted] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const startEdit = (session: SessionData) => {
    setEditingId(session.id);
    setEditReason(session.reason || "");
    setEditCategory(session.category || "Other");
    setEditCompleted(session.completed);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: string) => {
    if (!supabase) return;
    try {
      await supabase
        .from('sessions')
        .update({ reason: editReason, category: editCategory, completed: editCompleted })
        .eq('id', id);
        
      setEditingId(null);
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteSession = async (id: string) => {
    if (!supabase) return;
    setIsDeleting(id);
    try {
      await supabase.from('sessions').delete().eq('id', id);
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(null);
    }
  };

  if (sessions.length === 0) {
    return (
      <div className="w-full glass-card p-10 rounded-2xl text-center text-slate-400 animate-pulse-slow">
        No past sessions yet. Start a task above!
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-xl font-bold text-white mb-4 tracking-wide">Recent Action Log</h3>
      <div className="glass-card rounded-2xl overflow-hidden shadow-2xl border-slate-700/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-700/80">
                <th className="p-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Task</th>
                <th className="p-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest hidden sm:table-cell">Category</th>
                <th className="p-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Duration</th>
                <th className="p-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest hidden md:table-cell">Reason</th>
                <th className="p-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap hidden sm:table-cell">Date</th>
                <th className="p-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Status</th>
                <th className="p-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 relative">
              <AnimatePresence>
                {sessions.slice(0, 10).map((session, i) => {
                  const isEditing = editingId === session.id;
                  
                  return (
                    <motion.tr 
                      key={session.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: i * 0.05 }}
                      className={`group transition-colors ${isEditing ? 'bg-slate-800 border-l-2 border-brand-neon-blue' : 'hover:bg-slate-800/40'}`}
                    >
                      <td className="p-4 font-medium text-slate-200">
                        <span className="line-clamp-2 md:line-clamp-1">{session.tasks?.task_text || "Unknown Task"}</span>
                      </td>
                      
                      <td className="p-4 text-sm text-brand-neon-blue hidden sm:table-cell font-bold">
                        {isEditing ? (
                          <input 
                            type="text" 
                            className="bg-slate-900 border border-brand-neon-blue/50 text-brand-neon-blue rounded px-2 py-1 flex-1 w-20 sm:w-24 focus:outline-none focus:border-brand-neon-blue" 
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                          />
                        ) : (
                          `#${session.category || "Other"}`
                        )}
                      </td>

                      <td className="p-4 text-slate-300 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-sm">
                          <Clock className="w-3.5 h-3.5 text-brand-neon-blue" />
                          {session.duration / 60}m
                        </div>
                      </td>
                      
                      <td className="p-4 text-sm text-slate-400 hidden md:table-cell">
                        {isEditing ? (
                          <input 
                            type="text" 
                            className="bg-slate-900 border border-slate-600 rounded px-2 py-1 flex-1 w-24 sm:w-32 focus:outline-none focus:border-brand-neon-blue" 
                            value={editReason}
                            onChange={(e) => setEditReason(e.target.value)}
                          />
                        ) : (
                          <span className="capitalize">{session.reason}</span>
                        )}
                      </td>
                      
                      <td className="p-4 text-sm text-slate-400 hidden sm:table-cell">
                        {new Date(session.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}
                      </td>
                      
                      <td className="p-4 whitespace-nowrap">
                        {isEditing ? (
                          <select 
                            className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-slate-200 focus:outline-none focus:border-brand-neon-blue"
                            value={editCompleted ? "1" : "0"}
                            onChange={(e) => setEditCompleted(e.target.value === "1")}
                          >
                            <option value="1">Done</option>
                            <option value="0">Missed</option>
                          </select>
                        ) : session.completed ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-neon-green/10 text-brand-neon-green text-[11px] uppercase tracking-wider font-bold border border-brand-neon-green/30 drop-shadow-[0_0_5px_rgba(57,255,20,0.2)]">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Done</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 text-slate-400 text-[11px] uppercase tracking-wider font-bold border border-slate-600">
                            <XCircle className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Missed</span>
                          </div>
                        )}
                      </td>
                      
                      <td className="p-4 text-right whitespace-nowrap">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-2">
                             <button onClick={() => saveEdit(session.id)} className="p-1.5 rounded bg-brand-neon-green/20 text-brand-neon-green hover:bg-brand-neon-green hover:text-slate-900 transition-colors">
                               <Check className="w-4 h-4" />
                             </button>
                             <button onClick={cancelEdit} className="p-1.5 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors">
                               <X className="w-4 h-4" />
                             </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEdit(session)} className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-brand-neon-blue transition-colors outline-none">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => deleteSession(session.id)} 
                              disabled={isDeleting === session.id}
                              className="p-2 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors outline-none disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {sessions.length > 10 && (
          <div className="p-3 text-center text-xs text-brand-neon-blue font-bold border-t border-slate-800/50 bg-slate-900/50 uppercase tracking-widest shadow-inner">
            Showing latest 10 sessions
          </div>
        )}
      </div>
    </div>
  );
}
