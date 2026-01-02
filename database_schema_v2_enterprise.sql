-- =====================================================
-- FUTORAPAY — ENTERPRISE DATABASE SCHEMA V2
-- "GitHub of Financial Data"
-- =====================================================
-- 
-- DESIGN PRINCIPLES:
-- 1. Audit-safe: Every change tracked
-- 2. Snapshot-first: Reports are immutable
-- 3. Multi-workspace: Enterprise-ready isolation
-- 4. Normalized: AI-ready data structure
-- 5. Compliance: Built for trust
--
-- Last Updated: 2026-01-02
-- =====================================================

-- =====================================================
-- CORE IDENTITY & WORKSPACE TABLES
-- =====================================================

-- Profiles (User Identity)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  -- Preferences
  default_currency TEXT DEFAULT 'INR',
  date_format TEXT DEFAULT 'DD/MM/YYYY',
  timezone TEXT DEFAULT 'Asia/Kolkata',
  dark_mode BOOLEAN DEFAULT TRUE,
  -- Onboarding
  onboarding_completed BOOLEAN DEFAULT FALSE,
  account_type TEXT CHECK (account_type IN ('individual', 'business')) DEFAULT 'individual',
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Workspaces (Multi-tenant isolation)
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('personal', 'business', 'startup')) DEFAULT 'personal',
  currency TEXT DEFAULT 'INR',
  fiscal_year_start INTEGER DEFAULT 1, -- Month number (1 = January)
  -- Settings
  settings JSONB DEFAULT '{}'::jsonb,
  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  -- Constraints
  CONSTRAINT workspace_name_owner_unique UNIQUE (owner_id, name)
);

-- Workspace Members (Future: Team collaboration)
CREATE TABLE IF NOT EXISTS workspace_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('owner', 'admin', 'editor', 'viewer')) DEFAULT 'viewer',
  permissions JSONB DEFAULT '{}'::jsonb,
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  joined_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT workspace_member_unique UNIQUE (workspace_id, user_id)
);

-- =====================================================
-- FINANCIAL MASTER DATA
-- =====================================================

-- Categories (Dynamic, workspace-specific)
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense', 'both')) NOT NULL,
  icon TEXT,
  color TEXT,
  parent_category_id UUID REFERENCES categories ON DELETE SET NULL,
  is_system BOOLEAN DEFAULT FALSE, -- System categories can't be deleted
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  CONSTRAINT category_name_workspace_unique UNIQUE (workspace_id, name, type)
);

-- Tags (Flexible labeling system)
CREATE TABLE IF NOT EXISTS tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  CONSTRAINT tag_name_workspace_unique UNIQUE (workspace_id, name)
);

-- =====================================================
-- ACCOUNTS & ASSETS
-- =====================================================

-- Accounts (All financial accounts)
CREATE TABLE IF NOT EXISTS accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  -- Account Details
  name TEXT NOT NULL,
  type TEXT CHECK (type IN (
    'cash',
    'bank_checking',
    'bank_savings',
    'credit_card',
    'investment',
    'loan',
    'mortgage',
    'real_estate',
    'crypto',
    'other_asset',
    'other_liability'
  )) NOT NULL,
  -- Balance
  current_balance DECIMAL(15,2) DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  -- Account Metadata
  account_number TEXT, -- Last 4 digits only
  institution_name TEXT,
  icon TEXT,
  color TEXT,
  -- Asset/Liability Classification
  classification TEXT CHECK (classification IN ('asset', 'liability')) NOT NULL,
  -- Interest & Fees
  interest_rate DECIMAL(5,2), -- Annual percentage
  credit_limit DECIMAL(15,2), -- For credit cards
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_included_in_networth BOOLEAN DEFAULT TRUE,
  -- Metadata
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Account Balance History (For trends)
CREATE TABLE IF NOT EXISTS account_balance_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID REFERENCES accounts ON DELETE CASCADE NOT NULL,
  balance DECIMAL(15,2) NOT NULL,
  snapshot_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  CONSTRAINT account_snapshot_date_unique UNIQUE (account_id, snapshot_date)
);

