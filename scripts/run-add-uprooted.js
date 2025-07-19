#!/usr/bin/env node

/**
 * Simple Node.js runner for the add-uprooted-vegan-cuisine TypeScript script
 * This runs the TypeScript file using ts-node or can be compiled first
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Uprooted Vegan Cuisine addition script...\n');

// Try to run with ts-node first, then fallback to tsx if available
const scriptPath = path.join(__dirname, 'add-uprooted-vegan-cuisine.ts');

// Try ts-node first
let proc = spawn('npx', ['ts-node', scriptPath], {
  stdio: 'inherit',
  shell: true
});

proc.on('error', (err) => {
  if (err.code === 'ENOENT' || err.message.includes('ts-node')) {
    console.log('📝 ts-node not found, trying tsx...\n');
    
    // Try tsx as fallback
    proc = spawn('npx', ['tsx', scriptPath], {
      stdio: 'inherit', 
      shell: true
    });
    
    proc.on('error', (err) => {
      console.error('❌ Neither ts-node nor tsx found. Please install one of them:');
      console.error('   npm install -D ts-node');
      console.error('   or');
      console.error('   npm install -D tsx');
      process.exit(1);
    });
  }
});

proc.on('close', (code) => {
  if (code === 0) {
    console.log('\n🎊 Script completed successfully!');
  } else {
    console.log(`\n⚠️  Script exited with code ${code}`);
  }
});
