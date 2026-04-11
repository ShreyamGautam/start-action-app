import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const createClient = (token?: string) =>
  createBrowserClient(
    supabaseUrl!,
    supabaseKey!,
    token ? {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    } : undefined
  );
