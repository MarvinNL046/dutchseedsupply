#!/usr/bin/env node

/**
 * Script to fix build errors by temporarily renaming problematic files
 */

const fs = require('fs');
const path = require('path');

// Files that cause build errors
const problematicFiles = [
  path.join(__dirname, '../middleware/backup/middleware.backup.ts'),
  // Add other problematic files here if needed
];

// Function to check if a file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  } catch (error) {
    return false;
  }
}

// Function to temporarily rename a file
function renameFile(filePath, newExtension = '.bak') {
  if (fileExists(filePath)) {
    const newPath = `${filePath}${newExtension}`;
    console.log(`Renaming ${filePath} to ${newPath}`);
    fs.renameSync(filePath, newPath);
    return { original: filePath, renamed: newPath };
  }
  return null;
}

// Main function
function main() {
  console.log('Fixing build errors by renaming problematic files...');
  
  const renamedFiles = [];
  
  // Rename problematic files
  for (const file of problematicFiles) {
    const result = renameFile(file);
    if (result) {
      renamedFiles.push(result);
    }
  }
  
  // Create a restore script
  if (renamedFiles.length > 0) {
    const restoreScript = `
#!/usr/bin/env node

/**
 * Script to restore renamed files after build
 */

const fs = require('fs');

// Files to restore
const renamedFiles = ${JSON.stringify(renamedFiles, null, 2)};

// Function to check if a file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  } catch (error) {
    return false;
  }
}

// Function to restore a renamed file
function restoreFile(renamedPath, originalPath) {
  if (fileExists(renamedPath)) {
    console.log(\`Restoring \${renamedPath} to \${originalPath}\`);
    fs.renameSync(renamedPath, originalPath);
    return true;
  }
  return false;
}

// Main function
function main() {
  console.log('Restoring renamed files...');
  
  // Restore files
  for (const file of renamedFiles) {
    restoreFile(file.renamed, file.original);
  }
  
  console.log('Restore complete!');
}

// Run the main function
main();
    `;
    
    // Write the restore script
    const restoreScriptPath = path.join(__dirname, 'restore-renamed-files.js');
    fs.writeFileSync(restoreScriptPath, restoreScript);
    
    console.log('Fix complete!');
    console.log('A restore script has been created at:', restoreScriptPath);
    console.log(`Renamed ${renamedFiles.length} files.`);
  } else {
    console.log('No files were renamed. No problematic files found.');
  }
}

// Run the main function
main();
