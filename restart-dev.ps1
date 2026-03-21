# Stop all Node processes
Write-Host "Stopping all Node.js processes..." -ForegroundColor Yellow
taskkill /F /IM node.exe 2>$null

Start-Sleep -Seconds 2

# Clean Prisma client
Write-Host "Cleaning Prisma client..." -ForegroundColor Yellow
Remove-Item -Path "node_modules\.prisma" -Recurse -Force -ErrorAction SilentlyContinue

# Regenerate Prisma client
Write-Host "Generating Prisma client..." -ForegroundColor Green
npx prisma generate

# Start dev server
Write-Host "Starting dev server..." -ForegroundColor Green
npm run dev
