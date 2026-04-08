-- ============================================================
-- START ACTION — FINAL MASTER SCHEMA
-- Run this in Supabase SQL Editor to fix all data sync issues.
-- WARNING: Drops existing tables. Safe since old data was broken.
-- ============================================================

-- 1. DROP EVERYTHING (removes old broken UUID columns + bad constraints)
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;

-- 2. TASKS TABLE (user_id is TEXT — matches Clerk IDs like "user_xxxx")
CREATE TABLE tasks (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_text  TEXT NOT NULL,
    user_id    TEXT NOT NULL,           -- Clerk user IDs are TEXT strings
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. SESSIONS TABLE (user_id is TEXT — NO foreign key to auth.users)
CREATE TABLE sessions (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id    UUID REFERENCES tasks(id) ON DELETE CASCADE,
    user_id    TEXT NOT NULL,           -- Clerk user IDs are TEXT strings
    start_time TIMESTAMPTZ DEFAULT now() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    duration   INTEGER NOT NULL,
    reason     TEXT,
    completed  BOOLEAN DEFAULT FALSE,
    category   TEXT DEFAULT 'Other',
    xp_earned  INTEGER DEFAULT 0
);

-- 4. ENABLE ROW LEVEL SECURITY
ALTER TABLE tasks    ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- 5. RLS POLICIES (auth.jwt() ->> 'sub' is Clerk's user ID)
CREATE POLICY "tasks_rls" ON tasks
    FOR ALL USING ((auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "sessions_rls" ON sessions
    FOR ALL USING ((auth.jwt() ->> 'sub') = user_id);

-- 6. INDEXES FOR PERFORMANCE
CREATE INDEX tasks_user_idx    ON tasks(user_id);
CREATE INDEX sessions_user_idx ON sessions(user_id);

-- 7. RELOAD POSTGREST SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
