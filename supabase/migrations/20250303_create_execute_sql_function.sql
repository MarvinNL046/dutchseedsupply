-- Create a function to execute arbitrary SQL
-- This function is used by the clean-database.js script to execute SQL statements
CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE sql_query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION execute_sql(TEXT) TO authenticated;

-- Grant execute permission to anon users (if needed)
GRANT EXECUTE ON FUNCTION execute_sql(TEXT) TO anon;

-- Confirm completion
SELECT 'execute_sql function created successfully' as result;
