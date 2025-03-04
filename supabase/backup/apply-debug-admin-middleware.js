/**
 * This script applies the debug admin middleware that allows access to admin pages
 * This is for debugging purposes only and should not be used in production
 */

const fs = require('fs');
const path = require('path');

// Paths
const middlewarePath = path.join(process.cwd(), 'middleware.ts');
const debugAdminMiddlewarePath = path.join(process.cwd(), 'middleware.debug-admin.ts');
const backupMiddlewarePath = path.join(process.cwd(), 'middleware.current.ts');

// Check if debug admin middleware exists
if (!fs.existsSync(debugAdminMiddlewarePath)) {
  console.error('Debug admin middleware file not found:', debugAdminMiddlewarePath);
  process.exit(1);
}

// Backup current middleware if not already backed up
if (!fs.existsSync(backupMiddlewarePath) && fs.existsSync(middlewarePath)) {
  console.log('Backing up current middleware to:', backupMiddlewarePath);
  fs.copyFileSync(middlewarePath, backupMiddlewarePath);
}

// Apply debug admin middleware
console.log('Applying debug admin middleware...');
fs.copyFileSync(debugAdminMiddlewarePath, middlewarePath);
console.log('Debug admin middleware applied successfully!');

console.log('\nThis debug admin middleware:');
console.log('1. Allows access to all admin pages without authentication');
console.log('2. Maintains session handling for other pages');
console.log('3. Should only be used for debugging purposes');
console.log('\nTo restore the previous middleware, run:');
console.log('node scripts/restore-current-middleware.js');

// Create restore script if it doesn't exist
const restoreScriptPath = path.join(process.cwd(), 'scripts', 'restore-current-middleware.js');
if (!fs.existsSync(restoreScriptPath)) {
  const restoreScript = `/**
 * This script restores the previous middleware from backup
 */

const fs = require('fs');
const path = require('path');

// Paths
const middlewarePath = path.join(process.cwd(), 'middleware.ts');
const backupMiddlewarePath = path.join(process.cwd(), 'middleware.current.ts');

// Check if backup middleware exists
if (!fs.existsSync(backupMiddlewarePath)) {
  console.error('Backup middleware file not found:', backupMiddlewarePath);
  process.exit(1);
}

// Restore previous middleware
console.log('Restoring previous middleware...');
fs.copyFileSync(backupMiddlewarePath, middlewarePath);

console.log('Previous middleware restored successfully!');
console.log('If you want to deploy these changes to production, run:');
console.log('vercel --prod');
`;

  // Write restore script
  fs.writeFileSync(restoreScriptPath, restoreScript);
  console.log('Restore script created at:', restoreScriptPath);
}
