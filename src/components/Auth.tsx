"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, ArrowRight, Loader2 } from "lucide-react";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    
    setLoading(true);
    setErrorMsg("");

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) setErrorMsg(error.message);
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) setErrorMsg(error.message);
        else setErrorMsg("Check your email for the confirmation link!");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto relative z-10 pt-20">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 md:p-10 rounded-[2rem] relative overflow-hidden ring-1 ring-white/10 shadow-2xl backdrop-blur-xl"
      >
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-brand-neon-blue/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-purple-500/20 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <h2 className="text-3xl font-black text-white mb-2 tracking-wide">
            {isLogin ? "Welcome Back" : "Start Fresh"}
          </h2>
          <p className="text-slate-400 text-sm mb-8 font-medium">
            {isLogin ? "Log in to track your deep work." : "Create a secure account to begin."}
          </p>

          <form onSubmit={handleAuth} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
              <div className="relative flex items-center bg-slate-900/60 border border-slate-700/80 rounded-2xl overflow-hidden focus-within:border-brand-neon-blue focus-within:ring-1 focus-within:ring-brand-neon-blue transition-all shadow-inner">
                <Mail className="absolute left-4 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@email.com"
                  className="w-full bg-transparent text-white pl-12 pr-4 py-4 text-sm focus:outline-none placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative flex items-center bg-slate-900/60 border border-slate-700/80 rounded-2xl overflow-hidden focus-within:border-brand-neon-blue focus-within:ring-1 focus-within:ring-brand-neon-blue transition-all shadow-inner">
                <Lock className="absolute left-4 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-transparent text-white pl-12 pr-4 py-4 text-sm focus:outline-none placeholder:text-slate-600"
                />
              </div>
            </div>

            <AnimatePresence>
              {errorMsg && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`text-xs font-bold ${errorMsg.includes('Check your') ? 'text-brand-neon-green' : 'text-rose-400'} text-center mt-2`}
                >
                  {errorMsg}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="mt-4 group relative flex items-center justify-center gap-2 bg-brand-neon-blue/10 hover:bg-brand-neon-blue/20 disabled:opacity-50 disabled:hover:bg-brand-neon-blue/10 text-brand-neon-blue py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all border border-brand-neon-blue/40 hover:border-brand-neon-blue shadow-[0_0_15px_rgba(0,243,255,0.1)] hover:shadow-[0_0_25px_rgba(0,243,255,0.3)]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  {isLogin ? "Log In" : "Sign Up"}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center bg-slate-900/50 rounded-xl py-3 border border-slate-800/50">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setErrorMsg("");
              }}
              className="text-xs text-slate-400 font-bold hover:text-white transition-colors tracking-wide"
            >
              {isLogin ? "Need an account? " : "Already have an account? "}
              <span className="text-brand-neon-blue ml-1 uppercase">{isLogin ? "Sign Up" : "Log In"}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
