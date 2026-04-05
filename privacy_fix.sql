-- 🛡️ EMERGENCY PRIVACY RESTORATION
-- Run this in the Supabase SQL Editor to RE-ENABLE security.

-- 1. RE-ENABLE ROW LEVEL SECURITY
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 2. RESET POLICIES TO BE BULLETPROOF
-- This policy uses Clerk's 'sub' claim to identify you.
DROP POLICY IF EXISTS "user_tasks_policy" ON tasks;
DROP POLICY IF EXISTS "user_sessions_policy" ON sessions;

CREATE POLICY "user_tasks_policy" ON tasks 
    FOR ALL USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "user_sessions_policy" ON sessions 
    FOR ALL USING (auth.jwt() ->> 'sub' = user_id);

-- 3. FORCE RELOAD
NOTIFY pgrst, 'reload schema';

-- [ Instructions ]
-- 1. Run this script.
-- 2. If your dashboard becomes blank again, it means your Clerk JWT template does not have the 'sub' claim.
-- 3. To fix that, go to Clerk Dashboard -> JWT Templates -> 'supabase' -> Check that 'sub' is set to '{{user.id}}'.
