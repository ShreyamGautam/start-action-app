-- Start Action MVP Database Schema
-- Note: Re-running this script won't crash if the tables/policies already exist.

-- Create tasks table if it doesn't exist
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    duration INTEGER NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Safely add NEW columns introduced in recent updates
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Other';
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS xp_earned INTEGER DEFAULT 0;

-- Link rows to the authenticated user ID securely securely
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;

-- Enable Row Level Security (RLS) policies
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- STRICT PERMISSION POLICIES (Fixes the editing errors)
-- -----------------------------------------------------

-- Tasks Policies
DROP POLICY IF EXISTS "Users can only read their own tasks" ON tasks;
CREATE POLICY "Users can only read their own tasks"
  ON tasks FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only insert their own tasks" ON tasks;
CREATE POLICY "Users can only insert their own tasks"
  ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only update their own tasks" ON tasks;
CREATE POLICY "Users can only update their own tasks"
  ON tasks FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only delete their own tasks" ON tasks;
CREATE POLICY "Users can only delete their own tasks"
  ON tasks FOR DELETE USING (auth.uid() = user_id);

-- Sessions Policies
DROP POLICY IF EXISTS "Users can only read their own sessions" ON sessions;
CREATE POLICY "Users can only read their own sessions"
  ON sessions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only insert their own sessions" ON sessions;
CREATE POLICY "Users can only insert their own sessions"
  ON sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only update their own sessions" ON sessions;
CREATE POLICY "Users can only update their own sessions"
  ON sessions FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only delete their own sessions" ON sessions;
CREATE POLICY "Users can only delete their own sessions"
  ON sessions FOR DELETE USING (auth.uid() = user_id);

-- -----------------------------------------------------
-- FORCE SUPABASE TO WAKE UP AND SEE THE CHANGES
-- -----------------------------------------------------
NOTIFY pgrst, 'reload schema';
