#!/usr/bin/env node

// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

console.log('🔧 Creating client reference manifest files...');

// Function to ensure directory exists
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created directory: ${dirPath}`);
  }
}

// Function to create manifest file
function createManifest(filePath, content) {
  fs.writeFileSync(filePath, content);
  console.log(`✅ Created: ${filePath}`);
}

// Base paths
const nextDir = path.join(process.cwd(), '.next');
const serverDir = path.join(nextDir, 'server');
const appDir = path.join(serverDir, 'app');
const dashboardDir = path.join(appDir, '(dashboard)');

// Ensure all directories exist
ensureDir(nextDir);
ensureDir(serverDir);
ensureDir(appDir);
ensureDir(dashboardDir);

// Manifest content
const jsManifest = `// Auto-generated client reference manifest
module.exports = {
  clientModules: {},
  ssrModuleMapping: {},
  edgeSSRModuleMapping: {},
  entryCSSFiles: {}
};`;

const jsonManifest = `{
  "clientModules": {},
  "ssrModuleMapping": {},
  "edgeSSRModuleMapping": {},
  "entryCSSFiles": {}
}`;

// Files to create
const manifestFiles = [
  { name: 'page_client-reference-manifest.js', content: jsManifest },
  { name: 'page_client-reference-manifest.json', content: jsonManifest },
  { name: 'client-reference-manifest.js', content: jsManifest },
  { name: 'client-reference-manifest.json', content: jsonManifest },
  { name: 'layout_client-reference-manifest.js', content: jsManifest },
  { name: 'layout_client-reference-manifest.json', content: jsonManifest }
];

// Create manifest files in dashboard directory
manifestFiles.forEach(file => {
  const filePath = path.join(dashboardDir, file.name);
  createManifest(filePath, file.content);
});

// Create manifest files in app directory
manifestFiles.forEach(file => {
  const filePath = path.join(appDir, file.name);
  createManifest(filePath, file.content);
});

// Create manifest files in server directory
manifestFiles.forEach(file => {
  const filePath = path.join(serverDir, file.name);
  createManifest(filePath, file.content);
});

// Create additional required files
const requiredFiles = [
  { name: 'page.js', content: '// Auto-generated page\nmodule.exports = {};' },
  { name: 'layout.js', content: '// Auto-generated layout\nmodule.exports = {};' },
  { name: 'loading.js', content: '// Auto-generated loading\nmodule.exports = {};' },
  { name: 'error.js', content: '// Auto-generated error\nmodule.exports = {};' },
  { name: 'not-found.js', content: '// Auto-generated not-found\nmodule.exports = {};' }
];

requiredFiles.forEach(file => {
  const filePath = path.join(dashboardDir, file.name);
  if (!fs.existsSync(filePath)) {
    createManifest(filePath, file.content);
  }
});

console.log('✅ All client reference manifest files created successfully!');
console.log('🚀 Ready for Vercel deployment!');
