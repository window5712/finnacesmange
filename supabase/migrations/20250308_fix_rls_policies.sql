-- Migration to fix RLS and allow row insertion

-- 1. Setup User Roles first so policies can reference the 'role' column
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
UPDATE public.users SET role = 'admin' WHERE email = 'aryan@prolx.cloud';
UPDATE public.users SET role = 'admin' WHERE email = 'yassen@prolx.cloud';

-- 2. Enable RLS on all tables
ALTER TABLE public.income ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_income ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_savings_goals ENABLE ROW LEVEL SECURITY;

-- 3. Income Policies
DROP POLICY IF EXISTS "Users can insert their own income" ON public.income;
CREATE POLICY "Users can insert their own income" ON public.income
  FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can view their own income" ON public.income;
CREATE POLICY "Users can view their own income" ON public.income
  FOR SELECT USING (auth.uid() = created_by OR (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')));

DROP POLICY IF EXISTS "Users can update their own income" ON public.income;
CREATE POLICY "Users can update their own income" ON public.income
  FOR UPDATE USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can delete their own income" ON public.income;
CREATE POLICY "Users can delete their own income" ON public.income
  FOR DELETE USING (auth.uid() = created_by);

-- 4. Expenses Policies
DROP POLICY IF EXISTS "Users can insert their own expenses" ON public.expenses;
CREATE POLICY "Users can insert their own expenses" ON public.expenses
  FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can view their own expenses" ON public.expenses;
CREATE POLICY "Users can view their own expenses" ON public.expenses
  FOR SELECT USING (auth.uid() = created_by OR (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')));

DROP POLICY IF EXISTS "Users can update their own expenses" ON public.expenses;
CREATE POLICY "Users can update their own expenses" ON public.expenses
  FOR UPDATE USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can delete their own expenses" ON public.expenses;
CREATE POLICY "Users can delete their own expenses" ON public.expenses
  FOR DELETE USING (auth.uid() = created_by);

-- 5. Salaries Policies
DROP POLICY IF EXISTS "Users can insert their own salaries" ON public.salaries;
CREATE POLICY "Users can insert their own salaries" ON public.salaries
  FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can view their own salaries" ON public.salaries;
CREATE POLICY "Users can view their own salaries" ON public.salaries
  FOR SELECT USING (auth.uid() = created_by OR (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')));

DROP POLICY IF EXISTS "Users can update their own salaries" ON public.salaries;
CREATE POLICY "Users can update their own salaries" ON public.salaries
  FOR UPDATE USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can delete their own salaries" ON public.salaries;
CREATE POLICY "Users can delete their own salaries" ON public.salaries
  FOR DELETE USING (auth.uid() = created_by);

-- 6. Investments Policies
DROP POLICY IF EXISTS "Users can insert their own investments" ON public.investments;
CREATE POLICY "Users can insert their own investments" ON public.investments
  FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can view their own investments" ON public.investments;
CREATE POLICY "Users can view their own investments" ON public.investments
  FOR SELECT USING (auth.uid() = created_by OR (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')));

DROP POLICY IF EXISTS "Users can update their own investments" ON public.investments;
CREATE POLICY "Users can update their own investments" ON public.investments
  FOR UPDATE USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can delete their own investments" ON public.investments;
CREATE POLICY "Users can delete their own investments" ON public.investments
  FOR DELETE USING (auth.uid() = created_by);

-- 7. Activity Log Policies
DROP POLICY IF EXISTS "Users can insert their own activity log" ON public.activity_log;
CREATE POLICY "Users can insert their own activity log" ON public.activity_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own activity log" ON public.activity_log;
CREATE POLICY "Users can view their own activity log" ON public.activity_log
  FOR SELECT USING (auth.uid() = user_id OR (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')));

-- 8. Personal Finance Policies
DROP POLICY IF EXISTS "Users can manage own personal income" ON public.personal_income;
CREATE POLICY "Users can manage own personal income" ON public.personal_income
  FOR ALL USING (auth.uid() = user_id OR (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')));

DROP POLICY IF EXISTS "Users can manage own personal expenses" ON public.personal_expenses;
CREATE POLICY "Users can manage own personal expenses" ON public.personal_expenses
  FOR ALL USING (auth.uid() = user_id OR (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')));

DROP POLICY IF EXISTS "Users can manage own personal savings" ON public.personal_savings_goals;
CREATE POLICY "Users can manage own personal savings" ON public.personal_savings_goals
  FOR ALL USING (auth.uid() = user_id OR (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')));
