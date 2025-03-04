# New Database Setup Guide

This guide explains how to set up the new Supabase database for Dutch Seed Supply.

## Prerequisites

- Node.js installed
- Supabase account with a new project created
- Supabase URL and API keys

## Step 1: Update Environment Variables

Update the `.env.local` file with your new Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://yuyoureweuzdsgqmzqsu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_EMAILS=marvinsmit1988@gmail.com
```

## Step 2: Run the Setup Script

Run the following command to set up the new database:

```bash
node scripts/setup-new-database.js
```

This script will:

1. Create the `execute_sql` function in your Supabase database
2. Apply the new schema to your Supabase database
3. Clean up old SQL files and scripts

Alternatively, you can run the scripts individually:

```bash
node scripts/create-execute-sql-function.js
node scripts/apply-new-schema.js
node scripts/cleanup-old-files.js
```

## Step 3: Create an Admin User

If the admin user was not created automatically, you need to:

1. Sign up with the email address specified in the `ADMIN_EMAILS` environment variable
2. Run the following SQL in the Supabase SQL Editor:

```sql
UPDATE public.users SET is_admin = true WHERE email = 'marvinsmit1988@gmail.com';
```

## Database Schema

The new database schema includes the following tables:

- `users`: User accounts and profiles
- `categories`: Product categories
- `products`: Product information
- `orders`: Customer orders
- `order_items`: Items in orders
- `reviews`: Product reviews
- `feedback`: User feedback
- `blog_categories`: Blog post categories
- `blog_posts`: Blog posts
- `blog_tags`: Tags for blog posts
- `blog_posts_tags`: Junction table for blog posts and tags
- `blog_comments`: Comments on blog posts
- `site_config`: Site configuration for whitelabel setup

## Row Level Security (RLS)

All tables have Row Level Security enabled with the following policies:

- Public data (like products and categories) is viewable by everyone
- User data (like profiles and orders) is only viewable by the user who owns it
- Admin users can view and edit all data

The `is_admin` function is used consistently across all RLS policies to check if a user is an admin.

## Adding New Tables

If you need to add new tables to the database:

1. Add the table definition to `supabase/new-schema.sql`
2. Enable Row Level Security for the table
3. Create appropriate RLS policies using the `is_admin` function
4. Run the `apply-new-schema.js` script again

## Troubleshooting

### Error: function execute_sql does not exist

If you get this error, you need to create the `execute_sql` function manually in the Supabase SQL Editor:

```sql
CREATE OR REPLACE FUNCTION execute_sql(sql_query text)
RETURNS void AS $$
BEGIN
  EXECUTE sql_query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Error: relation "users" does not exist

This error can occur if the tables are created in the wrong order. Try running the script again, or manually create the tables in the correct order.

### Error: permission denied for schema public

This error can occur if the service role key doesn't have the necessary permissions. Make sure you're using the correct service role key.
