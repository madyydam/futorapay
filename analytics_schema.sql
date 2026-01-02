-- Enterprise Analytics Views for Tableau/PowerBI
-- Run this in Supabase SQL Editor to create the analytics layer

-- 1. Master Transactions View
-- Flattens all transactions with clean formatting and joins
CREATE OR REPLACE VIEW view_analytics_transactions AS
SELECT
    t.id AS transaction_id,
    t.user_id,
    t.workspace_id,
    t.transaction_date,
    TO_CHAR(t.transaction_date, 'YYYY-MM') AS month_str,
    EXTRACT(YEAR FROM t.transaction_date) AS year_num,
    EXTRACT(MONTH FROM t.transaction_date) AS month_num,
    t.type,
    c.name AS category,
    a.name AS account_name,
    a.type AS account_type,
    t.amount,
    a.currency,
    t.description,
    t.created_at
FROM transactions t
LEFT JOIN categories c ON t.category_id = c.id
LEFT JOIN accounts a ON t.account_id = a.id
WHERE t.is_deleted = FALSE;

-- 2. Monthly Summary View (KPIs)
-- Aggregates metrics by month for fast dashboarding
CREATE OR REPLACE VIEW view_analytics_monthly_summary AS
SELECT
    user_id,
    workspace_id,
    TO_CHAR(transaction_date, 'YYYY-MM') AS month_str,
    MAX(currency) as currency,
    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS total_income,
    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expense,
    (SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) - SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END)) AS net_savings,
    -- Simple burn rate (expenses)
    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS burn_rate
FROM view_analytics_transactions
GROUP BY user_id, workspace_id, month_str
ORDER BY month_str DESC;

-- 3. Category Breakdown View
-- Optimization for Pie/Treemaps
CREATE OR REPLACE VIEW view_analytics_category_summary AS
SELECT
    user_id,
    workspace_id,
    month_str,
    category,
    type,
    SUM(amount) as total_amount,
    COUNT(*) as transaction_count
FROM view_analytics_transactions
GROUP BY user_id, workspace_id, month_str, category, type;

-- 4. Net Worth History View
-- Pulls from report_snapshots table which stores historical net worth
CREATE OR REPLACE VIEW view_analytics_net_worth_history AS
SELECT
    id AS snapshot_id,
    user_id,
    workspace_id,
    created_at AS date,
    TO_CHAR(created_at, 'YYYY-MM-DD') AS date_str,
    total_assets,
    total_liabilities,
    net_worth
FROM report_snapshots
ORDER BY created_at DESC;

-- 5. Helper function to get dataset for a specific report
-- This function mimics the extraction logic for the Edge Function
-- to ensure consistency.
-- Note: Edge functions usually query views directly.
