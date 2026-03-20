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
END $$;

-- Set up Row Level Security (RLS) policies
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Idempotent Policy Creation using DO blocks
DO $$ 
BEGIN
    -- Tasks Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Allow anonymous select on tasks') THEN
        CREATE POLICY "Allow anonymous select on tasks" ON tasks FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Allow anonymous insert on tasks') THEN
        CREATE POLICY "Allow anonymous insert on tasks" ON tasks FOR INSERT WITH CHECK (true);
    END IF;

    -- Sessions Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sessions' AND policyname = 'Allow anonymous select on sessions') THEN
        CREATE POLICY "Allow anonymous select on sessions" ON sessions FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sessions' AND policyname = 'Allow anonymous insert on sessions') THEN
        CREATE POLICY "Allow anonymous insert on sessions" ON sessions FOR INSERT WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sessions' AND policyname = 'Allow anonymous update on sessions') THEN
        CREATE POLICY "Allow anonymous update on sessions" ON sessions FOR UPDATE USING (true);
    END IF;
    
    -- New Delete Policies for CRUD
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sessions' AND policyname = 'Allow anonymous delete on sessions') THEN
        CREATE POLICY "Allow anonymous delete on sessions" ON sessions FOR DELETE USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Allow anonymous delete on tasks') THEN
        CREATE POLICY "Allow anonymous delete on tasks" ON tasks FOR DELETE USING (true);
    END IF;
END $$;
