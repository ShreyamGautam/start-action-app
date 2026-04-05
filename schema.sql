-- START ACTION: FULL CLERK + SUPABASE UNIFIED SCHEMA
-- This script is idempotent (can be run multiple times safely).

-- 1. Create tables with correct types if they don't exist
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_text TEXT NOT NULL,
    user_id TEXT, -- Clerk IDs are strings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    duration INTEGER NOT NULL,
    reason TEXT,
    completed BOOLEAN DEFAULT FALSE,
    category TEXT DEFAULT 'Other',
    xp_earned INTEGER DEFAULT 0,
    user_id TEXT, -- Clerk IDs are strings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Handle conversion for existing tables
DO $$ 
BEGIN
    ALTER TABLE sessions ALTER COLUMN user_id TYPE TEXT USING user_id::text;
    ALTER TABLE tasks ALTER COLUMN user_id TYPE TEXT USING user_id::text;
EXCEPTION WHEN OTHERS THEN
    NULL; -- Skip if columns don't exist yet or already converted
END $$;

-- 3. Clear all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can only read their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can only insert their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can only update their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can only delete their own tasks" ON tasks;

DROP POLICY IF EXISTS "Users can only read their own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can only insert their own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can only update their own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can only delete their own sessions" ON sessions;

-- 4. Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- 5. Create new Clerk-based policies with explicit type-casting
CREATE POLICY "Users can only read their own tasks" ON tasks FOR SELECT USING ((auth.jwt() ->> 'sub')::text = user_id::text);
CREATE POLICY "Users can only insert their own tasks" ON tasks FOR INSERT WITH CHECK ((auth.jwt() ->> 'sub')::text = user_id::text);
CREATE POLICY "Users can only update their own tasks" ON tasks FOR UPDATE USING ((auth.jwt() ->> 'sub')::text = user_id::text);
CREATE POLICY "Users can only delete their own tasks" ON tasks FOR DELETE USING ((auth.jwt() ->> 'sub')::text = user_id::text);

CREATE POLICY "Users can only read their own sessions" ON sessions FOR SELECT USING ((auth.jwt() ->> 'sub')::text = user_id::text);
CREATE POLICY "Users can only insert their own sessions" ON sessions FOR INSERT WITH CHECK ((auth.jwt() ->> 'sub')::text = user_id::text);
CREATE POLICY "Users can only update their own sessions" ON sessions FOR UPDATE USING ((auth.jwt() ->> 'sub')::text = user_id::text);
CREATE POLICY "Users can only delete their own sessions" ON sessions FOR DELETE USING ((auth.jwt() ->> 'sub')::text = user_id::text);

-- 6. Reload schema cache
NOTIFY pgrst, 'reload schema';