-- =====================================================
-- TRANSACTIONS (The Core)
-- =====================================================

-- Transactions (Income & Expenses)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES accounts ON DELETE SET NULL,
  -- Transaction Details
  description TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense', 'transfer')) NOT NULL,
  category_id UUID REFERENCES categories ON DELETE SET NULL,
  -- Transaction Metadata
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT,
  reference_number TEXT,
  -- Transfer Details (if type = 'transfer')
  from_account_id UUID REFERENCES accounts ON DELETE SET NULL,
  to_account_id UUID REFERENCES accounts ON DELETE SET NULL,
  -- Attachments
  receipt_url TEXT,
  -- Recurrence
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_rule TEXT, -- RRULE format
  parent_transaction_id UUID REFERENCES transactions ON DELETE SET NULL,
  -- Status
  status TEXT CHECK (status IN ('pending', 'completed', 'cancelled')) DEFAULT 'completed',
  -- Notes
  notes TEXT,
  -- Audit Trail
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  created_by UUID REFERENCES auth.users,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_by UUID REFERENCES auth.users,
  -- Version Control
  version INTEGER DEFAULT 1,
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Transaction Tags (Many-to-Many)
CREATE TABLE IF NOT EXISTS transaction_tags (
  transaction_id UUID REFERENCES transactions ON DELETE CASCADE,
  tag_id UUID REFERENCES tags ON DELETE CASCADE,
  PRIMARY KEY (transaction_id, tag_id)
);

-- Transaction Audit Log (Immutable history)
CREATE TABLE IF NOT EXISTS transaction_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID REFERENCES transactions ON DELETE CASCADE NOT NULL,
  action TEXT CHECK (action IN ('created', 'updated', 'deleted')) NOT NULL,
  changed_by UUID REFERENCES auth.users NOT NULL,
  changes JSONB, -- Store the diff
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- =====================================================
-- GOALS & PLANNING
-- =====================================================

-- Goals (Savings & Financial Goals)
CREATE TABLE IF NOT EXISTS goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  -- Goal Details
  name TEXT NOT NULL,
  description TEXT,
  target_amount DECIMAL(15,2) NOT NULL,
  current_amount DECIMAL(15,2) DEFAULT 0,
  -- Timeline
  start_date DATE DEFAULT CURRENT_DATE,
  deadline DATE,
  -- Visual
  icon TEXT,
  color TEXT,
  category TEXT,
  -- Auto-save Rules
  auto_save_enabled BOOLEAN DEFAULT FALSE,
  auto_save_amount DECIMAL(15,2),
  auto_save_frequency TEXT CHECK (auto_save_frequency IN ('daily', 'weekly', 'monthly')),
  -- Status
  status TEXT CHECK (status IN ('active', 'completed', 'archived')) DEFAULT 'active',
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Goal Milestones
CREATE TABLE IF NOT EXISTS goal_milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID REFERENCES goals ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  target_amount DECIMAL(15,2) NOT NULL,
  target_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  display_order INTEGER DEFAULT 0
);

-- =====================================================
-- REPORTS & SNAPSHOTS (The Trust Layer)
-- =====================================================

-- Reports (Generated reports metadata)
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  -- Report Details
  name TEXT NOT NULL,
  type TEXT CHECK (type IN (
    'expense_summary',
    'income_summary',
    'net_worth',
    'category_analysis',
    'profit_loss',
    'cash_flow',
    'burn_rate',
    'tax_summary',
    'custom'
  )) NOT NULL,
  -- Time Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  -- Files
  pdf_url TEXT,
  excel_url TEXT,
  csv_url TEXT,
  -- Snapshot Reference
  snapshot_id UUID, -- Links to report_snapshots
  -- Status
  status TEXT CHECK (status IN ('generating', 'completed', 'failed')) DEFAULT 'completed',
  -- Metadata
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  expires_at TIMESTAMP WITH TIME ZONE, -- Auto-cleanup old reports
  download_count INTEGER DEFAULT 0,
  -- Settings used for generation
  filters JSONB DEFAULT '{}'::jsonb
);

