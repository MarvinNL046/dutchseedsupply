# Supabase Admin Authentication Fix

This document explains the issues with admin authentication in Supabase and how to fix them.

## The Problem

We've identified several issues that could be causing the admin authentication problems:

1. **Inconsistent admin check in RLS policies**: Some policies use `is_admin(auth.uid())` function while others use `(auth.uid() IN (SELECT users.id FROM users WHERE users.is_admin = true))`. This inconsistency can lead to unexpected behavior and errors.

2. **Missing RLS on some tables**: Some tables might not have RLS enabled, which could cause security issues.

3. **Missing RLS policies on some tables**: Some tables might have RLS enabled but no policies, which would block all access by default.

## The Solution

We've created a script that will help you fix these issues:

```bash
node scripts/fix-supabase-admin-auth.js
```

This script will guide you through the following steps:

1. **Standardize the is_admin function**: This ensures that all RLS policies use the same function to check if a user is an admin.

2. **Update all admin policies**: This updates all RLS policies to use the standardized is_admin function.

3. **Check for missing RLS**: This identifies tables that don't have RLS enabled or don't have any RLS policies, and generates SQL statements to fix them.

4. **Restart the Supabase database**: This ensures that all changes take effect.

5. **Test admin authentication**: This verifies that the admin authentication issues have been fixed.

## Manual Fix

If you prefer to fix the issues manually, you can execute the following SQL files in the Supabase dashboard:

1. `supabase/standardize-is-admin-function.sql`: This standardizes the is_admin function.

2. `supabase/update-all-admin-policies.sql`: This updates all admin policies to use the standardized function.

3. `supabase/check-missing-rls.sql`: This checks for missing RLS on tables.

## Troubleshooting

If you still encounter issues after running the script or executing the SQL files:

1. **Check the browser console for error messages**: Open the browser developer tools (F12), go to the Console tab, and look for any error messages related to Supabase or authentication.

2. **Check the Supabase logs**: Go to the Supabase dashboard, click on "Logs", and look for any error messages related to RLS or authentication.

3. **Try clearing your browser cache and cookies**: This can help resolve issues with stale authentication tokens.

4. **Try accessing the admin dashboard in an incognito/private window**: This can help rule out issues with browser extensions or cached data.

## Prevention

To prevent similar issues in the future:

1. **Use the is_admin function consistently**: Always use the is_admin function to check if a user is an admin in RLS policies.

2. **Enable RLS on all tables**: All tables in your database should have RLS enabled.

3. **Create specific policies for each table**: Different tables may have different access requirements.

4. **Test your policies**: Make sure your policies work as expected by testing them with different users.

5. **Keep your policies simple**: Complex policies can be hard to understand and maintain.

## Further Reading

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
