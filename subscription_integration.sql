-- =====================================================
-- SUBSCRIPTION-TRANSACTION INTEGRATION
-- Auto-create transactions when subscriptions are paid
-- =====================================================

-- Function to create transaction from subscription payment
CREATE OR REPLACE FUNCTION create_subscription_transaction(p_subscription_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscription subscriptions%ROWTYPE;
  v_transaction_id UUID;
  v_next_date DATE;
BEGIN
  -- Get subscription details
  SELECT * INTO v_subscription
  FROM subscriptions
  WHERE id = p_subscription_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Subscription not found';
  END IF;

  -- Create transaction
  INSERT INTO transactions (
    user_id,
    name,
    amount,
    type,
    category,
    date,
    payment_method,
    notes
  ) VALUES (
    v_subscription.user_id,
    v_subscription.name || ' (Subscription)',
    v_subscription.amount,
    'expense',
    v_subscription.category,
    v_subscription.next_billing_date,
    v_subscription.payment_method,
    'Auto-generated from subscription: ' || v_subscription.name
  )
  RETURNING id INTO v_transaction_id;

  -- Calculate next billing date
  v_next_date := CASE v_subscription.billing_cycle
    WHEN 'daily' THEN v_subscription.next_billing_date + INTERVAL '1 day'
    WHEN 'weekly' THEN v_subscription.next_billing_date + INTERVAL '7 days'
    WHEN 'monthly' THEN v_subscription.next_billing_date + INTERVAL '1 month'
    WHEN 'yearly' THEN v_subscription.next_billing_date + INTERVAL '1 year'
  END;

  -- Update subscription next billing date
  UPDATE subscriptions
  SET next_billing_date = v_next_date,
      updated_at = NOW()
  WHERE id = p_subscription_id;

  RETURN v_transaction_id;
END;
$$;

-- Function to process all due subscriptions
CREATE OR REPLACE FUNCTION process_due_subscriptions()
RETURNS TABLE (
  subscription_id UUID,
  subscription_name TEXT,
  transaction_id UUID,
  amount DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH due_subs AS (
    SELECT id, name, amount
    FROM subscriptions
    WHERE is_active = TRUE
      AND next_billing_date <= CURRENT_DATE
      AND auto_renew = TRUE
  )
  SELECT 
    ds.id,
    ds.name,
    create_subscription_transaction(ds.id) as txn_id,
    ds.amount
  FROM due_subs ds;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION create_subscription_transaction(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION process_due_subscriptions() TO authenticated;

-- =====================================================
-- ENHANCED INSIGHTS WITH SUBSCRIPTION DATA
-- =====================================================

-- View: Subscription spending analysis
CREATE OR REPLACE VIEW view_subscription_insights AS
SELECT 
  s.user_id,
  s.category,
  COUNT(*) as subscription_count,
  SUM(s.amount) as total_monthly_cost,
  AVG(s.amount) as avg_subscription_cost,
  MIN(s.next_billing_date) as next_payment_date
FROM subscriptions s
WHERE s.is_active = TRUE
GROUP BY s.user_id, s.category;

GRANT SELECT ON view_subscription_insights TO authenticated;

-- =====================================================
-- DASHBOARD INTEGRATION
-- Get combined stats including subscriptions
-- =====================================================

DROP FUNCTION IF EXISTS get_dashboard_stats_with_subscriptions(DATE);

CREATE OR REPLACE FUNCTION get_dashboard_stats_with_subscriptions(p_month DATE DEFAULT DATE_TRUNC('month', CURRENT_DATE))
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_result JSONB;
  v_subscription_monthly NUMERIC;
  v_upcoming_bills JSONB;
BEGIN
  -- Get subscription totals
  SELECT COALESCE(SUM(amount), 0)
  INTO v_subscription_monthly
  FROM subscriptions
  WHERE user_id = v_user_id 
    AND is_active = TRUE
    AND billing_cycle = 'monthly';

  -- Get upcoming bills (next 7 days)
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'name', name,
    'amount', amount,
    'due_date', next_billing_date,
    'days_until', (next_billing_date - CURRENT_DATE)
  )), '[]'::jsonb)
  INTO v_upcoming_bills
  FROM subscriptions
  WHERE user_id = v_user_id
    AND is_active = TRUE
    AND next_billing_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + 7);

  -- Get transaction stats and merge with subscription data
  WITH txn_stats AS (
    SELECT 
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense
    FROM transactions
    WHERE user_id = v_user_id 
      AND DATE_TRUNC('month', date) = p_month
  )
  SELECT jsonb_build_object(
    'monthlyIncome', txn_stats.income,
    'monthlyExpenses', txn_stats.expense,
    'savings', txn_stats.income - txn_stats.expense,
    'subscriptionMonthly', v_subscription_monthly,
    'upcomingBills', v_upcoming_bills,
    'totalCommitments', txn_stats.expense + v_subscription_monthly
  )
  INTO v_result
  FROM txn_stats;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION get_dashboard_stats_with_subscriptions(DATE) TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Subscription integration complete!';
  RAISE NOTICE 'Functions:';
  RAISE NOTICE '  - create_subscription_transaction(UUID)';
  RAISE NOTICE '  - process_due_subscriptions()';
  RAISE NOTICE '  - get_dashboard_stats_with_subscriptions(DATE)';
  RAISE NOTICE 'Views:';
  RAISE NOTICE '  - view_subscription_insights';
END $$;
