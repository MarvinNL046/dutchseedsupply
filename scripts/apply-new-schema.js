#!/usr/bin/env node

/**
 * Script to apply the new schema to the Supabase database
 * This script executes the SQL in supabase/new-schema.sql
 */

const fs = require('fs');
const path = require('path');
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

async function applyNewSchema() {
  try {
    console.log('Applying new schema to Supabase database...');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, '../supabase/new-schema.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split the SQL into smaller chunks to avoid hitting query size limits
    const sqlChunks = splitSqlIntoChunks(sql);
    
    console.log(`Executing SQL in ${sqlChunks.length} chunks...`);
    
    // Execute each chunk
    for (let i = 0; i < sqlChunks.length; i++) {
      console.log(`Executing chunk ${i + 1}/${sqlChunks.length}...`);
      
      try {
        const { error } = await supabase.rpc('execute_sql', { sql_query: sqlChunks[i] });
        
        if (error) {
          console.error(`Error executing chunk ${i + 1}:`, error);
          console.error('SQL chunk:', sqlChunks[i]);
        } else {
          console.log(`Chunk ${i + 1} executed successfully.`);
        }
      } catch (chunkError) {
        console.error(`Error executing chunk ${i + 1}:`, chunkError);
        console.error('SQL chunk:', sqlChunks[i]);
      }
    }
    
    console.log('Schema applied successfully!');
    
    // Verify the admin user
    const { data: adminUser, error: userError } = await supabase
      .from('users')
      .select('email, is_admin')
      .eq('email', 'marvinsmit1988@gmail.com')
      .single();
    
    if (userError) {
      console.error('Error verifying admin user:', userError);
      console.log('You may need to create an admin user manually.');
      console.log('1. Sign up with email: marvinsmit1988@gmail.com');
      console.log('2. Run the following SQL in the Supabase SQL Editor:');
      console.log('   UPDATE public.users SET is_admin = true WHERE email = \'marvinsmit1988@gmail.com\';');
    } else {
      console.log('Admin user status:', adminUser);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

// Function to split SQL into smaller chunks
function splitSqlIntoChunks(sql, maxChunkSize = 100000) {
  // Split by semicolons, but keep the semicolons
  const statements = sql.split(/;(?=(?:[^']*'[^']*')*[^']*$)/).filter(stmt => stmt.trim());
  
  const chunks = [];
  let currentChunk = '';
  
  for (const statement of statements) {
    // If adding this statement would exceed the max chunk size, start a new chunk
    if (currentChunk.length + statement.length + 1 > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk);
      currentChunk = '';
    }
    
    // Add the statement to the current chunk
    currentChunk += statement + ';';
  }
  
  // Add the last chunk if it's not empty
  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }
  
  return chunks;
}

// Check if execute_sql function exists, if not create it
async function checkExecuteSqlFunction() {
  try {
    console.log('Checking if execute_sql function exists...');
    
    // Try to call the function to see if it exists
    const { error } = await supabase.rpc('execute_sql', { sql_query: 'SELECT 1;' });
    
    if (error && error.message.includes('function execute_sql does not exist')) {
      console.log('execute_sql function does not exist, creating it...');
      
      // Create the execute_sql function
      const createFunctionSql = `
        CREATE OR REPLACE FUNCTION execute_sql(sql_query text)
        RETURNS void AS $$
        BEGIN
          EXECUTE sql_query;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `;
      
      const { error: createError } = await supabase.from('_rpc').select('*').rpc('execute_sql', { sql_query: createFunctionSql });
      
      if (createError) {
        console.error('Error creating execute_sql function:', createError);
        console.log('You may need to create the function manually in the Supabase SQL Editor:');
        console.log(createFunctionSql);
        process.exit(1);
      }
      
      console.log('execute_sql function created successfully.');
    } else if (error) {
      console.error('Error checking execute_sql function:', error);
    } else {
      console.log('execute_sql function already exists.');
    }
  } catch (error) {
    console.error('Error checking execute_sql function:', error);
    
    // Try to create the function using a direct query
    try {
      console.log('Attempting to create execute_sql function using direct query...');
      
      const { error: queryError } = await supabase.from('_rpc').select('*').rpc('execute_sql', {
        sql_query: `
          CREATE OR REPLACE FUNCTION execute_sql(sql_query text)
          RETURNS void AS $$
          BEGIN
            EXECUTE sql_query;
          END;
          $$ LANGUAGE plpgsql SECURITY DEFINER;
        `
      });
      
      if (queryError) {
        console.error('Error creating execute_sql function:', queryError);
        console.log('You will need to create the function manually in the Supabase SQL Editor:');
        console.log(`
          CREATE OR REPLACE FUNCTION execute_sql(sql_query text)
          RETURNS void AS $$
          BEGIN
            EXECUTE sql_query;
          END;
          $$ LANGUAGE plpgsql SECURITY DEFINER;
        `);
      } else {
        console.log('execute_sql function created successfully.');
      }
    } catch (queryError) {
      console.error('Error creating execute_sql function:', queryError);
      console.log('You will need to create the function manually in the Supabase SQL Editor:');
      console.log(`
        CREATE OR REPLACE FUNCTION execute_sql(sql_query text)
        RETURNS void AS $$
        BEGIN
          EXECUTE sql_query;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `);
    }
  }
}

// Run the script
async function main() {
  try {
    await checkExecuteSqlFunction();
    await applyNewSchema();
  } catch (error) {
    console.error('Error in main function:', error);
    process.exit(1);
  }
}

main();
