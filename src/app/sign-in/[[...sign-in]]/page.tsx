"use client";

import Auth from "@/components/Auth";

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-slate-900 text-slate-200 flex items-center justify-center p-4">
      <Auth initialStep="login" />
    </main>
  );
}
