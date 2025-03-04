-- Check if the is_admin function exists
SELECT 
    proname, 
    pg_get_functiondef(oid) AS function_definition
FROM 
    pg_proc 
WHERE 
    proname = 'is_admin';

-- Create or replace the is_admin function with a standardized implementation
CREATE OR REPLACE FUNCTION is_admin(uid uuid) RETURNS boolean AS $$
BEGIN
  -- Check if the user with the given uid has is_admin = true
  RETURN EXISTS (
    SELECT 1 
    FROM public.users 
    WHERE id = uid AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the function with a known admin user
-- Replace '5f40be48-2f10-4a56-a659-eae59cfa9318' with an actual admin user ID from your database
SELECT 
    id, 
    email, 
    is_admin, 
    is_admin(id) AS is_admin_function_result
FROM 
    public.users
WHERE 
    is_admin = true
LIMIT 5;

-- Update all RLS policies that use the inconsistent check to use the is_admin function
-- First, let's identify policies that use the inconsistent check
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual
FROM 
    pg_policies
WHERE 
    qual LIKE '%IN ( SELECT users%id FROM users%WHERE (users%.is_admin = true))%'
    AND schemaname = 'public';

-- Now, let's update these policies to use the is_admin function
-- Note: You'll need to run the following commands for each policy that needs to be updated
-- Here's an example for the users table:

-- Drop and recreate the "Allow admin write access to users" policy
DROP POLICY IF EXISTS "Allow admin write access to users" ON public.users;
CREATE POLICY "Allow admin write access to users"
  ON public.users
  FOR ALL
  USING (is_admin(auth.uid()));

-- Drop and recreate the "Admins can update all users" policy if it exists
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
CREATE POLICY "Admins can update all users"
  ON public.users
  FOR UPDATE
  USING (is_admin(auth.uid()));

-- Drop and recreate the "Admins can view all users" policy if it exists
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users"
  ON public.users
  FOR SELECT
  USING (is_admin(auth.uid()));

-- Update site_config policies
DROP POLICY IF EXISTS "Allow admin write access to site_config" ON public.site_config;
CREATE POLICY "Allow admin write access to site_config"
  ON public.site_config
  FOR ALL
  USING (is_admin(auth.uid()));

-- Verify the updated policies
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual
FROM 
    pg_policies
WHERE 
    (tablename = 'users' OR tablename = 'site_config')
    AND schemaname = 'public'
ORDER BY 
    tablename, 
    policyname;
