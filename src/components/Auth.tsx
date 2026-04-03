"use client";

import { SignIn, SignUp } from "@clerk/nextjs";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Auth() {
  const pathname = usePathname();
  const isLogin = pathname?.startsWith("/sign-in");

  const sharedAppearance = {
    elements: {
      rootBox: "mx-auto w-full",
      card: "bg-slate-900 border border-white/5 shadow-none w-full rounded-[2rem]",
      headerTitle: "text-2xl font-black text-white text-center mb-1",
      headerSubtitle: "text-slate-400 text-center font-medium mb-6",
      socialButtonsBlockButton: "bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all rounded-2xl h-12 flex justify-center items-center gap-3",
      socialButtonsBlockButtonText: "text-white font-bold tracking-tight",
      dividerLine: "bg-slate-800",
      dividerText: "text-slate-500 font-bold uppercase tracking-widest text-[10px]",
      formButtonPrimary: "bg-brand-neon-blue hover:bg-brand-neon-blue/80 text-brand-bg font-black uppercase tracking-widest h-12 rounded-2xl shadow-[0_0_15px_rgba(0,243,255,0.3)] transition-all",
      formFieldLabel: "text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-1.5 ml-1",
      formFieldInput: "bg-slate-900/60 border border-slate-700 text-white rounded-2xl px-4 h-12 focus:border-brand-neon-blue transition-all shadow-inner block outline-none",
      footerActionText: "text-slate-500 font-medium",
      footerActionLink: "text-brand-neon-blue hover:text-brand-neon-blue/80 font-bold",
      identityPreviewText: "text-white font-bold",
      identityPreviewEditButtonIcon: "text-brand-neon-blue",
      formResendCodeLink: "text-brand-neon-blue",
      formFieldAction: "text-brand-neon-blue hover:text-brand-neon-blue/80 font-bold underline-none",
      providerIcon__google: "filter brightness-110",
      formFieldSuccessText: "text-brand-neon-green",
      formFieldErrorText: "text-red-400",
      alertText: "text-white",
    }
  };

  return (
    <div className="w-full max-w-md mx-auto relative z-10 pt-10 pb-20 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center"
      >
        <div className="mb-10 text-center">
          <motion.h2 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-5xl font-black text-white mb-2 tracking-tighter italic drop-shadow-[0_0_15px_rgba(0,243,255,0.2)]"
          >
            START <span className="text-brand-neon-blue">ACTION</span>
          </motion.h2>
          <div className="h-1 w-20 bg-gradient-to-r from-brand-neon-blue to-brand-neon-green mx-auto rounded-full" />
        </div>

        <div className="glass-card w-full p-2 rounded-[2.5rem] relative overflow-hidden ring-1 ring-white/10 shadow-2xl backdrop-blur-3xl bg-slate-900/40 border border-white/5">
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-brand-neon-blue/10 blur-[130px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-brand-neon-green/10 blur-[130px] rounded-full pointer-events-none" />
          
          <div className="relative z-10">
            {isLogin ? (
              <SignIn 
                path="/sign-in"
                routing="path" 
                appearance={sharedAppearance}
                signUpUrl="/sign-up"
              />
            ) : (
              <SignUp 
                path="/sign-up"
                routing="path"
                appearance={sharedAppearance}
                signInUrl="/sign-in"
              />
            )}
          </div>
        </div>

        <div className="mt-8">
            <Link
              href={isLogin ? "/sign-up" : "/sign-in"}
              className="px-8 py-3 rounded-2xl bg-slate-800/40 border border-slate-700/50 text-xs text-slate-400 font-bold hover:text-white hover:border-brand-neon-blue/40 transition-all tracking-widest uppercase backdrop-blur-md inline-block text-center"
            >
              {isLogin ? "Need an account? " : "Already have an account? "}
              <span className="text-brand-neon-blue ml-1">{isLogin ? "Sign Up" : "Log In"}</span>
            </Link>
        </div>
      </motion.div>
    </div>
  );
}
