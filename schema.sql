-- 🚨 EMERGENCY RESET: CLEAN SLATE CLERK + SUPABASE SCHEMA
-- WARNING: THIS WILL ERASE ALL EXISTING DATA. USE THIS ONLY IF YOUR DASHBOARD IS BLANK.

-- 1. DROP EVERYTHING (Start from scratch)
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS tasks;

-- 2. CREATE TASKS TABLE (Using TEXT for user_id to match Clerk)
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_text TEXT NOT NULL,
    user_id TEXT NOT NULL, -- Clerk user IDs are strings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. CREATE SESSIONS TABLE
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL, -- Clerk user IDs are strings
    start_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    duration INTEGER NOT NULL,
    reason TEXT,
    completed BOOLEAN DEFAULT FALSE,
    category TEXT DEFAULT 'Other',
    xp_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ENABLE RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- 5. CREATE POLICIES (Strictly matching Clerk's sub claim)
-- IMPORTANT: This depends on a Clerk JWT template named 'supabase'
CREATE POLICY "user_tasks_policy" ON tasks 
    FOR ALL USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "user_sessions_policy" ON sessions 
    FOR ALL USING (auth.jwt() ->> 'sub' = user_id);

-- 6. INDEXING
CREATE INDEX IF NOT EXISTS tasks_user_idx ON tasks(user_id);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id);

-- 7. RELOAD
NOTIFY pgrst, 'reload schema';
