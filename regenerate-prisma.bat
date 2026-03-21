@echo off
echo ===================================
echo Prisma Client Regeneration Script
echo ===================================
echo.
echo This will:
echo 1. Stop all Node.js processes
echo 2. Regenerate Prisma Client
echo 3. Start the dev server
echo.
pause

echo.
echo [1/3] Stopping all Node.js processes...
taskkill /F /IM node.exe /T 2>nul
timeout /t 2 /nobreak >nul

echo.
echo [2/3] Regenerating Prisma Client...
call npx prisma generate

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Prisma generation failed!
    echo Please close VS Code and run this script again.
    pause
    exit /b 1
)

echo.
echo [3/3] Starting dev server...
echo.
echo Visit http://localhost:3000/vendor/register to test!
echo.
start cmd /k "npm run dev"

echo.
echo ===================================
echo Setup complete! Dev server started.
echo ===================================
pause
