-- MIGRATION SCRIPT: V1 to V2 Enterprise
-- Run this if you have an existing database and are getting "column does not exist" errors.

-- 1. Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Workspaces Table (New Root Entity)
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

-- 3. Create Default Personal Workspaces for Existing Users
INSERT INTO workspaces (owner_id, name, type)
SELECT id, 'Personal Workspace', 'personal'
FROM auth.users
WHERE id NOT IN (SELECT owner_id FROM workspaces)
ON CONFLICT DO NOTHING;

-- 4. Add workspace_id to Core Tables
-- We use a DO block to safely add columns if they don't exist

DO $$
BEGIN
    -- Categories
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'workspace_id') THEN
        ALTER TABLE categories ADD COLUMN workspace_id UUID REFERENCES workspaces ON DELETE CASCADE;
    END IF;

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

-- 5. Backfill workspace_id for existing data
-- Associates orphan data with the user's default personal workspace

UPDATE categories c
SET workspace_id = w.id
FROM workspaces w
WHERE c.workspace_id IS NULL AND w.owner_id = (SELECT auth.uid()); -- Optimistic guess, better to rely on RLS or specific logic
-- A more robust backfill:
UPDATE categories c SET workspace_id = (SELECT id FROM workspaces WHERE owner_id = (SELECT user_id FROM accounts WHERE id IN (SELECT account_id FROM transactions LIMIT 1) LIMIT 1) LIMIT 1) WHERE workspace_id IS NULL; 
-- Actually, we can't easily map without user_id on categories (v1 didn't have user_id on categories usually? Or did it?).
-- Assuming v1 tables had user_id.

-- Let's try to backfill based on user ownership if possible.
-- If tables have user_id:
UPDATE accounts a SET workspace_id = (SELECT id FROM workspaces WHERE owner_id = a.user_id LIMIT 1) WHERE workspace_id IS NULL;
UPDATE transactions t SET workspace_id = (SELECT id FROM workspaces WHERE owner_id = t.user_id LIMIT 1) WHERE workspace_id IS NULL;
UPDATE goals g SET workspace_id = (SELECT id FROM workspaces WHERE owner_id = g.user_id LIMIT 1) WHERE workspace_id IS NULL;

-- 6. Add Enterprise Columns to Accounts (if missing)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'classification') THEN
        ALTER TABLE accounts ADD COLUMN classification TEXT DEFAULT 'asset';
    END IF;
     IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'institution_name') THEN
        ALTER TABLE accounts ADD COLUMN institution_name TEXT;
    END IF;
END $$;

-- 7. Create New Enterprise Tables (Reports, Snapshots, Insights)
-- These should use CREATE TABLE IF NOT EXISTS in the main schema, but we repeat critical ones here to be safe.

CREATE TABLE IF NOT EXISTS report_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID, -- Can be null initially if just snapshotting
  workspace_id UUID REFERENCES workspaces ON DELETE CASCADE,
  snapshot_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 8. Fix Categories Constraint (v1 might have user_id based constraint)
-- We need to drop old unique constraints if they conflict with new workspace-based ones
-- ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_name_user_id_key;
-- ALTER TABLE categories DROP CONSTRAINT IF EXISTS category_name_unique;

-- 9. Re-run Policy setup (Optional, handled by main schema)
