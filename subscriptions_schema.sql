-- =====================================================
-- SUBSCRIPTIONS TABLE - STANDALONE VERSION
-- Run this FIRST before using the subscriptions feature
-- =====================================================

-- Create the update timestamp function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  
  -- Subscription Details
  name TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  
  -- Billing Info
  billing_cycle TEXT CHECK (billing_cycle IN ('daily', 'weekly', 'monthly', 'yearly')) DEFAULT 'monthly',
  billing_day INTEGER, -- Day of month (1-31) or week (1-7)
  next_billing_date DATE NOT NULL,
  
  -- Categorization
  category TEXT,
  icon TEXT,
  
  -- Payment Method
  payment_method TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  auto_renew BOOLEAN DEFAULT TRUE,
  
  -- Notifications
  reminder_days INTEGER DEFAULT 3, -- Days before to send reminder
  notifications_enabled BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  notes TEXT,
  website_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage own subscriptions" ON subscriptions;

-- RLS Policies
CREATE POLICY "Users can manage own subscriptions" ON subscriptions
  FOR ALL USING (user_id = auth.uid());

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_subscriptions_user;
DROP INDEX IF EXISTS idx_subscriptions_next_billing;
DROP INDEX IF EXISTS idx_subscriptions_active;

-- Create indexes for performance
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_next_billing ON subscriptions(next_billing_date);
CREATE INDEX idx_subscriptions_active ON subscriptions(is_active) WHERE is_active = TRUE;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;

-- Create trigger for updated_at
CREATE TRIGGER update_subscriptions_updated_at 
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_upcoming_subscriptions(INTEGER);

-- Function to get upcoming bills
CREATE OR REPLACE FUNCTION get_upcoming_subscriptions(days_ahead INTEGER DEFAULT 30)
RETURNS TABLE (
  id UUID,
  name TEXT,
  amount DECIMAL,
  next_billing_date DATE,
  days_until INTEGER,
  category TEXT,
  icon TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.name,
    s.amount,
    s.next_billing_date,
    (s.next_billing_date - CURRENT_DATE)::INTEGER as days_until,
    s.category,
    s.icon
  FROM subscriptions s
  WHERE s.user_id = auth.uid()
    AND s.is_active = TRUE
    AND s.next_billing_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + days_ahead)
  ORDER BY s.next_billing_date ASC;
END;
$$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Subscriptions table created successfully!';
  RAISE NOTICE 'You can now use the Subscriptions feature in FutoraPay.';
END $$;
