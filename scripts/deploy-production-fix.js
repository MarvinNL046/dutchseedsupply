/**
 * This script applies the production middleware fix and deploys it to the live website
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Paths
const middlewarePath = path.join(process.cwd(), 'middleware.ts');
const productionMiddlewarePath = path.join(process.cwd(), 'middleware.production.ts');
const backupMiddlewarePath = path.join(process.cwd(), 'middleware.backup.ts');

// Check if production middleware exists
if (!fs.existsSync(productionMiddlewarePath)) {
  console.error('Production middleware file not found:', productionMiddlewarePath);
  process.exit(1);
}

// Backup current middleware if not already backed up
if (!fs.existsSync(backupMiddlewarePath) && fs.existsSync(middlewarePath)) {
  console.log('Backing up current middleware to:', backupMiddlewarePath);
  fs.copyFileSync(middlewarePath, backupMiddlewarePath);
}

// Apply production middleware
console.log('Applying production middleware...');
fs.copyFileSync(productionMiddlewarePath, middlewarePath);
console.log('Production middleware applied successfully!');

// Commit changes
try {
  console.log('Committing changes...');
  execSync('git add middleware.ts');
  execSync('git commit -m "Apply production middleware fix for infinite loop issue"');
  console.log('Changes committed successfully!');
} catch (error) {
  console.error('Error committing changes:', error.message);
  console.log('Continuing with deployment...');
}

// Deploy to production
console.log('Deploying to production...');
try {
  execSync('vercel --prod', { stdio: 'inherit' });
  console.log('Deployment successful!');
} catch (error) {
  console.error('Error deploying to production:', error.message);
  process.exit(1);
}

console.log('\nProduction fix has been deployed successfully!');
console.log('The fix prevents infinite redirect loops by checking if the request is coming from the login page.');
console.log('If you need to restore the original middleware, run:');
console.log('node scripts/restore-middleware.js');

// Create restore script if it doesn't exist
const restoreScriptPath = path.join(process.cwd(), 'scripts', 'restore-middleware.js');
if (!fs.existsSync(restoreScriptPath)) {
  const restoreScript = `/**
 * This script restores the original middleware from backup
 */

const fs = require('fs');
const path = require('path');

// Paths
const middlewarePath = path.join(process.cwd(), 'middleware.ts');
const backupMiddlewarePath = path.join(process.cwd(), 'middleware.backup.ts');

// Check if backup middleware exists
if (!fs.existsSync(backupMiddlewarePath)) {
  console.error('Backup middleware file not found:', backupMiddlewarePath);
  process.exit(1);
}

// Restore original middleware
console.log('Restoring original middleware...');
fs.copyFileSync(backupMiddlewarePath, middlewarePath);

console.log('Original middleware restored successfully!');
console.log('If you want to deploy these changes to production, run:');
console.log('vercel --prod');
`;

  // Write restore script
  fs.writeFileSync(restoreScriptPath, restoreScript);
  console.log('Restore script created at:', restoreScriptPath);
}
