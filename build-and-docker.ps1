# build-and-docker.ps1
# Run this script ONCE from the project root to:
# 1. Install node_modules (if needed)
# 2. Generate Prisma Client (host machine, uses native binary)
# 3. Build Next.js in standalone mode
# 4. Build and run the Docker image (just copies artifacts - no hang)

$ErrorActionPreference = "Stop"

Write-Host "=== Step 1: Installing node_modules ===" -ForegroundColor Cyan
if (-not (Test-Path "node_modules")) {
    npm ci --frozen-lockfile
} else {
    Write-Host "node_modules already exists, skipping." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Step 2: Generating Prisma Client ===" -ForegroundColor Cyan
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Error "Prisma generate failed. Check your DATABASE_URL is reachable or schema is valid."
    exit 1
}

Write-Host ""
Write-Host "=== Step 3: Building Next.js (standalone) ===" -ForegroundColor Cyan
$env:NODE_ENV = "production"
npx next build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Next.js build failed. See errors above."
    exit 1
}

Write-Host ""
Write-Host "=== Step 4: Building Docker Image ===" -ForegroundColor Cyan
# The Dockerfile now just copies pre-built artifacts — no npm install inside Docker
docker compose --env-file .env.docker build app
if ($LASTEXITCODE -ne 0) {
    Write-Error "Docker build failed."
    exit 1
}

Write-Host ""
Write-Host "=== Step 5: Starting All Services ===" -ForegroundColor Cyan
docker compose --env-file .env.docker up -d

Write-Host ""
Write-Host "=== DONE ===" -ForegroundColor Green
Write-Host "App is running at: http://localhost:3000" -ForegroundColor Green
Write-Host "To follow logs: docker compose logs -f app" -ForegroundColor Yellow
