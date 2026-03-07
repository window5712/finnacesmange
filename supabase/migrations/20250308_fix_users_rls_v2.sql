-- =====================================================
-- FIX users table RLS (v2) - No infinite recursion
-- Run in: https://supabase.com/dashboard/project/jryjutcrvzpotfegixoq/sql/new
-- =====================================================

-- Step 1: Drop ALL existing policies on public.users to start clean
DROP POLICY IF EXISTS "Users can view own profile"      ON public.users;
DROP POLICY IF EXISTS "Admins can view all profiles"    ON public.users;
DROP POLICY IF EXISTS "Users can update own profile"    ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile"    ON public.users;
-- Also drop any policies from previous migrations
DROP POLICY IF EXISTS "Allow users to read own data"    ON public.users;
DROP POLICY IF EXISTS "Allow admins to read all data"   ON public.users;
DROP POLICY IF EXISTS "users_select_own"                ON public.users;
DROP POLICY IF EXISTS "users_select_admin"              ON public.users;

-- Step 2: Create a SECURITY DEFINER helper function so the admin
--         check does NOT go through RLS (avoids infinite recursion).
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.users WHERE id = auth.uid() LIMIT 1;
$$;

-- Step 3: Re-enable RLS (safe if already enabled)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Step 4: Simple, non-recursive SELECT policy
--   Each user can see their own row.
--   Admins call get_my_role() which bypasses RLS (SECURITY DEFINER).
CREATE POLICY "users_select_policy"
  ON public.users
  FOR SELECT
  USING (
    id = auth.uid()
    OR public.get_my_role() = 'admin'
  );

-- Step 5: UPDATE — own row only
CREATE POLICY "users_update_policy"
  ON public.users
  FOR UPDATE
  USING (id = auth.uid());

-- Step 6: INSERT — only for your own id
CREATE POLICY "users_insert_policy"
  ON public.users
  FOR INSERT
  WITH CHECK (id = auth.uid());

-- Step 7: Service role bypasses RLS anyway, but grant explicitly
GRANT ALL ON public.users TO service_role;
GRANT SELECT, UPDATE ON public.users TO authenticated;

-- Step 8: De-duplicate rows in public.users
--   Keep only the LATEST row per user id (by ctid as tiebreaker).
DELETE FROM public.users
WHERE ctid NOT IN (
  SELECT min(ctid)
  FROM public.users
  GROUP BY id
);

-- Step 9: Add a unique constraint so duplicates can't happen again
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_unique;
ALTER TABLE public.users ADD CONSTRAINT users_id_unique UNIQUE (id);

-- Step 10: Ensure admin users have the correct role
UPDATE public.users
SET role = 'admin'
WHERE email IN ('aryan@prolx.cloud', 'yassen@prolx.cloud');

-- Step 11: Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- Verify: should return 1 row per user
-- SELECT id, email, role, count(*) FROM public.users GROUP BY id, email, role;
