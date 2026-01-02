-- =====================================================
-- FUTORAPAY — ANALYTICS & SCALABILITY FEATURES
-- =====================================================

-- 1. Analytics Views: Monthly Summary
-- Aggregates income, expense, and savings per month directly in the database.
-- Usage: SELECT * FROM view_analytics_monthly_summary WHERE user_id = auth.uid();
CREATE OR REPLACE VIEW view_analytics_monthly_summary AS
SELECT 
  user_id,
  -- workspace_id, -- Removed as it might not exist in current schema yet
  DATE_TRUNC('month', date)::DATE as month_start,
  SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
  SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense,
  SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as net_savings,
  COUNT(*) as transaction_count
FROM transactions
-- WHERE is_deleted = FALSE AND status = 'completed' -- Removed columns that might not exist
GROUP BY user_id, DATE_TRUNC('month', date); -- workspace_id removed


-- 2. Analytics Views: Category Spending Breakdown
-- Pre-calculates spending by category for the current month/year
CREATE OR REPLACE VIEW view_analytics_category_summary AS
SELECT 
  user_id,
  -- workspace_id, -- Removed
  category as category_name, -- Changed from join to direct column usage matching frontend types
  -- c.color as category_color, -- Removed join
  DATE_TRUNC('month', date)::DATE as month_start,
  SUM(amount) as total_amount,
  COUNT(id) as transaction_count
FROM transactions
WHERE type = 'expense' -- AND is_deleted = FALSE AND status = 'completed'
GROUP BY user_id, category, DATE_TRUNC('month', date);


-- 3. Function: Get Dashboard Stats (Optimized)
-- Replaces useFinanceStats client-side calculation.
-- Returns single JSON object with all stats for fast loading.
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
    -- AND is_deleted = FALSE;

  -- Get previous month totals
  SELECT 
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)
  INTO v_prev_income, v_prev_expense
  FROM transactions
  WHERE user_id = v_user_id 
    AND DATE_TRUNC('month', date) = (p_month - INTERVAL '1 month');
    -- AND is_deleted = FALSE;

  -- Get Total Balance (All time net)
  -- Simplified to sum all transactions for now as accounts table might not have unified balance
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
