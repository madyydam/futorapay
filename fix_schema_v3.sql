-- FINAL FIX V3: Schema Normalization
-- Fixes "column category_id does not exist" by migrating text categories to the new system.

-- 1. Add the missing category_id column
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'category_id') THEN
        ALTER TABLE transactions ADD COLUMN category_id UUID REFERENCES categories(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 2. Populate Categories Table from existing distinct transaction text
-- This ensures 'Food' becomes a real Category entity if it doesn't exist
INSERT INTO categories (workspace_id, name, type, icon)
SELECT DISTINCT 
    t.workspace_id,
    t.category, -- Legacy string column
    t.type,     -- 'income' or 'expense'
    CASE 
        WHEN t.type = 'income' THEN '💰'
        ELSE '📁'
    END
FROM transactions t
WHERE t.category IS NOT NULL 
  AND t.workspace_id IS NOT NULL
  -- Only insert if it doesn't exist (handled by unique constraint)
ON CONFLICT DO NOTHING;

-- 3. Backfill: Link Transactions to new Category IDs
UPDATE transactions t
SET category_id = c.id
FROM categories c
WHERE t.category = c.name 
  AND t.type = c.type 
  AND t.workspace_id = c.workspace_id
  AND t.category_id IS NULL;

-- 4. Verify Analytics View Dependencies
-- Now that category_id exists, the analytics_schema.sql will work.
