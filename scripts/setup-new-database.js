#!/usr/bin/env node

/**
 * Script to set up the new database
 * This script runs all the necessary steps in the correct order
 */

const { spawn } = require('child_process');
const path = require('path');

// Function to run a script and wait for it to complete
function runScript(scriptPath) {
  return new Promise((resolve, reject) => {
    console.log(`Running ${path.basename(scriptPath)}...`);
    
    const process = spawn('node', [scriptPath], { stdio: 'inherit' });
    
    process.on('close', (code) => {
      if (code === 0) {
        console.log(`${path.basename(scriptPath)} completed successfully.`);
        resolve();
      } else {
        console.error(`${path.basename(scriptPath)} failed with code ${code}.`);
        reject(new Error(`Script failed with code ${code}`));
      }
    });
    
    process.on('error', (error) => {
      console.error(`Error running ${path.basename(scriptPath)}:`, error);
      reject(error);
    });
  });
}

// Main function to run all scripts in order
async function setupNewDatabase() {
  try {
    console.log('Starting new database setup...');
    
    // Step 1: Create the execute_sql function
    await runScript(path.join(__dirname, 'create-execute-sql-function.js'));
    
    // Step 2: Apply the new schema
    await runScript(path.join(__dirname, 'apply-new-schema.js'));
    
    // Step 3: Clean up old files
    await runScript(path.join(__dirname, 'cleanup-old-files.js'));
    
    console.log('\nNew database setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Sign up with your admin email (marvinsmit1988@gmail.com)');
    console.log('2. Verify that the admin user was created correctly');
    console.log('3. Test the admin functionality');
    console.log('\nFor more information, see docs/new-database-setup.md');
    
  } catch (error) {
    console.error('Error setting up new database:', error);
    console.log('\nPlease check the error message and try again.');
    console.log('You can also run the scripts individually:');
    console.log('1. node scripts/create-execute-sql-function.js');
    console.log('2. node scripts/apply-new-schema.js');
    console.log('3. node scripts/cleanup-old-files.js');
    console.log('\nFor more information, see docs/new-database-setup.md');
    process.exit(1);
  }
}

// Run the setup
setupNewDatabase();
