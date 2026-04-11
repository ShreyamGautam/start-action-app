import { useAuth } from "@clerk/nextjs";
import { createClerkSupabaseClient } from "@/lib/supabase";
import { useEffect, useState, useMemo } from "react";

export function useSupabase() {
  const { getToken, isLoaded, userId } = useAuth();
  const [client, setClient] = useState(createClerkSupabaseClient());

  useEffect(() => {
    const updateClient = async () => {
      if (isLoaded && userId) {
        try {
          const token = await getToken({ template: "supabase" });
          if (token) {
            console.log("🔐 [Supabase Sync] Token fetched from Clerk.");
            setClient(createClerkSupabaseClient(token));
          } else {
            console.warn("⚠️ [Supabase Sync] No token found in 'supabase' template. Check Clerk dashboard.");
          }
        } catch (err) {
          console.error("❌ [Supabase Sync] Failed to fetch token:", err);
        }
      }
    };
    updateClient();
  }, [getToken, isLoaded, userId]);

  return client;
}

