-- RUN THIS FIRST to clean up the broken auth.users entries
-- These were inserted with wrong format and are causing GoTrue to fail
-- Go to: https://supabase.com/dashboard/project/jryjutcrvzpotfegixoq/sql/new

DELETE FROM auth.users WHERE email IN ('aryan@prolx.cloud', 'yassen@prolx.cloud');
DELETE FROM public.users WHERE email IN ('aryan@prolx.cloud', 'yassen@prolx.cloud');

-- Then reload
NOTIFY pgrst, 'reload schema';
