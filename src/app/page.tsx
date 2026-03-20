"use client";

import { useState } from "react";
import StartHome from "@/components/StartHome";
import PreStart from "@/components/PreStart";
import FocusMode from "@/components/FocusMode";
import Completion from "@/components/Completion";

export type AppState = "HOME" | "PRE_START" | "FOCUS" | "COMPLETION";

export default function Page() {
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
