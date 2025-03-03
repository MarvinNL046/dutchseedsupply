#!/usr/bin/env node

/**
 * Script to apply admin policies to fix infinite recursion issue
 * This script executes the SQL migration in supabase/migrations/20250302_fix_admin_policies.sql
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

async function applyAdminPolicies() {
  try {
    console.log('Applying admin policies to fix infinite recursion issue...');
    
    // Read the SQL migration file
    const sqlFilePath = path.join(__dirname, '../supabase/migrations/20250302_fix_admin_policies.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Execute the SQL
    const { error } = await supabase.rpc('execute_sql', { sql_query: sql });
    
    if (error) {
      console.error('Error executing SQL:', error);
      process.exit(1);
    }
    
    console.log('Admin policies applied successfully!');
    
    // Verify the admin user
    const { data: adminUser, error: userError } = await supabase
      .from('users')
      .select('email, is_admin')
      .eq('email', 'marvinsmit1988@gmail.com')
      .single();
    
    if (userError) {
      console.error('Error verifying admin user:', userError);
    } else {
      console.log('Admin user status:', adminUser);
    }
    
    // Verify the policies
    const { data: policies, error: policiesError } = await supabase.rpc('execute_sql', {
      sql_query: "SELECT tablename, policyname, cmd, qual FROM pg_policies WHERE tablename = 'users';"
    });
    
    if (policiesError) {
      console.error('Error verifying policies:', policiesError);
    } else {
      console.log('Policies applied:');
      console.log(policies);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

applyAdminPolicies();
