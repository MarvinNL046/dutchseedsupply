# Database Cleanup for Dutch Seed Supply

This document explains how to clean up the database to remove existing products and order items, allowing you to start fresh with cannabis seeds products.

## The Problem

When trying to delete products, you may encounter a foreign key constraint error:

```
update or delete on table "products" violates foreign key constraint "order_items_product_id_fkey" on table "order_items"
```

This happens because there are order items in the database that reference these products. You need to delete the order items first before you can delete the products.

## Solution

We've created scripts to help you clean up the database:

1. SQL migration files:
   - `supabase/migrations/20250303_create_execute_sql_function.sql`: Creates a function to execute arbitrary SQL
   - `supabase/migrations/20250303_clean_database.sql`: Deletes order items and products, resets sequences

2. JavaScript script:
   - `scripts/clean-database.js`: Executes the SQL statements using the Supabase client

## How to Use

### Option 1: Using the Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `supabase/migrations/20250303_create_execute_sql_function.sql` and execute it
4. Copy the contents of `supabase/migrations/20250303_clean_database.sql` and execute it

### Option 2: Using the JavaScript Script

1. Make sure your `.env.local` file contains the correct Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_KEY=your-supabase-service-key
   ```

2. Run the script:
   ```bash
   node scripts/clean-database.js
   ```

### Option 3: Using the Supabase CLI

1. Install the Supabase CLI if you haven't already:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. Execute the SQL files:
   ```bash
   supabase db execute --file supabase/migrations/20250303_create_execute_sql_function.sql
   supabase db execute --file supabase/migrations/20250303_clean_database.sql
   ```

## After Cleanup

After cleaning up the database, you can:

1. Add new cannabis seed products through the admin interface
2. Set up product categories for different types of seeds (Feminized, Autoflowering, CBD-rich, etc.)
3. Make sure the site configuration is correctly set up with the Dutch Seed Supply branding

## Troubleshooting

If you encounter any issues:

1. Check that you have the necessary permissions to execute the SQL statements
2. Verify that the `execute_sql` function was created successfully
3. Check the Supabase logs for any error messages
4. Make sure your `.env.local` file contains the correct credentials

For more help, refer to the Supabase documentation or contact support.
