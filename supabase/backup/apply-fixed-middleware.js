/**
 * This script replaces the current middleware.ts with the fixed version
 * to fix the infinite loop issue with admin authentication.
 */

const fs = require('fs');
const path = require('path');

// Paths
const middlewarePath = path.join(process.cwd(), 'middleware.ts');
const fixedMiddlewarePath = path.join(process.cwd(), 'middleware.fixed.ts');
const backupMiddlewarePath = path.join(process.cwd(), 'middleware.original.ts');

// Check if fixed middleware exists
if (!fs.existsSync(fixedMiddlewarePath)) {
  console.error('Fixed middleware file not found:', fixedMiddlewarePath);
  process.exit(1);
}

// Backup original middleware if not already backed up
if (!fs.existsSync(backupMiddlewarePath) && fs.existsSync(middlewarePath)) {
  console.log('Backing up original middleware to:', backupMiddlewarePath);
  fs.copyFileSync(middlewarePath, backupMiddlewarePath);
}

// Copy fixed middleware to middleware.ts
console.log('Applying fixed middleware...');
fs.copyFileSync(fixedMiddlewarePath, middlewarePath);

console.log('Fixed middleware applied successfully!');
console.log('\nThis fixed middleware:');
console.log('1. Checks if the request is coming from the login page to prevent infinite loops');
console.log('2. Allows access to admin pages if coming from the login page');
console.log('3. Adds detailed logging to help diagnose authentication issues');
console.log('\nTo restore the original middleware, run:');
console.log('node scripts/restore-original-middleware.js');
