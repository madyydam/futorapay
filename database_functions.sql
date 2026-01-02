-- =====================================================
-- FUTORAPAY — FINANCIAL CALCULATION ENGINE
-- Server-side, deterministic, audit-safe calculations
-- =====================================================

-- =====================================================
-- CORE FINANCIAL CALCULATIONS
-- =====================================================

-- 1. GET NET WORTH (Assets - Liabilities)
CREATE OR REPLACE FUNCTION get_net_worth(p_user_id UUID, p_workspace_id UUID DEFAULT NULL)
RETURNS TABLE(
  total_assets DECIMAL(15,2),
  total_liabilities DECIMAL(15,2),
  net_worth DECIMAL(15,2),
  currency TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(CASE WHEN a.classification = 'asset' THEN a.current_balance ELSE 0 END), 0)::DECIMAL(15,2) as total_assets,
    COALESCE(SUM(CASE WHEN a.classification = 'liability' THEN a.current_balance ELSE 0 END), 0)::DECIMAL(15,2) as total_liabilities,
    (COALESCE(SUM(CASE WHEN a.classification = 'asset' THEN a.current_balance ELSE 0 END), 0) - 
     COALESCE(SUM(CASE WHEN a.classification = 'liability' THEN a.current_balance ELSE 0 END), 0))::DECIMAL(15,2) as net_worth,
    COALESCE(MAX(a.currency), 'INR') as currency
  FROM accounts a
  WHERE a.user_id = p_user_id 
    AND a.is_active = TRUE 
    AND a.is_included_in_networth = TRUE
    AND (p_workspace_id IS NULL OR a.workspace_id = p_workspace_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2. GET TOTAL BALANCE (All accounts sum)
CREATE OR REPLACE FUNCTION get_total_balance(p_user_id UUID, p_workspace_id UUID DEFAULT NULL)
RETURNS DECIMAL(15,2) AS $$
DECLARE
  v_balance DECIMAL(15,2);
BEGIN
  SELECT COALESCE(SUM(
    CASE 
      WHEN classification = 'asset' THEN current_balance 
      ELSE -current_balance 
    END
  ), 0)
  INTO v_balance
  FROM accounts
  WHERE user_id = p_user_id 
    AND is_active = TRUE
    AND (p_workspace_id IS NULL OR workspace_id = p_workspace_id);
  
  RETURN v_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 3. GET MONTHLY INCOME
CREATE OR REPLACE FUNCTION get_monthly_income(
  p_user_id UUID, 
  p_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
  p_month INTEGER DEFAULT EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER,
  p_workspace_id UUID DEFAULT NULL
)
RETURNS DECIMAL(15,2) AS $$
DECLARE
  v_income DECIMAL(15,2);
BEGIN
  SELECT COALESCE(SUM(amount), 0)
  INTO v_income
  FROM transactions
  WHERE user_id = p_user_id 
    AND type = 'income'
    AND EXTRACT(YEAR FROM transaction_date) = p_year
    AND EXTRACT(MONTH FROM transaction_date) = p_month
    AND is_deleted = FALSE
    AND status = 'completed'
    AND (p_workspace_id IS NULL OR workspace_id = p_workspace_id);
  
  RETURN v_income;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 4. GET MONTHLY EXPENSES
CREATE OR REPLACE FUNCTION get_monthly_expenses(
  p_user_id UUID, 
  p_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
  p_month INTEGER DEFAULT EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER,
  p_workspace_id UUID DEFAULT NULL
)
RETURNS DECIMAL(15,2) AS $$
DECLARE
  v_expenses DECIMAL(15,2);
BEGIN
  SELECT COALESCE(SUM(amount), 0)
  INTO v_expenses
  FROM transactions
  WHERE user_id = p_user_id 
    AND type = 'expense'
    AND EXTRACT(YEAR FROM transaction_date) = p_year
    AND EXTRACT(MONTH FROM transaction_date) = p_month
    AND is_deleted = FALSE
    AND status = 'completed'
    AND (p_workspace_id IS NULL OR workspace_id = p_workspace_id);
  
  RETURN v_expenses;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 5. GET CATEGORY-WISE SPENDING
CREATE OR REPLACE FUNCTION get_category_spending(
  p_user_id UUID,
  p_start_date DATE DEFAULT DATE_TRUNC('month', CURRENT_DATE)::DATE,
  p_end_date DATE DEFAULT CURRENT_DATE,
  p_workspace_id UUID DEFAULT NULL
)
RETURNS TABLE(
  category_id UUID,
  category_name TEXT,
  category_icon TEXT,
  total_amount DECIMAL(15,2),
  transaction_count BIGINT,
  percentage DECIMAL(5,2)
) AS $$
DECLARE
  v_total DECIMAL(15,2);
BEGIN
  -- Get total for percentage calculation
  SELECT COALESCE(SUM(t.amount), 0)
  INTO v_total
  FROM transactions t
  WHERE t.user_id = p_user_id 
    AND t.type = 'expense'
    AND t.transaction_date BETWEEN p_start_date AND p_end_date
    AND t.is_deleted = FALSE
    AND t.status = 'completed'
    AND (p_workspace_id IS NULL OR t.workspace_id = p_workspace_id);

  RETURN QUERY
  SELECT 
    c.id as category_id,
    c.name as category_name,
    c.icon as category_icon,
    COALESCE(SUM(t.amount), 0)::DECIMAL(15,2) as total_amount,
    COUNT(t.id) as transaction_count,
    CASE 
      WHEN v_total > 0 THEN (COALESCE(SUM(t.amount), 0) / v_total * 100)::DECIMAL(5,2)
      ELSE 0::DECIMAL(5,2)
    END as percentage
  FROM categories c
  LEFT JOIN transactions t ON t.category_id = c.id 
    AND t.user_id = p_user_id
    AND t.type = 'expense'
    AND t.transaction_date BETWEEN p_start_date AND p_end_date
    AND t.is_deleted = FALSE
    AND t.status = 'completed'
  WHERE (p_workspace_id IS NULL OR c.workspace_id = p_workspace_id)
  GROUP BY c.id, c.name, c.icon
  HAVING COALESCE(SUM(t.amount), 0) > 0
  ORDER BY total_amount DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 6. GET MONTHLY TREND (Last N months)
CREATE OR REPLACE FUNCTION get_monthly_trend(
  p_user_id UUID,
  p_months INTEGER DEFAULT 6,
  p_workspace_id UUID DEFAULT NULL
)
RETURNS TABLE(
  month_year TEXT,
  month_date DATE,
  total_income DECIMAL(15,2),
  total_expenses DECIMAL(15,2),
  net_savings DECIMAL(15,2),
  savings_rate DECIMAL(5,2)
) AS $$
BEGIN
  RETURN QUERY
  WITH months AS (
    SELECT 
      DATE_TRUNC('month', CURRENT_DATE - (n || ' months')::INTERVAL)::DATE as month_start
    FROM generate_series(0, p_months - 1) n
  )
  SELECT 
    TO_CHAR(m.month_start, 'Mon YYYY') as month_year,
    m.month_start as month_date,
    COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0)::DECIMAL(15,2) as total_income,
    COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0)::DECIMAL(15,2) as total_expenses,
    (COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) - 
     COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0))::DECIMAL(15,2) as net_savings,
    CASE 
      WHEN COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) > 0 
      THEN ((COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) - 
             COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0)) / 
            COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 1) * 100)::DECIMAL(5,2)
      ELSE 0::DECIMAL(5,2)
    END as savings_rate
  FROM months m
  LEFT JOIN transactions t ON DATE_TRUNC('month', t.transaction_date) = m.month_start
    AND t.user_id = p_user_id
    AND t.is_deleted = FALSE
    AND t.status = 'completed'
    AND (p_workspace_id IS NULL OR t.workspace_id = p_workspace_id)
  GROUP BY m.month_start
  ORDER BY m.month_start DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 7. BURN RATE CALCULATION (Business/Startup)
