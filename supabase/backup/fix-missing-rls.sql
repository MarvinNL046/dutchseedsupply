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

-- Enable RLS on tables that don't have it enabled
-- Replace the table names with the ones from the query above
ALTER TABLE public.table_name1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.table_name2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.table_name3 ENABLE ROW LEVEL SECURITY;

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

-- Create basic RLS policies for tables that don't have any
-- Replace the table names with the ones from the query above

-- For table_name1
CREATE POLICY "Allow public read access to table_name1" 
  ON public.table_name1 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow admin write access to table_name1" 
  ON public.table_name1 
  FOR ALL 
  USING (is_admin(auth.uid()));

-- For table_name2
CREATE POLICY "Allow public read access to table_name2" 
  ON public.table_name2 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow admin write access to table_name2" 
  ON public.table_name2 
  FOR ALL 
  USING (is_admin(auth.uid()));

-- For table_name3
CREATE POLICY "Allow public read access to table_name3" 
  ON public.table_name3 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow admin write access to table_name3" 
  ON public.table_name3 
  FOR ALL 
  USING (is_admin(auth.uid()));
