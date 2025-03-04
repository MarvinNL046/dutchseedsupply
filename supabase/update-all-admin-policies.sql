-- This script updates all RLS policies that use the inconsistent admin check
-- to use the standardized is_admin() function instead

-- First, let's identify all policies that use the inconsistent check
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
    AND schemaname = 'public'
ORDER BY
    tablename,
    policyname;

-- Now, let's update these policies to use the is_admin function
-- We'll generate the SQL statements to drop and recreate each policy

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
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
            AND schemaname = 'public'
        ORDER BY
            tablename,
            policyname
    ) LOOP
        -- Drop the existing policy
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I;',
            r.policyname, r.schemaname, r.tablename);
        
        -- Create a new policy using the is_admin function
        -- We need to handle different command types (SELECT, INSERT, UPDATE, DELETE, ALL)
        IF r.cmd = 'SELECT' THEN
            EXECUTE format('CREATE POLICY %I ON %I.%I FOR SELECT USING (is_admin(auth.uid()));',
                r.policyname, r.schemaname, r.tablename);
        ELSIF r.cmd = 'INSERT' THEN
            EXECUTE format('CREATE POLICY %I ON %I.%I FOR INSERT USING (is_admin(auth.uid()));',
                r.policyname, r.schemaname, r.tablename);
        ELSIF r.cmd = 'UPDATE' THEN
            EXECUTE format('CREATE POLICY %I ON %I.%I FOR UPDATE USING (is_admin(auth.uid()));',
                r.policyname, r.schemaname, r.tablename);
        ELSIF r.cmd = 'DELETE' THEN
            EXECUTE format('CREATE POLICY %I ON %I.%I FOR DELETE USING (is_admin(auth.uid()));',
                r.policyname, r.schemaname, r.tablename);
        ELSIF r.cmd = 'ALL' THEN
            EXECUTE format('CREATE POLICY %I ON %I.%I FOR ALL USING (is_admin(auth.uid()));',
                r.policyname, r.schemaname, r.tablename);
        END IF;
        
        RAISE NOTICE 'Updated policy %I on table %I.%I', 
            r.policyname, r.schemaname, r.tablename;
    END LOOP;
END
$$;

-- Verify that all policies have been updated
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

-- Check if there are any remaining policies with the inconsistent check
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
    AND schemaname = 'public'
ORDER BY
    tablename,
    policyname;
