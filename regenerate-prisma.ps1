# Prisma Regeneration Script for PowerShell
# Run this if the batch file doesn't work

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Prisma Client Regeneration Script" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Kill Node processes
Write-Host "[1/3] Stopping all Node.js processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Step 2: Regenerate Prisma
Write-Host "[2/3] Regenerating Prisma Client..." -ForegroundColor Yellow
npx prisma generate

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Prisma generation failed!" -ForegroundColor Red
    Write-Host "Please close VS Code and run this script again." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Step 3: Start dev server
Write-Host ""
Write-Host "[3/3] Starting dev server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Visit http://localhost:3000/vendor/register to test!" -ForegroundColor Green
Write-Host ""

Start-Process cmd -ArgumentList "/k npm run dev"

Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Setup complete! Dev server started." -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Read-Host "Press Enter to exit"
