/**
 * This script modifies the utils/supabase/server.ts file to enable DEBUG_MODE in production
 * This is useful for debugging admin authentication issues in production
 */

const fs = require('fs');
const path = require('path');

// Path to the server.ts file
const serverFilePath = path.join(__dirname, '../utils/supabase/server.ts');

// Backup the original file
const backupFilePath = path.join(__dirname, '../utils/supabase/server.backup.ts');
console.log(`Backing up ${serverFilePath} to ${backupFilePath}`);
fs.copyFileSync(serverFilePath, backupFilePath);

// Read the file content
let content = fs.readFileSync(serverFilePath, 'utf8');

// Replace the DEBUG_MODE constant
const originalDebugMode = "const DEBUG_MODE = process.env.NODE_ENV === 'development';";
const newDebugMode = "const DEBUG_MODE = true; // TEMPORARY: Enabled for production debugging";

if (content.includes(originalDebugMode)) {
  content = content.replace(originalDebugMode, newDebugMode);
  
  // Write the modified content back to the file
  fs.writeFileSync(serverFilePath, content);
  console.log('DEBUG_MODE has been enabled for production in utils/supabase/server.ts');
  console.log('Remember to revert this change after debugging by running:');
  console.log('node scripts/restore-server-file.js');
  
  // Create a restore script
  const restoreScript = `/**
 * This script restores the original utils/supabase/server.ts file
 */

const fs = require('fs');
const path = require('path');

// Path to the backup file
const backupFilePath = path.join(__dirname, '../utils/supabase/server.backup.ts');
// Path to the server.ts file
const serverFilePath = path.join(__dirname, '../utils/supabase/server.ts');

// Check if backup file exists
if (fs.existsSync(backupFilePath)) {
  // Restore the original file
  fs.copyFileSync(backupFilePath, serverFilePath);
  console.log('Original utils/supabase/server.ts file has been restored');
  
  // Delete the backup file
  fs.unlinkSync(backupFilePath);
  console.log('Backup file has been deleted');
} else {
  console.error('Backup file not found. Cannot restore the original file.');
}
`;
  
  // Write the restore script
  const restoreScriptPath = path.join(__dirname, 'restore-server-file.js');
  fs.writeFileSync(restoreScriptPath, restoreScript);
  console.log(`Restore script has been created at ${restoreScriptPath}`);
} else {
  console.error('Could not find the DEBUG_MODE constant in the file. No changes were made.');
}
