-- This script enables RLS on all tables in the public schema and creates basic policies
-- WARNING: Run this script only after reviewing it and understanding the implications
-- It's generally better to create specific policies for each table based on your application's needs

-- Function to enable RLS on all tables
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Loop through all tables in the public schema
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = false)
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.tablename);
        RAISE NOTICE 'Enabled RLS on table: %', r.tablename;
    END LOOP;
END
$$;

-- Create basic read policies for all tables
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Loop through all tables in the public schema
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public')
    LOOP
        -- Check if a SELECT policy already exists
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = r.tablename 
            AND cmd = 'SELECT'
        ) THEN
            -- Create a policy that allows everyone to read
            EXECUTE format(
                'CREATE POLICY "Allow public read access to %I" ON public.%I FOR SELECT USING (true);',
                r.tablename, r.tablename
            );
            RAISE NOTICE 'Created SELECT policy for table: %', r.tablename;
        END IF;
    END LOOP;
END
$$;

-- Create basic write policies for all tables (only for authenticated users)
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Loop through all tables in the public schema
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public')
    LOOP
        -- Check if an ALL policy already exists
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = r.tablename 
            AND cmd = 'ALL'
        ) THEN
            -- Create a policy that allows only admin users to write
            EXECUTE format(
                'CREATE POLICY "Allow admin write access to %I" ON public.%I FOR ALL USING (auth.uid() IN (SELECT id FROM public.users WHERE is_admin = true));',
                r.tablename, r.tablename
            );
            RAISE NOTICE 'Created ALL policy for table: %', r.tablename;
        END IF;
    END LOOP;
END
$$;

-- Verify that RLS is enabled on all tables
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- List all policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM 
    pg_policies
WHERE 
    schemaname = 'public'
ORDER BY 
    tablename, 
    policyname;
