/**
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
