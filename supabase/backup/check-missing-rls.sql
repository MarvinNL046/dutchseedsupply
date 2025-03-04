-- This script checks for tables that don't have RLS enabled
-- and generates SQL statements to enable RLS on those tables

-- Check which tables have RLS disabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM 
    pg_tables
WHERE 
    schemaname = 'public' AND
    rowsecurity = false
ORDER BY
    tablename;

-- Generate SQL statements to enable RLS on tables that don't have it enabled
SELECT 
    'ALTER TABLE ' || schemaname || '.' || tablename || ' ENABLE ROW LEVEL SECURITY;' AS enable_rls_statement
FROM 
    pg_tables
WHERE 
    schemaname = 'public' AND
    rowsecurity = false
ORDER BY
    tablename;

-- Check which tables don't have any RLS policies
SELECT 
    t.schemaname,
    t.tablename,
    t.rowsecurity,
    COUNT(p.policyname) AS policy_count
FROM 
    pg_tables t
LEFT JOIN 
    pg_policies p ON t.schemaname = p.schemaname AND t.tablename = p.tablename
WHERE 
    t.schemaname = 'public'
GROUP BY 
    t.schemaname, t.tablename, t.rowsecurity
HAVING 
    COUNT(p.policyname) = 0
ORDER BY
    t.tablename;

-- Generate SQL statements to create basic RLS policies for tables that don't have any
WITH tables_without_policies AS (
    SELECT 
        t.schemaname,
        t.tablename
    FROM 
        pg_tables t
    LEFT JOIN 
        pg_policies p ON t.schemaname = p.schemaname AND t.tablename = p.tablename
    WHERE 
        t.schemaname = 'public'
    GROUP BY 
        t.schemaname, t.tablename
    HAVING 
        COUNT(p.policyname) = 0
)
SELECT 
    '-- Enable RLS on ' || tablename || E'\n' ||
    'ALTER TABLE ' || schemaname || '.' || tablename || E' ENABLE ROW LEVEL SECURITY;\n' ||
    E'\n' ||
    '-- Create policy for public read access\n' ||
    'CREATE POLICY "Allow public read access to ' || tablename || E'" ON ' || schemaname || '.' || tablename || E' FOR SELECT USING (true);\n' ||
    E'\n' ||
    '-- Create policy for admin write access\n' ||
    'CREATE POLICY "Allow admin write access to ' || tablename || E'" ON ' || schemaname || '.' || tablename || E' FOR ALL USING (is_admin(auth.uid()));\n' AS create_policies_statement
FROM 
    tables_without_policies
ORDER BY
    tablename;
