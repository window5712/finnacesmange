-- Add users Aryan and Yassen with password 'Admin123###'
-- This version includes 'aud' and 'role' required for Supabase Auth to recognize the user

INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  raw_app_meta_data,
  is_super_admin,
  role,
  aud,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
)
SELECT 
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  val.email,
  '$2b$10$DNvkzov.9g0ouColt7H7deZuj9Zi2BWG2QShCKm6J.CM.OSOLAMau',
  now(),
  val.meta_data,
  '{"provider": "email", "providers": ["email"]}',
  false,
  'authenticated',
  'authenticated',
  now(),
  now(),
  '',
  '',
  '',
  ''
FROM (
  VALUES 
    ('aryan@prolx.cloud', '{"full_name": "aryan", "name": "aryan", "email": "aryan@prolx.cloud"}'::jsonb),
    ('yassen@prolx.cloud', '{"full_name": "yassen", "name": "yassen", "email": "yassen@prolx.cloud"}'::jsonb)
) AS val(email, meta_data)
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE auth.users.email = val.email
);

-- Note: If the users already exist but cannot login, you may need to DELETE them first:
-- DELETE FROM auth.users WHERE email IN ('aryan@prolx.cloud', 'yassen@prolx.cloud');
-- Then run the INSERT above.
