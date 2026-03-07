-- Fix for Activity Log Visibility
-- The previous RLS policies or lack thereof might be preventing users from reading the activity_log table.

-- Enable RLS on the activity_log table just to be sure
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own logs
DROP POLICY IF EXISTS "Users can insert their own activity logs" ON activity_log;
CREATE POLICY "Users can insert their own activity logs" ON activity_log
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Allow all authenticated users to read activity logs (so the admin can see them, and users can see their own)
-- Since it's a shared dashboard in many respects, we let authenticated users read. 
-- You could also restrict this to just admins or the user themselves: `USING (auth.uid() = user_id OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin')`
-- However, for now, we'll allow authenticated given the previous setup.
DROP POLICY IF EXISTS "Authenticated users can read activity logs" ON activity_log;
CREATE POLICY "Authenticated users can read activity logs" ON activity_log
  FOR SELECT TO authenticated USING (true);
