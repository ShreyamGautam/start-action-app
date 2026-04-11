-- ============================================================
-- MASTER UNIFIED SCHEMA (The Source of Truth)
-- ============================================================

-- 1. CLEAN SLATE
-- Drops everything to ensure no old/conflicting policies remain.
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;

-- 2. CORE TABLES
-- user_id is TEXT to match Clerk's String format.
CREATE TABLE tasks (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_text  TEXT NOT NULL,
    user_id    TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE sessions (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id    UUID REFERENCES tasks(id) ON DELETE CASCADE,
    user_id    TEXT NOT NULL,
    start_time TIMESTAMPTZ DEFAULT now() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    duration   INTEGER NOT NULL,
    reason     TEXT,
    completed  BOOLEAN DEFAULT FALSE,
    category   TEXT DEFAULT 'Other',
    xp_earned  INTEGER DEFAULT 0
);

-- 3. ENABLE SECURITY
ALTER TABLE tasks    ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- 4. FINAL SECURE POLICIES (Clerk ↔ Supabase Bridge)
-- These ensure users can ONLY see and modify their own data.
CREATE POLICY "secure_user_tasks" ON tasks 
    FOR ALL 
    TO authenticated 
    USING ( (auth.jwt() ->> 'sub')::text = user_id::text )
    WITH CHECK ( (auth.jwt() ->> 'sub')::text = user_id::text );

CREATE POLICY "secure_user_sessions" ON sessions 
    FOR ALL 
    TO authenticated 
    USING ( (auth.jwt() ->> 'sub')::text = user_id::text )
    WITH CHECK ( (auth.jwt() ->> 'sub')::text = user_id::text );

-- 5. PERFORMANCE INDEXES
CREATE INDEX tasks_user_idx    ON tasks(user_id);
CREATE INDEX sessions_user_idx ON sessions(user_id);

-- 6. DIAGNOSTIC HELPERS
-- Use these to verify identity: SELECT debug_user_id();
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

-- 7. NOTIFY SYSTEM
-- Forces Supabase to recognize schema changes immediately.
NOTIFY pgrst, 'reload schema';
