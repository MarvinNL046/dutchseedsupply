#!/usr/bin/env node
/**
 * Script to create the execute_sql function in Supabase
 * This function is required for the clean-database.js script to work
 * 
 * Usage:
 * 1. Make sure you have the .env.local file with the correct Supabase credentials
 * 2. Run: node scripts/create-execute-sql-function.js
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

// SQL to create the execute_sql function
const createFunctionSql = `
-- Create a function to execute arbitrary SQL
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
`;

async function createFunction() {
  console.log('Creating execute_sql function in Supabase...');
  
  try {
    // Use the REST API to execute SQL directly
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        query: createFunctionSql
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to execute SQL: ${errorText}`);
    }
    
    console.log('✅ execute_sql function created successfully');
    
    // Verify the function works
    console.log('Verifying function...');
    const { data, error } = await supabase.rpc('execute_sql', {
      sql_query: 'SELECT 1'
    });
    
    if (error) {
      throw new Error(`Function verification failed: ${error.message}`);
    }
    
    console.log('✅ Function verified and working correctly');
    
  } catch (error) {
    console.error('Error creating function:', error.message);
    
    // Alternative approach using direct SQL API if available
    console.log('Trying alternative approach...');
    try {
      const { data, error } = await supabase.from('_sql').select('*').execute(createFunctionSql);
      
      if (error) {
        throw new Error(`Alternative approach failed: ${error.message}`);
      }
      
      console.log('✅ execute_sql function created successfully using alternative approach');
      
    } catch (altError) {
      console.error('Alternative approach failed:', altError.message);
      console.log('\nPlease create the function manually using the Supabase dashboard:');
      console.log('1. Go to your Supabase project dashboard');
      console.log('2. Navigate to the SQL Editor');
      console.log('3. Copy and paste the following SQL:');
      console.log('\n' + createFunctionSql);
      process.exit(1);
    }
  }
}

// Run the script
createFunction();
