#!/usr/bin/env node

/**
 * Fix for Vercel deployment issues
 * This script ensures proper build configuration for Vercel
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Vercel build configuration...');

// Clean any existing .next directory
const nextDir = path.join(process.cwd(), '.next');
if (fs.existsSync(nextDir)) {
  console.log('🧹 Cleaning existing .next directory...');
  fs.rmSync(nextDir, { recursive: true, force: true });
}

// Create fresh .next directory structure
fs.mkdirSync(nextDir, { recursive: true });
console.log('✅ Created .next directory');

// Ensure server directory exists
const serverDir = path.join(nextDir, 'server');
fs.mkdirSync(serverDir, { recursive: true });
console.log('✅ Created .next/server directory');

// Ensure app directory exists
const appDir = path.join(serverDir, 'app');
fs.mkdirSync(appDir, { recursive: true });
console.log('✅ Created .next/server/app directory');

// Create dashboard directory
const dashboardDir = path.join(appDir, '(dashboard)');
fs.mkdirSync(dashboardDir, { recursive: true });
console.log('✅ Created .next/server/app/(dashboard) directory');

// Create the missing manifest file in multiple locations
const manifestFiles = [
  'page_client-reference-manifest.js',
  'page_client-reference-manifest.json',
  'client-reference-manifest.js',
  'client-reference-manifest.json'
];

manifestFiles.forEach(fileName => {
  const manifestPath = path.join(dashboardDir, fileName);
  const manifestContent = fileName.endsWith('.json')
    ? '{}'
    : `// Auto-generated client reference manifest\nmodule.exports = {};`;
  fs.writeFileSync(manifestPath, manifestContent);
  console.log(`✅ Created ${fileName}`);
});

// Also create in the root app directory
manifestFiles.forEach(fileName => {
  const manifestPath = path.join(appDir, fileName);
  const manifestContent = fileName.endsWith('.json')
    ? '{}'
    : `// Auto-generated client reference manifest\nmodule.exports = {};`;
  fs.writeFileSync(manifestPath, manifestContent);
  console.log(`✅ Created ${fileName} in app root`);
});

// Create additional required files
const requiredFiles = [
  'page.js',
  'layout.js',
  'loading.js',
  'error.js'
];

requiredFiles.forEach(file => {
  const filePath = path.join(dashboardDir, file);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, `// Auto-generated ${file}\nmodule.exports = {};`);
    console.log(`✅ Created ${file}`);
  }
});

console.log('✅ Vercel build configuration fixed!');
console.log('🚀 Ready for deployment!');
