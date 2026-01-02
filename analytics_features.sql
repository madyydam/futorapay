-- =====================================================
-- FUTORAPAY — ANALYTICS & SCALABILITY FEATURES
-- Run this in Supabase SQL Editor AFTER fixing column names
-- =====================================================

-- Create the update timestamp function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing views if they exist
DROP VIEW IF EXISTS view_analytics_monthly_summary;
DROP VIEW IF EXISTS view_analytics_category_summary;

-- 1. Analytics Views: Monthly Summary
-- Aggregates income, expense, and savings per month directly in the database.
CREATE OR REPLACE VIEW view_analytics_monthly_summary AS
SELECT 
  user_id,
  DATE_TRUNC('month', date)::DATE as month_start,
  SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
  SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense,
  SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as net_savings,
  COUNT(*) as transaction_count
FROM transactions
GROUP BY user_id, DATE_TRUNC('month', date);


-- 2. Analytics Views: Category Spending Breakdown
CREATE OR REPLACE VIEW view_analytics_category_summary AS
SELECT 
  user_id,
  category as category_name,
  DATE_TRUNC('month', date)::DATE as month_start,
  SUM(amount) as total_amount,
  COUNT(id) as transaction_count
FROM transactions
WHERE type = 'expense'
GROUP BY user_id, category, DATE_TRUNC('month', date);


-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_dashboard_stats(DATE);

-- 3. Function: Get Dashboard Stats (Optimized)
CREATE OR REPLACE FUNCTION get_dashboard_stats(p_month DATE DEFAULT DATE_TRUNC('month', CURRENT_DATE))
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_current_income NUMERIC;
  v_current_expense NUMERIC;
  v_prev_income NUMERIC;
  v_prev_expense NUMERIC;
  v_total_balance NUMERIC;
  v_result JSONB;
BEGIN
  -- Get current month totals
  SELECT 
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)
  INTO v_current_income, v_current_expense
  FROM transactions
  WHERE user_id = v_user_id 
    AND DATE_TRUNC('month', date) = p_month;

  -- Get previous month totals
  SELECT 
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)
  INTO v_prev_income, v_prev_expense
  FROM transactions
  WHERE user_id = v_user_id 
    AND DATE_TRUNC('month', date) = (p_month - INTERVAL '1 month');

  -- Get Total Balance (All time net)
  SELECT 
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0)
  INTO v_total_balance
  FROM transactions
  WHERE user_id = v_user_id;

  -- Construct Result
  v_result := jsonb_build_object(
    'totalBalance', v_total_balance,
    'monthlyIncome', v_current_income,
    'monthlyExpenses', v_current_expense,
    'savings', v_current_income - v_current_expense,
    'incomeChange', CASE WHEN v_prev_income = 0 THEN 0 ELSE ((v_current_income - v_prev_income) / v_prev_income) * 100 END,
    'expensesChange', CASE WHEN v_prev_expense = 0 THEN 0 ELSE ((v_current_expense - v_prev_expense) / v_prev_expense) * 100 END,
    'savingsChange', 0 
  );

  RETURN v_result;
END;
$$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Analytics views and functions created successfully!';
  RAISE NOTICE 'Views: view_analytics_monthly_summary, view_analytics_category_summary';
  RAISE NOTICE 'Function: get_dashboard_stats()';
END $$;
