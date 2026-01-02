-- FINAL SCHEMA STANDARDIZATION (V4)
-- Fixes "transaction_date does not exist" and ensures database matches Enterprise spec.

-- 1. Standardize Transactions Table
DO $$
BEGIN
    -- Rename 'date' to 'transaction_date' if it exists (Legacy Fix)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'date') THEN
        ALTER TABLE transactions RENAME COLUMN "date" TO transaction_date;
    END IF;

    -- If neither exists, create transaction_date
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'transaction_date') THEN
        ALTER TABLE transactions ADD COLUMN transaction_date DATE DEFAULT CURRENT_DATE;
    END IF;
END $$;

-- 2. Ensure Category ID exists (Recap from V3)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'category_id') THEN
        ALTER TABLE transactions ADD COLUMN category_id UUID REFERENCES categories(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 3. Populate Categories from text (Recap from V3)
INSERT INTO categories (workspace_id, name, type, icon)
SELECT DISTINCT 
    t.workspace_id,
    t.category, 
    t.type,
    CASE WHEN t.type = 'income' THEN '💰' ELSE '📁' END
FROM transactions t
WHERE t.category IS NOT NULL 
  AND t.workspace_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- 4. Backfill Category IDs (Recap from V3)
UPDATE transactions t
SET category_id = c.id
FROM categories c
WHERE t.category = c.name 
  AND t.type = c.type 
  AND t.workspace_id = c.workspace_id
  AND t.category_id IS NULL;

-- 5. Standardize Accounts Table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'classification') THEN
        ALTER TABLE accounts ADD COLUMN classification TEXT DEFAULT 'asset';
    END IF;
END $$;
