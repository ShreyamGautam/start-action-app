-- Start Action Clerk + Supabase Unified Schema
-- This schema allows Clerk users to persist data in Supabase with strict RLS.

-- 1. Correct the user_id storage type (Clerk user IDs are strings, not UUIDs)
DO $$ 
BEGIN
    -- Change sessions user_id to TEXT
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sessions' AND column_name='user_id') THEN
        ALTER TABLE sessions ALTER COLUMN user_id TYPE TEXT;
    END IF;
    
    -- Change tasks user_id to TEXT
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='user_id') THEN
        ALTER TABLE tasks ALTER COLUMN user_id TYPE TEXT;
    END IF;
END $$;

-- 2. Ensure basic columns exist
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Other';
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS xp_earned INTEGER DEFAULT 0;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS user_id TEXT;

-- 3. Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- CLERK-BASED PERMISSION POLICIES
-- Uses the 'sub' (Subject) claim from the Clerk JWT
-- -----------------------------------------------------

-- Tasks Policies
DROP POLICY IF EXISTS "Users can only read their own tasks" ON tasks;
CREATE POLICY "Users can only read their own tasks"
  ON tasks FOR SELECT USING ((auth.jwt() ->> 'sub')::text = user_id);

DROP POLICY IF EXISTS "Users can only insert their own tasks" ON tasks;
CREATE POLICY "Users can only insert their own tasks"
  ON tasks FOR INSERT WITH CHECK ((auth.jwt() ->> 'sub')::text = user_id);

DROP POLICY IF EXISTS "Users can only update their own tasks" ON tasks;
CREATE POLICY "Users can only update their own tasks"
  ON tasks FOR UPDATE USING ((auth.jwt() ->> 'sub')::text = user_id);

DROP POLICY IF EXISTS "Users can only delete their own tasks" ON tasks;
CREATE POLICY "Users can only delete their own tasks"
  ON tasks FOR DELETE USING ((auth.jwt() ->> 'sub')::text = user_id);

-- Sessions Policies
DROP POLICY IF EXISTS "Users can only read their own sessions" ON sessions;
CREATE POLICY "Users can only read their own sessions"
  ON sessions FOR SELECT USING ((auth.jwt() ->> 'sub')::text = user_id);

DROP POLICY IF EXISTS "Users can only insert their own sessions" ON sessions;
CREATE POLICY "Users can only insert their own sessions"
  ON sessions FOR INSERT WITH CHECK ((auth.jwt() ->> 'sub')::text = user_id);

DROP POLICY IF EXISTS "Users can only update their own sessions" ON sessions;
CREATE POLICY "Users can only update their own sessions"
  ON sessions FOR UPDATE USING ((auth.jwt() ->> 'sub')::text = user_id);

DROP POLICY IF EXISTS "Users can only delete their own sessions" ON sessions;
CREATE POLICY "Users can only delete their own sessions"
  ON sessions FOR DELETE USING ((auth.jwt() ->> 'sub')::text = user_id);

-- -----------------------------------------------------
-- FORCE SUPABASE TO WAKE UP AND SEE THE CHANGES
-- -----------------------------------------------------
NOTIFY pgrst, 'reload schema';
