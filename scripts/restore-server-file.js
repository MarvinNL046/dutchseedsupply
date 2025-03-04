/**
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
