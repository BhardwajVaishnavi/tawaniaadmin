#!/bin/bash

echo "🚀 Starting Vercel build process..."

# Create manifest files before build
echo "📁 Creating client reference manifest files..."
node scripts/create-manifest.js

# Run Vercel build fix
echo "🔧 Running Vercel build fix..."
node scripts/fix-vercel-build.js

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
npx prisma generate

# Build the application
echo "🏗️ Building Next.js application..."
next build

# Create manifest files after build (in case they were removed)
echo "📁 Ensuring manifest files exist after build..."
node scripts/create-manifest.js

echo "✅ Vercel build process completed successfully!"
