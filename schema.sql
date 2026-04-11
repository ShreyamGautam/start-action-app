-- ============================================================
-- FINAL MASTER SCHEMA (Clerk + Supabase + Diagnostics)
-- ============================================================

-- 1. CLEAN SLATE
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;

-- 2. CREATE TABLES
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_text TEXT NOT NULL,
    user_id TEXT NOT NULL, -- Clerk user IDs are TEXT
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL, -- Clerk user IDs are TEXT
    start_time TIMESTAMPTZ DEFAULT now() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    duration INTEGER NOT NULL,
    reason TEXT,
    completed BOOLEAN DEFAULT FALSE,
    category TEXT DEFAULT 'Other',
    xp_earned INTEGER DEFAULT 0
);

-- 3. ENABLE RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- 4. CREATE POLICIES
CREATE POLICY "tasks_policy" ON tasks
    FOR ALL USING ((auth.jwt() ->> 'sub') = user_id)
    WITH CHECK ((auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "sessions_policy" ON sessions
    FOR ALL USING ((auth.jwt() ->> 'sub') = user_id)
    WITH CHECK ((auth.jwt() ->> 'sub') = user_id);

-- 5. INDEXES
CREATE INDEX tasks_user_idx ON tasks(user_id);
CREATE INDEX sessions_user_idx ON sessions(user_id);

-- 6. DEBUG HELPERS (Your proposed functions)
CREATE OR REPLACE FUNCTION debug_jwt()
RETURNS JSONB AS $$
BEGIN
  RETURN auth.jwt();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION debug_user_id()
RETURNS TEXT AS $$
BEGIN
  RETURN (auth.jwt() ->> 'sub')::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. RELOAD
NOTIFY pgrst, 'reload schema';