-- Report Snapshots (Immutable financial data for audit trail)
CREATE TABLE IF NOT EXISTS report_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES reports ON DELETE CASCADE NOT NULL,
  workspace_id UUID REFERENCES workspaces ON DELETE CASCADE NOT NULL,
  -- Snapshot Data (Frozen at generation time)
  snapshot_data JSONB NOT NULL, -- Complete financial state
  -- Calculations
  total_income DECIMAL(15,2),
  total_expenses DECIMAL(15,2),
  net_amount DECIMAL(15,2),
  total_assets DECIMAL(15,2),
  total_liabilities DECIMAL(15,2),
  net_worth DECIMAL(15,2),
  -- Metadata
  snapshot_timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  data_hash TEXT, -- SHA-256 hash for integrity verification
  is_locked BOOLEAN DEFAULT TRUE, -- Locked snapshots can't be modified
  -- Version
  version INTEGER DEFAULT 1
);

-- =====================================================
-- INSIGHTS & ANALYTICS
-- =====================================================

-- Financial Insights (AI-generated insights)
CREATE TABLE IF NOT EXISTS insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  -- Insight Details
  type TEXT CHECK (type IN (
    'spending_anomaly',
    'budget_warning',
    'savings_opportunity',
    'bill_prediction',
    'cash_flow_warning',
    'goal_recommendation',
    'category_trend'
  )) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  -- Severity
  severity TEXT CHECK (severity IN ('info', 'warning', 'critical')) DEFAULT 'info',
  -- Data Reference
  related_category_id UUID REFERENCES categories,
  related_transaction_ids UUID[],
  amount_impact DECIMAL(15,2),
  -- Action
  action_taken BOOLEAN DEFAULT FALSE,
  dismissed BOOLEAN DEFAULT FALSE,
  -- Metadata
  insight_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- =====================================================
-- NOTIFICATIONS & ALERTS
-- =====================================================

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  workspace_id UUID REFERENCES workspaces ON DELETE CASCADE,
  -- Notification Details
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('info', 'success', 'warning', 'error', 'insight')) DEFAULT 'info',
  -- Action
  action_url TEXT,
  action_label TEXT,
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- SYSTEM TABLES
-- =====================================================

-- Audit Log (System-wide audit trail)
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  workspace_id UUID REFERENCES workspaces,
  -- Event Details
  event_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  action TEXT NOT NULL,
  -- Changes
  old_values JSONB,
  new_values JSONB,
  -- Metadata
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- System Settings
CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_by UUID REFERENCES auth.users
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Workspaces
CREATE INDEX idx_workspaces_owner ON workspaces(owner_id);
CREATE INDEX idx_workspaces_active ON workspaces(is_active) WHERE is_active = TRUE;

-- Accounts
CREATE INDEX idx_accounts_workspace ON accounts(workspace_id);
CREATE INDEX idx_accounts_user ON accounts(user_id);
CREATE INDEX idx_accounts_type ON accounts(type);
CREATE INDEX idx_accounts_active ON accounts(is_active) WHERE is_active = TRUE;

-- Transactions
CREATE INDEX idx_transactions_workspace ON transactions(workspace_id);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_account ON transactions(account_id);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date DESC);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_deleted ON transactions(is_deleted) WHERE is_deleted = FALSE;

-- Reports
CREATE INDEX idx_reports_workspace ON reports(workspace_id);
CREATE INDEX idx_reports_user ON reports(user_id);
CREATE INDEX idx_reports_type ON reports(type);
CREATE INDEX idx_reports_snapshot ON reports(snapshot_id);
CREATE INDEX idx_reports_generated ON reports(generated_at DESC);

