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
    duration INTEGER NOT NULL, -- in seconds
    reason TEXT, -- why they were stuck
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Safely add 'completed' column for existing installations
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sessions' AND column_name='completed') THEN
        ALTER TABLE sessions ADD COLUMN completed BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sessions' AND column_name='category') THEN
        ALTER TABLE sessions ADD COLUMN category TEXT DEFAULT 'Other';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sessions' AND column_name='xp_earned') THEN
        ALTER TABLE sessions ADD COLUMN xp_earned INTEGER DEFAULT 0;
    END IF;
END $$;

-- Set up Row Level Security (RLS) policies
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Secure Idempotent Schema Adjustments
-- Secure native schema adjustments without PL/pgSQL wrapping
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop purely anonymous insecure policies
DROP POLICY IF EXISTS "Allow anonymous select on tasks" ON tasks;
DROP POLICY IF EXISTS "Allow anonymous insert on tasks" ON tasks;
DROP POLICY IF EXISTS "Allow anonymous update on tasks" ON tasks;
DROP POLICY IF EXISTS "Allow anonymous delete on tasks" ON tasks;
DROP POLICY IF EXISTS "Allow anonymous select on sessions" ON sessions;
DROP POLICY IF EXISTS "Allow anonymous insert on sessions" ON sessions;
DROP POLICY IF EXISTS "Allow anonymous update on sessions" ON sessions;
DROP POLICY IF EXISTS "Allow anonymous delete on sessions" ON sessions;

-- Set up Authenticated strict Row Level Security (RLS) policies
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

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
