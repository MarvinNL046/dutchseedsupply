# Row Level Security (RLS) in Supabase

This directory contains SQL scripts to help manage Row Level Security (RLS) in your Supabase database.

## What is Row Level Security?

Row Level Security (RLS) is a feature in PostgreSQL that allows you to control which rows in a table a user can access. When RLS is enabled on a table, all access to the table is denied by default, and you must create policies to allow specific access.

## Why is RLS Important?

Without RLS, any user with access to your database can potentially read or modify any row in your tables, which is a security risk. By enabling RLS and creating appropriate policies, you can ensure that users can only access the data they are supposed to.

## Scripts in this Directory

### 1. `check-rls-all-tables.sql`

This script checks which tables in your database have RLS disabled and lists all existing RLS policies. Use this script to identify security issues in your database.

To run this script:
1. Go to the Supabase dashboard
2. Click on "SQL Editor"
3. Create a new query
4. Copy and paste the contents of `check-rls-all-tables.sql`
5. Click "Run"

### 2. `enable-rls-site-config.sql`

This script enables RLS on the `site_config` table and creates two policies:
- A policy that allows everyone to read the `site_config` table
- A policy that allows only admin users to insert, update, or delete from the `site_config` table

To run this script:
1. Go to the Supabase dashboard
2. Click on "SQL Editor"
3. Create a new query
4. Copy and paste the contents of `enable-rls-site-config.sql`
5. Click "Run"

### 3. `enable-rls-all-tables.sql`

This script enables RLS on all tables in the public schema and creates basic policies for them. This is a more comprehensive solution that ensures all tables have at least basic security.

**WARNING**: Run this script only after reviewing it and understanding the implications. It's generally better to create specific policies for each table based on your application's needs.

To run this script:
1. Go to the Supabase dashboard
2. Click on "SQL Editor"
3. Create a new query
4. Copy and paste the contents of `enable-rls-all-tables.sql`
5. Click "Run"

## Best Practices for RLS

1. **Enable RLS on all tables**: All tables in your database should have RLS enabled.
2. **Create specific policies for each table**: Different tables may have different access requirements.
3. **Use the principle of least privilege**: Only grant the minimum access necessary.
4. **Test your policies**: Make sure your policies work as expected by testing them with different users.
5. **Keep your policies simple**: Complex policies can be hard to understand and maintain.

## Common Policy Patterns

### Allow public read access

```sql
CREATE POLICY "Allow public read access"
  ON public.table_name
  FOR SELECT
  USING (true);
```

### Allow authenticated users to read

```sql
CREATE POLICY "Allow authenticated read access"
  ON public.table_name
  FOR SELECT
  USING (auth.role() = 'authenticated');
```

### Allow users to read their own data

```sql
CREATE POLICY "Allow users to read own data"
  ON public.table_name
  FOR SELECT
  USING (auth.uid() = user_id);
```

### Allow admin users to do anything

```sql
CREATE POLICY "Allow admin full access"
  ON public.table_name
  FOR ALL
  USING (auth.uid() IN (SELECT id FROM public.users WHERE is_admin = true));
```

## Further Reading

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