-- Report Snapshots
CREATE INDEX idx_snapshots_report ON report_snapshots(report_id);
CREATE INDEX idx_snapshots_workspace ON report_snapshots(workspace_id);
CREATE INDEX idx_snapshots_timestamp ON report_snapshots(snapshot_timestamp DESC);

-- Goals
CREATE INDEX idx_goals_workspace ON goals(workspace_id);
CREATE INDEX idx_goals_user ON goals(user_id);
CREATE INDEX idx_goals_status ON goals(status);

-- Insights
CREATE INDEX idx_insights_workspace ON insights(workspace_id);
CREATE INDEX idx_insights_user ON insights(user_id);
CREATE INDEX idx_insights_type ON insights(type);
CREATE INDEX idx_insights_date ON insights(insight_date DESC);

-- Audit Log
CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_workspace ON audit_log(workspace_id);
CREATE INDEX idx_audit_timestamp ON audit_log(timestamp DESC);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_balance_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Workspaces
CREATE POLICY "Users can view own workspaces" ON workspaces
  FOR SELECT USING (
    owner_id = auth.uid() OR
    id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create workspaces" ON workspaces
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update workspaces" ON workspaces
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete workspaces" ON workspaces
  FOR DELETE USING (owner_id = auth.uid());

-- Workspace Members
CREATE POLICY "Users can view workspace members" ON workspace_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspaces 
      WHERE id = workspace_members.workspace_id 
      AND owner_id = auth.uid()
    ) OR user_id = auth.uid()
  );

-- Categories
CREATE POLICY "Users can manage workspace categories" ON categories
  FOR ALL USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
    )
  );

-- Tags
CREATE POLICY "Users can manage workspace tags" ON tags
  FOR ALL USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
    )
  );

-- Accounts
CREATE POLICY "Users can manage own accounts" ON accounts
  FOR ALL USING (user_id = auth.uid());

-- Account Balance Snapshots
CREATE POLICY "Users can view account snapshots" ON account_balance_snapshots
  FOR SELECT USING (
    account_id IN (SELECT id FROM accounts WHERE user_id = auth.uid())
  );

-- Transactions
CREATE POLICY "Users can manage own transactions" ON transactions
  FOR ALL USING (user_id = auth.uid() AND is_deleted = FALSE);

-- Transaction Tags
CREATE POLICY "Users can manage transaction tags" ON transaction_tags
  FOR ALL USING (
    transaction_id IN (SELECT id FROM transactions WHERE user_id = auth.uid())
  );

-- Transaction Audit Log
CREATE POLICY "Users can view own transaction audit log" ON transaction_audit_log
  FOR SELECT USING (
    transaction_id IN (SELECT id FROM transactions WHERE user_id = auth.uid())
  );

-- Goals
CREATE POLICY "Users can manage own goals" ON goals
  FOR ALL USING (user_id = auth.uid());

-- Goal Milestones
CREATE POLICY "Users can manage goal milestones" ON goal_milestones
  FOR ALL USING (
    goal_id IN (SELECT id FROM goals WHERE user_id = auth.uid())
  );

-- Reports
CREATE POLICY "Users can view own reports" ON reports
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create reports" ON reports
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own reports" ON reports
  FOR DELETE USING (user_id = auth.uid());

-- Report Snapshots (Read-only after creation)
CREATE POLICY "Users can view own snapshots" ON report_snapshots
  FOR SELECT USING (
    report_id IN (SELECT id FROM reports WHERE user_id = auth.uid())
  );

CREATE POLICY "System can create snapshots" ON report_snapshots
  FOR INSERT WITH CHECK (
    report_id IN (SELECT id FROM reports WHERE user_id = auth.uid())
  );

-- Insights
CREATE POLICY "Users can view own insights" ON insights
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own insights" ON insights
  FOR UPDATE USING (user_id = auth.uid());

