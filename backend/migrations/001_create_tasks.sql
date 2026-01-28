-- Clawban Tasks Table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  model_strategy TEXT,
  estimated_token_cost INTEGER DEFAULT 0,
  estimated_dollar_cost DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'approved', 'in-progress', 'complete')),
  assignee TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  llm_usage JSONB DEFAULT '[]'
);

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- Allow service key full access (for API)
CREATE POLICY "Service key full access to tasks" ON tasks
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service key full access to tags" ON tags
  FOR ALL USING (true) WITH CHECK (true);

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee);
