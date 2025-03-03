#!/usr/bin/env node
/**
 * Script to clean the database for Dutch Seed Supply
 * This script executes the SQL in supabase/migrations/20250303_clean_database.sql
 * 
 * Usage:
 * 1. Make sure you have the .env.local file with the correct Supabase credentials
 * 2. Run: node scripts/clean-database.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase credentials in .env.local file');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are set');
  process.exit(1);
}

// Create Supabase client with admin privileges
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Read the SQL file
const sqlFilePath = path.join(__dirname, '..', 'supabase', 'migrations', '20250303_clean_database.sql');
let sqlContent;

try {
  sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
} catch (error) {
  console.error(`Error reading SQL file: ${error.message}`);
  process.exit(1);
}

// Split the SQL into individual statements
// Note: This is a simple split and may not work for all SQL statements
// For more complex SQL, consider using a proper SQL parser
const statements = sqlContent
  .replace(/--.*$/gm, '') // Remove comments
  .replace(/\\\i.*$/gm, '') // Remove \i commands (they're not supported in this context)
  .split(';')
  .map(stmt => stmt.trim())
  .filter(stmt => stmt.length > 0);

// Execute each SQL statement
async function executeStatements() {
  console.log('Starting database cleanup...');
  
  try {
    // First, delete order_items
    console.log('Deleting order_items...');
    const { error: orderItemsError } = await supabase.rpc('execute_sql', {
      sql_query: 'DELETE FROM order_items'
    });
    
    if (orderItemsError) throw orderItemsError;
    console.log('✓ Order items deleted successfully');
    
    // Then delete products
    console.log('Deleting products...');
    const { error: productsError } = await supabase.rpc('execute_sql', {
      sql_query: 'DELETE FROM products'
    });
    
    if (productsError) throw productsError;
    console.log('✓ Products deleted successfully');
    
    // Reset sequences
    console.log('Resetting sequences...');
    try {
      const { error: seqCheckError } = await supabase.rpc('execute_sql', {
        sql_query: `
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
        `
      });
      
      if (seqCheckError) throw seqCheckError;
      console.log('✓ Sequences reset successfully');
    } catch (seqError) {
      console.warn('Warning: Could not reset sequences:', seqError.message);
      console.log('Continuing with the rest of the cleanup...');
    }
    
    // Execute site_config SQL
    console.log('Setting up site_config table...');
    const siteConfigSqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250302_add_site_config.sql');
    const siteConfigSql = fs.readFileSync(siteConfigSqlPath, 'utf8');
    
    // Execute the site_config SQL in chunks if needed
    // This is a simplified approach - for complex SQL you might need to parse it properly
    const { error: siteConfigError } = await supabase.rpc('execute_sql', {
      sql_query: `
        -- Create site_config table if it doesn't exist
        CREATE TABLE IF NOT EXISTS site_config (
          id BIGINT PRIMARY KEY,
          config JSONB NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Delete existing config
        DELETE FROM site_config;
        
        -- Insert Dutch Seed Supply configuration
        INSERT INTO site_config (id, config)
        VALUES (1, '${JSON.stringify({
          name: "Dutch Seed Supply",
          domain: "dutchseedsupply.com",
          seo: {
            defaultTitle: "Dutch Seed Supply | Premium Cannabis Seeds from the Netherlands",
            defaultDescription: "High-quality cannabis seeds with authentic Dutch genetics. Feminized, autoflowering, and CBD-rich varieties for collectors and growers.",
            defaultKeywords: "cannabis seeds, marijuana seeds, weed seeds, Dutch genetics, feminized seeds, autoflower seeds, CBD seeds, Amsterdam seeds"
          },
          branding: {
            logo: "/images/logo/dutchseedsupply-transaparante-achtergrond.png",
            favicon: "/favicon-seeds.ico",
            colors: {
              primary: "#4D7C0F",
              primaryLight: "#84CC16",
              primaryDark: "#3F6212",
              secondary: "#F59E0B",
              secondaryLight: "#FBBF24",
              secondaryDark: "#D97706",
              accent: "#ECFCCB"
            },
            fonts: {
              heading: "Poppins, sans-serif",
              body: "Open Sans, sans-serif",
              accent: "Merriweather, serif"
            }
          },
          contact: {
            email: "support@dutchseedsupply.com",
            phone: "+31 20 123 4567",
            address: "Seed Street 42, 1012 AB Amsterdam, Netherlands"
          },
          notificationBars: {
            top: {
              message: "Free & Discreet Shipping on orders over €50",
              bgColor: "bg-lime-100",
              textColor: "text-lime-800"
            },
            bottom: {
              message: "Dutch Seed Supply - Premium cannabis seeds with authentic Dutch genetics",
              bgColor: "bg-primary-100",
              textColor: "text-primary-800"
            }
          }
        })}');
      `
    });
    
    if (siteConfigError) throw siteConfigError;
    console.log('✓ Site configuration set up successfully');
    
    console.log('✅ Database cleaned successfully for Dutch Seed Supply');
    
  } catch (error) {
    console.error('Error executing SQL:', error.message);
    process.exit(1);
  }
}

// Run the script
executeStatements();
