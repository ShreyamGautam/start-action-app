import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase URL or Anon Key is missing. Check your .env.local file.');
}

// Helper to create a Supabase client that uses Clerk's JWT
export const createClerkSupabaseClient = (supabaseAccessToken?: string) => {
  const headers: Record<string, string> = {};
  if (supabaseAccessToken) {
    headers.Authorization = `Bearer ${supabaseAccessToken}`;
  }
  
  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers,
    },
  });
};

// Existing client for public/anon access
export const supabase = createClient(supabaseUrl, supabaseKey);
