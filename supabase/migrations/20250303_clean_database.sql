-- Script to clean up the database for Dutch Seed Supply
-- This script removes order_items and products to allow for a fresh start with cannabis seeds

-- First, delete all order_items to remove foreign key constraints
DELETE FROM order_items;

-- Then, delete all products
DELETE FROM products;

-- Check if sequences exist before resetting them
DO $$
BEGIN
    -- Reset the sequence for products table if it exists
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'products_id_seq') THEN
        ALTER SEQUENCE products_id_seq RESTART WITH 1;
    END IF;
    
    -- Reset the sequence for order_items table if it exists
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'order_items_id_seq') THEN
        ALTER SEQUENCE order_items_id_seq RESTART WITH 1;
    END IF;
    
    -- Alternative sequence names to check (sometimes they use table_column_seq naming pattern)
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'products_id_seq') THEN
        ALTER SEQUENCE products_id_seq RESTART WITH 1;
    ELSIF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'product_id_seq') THEN
        ALTER SEQUENCE product_id_seq RESTART WITH 1;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'order_items_id_seq') THEN
        ALTER SEQUENCE order_items_id_seq RESTART WITH 1;
    ELSIF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'order_item_id_seq') THEN
        ALTER SEQUENCE order_item_id_seq RESTART WITH 1;
    END IF;
END $$;

-- Optionally, you can also clean up other related tables if needed
-- For example, if you have product categories or tags:
-- DELETE FROM product_categories;
-- ALTER SEQUENCE product_categories_id_seq RESTART WITH 1;

-- If you have product images:
-- DELETE FROM product_images;
-- ALTER SEQUENCE product_images_id_seq RESTART WITH 1;

-- If you want to keep some orders but just remove the items:
-- UPDATE orders SET total_amount = 0 WHERE id IN (SELECT DISTINCT order_id FROM order_items);

-- Add the site_config table if it doesn't exist (from the previous migration)
\i 'supabase/migrations/20250302_add_site_config.sql'

-- Confirm completion
SELECT 'Database cleaned successfully for Dutch Seed Supply' as result;
