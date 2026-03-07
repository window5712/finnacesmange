-- ========================================================
-- DEFINITIVE SUPABASE AUTH & PERMISSIONS FIX (V5)
-- "THE NUCLEAR OPTION"
-- ========================================================

-- 1. FULL SCHEMA ACCESS RESTORATION
-- We grant everything to everyone involved in the auth flow
DO $$ 
BEGIN
    -- Grant usage on schemas
    GRANT USAGE ON SCHEMA public, auth, extensions TO postgres, anon, authenticated, service_role, authenticator;
    
    -- Grant all on public (standard for many setups, might be overkill but solves blocks)
    GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
    GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
    
    -- IMPORTANT: Grant SELECT on auth.users to authenticator
    -- Without this, login often fails with schema errors
    GRANT SELECT ON auth.users TO authenticator, postgres, service_role;
    GRANT USAGE ON SCHEMA auth TO authenticator, postgres, service_role;
END $$;

-- 2. RESET SEARCH PATH TO ABSOLUTE DEFAULTS
ALTER ROLE authenticator SET search_path TO public, auth, extensions;
ALTER ROLE postgres SET search_path TO cache, public, auth, extensions;
ALTER ROLE authenticated SET search_path TO public, auth, extensions;
ALTER ROLE anon SET search_path TO public, auth, extensions;

-- 3. ENSURE authenticator CAN SWITCH ROLES
-- This is critical for the "authenticated" and "anon" roles to work
GRANT anon TO authenticator;
GRANT authenticated TO authenticator;
GRANT service_role TO authenticator;

-- 4. CLEANUP AND RECREATE ADMIN USERS
DELETE FROM auth.users WHERE email IN ('aryan@prolx.cloud', 'yassen@prolx.cloud');
DELETE FROM public.users WHERE email IN ('aryan@prolx.cloud', 'yassen@prolx.cloud');

-- 5. ENSURE ROLE COLUMN AND HELPER FUNCTION
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Use a subquery to avoid any role-based context issues
  RETURN (
    SELECT role = 'admin' 
    FROM public.users 
    WHERE id = auth.uid()
    LIMIT 1
  ) IS TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. RESET RLS POLICIES
-- Nuclear drop of all policies to ensure no conflicts
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- Apply simplified policies
-- Company Data
CREATE POLICY "income_all" ON public.income FOR ALL USING (auth.uid() = created_by OR public.is_admin());
CREATE POLICY "expenses_all" ON public.expenses FOR ALL USING (auth.uid() = created_by OR public.is_admin());
CREATE POLICY "salaries_all" ON public.salaries FOR ALL USING (auth.uid() = created_by OR public.is_admin());
CREATE POLICY "investments_all" ON public.investments FOR ALL USING (auth.uid() = created_by OR public.is_admin());
CREATE POLICY "activity_log_view" ON public.activity_log FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

-- Personal Data
CREATE POLICY "p_income_all" ON public.personal_income FOR ALL USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "p_expenses_all" ON public.personal_expenses FOR ALL USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "p_savings_all" ON public.personal_savings_goals FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- 7. RECREATE USERS
-- Re-insert exactly as they should be
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at, 
  raw_user_meta_data, raw_app_meta_data, aud, role, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  val.email,
  '$2b$10$DNvkzov.9g0ouColt7H7deZuj9Zi2BWG2QShCKm6J.CM.OSOLAMau', -- Admin123###
  now(),
  val.meta_data,
  '{"provider": "email", "providers": ["email"]}',
  'authenticated',
  'authenticated',
  now(),
  now()
FROM (
  VALUES 
    ('aryan@prolx.cloud', '{"full_name": "aryan", "name": "aryan", "email": "aryan@prolx.cloud"}'::jsonb),
    ('yassen@prolx.cloud', '{"full_name": "yassen", "name": "yassen", "email": "yassen@prolx.cloud"}'::jsonb)
) AS val(email, meta_data);

-- 8. FINAL ROLE SYNC
UPDATE public.users SET role = 'admin' WHERE email IN ('aryan@prolx.cloud', 'yassen@prolx.cloud');

-- 9. FORCE RELOAD
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';
