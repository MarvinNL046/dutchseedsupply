-- Check which tables have RLS disabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM 
    pg_tables
WHERE 
    schemaname = 'public' AND
    rowsecurity = false;

-- List all existing RLS policies
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
