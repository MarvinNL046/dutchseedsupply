/**
 * This script replaces the current middleware.ts with the debug version
 * to help diagnose and fix the infinite loop issue with admin authentication.
 */

const fs = require('fs');
const path = require('path');

// Paths
const middlewarePath = path.join(process.cwd(), 'middleware.ts');
const debugMiddlewarePath = path.join(process.cwd(), 'middleware.debug.ts');
const backupMiddlewarePath = path.join(process.cwd(), 'middleware.original.ts');

// Check if debug middleware exists
if (!fs.existsSync(debugMiddlewarePath)) {
  console.error('Debug middleware file not found:', debugMiddlewarePath);
  process.exit(1);
}

// Backup original middleware if not already backed up
if (!fs.existsSync(backupMiddlewarePath) && fs.existsSync(middlewarePath)) {
  console.log('Backing up original middleware to:', backupMiddlewarePath);
  fs.copyFileSync(middlewarePath, backupMiddlewarePath);
}

// Copy debug middleware to middleware.ts
console.log('Applying debug middleware...');
fs.copyFileSync(debugMiddlewarePath, middlewarePath);

console.log('Debug middleware applied successfully!');
console.log('\nThis debug middleware:');
console.log('1. Disables redirects for admin routes to break the infinite loop');
console.log('2. Adds detailed debug headers to help diagnose authentication issues');
console.log('3. Allows access to debug pages without authentication');
console.log('\nTo restore the original middleware, run:');
console.log('node scripts/restore-original-middleware.js');

// Create restore script if it doesn't exist
const restoreScriptPath = path.join(process.cwd(), 'scripts', 'restore-original-middleware.js');
if (!fs.existsSync(restoreScriptPath)) {
  const restoreScript = `/**
 * This script restores the original middleware.ts from the backup
 */

const fs = require('fs');
const path = require('path');

// Paths
const middlewarePath = path.join(process.cwd(), 'middleware.ts');
const backupMiddlewarePath = path.join(process.cwd(), 'middleware.original.ts');

// Check if backup middleware exists
if (!fs.existsSync(backupMiddlewarePath)) {
  console.error('Original middleware backup not found:', backupMiddlewarePath);
  process.exit(1);
}

// Restore original middleware
console.log('Restoring original middleware...');
fs.copyFileSync(backupMiddlewarePath, middlewarePath);

console.log('Original middleware restored successfully!');
`;

  // Ensure scripts directory exists
  const scriptsDir = path.join(process.cwd(), 'scripts');
  if (!fs.existsSync(scriptsDir)) {
    fs.mkdirSync(scriptsDir, { recursive: true });
  }

  // Write restore script
  fs.writeFileSync(restoreScriptPath, restoreScript);
  console.log('Restore script created at:', restoreScriptPath);
}
