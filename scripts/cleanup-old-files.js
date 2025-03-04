#!/usr/bin/env node

/**
 * Script to clean up old SQL files and scripts that are no longer needed
 * This script will move the old files to a backup directory
 */

const fs = require('fs');
const path = require('path');

// Create a backup directory
const backupDir = path.join(__dirname, '../supabase/backup');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Files to move to backup
const filesToBackup = [
  // Old SQL files
  '../supabase/migrations/20250228_update_orders_table.sql',
  '../supabase/migrations/20250301_185733_add_blog_tables.sql',
  '../supabase/migrations/20250301_add_translations_fields.sql',
  '../supabase/migrations/20250302_add_admin_users_policy.sql',
  '../supabase/migrations/20250302_add_shipping_address_column_simplified.sql',
  '../supabase/migrations/20250302_add_shipping_address_column.sql',
  '../supabase/migrations/20250302_add_shipping_info_column.sql',
  '../supabase/migrations/20250302_add_site_config.sql',
  '../supabase/migrations/20250302_allow_guest_orders.sql',
  '../supabase/fix-is-admin-function.sql',
  '../supabase/fix-admin-policies.sql',
  '../supabase/fix-missing-rls.sql',
  '../supabase/enable-rls-site-config.sql',
  '../supabase/check-rls-all-tables.sql',
  '../supabase/standardize-is-admin-function.sql',
  '../supabase/update-all-admin-policies.sql',
  '../supabase/check-missing-rls.sql',
  '../supabase/enable-rls-all-tables.sql',
  '../supabase/RLS-FIXES-README.md',
  '../supabase/RLS-README.md',
  
  // Old scripts
  '../scripts/fix-supabase-admin-auth.js',
  '../scripts/apply-debug-admin-middleware.js',
  '../scripts/apply-debug-middleware.js',
  '../scripts/apply-fixed-middleware.js',
  '../scripts/enable-debug-mode-in-production.js',
  '../scripts/deploy-production-fix.js',
];

// Backup the files
console.log('Backing up old files...');
let backupCount = 0;
let errorCount = 0;

for (const file of filesToBackup) {
  const filePath = path.join(__dirname, file);
  const fileName = path.basename(filePath);
  const backupPath = path.join(backupDir, fileName);
  
  try {
    if (fs.existsSync(filePath)) {
      // Copy the file to the backup directory
      fs.copyFileSync(filePath, backupPath);
      console.log(`Backed up: ${fileName}`);
      
      // Delete the original file
      fs.unlinkSync(filePath);
      console.log(`Deleted: ${fileName}`);
      
      backupCount++;
    } else {
      console.log(`File not found, skipping: ${fileName}`);
    }
  } catch (error) {
    console.error(`Error processing ${fileName}:`, error.message);
    errorCount++;
  }
}

console.log(`Backup complete. ${backupCount} files backed up and deleted.`);
if (errorCount > 0) {
  console.log(`${errorCount} errors occurred. Check the logs for details.`);
}

// Create a README file in the backup directory
const readmeContent = `# Backup of Old SQL Files and Scripts

This directory contains backup copies of old SQL files and scripts that were replaced by the new schema.

These files were backed up on ${new Date().toISOString()} when the new database schema was implemented.

You can safely delete this directory if you no longer need these files.
`;

fs.writeFileSync(path.join(backupDir, 'README.md'), readmeContent);
console.log('Created README.md in the backup directory.');