-- Notifications
CREATE POLICY "Users can manage own notifications" ON notifications
  FOR ALL USING (user_id = auth.uid());

-- Audit Log
CREATE POLICY "Users can view own audit log" ON audit_log
  FOR SELECT USING (user_id = auth.uid());

-- =====================================================
-- TRIGGERS FOR AUDIT TRAIL
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Net Worth View
CREATE OR REPLACE VIEW v_net_worth AS
SELECT 
  a.user_id,
  a.workspace_id,
  SUM(CASE WHEN a.classification = 'asset' THEN a.current_balance ELSE 0 END) as total_assets,
  SUM(CASE WHEN a.classification = 'liability' THEN a.current_balance ELSE 0 END) as total_liabilities,
  SUM(CASE WHEN a.classification = 'asset' THEN a.current_balance ELSE 0 END) - 
  SUM(CASE WHEN a.classification = 'liability' THEN a.current_balance ELSE 0 END) as net_worth
FROM accounts a
WHERE a.is_active = TRUE AND a.is_included_in_networth = TRUE
GROUP BY a.user_id, a.workspace_id;

-- =====================================================
-- FUNCTION: CREATE DEFAULT CATEGORIES FOR WORKSPACE
-- =====================================================

-- Function to create default categories when a workspace is created
CREATE OR REPLACE FUNCTION create_default_categories(p_workspace_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Default expense categories
  INSERT INTO categories (workspace_id, name, type, icon, is_system) VALUES
    (p_workspace_id, 'Food & Dining', 'expense', '🍔', TRUE),
    (p_workspace_id, 'Transportation', 'expense', '🚗', TRUE),
    (p_workspace_id, 'Shopping', 'expense', '🛍️', TRUE),
    (p_workspace_id, 'Entertainment', 'expense', '🎬', TRUE),
    (p_workspace_id, 'Bills & Utilities', 'expense', '💡', TRUE),
    (p_workspace_id, 'Healthcare', 'expense', '🏥', TRUE),
    (p_workspace_id, 'Education', 'expense', '📚', TRUE),
    (p_workspace_id, 'Housing', 'expense', '🏠', TRUE),
    (p_workspace_id, 'Personal Care', 'expense', '💅', TRUE),
    (p_workspace_id, 'Other Expense', 'expense', '📌', TRUE)
  ON CONFLICT DO NOTHING;

  -- Default income categories
  INSERT INTO categories (workspace_id, name, type, icon, is_system) VALUES
    (p_workspace_id, 'Salary', 'income', '💼', TRUE),
    (p_workspace_id, 'Freelance', 'income', '💻', TRUE),
    (p_workspace_id, 'Investment', 'income', '📈', TRUE),
    (p_workspace_id, 'Business', 'income', '🏢', TRUE),
    (p_workspace_id, 'Gift', 'income', '🎁', TRUE),
    (p_workspace_id, 'Other Income', 'income', '💰', TRUE)
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create default categories when workspace is created
CREATE OR REPLACE FUNCTION trigger_create_workspace_defaults()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_default_categories(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_workspace_created
  AFTER INSERT ON workspaces
  FOR EACH ROW EXECUTE FUNCTION trigger_create_workspace_defaults();

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE workspaces IS 'Multi-tenant workspaces for personal/business separation';
COMMENT ON TABLE report_snapshots IS 'Immutable financial snapshots for audit trail - the core trust layer';
COMMENT ON TABLE transactions IS 'Core transaction table with soft delete and version control';
COMMENT ON TABLE transaction_audit_log IS 'Complete audit trail of all transaction changes';
COMMENT ON TABLE accounts IS 'All financial accounts including assets and liabilities';
COMMENT ON COLUMN report_snapshots.data_hash IS 'SHA-256 hash for data integrity verification';
COMMENT ON COLUMN report_snapshots.is_locked IS 'Locked snapshots are immutable - enterprise compliance';

-- =====================================================
-- END OF SCHEMA
-- =====================================================
