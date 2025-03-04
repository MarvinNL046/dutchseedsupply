#!/usr/bin/env node

/**
 * Script to make a user an admin
 * This script updates the is_admin field for a specific user
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Check for required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const adminEmail = process.env.ADMIN_EMAILS?.split(',')[0] || 'marvinsmit1988@gmail.com';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing required environment variables');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

// Create Supabase client with service key for admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function makeUserAdmin() {
  try {
    console.log(`Making user ${adminEmail} an admin...`);
    
    // First, check if the user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, is_admin')
      .eq('email', adminEmail)
      .single();
    
    if (userError) {
      console.error('Error finding user:', userError);
      console.log(`User with email ${adminEmail} not found. Make sure the user has signed up.`);
      process.exit(1);
    }
    
    if (user.is_admin) {
      console.log(`User ${adminEmail} is already an admin.`);
      process.exit(0);
    }
    
    // Update the user's is_admin field
    const { error: updateError } = await supabase
      .from('users')
      .update({ is_admin: true })
      .eq('email', adminEmail);
    
    if (updateError) {
      console.error('Error updating user:', updateError);
      process.exit(1);
    }
    
    console.log(`User ${adminEmail} is now an admin.`);
    
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

// Run the script
makeUserAdmin().catch(error => {
  console.error('Error in makeUserAdmin:', error);
  process.exit(1);
});
