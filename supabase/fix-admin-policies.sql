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

-- Update users table policies
DROP POLICY IF EXISTS "Allow admin write access to users" ON public.users;
CREATE POLICY "Allow admin write access to users"
  ON public.users
  FOR ALL
  USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
CREATE POLICY "Admins can update all users"
  ON public.users
  FOR UPDATE
  USING (is_admin(auth.uid()));

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

-- Update products policies
DROP POLICY IF EXISTS "Allow admin write access to products" ON public.products;
CREATE POLICY "Allow admin write access to products"
  ON public.products
  FOR ALL
  USING (is_admin(auth.uid()));

-- Update orders policies
DROP POLICY IF EXISTS "Allow admin write access to orders" ON public.orders;
CREATE POLICY "Allow admin write access to orders"
  ON public.orders
  FOR ALL
  USING (is_admin(auth.uid()));

-- Update blog_posts policies
DROP POLICY IF EXISTS "Allow admin write access to blog_posts" ON public.blog_posts;
CREATE POLICY "Allow admin write access to blog_posts"
  ON public.blog_posts
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
    qual LIKE '%is_admin(auth.uid())%'
    AND schemaname = 'public'
ORDER BY 
    tablename, 
    policyname;
