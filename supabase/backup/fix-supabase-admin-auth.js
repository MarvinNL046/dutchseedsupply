#!/usr/bin/env node

/**
 * This script fixes Supabase admin authentication issues by:
 * 1. Standardizing the is_admin function
 * 2. Updating all admin policies to use the standardized function
 * 3. Checking for missing RLS on tables
 * 4. Applying the fixes to the Supabase database
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Paths to SQL files
const fixIsAdminFunctionPath = path.join(__dirname, '../supabase/fix-is-admin-function.sql');
const fixAdminPoliciesPath = path.join(__dirname, '../supabase/fix-admin-policies.sql');
const fixMissingRlsPath = path.join(__dirname, '../supabase/fix-missing-rls.sql');

// Function to prompt for confirmation
function confirm(message) {
  return new Promise((resolve) => {
    rl.question(`${message} (y/n): `, (answer) => {
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

// Function to execute SQL file using Supabase dashboard
async function executeSqlFile(filePath, description) {
  console.log(`\n=== ${description} ===`);
  console.log(`Please execute the SQL file: ${filePath}`);
  console.log('Instructions:');
  console.log('1. Go to the Supabase dashboard: https://supabase.com/dashboard/project/tkihdbdnowkpazahzfyp');
  console.log('2. Click on "SQL Editor"');
  console.log('3. Create a new query');
  console.log('4. Copy and paste the contents of the SQL file');
  console.log('5. Click "Run"');
  
  const sql = fs.readFileSync(filePath, 'utf8');
  console.log('\nSQL Content:');
  console.log('----------------------------------------');
  console.log(sql.substring(0, 500) + (sql.length > 500 ? '...' : ''));
  console.log('----------------------------------------');
  
  const confirmed = await confirm('Have you executed this SQL file?');
  return confirmed;
}

// Main function
async function main() {
  console.log('=== Supabase Admin Authentication Fix ===');
  console.log('This script will help you fix admin authentication issues in your Supabase database.');
  
  // Step 1: Fix is_admin function
  const step1 = await executeSqlFile(
    fixIsAdminFunctionPath,
    'Step 1: Fix is_admin function'
  );
  
  if (!step1) {
    console.log('Aborting. Please run the script again when you are ready to execute the SQL file.');
    rl.close();
    return;
  }
  
  // Step 2: Fix admin policies
  const step2 = await executeSqlFile(
    fixAdminPoliciesPath,
    'Step 2: Fix admin policies'
  );
  
  if (!step2) {
    console.log('Aborting. Please run the script again when you are ready to execute the SQL file.');
    rl.close();
    return;
  }
  
  // Step 3: Fix missing RLS
  const step3 = await executeSqlFile(
    fixMissingRlsPath,
    'Step 3: Fix missing RLS'
  );
  
  if (!step3) {
    console.log('Aborting. Please run the script again when you are ready to execute the SQL file.');
    rl.close();
    return;
  }
  
  // Step 4: Restart Supabase database
  console.log('\n=== Step 4: Restart Supabase database ===');
  console.log('Instructions:');
  console.log('1. Go to the Supabase dashboard: https://supabase.com/dashboard/project/tkihdbdnowkpazahzfyp');
  console.log('2. Click on "Project Settings"');
  console.log('3. Click on "Database"');
  console.log('4. Click on "Restart"');
  
  const step4 = await confirm('Have you restarted the Supabase database?');
  
  if (!step4) {
    console.log('Aborting. Please run the script again when you are ready to restart the database.');
    rl.close();
    return;
  }
  
  // Step 5: Test admin authentication
  console.log('\n=== Step 5: Test admin authentication ===');
  console.log('Instructions:');
  console.log('1. Try accessing the admin dashboard');
  console.log('2. If you still encounter issues, check the browser console for error messages');
  
  const step5 = await confirm('Were you able to access the admin dashboard?');
  
  if (step5) {
    console.log('\n=== Success! ===');
    console.log('The admin authentication issues have been fixed.');
  } else {
    console.log('\n=== Troubleshooting ===');
    console.log('1. Check the browser console for error messages');
    console.log('2. Check the Supabase logs for any error messages');
    console.log('3. Try clearing your browser cache and cookies');
    console.log('4. Try accessing the admin dashboard in an incognito/private window');
  }
  
  rl.close();
}

// Run the main function
main().catch((error) => {
  console.error('Error:', error);
  rl.close();
});
