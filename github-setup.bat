@echo off
echo 🚀 GitHub Setup for Vercel Deployment
echo =====================================

echo.
echo Step 1: Initialize Git repository...
git init

echo.
echo Step 2: Add all files...
git add .

echo.
echo Step 3: Create initial commit...
git commit -m "Initial commit - Tawania Admin Panel"

echo.
echo Step 4: Set main branch...
git branch -M main

echo.
echo ⚠️  MANUAL STEP REQUIRED:
echo 1. Create a new repository on GitHub
echo 2. Copy the repository URL
echo 3. Run: git remote add origin YOUR_GITHUB_URL
echo 4. Run: git push -u origin main
echo.
echo Then connect the GitHub repo to Vercel for automatic deployments!
echo.
pause
