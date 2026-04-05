-- 🛡️ LAST RESORT PRIVACY FIX
-- Run this if your dashboard is still blank but diagnostics show an ID in 'JWT Sub'.

-- 1. DROP OLD POLICIES
DROP POLICY IF EXISTS "user_tasks_policy" ON tasks;
DROP POLICY IF EXISTS "user_sessions_policy" ON sessions;

-- 2. CREATE MORE PERMISSIVE POLICIES
-- This version checks both the 'sub' claim AND the 'uid' claim for maximum compatibility.
CREATE POLICY "user_tasks_policy" ON tasks 
    FOR ALL USING (
      (auth.jwt() ->> 'sub')::text = user_id::text 
      OR 
      auth.uid()::text = user_id::text
    );

CREATE POLICY "user_sessions_policy" ON sessions 
    FOR ALL USING (
      (auth.jwt() ->> 'sub')::text = user_id::text 
      OR 
      auth.uid()::text = user_id::text
    );

-- 3. RELOAD
NOTIFY pgrst, 'reload schema';
