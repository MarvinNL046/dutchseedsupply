#!/usr/bin/env node

/**
 * Script to remove backup files before building
 * This script is run before the build process to avoid TypeScript errors
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Directories to clean up
const backupDirs = [
  path.join(__dirname, '../middleware/backup'),
  path.join(__dirname, '../supabase/backup'),
];

// Function to check if a directory exists
function directoryExists(dirPath) {
  try {
    return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
  } catch (error) {
    return false;
  }
}

// Function to temporarily move a directory
function moveDirectory(source, destination) {
  if (directoryExists(source)) {
    console.log(`Moving ${source} to ${destination}`);
    
    // Create the destination directory if it doesn't exist
    if (!directoryExists(path.dirname(destination))) {
      fs.mkdirSync(path.dirname(destination), { recursive: true });
    }
    
    // Rename (move) the directory
    fs.renameSync(source, destination);
    return true;
  }
  return false;
}

// Main function
function main() {
  console.log('Running pre-build cleanup...');
  
  // Create a temporary directory for backup
  const tempDir = path.join(__dirname, '../.temp-backup');
  if (!directoryExists(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  // Move backup directories to temporary location
  const movedDirs = [];
  for (const dir of backupDirs) {
    const dirName = path.basename(dir);
    const tempPath = path.join(tempDir, dirName);
    if (moveDirectory(dir, tempPath)) {
      movedDirs.push({ original: dir, temp: tempPath });
    }
  }
  
  // Create a restore script
  const restoreScript = `
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Directories to restore
const movedDirs = ${JSON.stringify(movedDirs, null, 2)};

// Function to check if a directory exists
function directoryExists(dirPath) {
  try {
    return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
  } catch (error) {
    return false;
  }
}

// Function to move a directory back to its original location
function restoreDirectory(source, destination) {
  if (directoryExists(source)) {
    console.log(\`Restoring \${source} to \${destination}\`);
    
    // Create the destination directory if it doesn't exist
    if (!directoryExists(path.dirname(destination))) {
      fs.mkdirSync(path.dirname(destination), { recursive: true });
    }
    
    // Rename (move) the directory back
    fs.renameSync(source, destination);
    return true;
  }
  return false;
}

// Main function
function main() {
  console.log('Restoring backup directories...');
  
  // Restore directories
  for (const dir of movedDirs) {
    restoreDirectory(dir.temp, dir.original);
  }
  
  // Remove the temporary directory if it's empty
  const tempDir = path.join(__dirname, '../.temp-backup');
  if (directoryExists(tempDir) && fs.readdirSync(tempDir).length === 0) {
    fs.rmdirSync(tempDir);
  }
  
  console.log('Restore complete!');
}

// Run the main function
main();
  `;
  
  // Write the restore script
  const restoreScriptPath = path.join(__dirname, 'post-build-restore.js');
  fs.writeFileSync(restoreScriptPath, restoreScript);
  
  console.log('Pre-build cleanup complete!');
  console.log('A restore script has been created at:', restoreScriptPath);
}

// Run the main function
main();
