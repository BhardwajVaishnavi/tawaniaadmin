@echo off
echo 🚀 Tawania Admin - Quick Deployment Script
echo ==========================================

echo.
echo Step 1: Building project locally...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed! Please fix errors before deploying.
    pause
    exit /b 1
)

echo.
echo ✅ Build successful!
echo.
echo Step 2: Deploying to Vercel...
call vercel --prod

echo.
echo 🎉 Deployment process completed!
echo.
echo Next steps:
echo 1. Set environment variables in Vercel dashboard
echo 2. Update NEXTAUTH_URL to your Vercel domain
echo 3. Test your deployed application
echo.
pause