CREATE OR REPLACE FUNCTION get_burn_rate(
  p_user_id UUID,
  p_months INTEGER DEFAULT 3,
  p_workspace_id UUID DEFAULT NULL
)
RETURNS TABLE(
  monthly_burn_rate DECIMAL(15,2),
  average_income DECIMAL(15,2),
  net_burn DECIMAL(15,2),
  runway_months INTEGER,
  current_balance DECIMAL(15,2)
) AS $$
DECLARE
  v_balance DECIMAL(15,2);
  v_avg_expense DECIMAL(15,2);
  v_avg_income DECIMAL(15,2);
  v_net_burn DECIMAL(15,2);
  v_runway INTEGER;
BEGIN
  -- Get current balance
  SELECT get_total_balance(p_user_id, p_workspace_id) INTO v_balance;
  
  -- Calculate average monthly expenses over last N months
  SELECT COALESCE(SUM(amount) / NULLIF(p_months, 0), 0)
  INTO v_avg_expense
  FROM transactions
  WHERE user_id = p_user_id 
    AND type = 'expense'
    AND transaction_date >= DATE_TRUNC('month', CURRENT_DATE - (p_months || ' months')::INTERVAL)
    AND is_deleted = FALSE
    AND status = 'completed'
    AND (p_workspace_id IS NULL OR workspace_id = p_workspace_id);

  -- Calculate average monthly income
  SELECT COALESCE(SUM(amount) / NULLIF(p_months, 0), 0)
  INTO v_avg_income
  FROM transactions
  WHERE user_id = p_user_id 
    AND type = 'income'
    AND transaction_date >= DATE_TRUNC('month', CURRENT_DATE - (p_months || ' months')::INTERVAL)
    AND is_deleted = FALSE
    AND status = 'completed'
    AND (p_workspace_id IS NULL OR workspace_id = p_workspace_id);

  -- Net burn (expenses - income)
  v_net_burn := v_avg_expense - v_avg_income;

  -- Runway calculation
  IF v_net_burn > 0 AND v_balance > 0 THEN
    v_runway := FLOOR(v_balance / v_net_burn);
  ELSIF v_net_burn <= 0 THEN
    v_runway := 999; -- Infinite runway (positive cash flow)
  ELSE
    v_runway := 0;
  END IF;

  RETURN QUERY
  SELECT 
    v_avg_expense::DECIMAL(15,2),
    v_avg_income::DECIMAL(15,2),
    v_net_burn::DECIMAL(15,2),
    v_runway,
    v_balance::DECIMAL(15,2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 8. GOAL PROGRESS CALCULATION
CREATE OR REPLACE FUNCTION get_goal_progress(p_user_id UUID, p_goal_id UUID DEFAULT NULL)
RETURNS TABLE(
  goal_id UUID,
  goal_name TEXT,
  target_amount DECIMAL(15,2),
  current_amount DECIMAL(15,2),
  remaining_amount DECIMAL(15,2),
  progress_percentage DECIMAL(5,2),
  days_remaining INTEGER,
  required_monthly_amount DECIMAL(15,2),
  is_on_track BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    g.id as goal_id,
    g.name as goal_name,
    g.target_amount,
    g.current_amount,
    (g.target_amount - g.current_amount)::DECIMAL(15,2) as remaining_amount,
    CASE 
      WHEN g.target_amount > 0 THEN (g.current_amount / g.target_amount * 100)::DECIMAL(5,2)
      ELSE 0::DECIMAL(5,2)
    END as progress_percentage,
    CASE 
      WHEN g.deadline IS NOT NULL THEN (g.deadline - CURRENT_DATE)::INTEGER
      ELSE NULL
    END as days_remaining,
    CASE 
      WHEN g.deadline IS NOT NULL AND g.deadline > CURRENT_DATE THEN
        ((g.target_amount - g.current_amount) / 
         NULLIF(CEIL((g.deadline - CURRENT_DATE) / 30.0), 0))::DECIMAL(15,2)
      ELSE NULL
    END as required_monthly_amount,
    CASE 
      WHEN g.deadline IS NULL THEN TRUE
      WHEN g.current_amount >= g.target_amount THEN TRUE
      WHEN g.deadline <= CURRENT_DATE THEN FALSE
      ELSE (g.current_amount / g.target_amount) >= 
           (1.0 - (g.deadline - CURRENT_DATE)::FLOAT / 
            NULLIF((g.deadline - g.start_date)::FLOAT, 0))
    END as is_on_track
  FROM goals g
  WHERE g.user_id = p_user_id 
    AND g.status = 'active'
    AND (p_goal_id IS NULL OR g.id = p_goal_id)
  ORDER BY g.deadline NULLS LAST, g.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 9. FINANCIAL SUMMARY (Dashboard KPIs)
CREATE OR REPLACE FUNCTION get_financial_summary(p_user_id UUID, p_workspace_id UUID DEFAULT NULL)
RETURNS TABLE(
  total_balance DECIMAL(15,2),
  net_worth DECIMAL(15,2),
  monthly_income DECIMAL(15,2),
  monthly_expenses DECIMAL(15,2),
  monthly_savings DECIMAL(15,2),
  savings_rate DECIMAL(5,2),
  last_month_income DECIMAL(15,2),
  last_month_expenses DECIMAL(15,2),
  income_change_percent DECIMAL(5,2),
  expense_change_percent DECIMAL(5,2),
  active_goals_count INTEGER,
  total_assets DECIMAL(15,2),
  total_liabilities DECIMAL(15,2)
) AS $$
DECLARE
  v_current_month_income DECIMAL(15,2);
  v_current_month_expenses DECIMAL(15,2);
  v_last_month_income DECIMAL(15,2);
  v_last_month_expenses DECIMAL(15,2);
  v_balance DECIMAL(15,2);
  v_assets DECIMAL(15,2);
  v_liabilities DECIMAL(15,2);
  v_net_worth DECIMAL(15,2);
  v_goals_count INTEGER;
BEGIN
  -- Current month
  SELECT get_monthly_income(p_user_id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER, p_workspace_id)
  INTO v_current_month_income;
  
  SELECT get_monthly_expenses(p_user_id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER, p_workspace_id)
  INTO v_current_month_expenses;
  
  -- Last month
  SELECT get_monthly_income(p_user_id, EXTRACT(YEAR FROM CURRENT_DATE - INTERVAL '1 month')::INTEGER, EXTRACT(MONTH FROM CURRENT_DATE - INTERVAL '1 month')::INTEGER, p_workspace_id)
  INTO v_last_month_income;
  
  SELECT get_monthly_expenses(p_user_id, EXTRACT(YEAR FROM CURRENT_DATE - INTERVAL '1 month')::INTEGER, EXTRACT(MONTH FROM CURRENT_DATE - INTERVAL '1 month')::INTEGER, p_workspace_id)
  INTO v_last_month_expenses;
  
  -- Balance and net worth
  SELECT get_total_balance(p_user_id, p_workspace_id) INTO v_balance;
  
  SELECT nw.total_assets, nw.total_liabilities, nw.net_worth
  INTO v_assets, v_liabilities, v_net_worth
  FROM get_net_worth(p_user_id, p_workspace_id) nw;
  
  -- Goals count
  SELECT COUNT(*) INTO v_goals_count
  FROM goals
  WHERE user_id = p_user_id AND status = 'active'
    AND (p_workspace_id IS NULL OR workspace_id = p_workspace_id);
  
  RETURN QUERY
  SELECT 
    v_balance,
    v_net_worth,
    v_current_month_income,
    v_current_month_expenses,
    (v_current_month_income - v_current_month_expenses)::DECIMAL(15,2),
    CASE 
      WHEN v_current_month_income > 0 
      THEN ((v_current_month_income - v_current_month_expenses) / v_current_month_income * 100)::DECIMAL(5,2)
      ELSE 0::DECIMAL(5,2)
    END,
    v_last_month_income,
    v_last_month_expenses,
    CASE 
      WHEN v_last_month_income > 0 
      THEN ((v_current_month_income - v_last_month_income) / v_last_month_income * 100)::DECIMAL(5,2)
      ELSE 0::DECIMAL(5,2)
    END,
    CASE 
      WHEN v_last_month_expenses > 0 
      THEN ((v_current_month_expenses - v_last_month_expenses) / v_last_month_expenses * 100)::DECIMAL(5,2)
      ELSE 0::DECIMAL(5,2)
    END,
    v_goals_count,
    v_assets,
    v_liabilities;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 10. GENERATE REPORT SNAPSHOT (Immutable financial state)
CREATE OR REPLACE FUNCTION generate_report_snapshot(
  p_report_id UUID,
  p_user_id UUID,
  p_workspace_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS UUID AS $$
DECLARE
  v_snapshot_id UUID;
  v_snapshot_data JSONB;
  v_income DECIMAL(15,2);
  v_expenses DECIMAL(15,2);
  v_assets DECIMAL(15,2);
  v_liabilities DECIMAL(15,2);
  v_net_worth DECIMAL(15,2);
  v_data_hash TEXT;
BEGIN
  -- Gather all transaction data for the period
  SELECT jsonb_agg(row_to_json(t))
  INTO v_snapshot_data
  FROM (
    SELECT id, description, amount, type, category_id, transaction_date
    FROM transactions
    WHERE user_id = p_user_id
      AND transaction_date BETWEEN p_start_date AND p_end_date
      AND is_deleted = FALSE
      AND status = 'completed'
      AND (p_workspace_id IS NULL OR workspace_id = p_workspace_id)
    ORDER BY transaction_date
  ) t;

  -- Calculate totals
  SELECT COALESCE(SUM(amount), 0) INTO v_income
  FROM transactions
  WHERE user_id = p_user_id AND type = 'income'
    AND transaction_date BETWEEN p_start_date AND p_end_date
    AND is_deleted = FALSE AND status = 'completed'
    AND (p_workspace_id IS NULL OR workspace_id = p_workspace_id);

  SELECT COALESCE(SUM(amount), 0) INTO v_expenses
  FROM transactions
  WHERE user_id = p_user_id AND type = 'expense'
    AND transaction_date BETWEEN p_start_date AND p_end_date
    AND is_deleted = FALSE AND status = 'completed'
    AND (p_workspace_id IS NULL OR workspace_id = p_workspace_id);

  -- Get net worth at time of snapshot
  SELECT nw.total_assets, nw.total_liabilities, nw.net_worth
  INTO v_assets, v_liabilities, v_net_worth
  FROM get_net_worth(p_user_id, p_workspace_id) nw;

  -- Create hash for integrity verification
  v_data_hash := md5(COALESCE(v_snapshot_data::TEXT, ''));

  -- Insert snapshot
  INSERT INTO report_snapshots (
    report_id, workspace_id, snapshot_data,
    total_income, total_expenses, net_amount,
    total_assets, total_liabilities, net_worth,
    data_hash
  ) VALUES (
    p_report_id, p_workspace_id, COALESCE(v_snapshot_data, '[]'::jsonb),
    v_income, v_expenses, (v_income - v_expenses),
    v_assets, v_liabilities, v_net_worth,
    v_data_hash
  )
  RETURNING id INTO v_snapshot_id;

  -- Update report with snapshot reference
  UPDATE reports SET snapshot_id = v_snapshot_id WHERE id = p_report_id;

  RETURN v_snapshot_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. AUTO-CREATE WORKSPACE FOR NEW USERS
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_workspace_id UUID;
BEGIN
  -- Create default workspace for new user
  INSERT INTO workspaces (owner_id, name, type, currency)
  VALUES (NEW.id, 'Personal', 'personal', 'INR')
  RETURNING id INTO v_workspace_id;
  
  -- Update profile to mark onboarding needed
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'))
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- GRANT ACCESS TO AUTHENTICATED USERS
-- =====================================================

GRANT EXECUTE ON FUNCTION get_net_worth TO authenticated;
GRANT EXECUTE ON FUNCTION get_total_balance TO authenticated;
GRANT EXECUTE ON FUNCTION get_monthly_income TO authenticated;
GRANT EXECUTE ON FUNCTION get_monthly_expenses TO authenticated;
GRANT EXECUTE ON FUNCTION get_category_spending TO authenticated;
GRANT EXECUTE ON FUNCTION get_monthly_trend TO authenticated;
GRANT EXECUTE ON FUNCTION get_burn_rate TO authenticated;
GRANT EXECUTE ON FUNCTION get_goal_progress TO authenticated;
GRANT EXECUTE ON FUNCTION get_financial_summary TO authenticated;
GRANT EXECUTE ON FUNCTION generate_report_snapshot TO authenticated;

-- =====================================================
-- END OF FINANCIAL CALCULATION ENGINE
-- =====================================================
