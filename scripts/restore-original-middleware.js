/**
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
