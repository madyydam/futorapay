-- FIX SIGNUP & ACCOUNT CREATION (500 Error Resolution)
-- Run this in your Supabase SQL Editor to fix the "Database error saving new user"

-- 1. DROP EXISTING TRIGGERS (Cleanup conflicts)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. ENSURE HELPER FUNCTION EXISTS (Category creation)
CREATE OR REPLACE FUNCTION public.create_default_categories(p_workspace_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Default expense categories
  INSERT INTO public.categories (workspace_id, name, type, icon, is_system) VALUES
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
  INSERT INTO public.categories (workspace_id, name, type, icon, is_system) VALUES
    (p_workspace_id, 'Salary', 'income', '💼', TRUE),
    (p_workspace_id, 'Freelance', 'income', '💻', TRUE),
    (p_workspace_id, 'Investment', 'income', '📈', TRUE),
    (p_workspace_id, 'Business', 'income', '🏢', TRUE),
    (p_workspace_id, 'Gift', 'income', '🎁', TRUE),
    (p_workspace_id, 'Other Income', 'income', '💰', TRUE)
  ON CONFLICT DO NOTHING;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to create default categories for workspace %: %', p_workspace_id, SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. CREATE ROBUST HANDLER FUNCTION
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_workspace_id UUID;
BEGIN
  -- A. CREATE PROFILE
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    full_name = EXCLUDED.full_name,
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    updated_at = NOW();

  -- B. CREATE DEFAULT WORKSPACE
  INSERT INTO public.workspaces (owner_id, name, type, currency)
  VALUES (NEW.id, 'Personal', 'personal', 'INR')
  RETURNING id INTO v_workspace_id;

  -- C. CREATE DEFAULT CATEGORIES
  PERFORM public.create_default_categories(v_workspace_id);

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Signup Trigger Failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. RECREATE TRIGGER
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. VERIFY/ENABLE RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
