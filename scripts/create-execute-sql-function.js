#!/usr/bin/env node

/**
 * Script to create the execute_sql function in Supabase
 * This function is needed for the apply-new-schema.js script to work
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Check for required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing required environment variables');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are set in .env.local');
  process.exit(1);
}

// Create Supabase client with service key for admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createExecuteSqlFunction() {
  try {
    console.log('Creating execute_sql function in Supabase...');
    
    // SQL to create the execute_sql function
    const sql = `
      CREATE OR REPLACE FUNCTION execute_sql(sql_query text)
      RETURNS void AS $$
      BEGIN
        EXECUTE sql_query;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
    
    // Execute the SQL directly using a raw query
    const { error } = await supabase.rpc('execute_sql', { sql_query: sql });
    
    if (error) {
      // If the function doesn't exist yet, we need to create it using a different method
      if (error.message.includes('function execute_sql does not exist')) {
        console.log('execute_sql function does not exist, creating it using a direct query...');
        
        // Try to create the function using a direct query
        try {
          // We need to use the PostgreSQL REST API to execute a raw SQL query
          const { error: directError } = await supabase.from('_rpc').select('*').rpc('execute_sql', {
            sql_query: sql
          });
          
          if (directError) {
            console.error('Error creating execute_sql function:', directError);
            console.log('You will need to create the function manually in the Supabase SQL Editor:');
            console.log(sql);
            process.exit(1);
          } else {
            console.log('execute_sql function created successfully using direct query.');
          }
        } catch (directError) {
          console.error('Error creating execute_sql function:', directError);
          console.log('You will need to create the function manually in the Supabase SQL Editor:');
          console.log(sql);
          process.exit(1);
        }
      } else {
        console.error('Error creating execute_sql function:', error);
        console.log('You will need to create the function manually in the Supabase SQL Editor:');
        console.log(sql);
        process.exit(1);
      }
    } else {
      console.log('execute_sql function created or updated successfully.');
    }
    
    // Verify the function exists
    try {
      const { error: verifyError } = await supabase.rpc('execute_sql', { sql_query: 'SELECT 1;' });
      
      if (verifyError) {
        console.error('Error verifying execute_sql function:', verifyError);
        console.log('You may need to create the function manually in the Supabase SQL Editor:');
        console.log(sql);
      } else {
        console.log('execute_sql function verified and working correctly.');
      }
    } catch (verifyError) {
      console.error('Error verifying execute_sql function:', verifyError);
      console.log('You may need to create the function manually in the Supabase SQL Editor:');
      console.log(sql);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

// Run the script
createExecuteSqlFunction().catch(error => {
  console.error('Error in createExecuteSqlFunction:', error);
  process.exit(1);
});
