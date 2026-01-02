-- SAFE MIGRATION SCRIPT V2
-- Handles cases where tables might be missing completely.

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Workspaces Table (If missing)
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'personal',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  CONSTRAINT workspace_name_owner_unique UNIQUE (owner_id, name)
);

-- 3. Create Default Personal Workspaces
INSERT INTO workspaces (owner_id, name, type)
SELECT id, 'Personal Workspace', 'personal'
FROM auth.users
WHERE id NOT IN (SELECT owner_id FROM workspaces)
ON CONFLICT DO NOTHING;

-- 4. Create Categories Table (If missing)
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense', 'both')) NOT NULL,
  icon TEXT,
  color TEXT,
  parent_category_id UUID REFERENCES categories ON DELETE SET NULL,
  is_system BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  CONSTRAINT category_name_workspace_unique UNIQUE (workspace_id, name, type)
);

-- 5. Add workspace_id to OTHER Core Tables (Accounts, Transactions, Goals)
DO $$
BEGIN
    -- Accounts
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'workspace_id') THEN
        ALTER TABLE accounts ADD COLUMN workspace_id UUID REFERENCES workspaces ON DELETE CASCADE;
    END IF;
    
    -- Transactions
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'workspace_id') THEN
        ALTER TABLE transactions ADD COLUMN workspace_id UUID REFERENCES workspaces ON DELETE CASCADE;
    END IF;

    -- Goals
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'goals' AND column_name = 'workspace_id') THEN
        ALTER TABLE goals ADD COLUMN workspace_id UUID REFERENCES workspaces ON DELETE CASCADE;
    END IF;
END $$;

-- 6. Backfill workspace_id for Accounts/Transactions/Goals
UPDATE accounts a SET workspace_id = (SELECT id FROM workspaces WHERE owner_id = a.user_id LIMIT 1) WHERE workspace_id IS NULL;
UPDATE transactions t SET workspace_id = (SELECT id FROM workspaces WHERE owner_id = t.user_id LIMIT 1) WHERE workspace_id IS NULL;
UPDATE goals g SET workspace_id = (SELECT id FROM workspaces WHERE owner_id = g.user_id LIMIT 1) WHERE workspace_id IS NULL;

-- 7. Add Enterprise Columns to Accounts
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'classification') THEN
        ALTER TABLE accounts ADD COLUMN classification TEXT DEFAULT 'asset';
    END IF;
     IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'institution_name') THEN
        ALTER TABLE accounts ADD COLUMN institution_name TEXT;
    END IF;
END $$;

-- 8. Create Report Snapshots (If missing)
CREATE TABLE IF NOT EXISTS report_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID, 
  workspace_id UUID REFERENCES workspaces ON DELETE CASCADE,
  snapshot_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);
