@echo off
echo 🔧 Setting Vercel Environment Variables
echo =====================================

echo.
echo Setting DATABASE_URL...
vercel env add DATABASE_URL production

echo.
echo Setting DIRECT_URL...
vercel env add DIRECT_URL production

echo.
echo Setting NEXTAUTH_URL...
vercel env add NEXTAUTH_URL production

echo.
echo Setting NEXTAUTH_SECRET...
vercel env add NEXTAUTH_SECRET production

echo.
echo Setting NODE_ENV...
vercel env add NODE_ENV production

echo.
echo Setting SKIP_ENV_VALIDATION...
vercel env add SKIP_ENV_VALIDATION production

echo.
echo ✅ Environment variables setup complete!
echo.
echo Now run: vercel --prod --force
echo.
pause
