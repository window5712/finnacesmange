-- Migration to ensure Company data is shared and Personal data is private

-- 1. Ensure admins can do everything with Company data
-- income
DROP POLICY IF EXISTS "income_all" ON public.income;
CREATE POLICY "income_admin_all" ON public.income 
  FOR ALL USING (public.is_admin() OR auth.uid() = created_by);

-- expenses
DROP POLICY IF EXISTS "expenses_all" ON public.expenses;
CREATE POLICY "expenses_admin_all" ON public.expenses 
  FOR ALL USING (public.is_admin() OR auth.uid() = created_by);

-- salaries
DROP POLICY IF EXISTS "salaries_all" ON public.salaries;
CREATE POLICY "salaries_admin_all" ON public.salaries 
  FOR ALL USING (public.is_admin() OR auth.uid() = created_by);

-- investments
DROP POLICY IF EXISTS "investments_all" ON public.investments;
CREATE POLICY "investments_admin_all" ON public.investments 
  FOR ALL USING (public.is_admin() OR auth.uid() = created_by);

-- activity_log
DROP POLICY IF EXISTS "activity_log_view" ON public.activity_log;
CREATE POLICY "activity_log_admin_all" ON public.activity_log 
  FOR ALL USING (public.is_admin() OR auth.uid() = user_id);

-- partner_transactions (already broad select, but ensure update/delete for admins)
DROP POLICY IF EXISTS "partner_transactions_select" ON public.partner_transactions;
DROP POLICY IF EXISTS "partner_transactions_insert" ON public.partner_transactions;
DROP POLICY IF EXISTS "partner_transactions_delete" ON public.partner_transactions;

CREATE POLICY "partner_transactions_select_all" ON public.partner_transactions
    FOR SELECT USING (true); -- Transparency for all partners

CREATE POLICY "partner_transactions_insert_admin" ON public.partner_transactions
    FOR INSERT WITH CHECK (public.is_admin() OR auth.uid() = partner_id);

CREATE POLICY "partner_transactions_all_admin" ON public.partner_transactions
    FOR ALL USING (public.is_admin() OR auth.uid() = partner_id);


-- 2. Ensure Personal data is strictly PRIVATE (even from admins)
-- personal_income
DROP POLICY IF EXISTS "p_income_all" ON public.personal_income;
CREATE POLICY "personal_income_private" ON public.personal_income 
  FOR ALL USING (auth.uid() = user_id);

-- personal_expenses
DROP POLICY IF EXISTS "p_expenses_all" ON public.personal_expenses;
CREATE POLICY "personal_expenses_private" ON public.personal_expenses 
  FOR ALL USING (auth.uid() = user_id);

-- personal_savings_goals
DROP POLICY IF EXISTS "p_savings_all" ON public.personal_savings_goals;
CREATE POLICY "personal_savings_private" ON public.personal_savings_goals 
  FOR ALL USING (auth.uid() = user_id);

-- 3. Ensure both users are admins
UPDATE public.users SET role = 'admin' WHERE email IN ('aryan@prolx.cloud', 'yassen@prolx.cloud');

-- Refresh
NOTIFY pgrst, 'reload schema';
