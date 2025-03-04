# RLS Fixes for Supabase

This directory contains SQL scripts to help fix Row Level Security (RLS) issues in your Supabase database, specifically the inconsistency in how admin access is checked across different RLS policies.

## The Problem

We've identified that there are inconsistencies in how admin access is checked across different RLS policies in your database:

1. Some policies use `is_admin(auth.uid())` function
2. Others use `(auth.uid() IN (SELECT users.id FROM users WHERE users.is_admin = true))`

This inconsistency can lead to unexpected behavior and errors, such as the 500 Internal Server Error you're experiencing when trying to access the admin dashboard.

## The Solution

We've created several SQL scripts to standardize how admin access is checked across all RLS policies:

### 1. `standardize-is-admin-function.sql`

This script:
- Checks if the `is_admin` function exists
- Creates or replaces the `is_admin` function with a standardized implementation
- Tests the function with known admin users
- Updates the RLS policies for the `users` and `site_config` tables to use the standardized function

### 2. `update-all-admin-policies.sql`

This script:
- Identifies all RLS policies that use the inconsistent admin check
- Updates these policies to use the standardized `is_admin` function
- Verifies that all policies have been updated

### 3. `check-missing-rls.sql`

This script:
- Checks for tables that don't have RLS enabled
- Generates SQL statements to enable RLS on those tables
- Checks for tables that don't have any RLS policies
- Generates SQL statements to create basic RLS policies for those tables

## How to Use These Scripts

1. **First, run the `standardize-is-admin-function.sql` script**:
   - Go to the Supabase dashboard
   - Click on "SQL Editor"
   - Create a new query
   - Copy and paste the contents of `standardize-is-admin-function.sql`
   - Click "Run"

2. **Then, run the `update-all-admin-policies.sql` script**:
   - Create a new query
   - Copy and paste the contents of `update-all-admin-policies.sql`
   - Click "Run"

3. **Finally, run the `check-missing-rls.sql` script**:
   - Create a new query
   - Copy and paste the contents of `check-missing-rls.sql`
   - Click "Run"
   - If there are any tables without RLS enabled or without RLS policies, use the generated SQL statements to fix them

4. **Restart the Supabase database**:
   - Go to the Supabase dashboard
   - Click on "Project Settings"
   - Click on "Database"
   - Click on "Restart"

5. **Test the admin dashboard**:
   - Try accessing the admin dashboard again
   - If you still encounter issues, check the browser console for error messages

## Expected Results

After running these scripts and restarting the database, you should see:

1. A standardized `is_admin` function that consistently checks if a user is an admin
2. All RLS policies updated to use this standardized function
3. All tables with RLS enabled and appropriate policies

This should resolve the 500 Internal Server Error you're experiencing when trying to access the admin dashboard.

## Troubleshooting

If you still encounter issues after running these scripts:

1. **Check the browser console for error messages**:
   - Open the browser developer tools (F12)
   - Go to the Console tab
   - Look for any error messages related to Supabase or authentication

2. **Check the Supabase logs**:
   - Go to the Supabase dashboard
   - Click on "Logs"
   - Look for any error messages related to RLS or authentication

3. **Try clearing your browser cache and cookies**:
   - This can help resolve issues with stale authentication tokens

4. **Try accessing the admin dashboard in an incognito/private window**:
   - This can help rule out issues with browser extensions or cached data
