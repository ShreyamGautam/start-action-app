import { useAuth } from "@clerk/nextjs";
import { createClerkSupabaseClient } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { SupabaseClient } from "@supabase/supabase-js";

export function useSupabase() {
  const { getToken, isLoaded, userId } = useAuth();
  
  // Start with a state-aware object
  const [session, setSession] = useState<{
    client: SupabaseClient;
    isReady: boolean;
  }>({
    client: createClerkSupabaseClient(),
    isReady: false
  });

  useEffect(() => {
    const updateClient = async () => {
      // Use isLoaded to wait for Clerk, but only mark ready when token is set
      if (isLoaded && userId) {
        try {
          const token = await getToken({ template: "supabase" });
          if (token) {
            console.log("🔐 [Supabase Sync] Authenticated Client Ready.");
            setSession({
              client: createClerkSupabaseClient(token),
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
