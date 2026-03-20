"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import StartHome from "@/components/StartHome";
import PreStart from "@/components/PreStart";
import FocusMode from "@/components/FocusMode";
import Completion from "@/components/Completion";
import Auth from "@/components/Auth";

export type AppState = "HOME" | "PRE_START" | "FOCUS" | "COMPLETION";

export default function Page() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [appState, setAppState] = useState<AppState>("HOME");
  const [taskText, setTaskText] = useState("");
  const [duration, setDuration] = useState(60);
  const [category, setCategory] = useState("Other");
  const [reason, setReason] = useState("");
  const [sessionId, setSessionId] = useState<string>("");

  const handleStart = (text: string, time: number, cat: string = "Other") => {
    setTaskText(text);
    setCategory(cat || "Other");
    setDuration(time);
    setAppState("PRE_START");
  };

  const handlePreStartContinue = (selectedReason: string) => {
    setReason(selectedReason);
    setAppState("FOCUS");
  };

  const handleFocusComplete = (id: string | null) => {
    if (id) setSessionId(id);
    setAppState("COMPLETION");
  };

  const handleRestart = () => {
    setTaskText("");
    setDuration(60);
    setCategory("Other");
    setReason("");
    setSessionId("");
    setAppState("HOME");
  };

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (authLoading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-brand-neon-blue font-bold tracking-widest uppercase text-sm animate-pulse">Loading Vault...</div>;

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-900 text-slate-200 selection:bg-brand-neon-blue/30 selection:text-white pb-20 overflow-x-hidden">
        <Auth />
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-4 min-h-screen">
      {appState === "HOME" && <StartHome onStart={handleStart} />}
      {appState === "PRE_START" && <PreStart onContinue={handlePreStartContinue} />}
      {appState === "FOCUS" && (
        <FocusMode 
          taskText={taskText} 
          duration={duration} 
          reason={reason}
          category={category}
          onComplete={handleFocusComplete} 
        />
      )}
      {appState === "COMPLETION" && (
        <Completion 
          taskText={taskText} 
          duration={duration} 
          reason={reason} 
          sessionId={sessionId}
          onRestart={handleRestart} 
        />
      )}
    </main>
  );
}
