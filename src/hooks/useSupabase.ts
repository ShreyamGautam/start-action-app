import { useAuth } from "@clerk/nextjs";
import { createClient as createBrowserClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { SupabaseClient } from "@supabase/supabase-js";

export function useSupabase() {
  const { getToken, isLoaded, userId } = useAuth();
  
  // Start with a state-aware object
  const [session, setSession] = useState<{
    client: SupabaseClient;
    isReady: boolean;
  }>({
    client: createBrowserClient(),
    isReady: false
  });

  useEffect(() => {
    const updateClient = async () => {
      if (isLoaded && userId) {
        try {
          const token = await getToken({ template: "supabase" });
          if (token) {
            console.log("🔐 [Supabase Sync] Authenticated Client Ready.");
            setSession({
              client: createBrowserClient(token),
              isReady: true
            });
          } else {
            console.warn("⚠️ [Supabase Sync] Token is null. Check JWT Template.");
            setSession(s => ({ ...s, isReady: false }));
          }
        } catch (err) {
          console.error("❌ [Supabase Sync] Token fetch crash:", err);
          setSession(s => ({ ...s, isReady: false }));
        }
      }
    };
    updateClient();
  }, [getToken, isLoaded, userId]);

  return session;
}

