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

-- Test the function with admin users
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
