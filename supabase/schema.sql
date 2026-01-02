-- =====================================================
-- FUTORAPAY — ENTERPRISE DATABASE SCHEMA (LATEST)
-- "The Single Source of Financial Truth"
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
  default_currency TEXT DEFAULT 'INR',
  date_format TEXT DEFAULT 'DD/MM/YYYY',
  timezone TEXT DEFAULT 'Asia/Kolkata',
  dark_mode BOOLEAN DEFAULT TRUE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  account_type TEXT CHECK (account_type IN ('individual', 'business')) DEFAULT 'individual',
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
  fiscal_year_start INTEGER DEFAULT 1,
  settings JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  CONSTRAINT workspace_name_owner_unique UNIQUE (owner_id, name)
);

-- Workspace Members
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

-- Categories
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

-- Accounts
CREATE TABLE IF NOT EXISTS accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN (
    'cash', 'bank_checking', 'bank_savings', 'credit_card', 'investment', 
    'loan', 'mortgage', 'real_estate', 'crypto', 'other_asset', 'other_liability'
  )) NOT NULL,
  current_balance DECIMAL(15,2) DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  institution_name TEXT,
  icon TEXT,
  color TEXT,
  classification TEXT CHECK (classification IN ('asset', 'liability')) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_included_in_networth BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES accounts ON DELETE SET NULL,
  description TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense', 'transfer')) NOT NULL,
  category TEXT, -- Soft category for flexibility
  category_id UUID REFERENCES categories ON DELETE SET NULL,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT,
  status TEXT CHECK (status IN ('pending', 'completed', 'cancelled')) DEFAULT 'completed',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  billing_cycle TEXT CHECK (billing_cycle IN ('daily', 'weekly', 'monthly', 'yearly')) DEFAULT 'monthly',
  billing_day INTEGER,
  next_billing_date DATE NOT NULL,
  category TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  auto_renew BOOLEAN DEFAULT TRUE,
  reminder_days INTEGER DEFAULT 3,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Goals
CREATE TABLE IF NOT EXISTS goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  target_amount DECIMAL(15,2) NOT NULL,
  current_amount DECIMAL(15,2) DEFAULT 0,
  deadline DATE,
  category TEXT,
  status TEXT CHECK (status IN ('active', 'completed', 'archived')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Reports & Snapshots
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status TEXT DEFAULT 'completed',
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE TABLE IF NOT EXISTS report_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES reports ON DELETE CASCADE NOT NULL,
  workspace_id UUID REFERENCES workspaces ON DELETE CASCADE NOT NULL,
  snapshot_data JSONB NOT NULL,
  total_income DECIMAL(15,2),
  total_expenses DECIMAL(15,2),
  net_worth DECIMAL(15,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own profile" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage own workspaces" ON workspaces FOR ALL USING (owner_id = auth.uid());
CREATE POLICY "Users can manage own accounts" ON accounts FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can manage own transactions" ON transactions FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can manage own subscriptions" ON subscriptions FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can manage own goals" ON goals FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can manage own reports" ON reports FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can manage own snapshots" ON report_snapshots FOR ALL USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));
CREATE POLICY "Users can manage own notifications" ON notifications FOR ALL USING (user_id = auth.uid());

-- =====================================================
-- ANALYTICS VIEWS
-- =====================================================

CREATE OR REPLACE VIEW view_analytics_monthly_summary 
WITH (security_invoker = true) AS
SELECT 
  user_id,
  DATE_TRUNC('month', transaction_date)::DATE as month_start,
  SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
  SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense,
  SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as net_savings,
  COUNT(*) as transaction_count
FROM transactions
WHERE is_deleted = FALSE
GROUP BY user_id, DATE_TRUNC('month', transaction_date);

CREATE OR REPLACE VIEW view_analytics_category_summary
WITH (security_invoker = true) AS
SELECT 
  user_id,
  category as category_name,
  DATE_TRUNC('month', transaction_date)::DATE as month_start,
  SUM(amount) as total_amount,
  COUNT(id) as transaction_count
FROM transactions
WHERE type = 'expense' AND is_deleted = FALSE
GROUP BY user_id, category, DATE_TRUNC('month', transaction_date);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- New user handler
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'));
  
  INSERT INTO workspaces (owner_id, name, type)
  VALUES (NEW.id, 'Personal Workspace', 'personal');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- THE END
-- =====================================================
