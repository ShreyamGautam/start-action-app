import { useAuth } from "@clerk/nextjs";
import { createClerkSupabaseClient } from "@/lib/supabase";
import { useEffect, useState } from "react";

export function useSupabase() {
  const { getToken, isLoaded } = useAuth();
  const [client, setClient] = useState(createClerkSupabaseClient());

  useEffect(() => {
    const updateClient = async () => {
      if (isLoaded) {
        const token = await getToken({ template: "supabase" });
        setClient(createClerkSupabaseClient(token || undefined));
      }
    };
    updateClient();
  }, [getToken, isLoaded]);

  return client;
}
