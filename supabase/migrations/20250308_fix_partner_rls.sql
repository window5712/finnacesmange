-- Fix RLS for partner_transactions table
-- This migration ensures the table exists and has correct policies

-- Create table if it doesn't exist (it should, but just in case)
CREATE TABLE IF NOT EXISTS public.partner_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES auth.users(id),
    type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'investment')),
    amount NUMERIC(15, 2) NOT NULL,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.partner_transactions ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, DELETE ON public.partner_transactions TO authenticated;
GRANT ALL ON public.partner_transactions TO service_role;

-- Policies
-- 1. All partners can view all transactions (for transparency)
CREATE POLICY "partner_transactions_select" ON public.partner_transactions
    FOR SELECT TO authenticated USING (true);

-- 2. Partners can insert their own transactions
CREATE POLICY "partner_transactions_insert" ON public.partner_transactions
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = partner_id OR public.is_admin());

-- 3. Partners can delete their own transactions
CREATE POLICY "partner_transactions_delete" ON public.partner_transactions
    FOR DELETE TO authenticated USING (auth.uid() = partner_id OR public.is_admin());

-- Use a DO block to safely drop whatever company_wallet currently is
DO $$ 
BEGIN
    -- Drop as materialized view if it exists
    IF EXISTS (SELECT 1 FROM pg_matviews WHERE schemaname = 'public' AND matviewname = 'company_wallet') THEN
        DROP MATERIALIZED VIEW public.company_wallet CASCADE;
    -- Drop as view if it exists
    ELSIF EXISTS (SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'company_wallet') THEN
        DROP VIEW public.company_wallet CASCADE;
    -- Drop as table if it exists
    ELSIF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'company_wallet') THEN
        DROP TABLE public.company_wallet CASCADE;
    END IF;
END $$;

-- Create or update company_wallet view to be strictly accurate
CREATE VIEW public.company_wallet AS
WITH totals AS (
    SELECT 
        COALESCE((SELECT SUM(amount) FROM public.income), 0) as total_income,
        COALESCE((SELECT SUM(amount) FROM public.partner_transactions WHERE type = 'deposit'), 0) as total_deposits,
        COALESCE((SELECT SUM(amount) FROM public.expenses), 0) as total_expenses,
        COALESCE((SELECT SUM(amount) FROM public.salaries), 0) as total_salaries,
        COALESCE((SELECT SUM(amount) FROM public.partner_transactions WHERE type = 'withdrawal'), 0) as total_withdrawals,
        COALESCE((SELECT SUM(amount) FROM public.investments), 0) as total_investments
)
SELECT 
    total_income,
    total_deposits,
    total_expenses,
    total_salaries,
    total_withdrawals,
    total_investments,
    (total_income + total_deposits - total_expenses - total_salaries - total_withdrawals) as wallet_balance
FROM totals;

-- Refresh function (if used by the app)
CREATE OR REPLACE FUNCTION public.refresh_company_wallet()
RETURNS void AS $$
BEGIN
  -- Since it's a view now, we don't need to refresh a materialized view
  -- but we keep the function for compatibility with the frontend action
  NOTIFY pgrst, 'reload schema';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
