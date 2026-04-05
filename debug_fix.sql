-- 🚨 EMERGENCY DASHBOARD DIAGNOSTIC
-- Run this in the Supabase SQL Editor to see why your data is blank.

-- 1. TEMPORARILY DISABLE SECURITY BRICKS (Testing only)
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;

-- 2. FORCE RELOAD CACHE
NOTIFY pgrst, 'reload schema';

-- [ After running this, REFRESH your Vercel/Localhost app ]
-- IF DATA APPEARS: The problem was our RLS Policy ("Users can only see their own tasks").
-- IF DATA IS STILL GONE: The data was never saved to Supabase (Check Clerk logs).
