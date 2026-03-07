-- =====================================================
-- SAFE FIX: Only touches tables we have permission to modify
-- Run in: https://supabase.com/dashboard/project/jryjutcrvzpotfegixoq/sql/new
-- =====================================================

-- 1. Grant schema usage (safe)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role, authenticator;

-- 2. Grant table access (safe)
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticator;

-- 3. Grant extensions schema (safe)
GRANT USAGE ON SCHEMA extensions TO authenticator, postgres, service_role;

-- 4. Fix authenticator search path (safe)
ALTER ROLE authenticator SET search_path TO public, auth, extensions;

-- 5. Force schema reload
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- 6. Ensure role column in our table (safe - we own this)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
UPDATE public.users SET role = 'admin' WHERE email IN ('aryan@prolx.cloud', 'yassen@prolx.cloud');
