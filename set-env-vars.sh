#!/bin/bash

echo "🔧 Setting Vercel Environment Variables..."

# Set DATABASE_URL
echo "Setting DATABASE_URL..."
echo "postgresql://neondb_owner:npg_fRBe6IuaS5cb@ep-aged-breeze-a466koxy-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require" | vercel env add DATABASE_URL production

# Set DIRECT_URL
echo "Setting DIRECT_URL..."
echo "postgresql://neondb_owner:npg_fRBe6IuaS5cb@ep-aged-breeze-a466koxy.us-east-1.aws.neon.tech/neondb?sslmode=require" | vercel env add DIRECT_URL production

# Set NEXTAUTH_URL
echo "Setting NEXTAUTH_URL..."
echo "https://tawaniaadmin-ljpiu8f9q-bhardwajvaishnavis-projects.vercel.app" | vercel env add NEXTAUTH_URL production

# Set NEXTAUTH_SECRET
echo "Setting NEXTAUTH_SECRET..."
echo "UpmPzkOejjjMTReLmyQVwJ4S8+eCRairz4KZ2/Hh5Hs=" | vercel env add NEXTAUTH_SECRET production

# Set NODE_ENV
echo "Setting NODE_ENV..."
echo "production" | vercel env add NODE_ENV production

# Set SKIP_ENV_VALIDATION
echo "Setting SKIP_ENV_VALIDATION..."
echo "1" | vercel env add SKIP_ENV_VALIDATION production

echo "✅ All environment variables set!"
echo "Now run: vercel --prod --force"
