# ============================================================
# Glanzoo — Makefile for Docker Management
# Usage: make <command>
# ============================================================
# On Windows use: nmake or install GNU make (choco install make)

.PHONY: help build up down restart logs shell db-shell prisma-push prisma-studio clean nuke

# Default target
help:
	@echo ""
	@echo "  Glanzoo Docker Commands"
	@echo "  ========================"
	@echo "  make build          Build/rebuild Docker images"
	@echo "  make up             Start all services (detached)"
	@echo "  make down           Stop all services"
	@echo "  make restart        Restart the app container only"
	@echo "  make logs           Tail all logs"
	@echo "  make logs-app       Tail only app logs"
	@echo "  make shell          Open shell in app container"
	@echo "  make db-shell       Open PostgreSQL shell"
	@echo "  make prisma-push    Push schema to DB (first time setup)"
	@echo "  make prisma-studio  Open Prisma Studio DB viewer"
	@echo "  make clean          Remove containers and images"
	@echo "  make nuke           Remove EVERYTHING including volumes (DATA LOSS)"
	@echo ""

# Build production Docker images
build:
	docker compose build --no-cache

# Start all services
up:
	docker compose up -d
	@echo ""
	@echo "✅ Glanzoo is starting..."
	@echo "   App:      http://localhost:3000"
	@echo "   DB:       postgresql://localhost:5432/glanzoo"
	@echo "   Redis:    localhost:6379"
	@echo ""
	@echo "Run 'make logs-app' to watch the startup"

# Stop all services
down:
	docker compose down

# Restart only the app (without rebuilding)
restart:
	docker compose restart app

# Tail all container logs
logs:
	docker compose logs -f

# Tail only app logs
logs-app:
	docker compose logs -f app

# Open a shell inside the running app container
shell:
	docker compose exec app sh

# Open PostgreSQL shell
db-shell:
	docker compose exec db psql -U glanzoo -d glanzoo

# Push Prisma schema to DB (use on first run or after schema changes)
prisma-push:
	docker compose exec app npx prisma db push

# Run Prisma migrations (production safe)
prisma-migrate:
	docker compose exec app npx prisma migrate deploy

# Open Prisma Studio (browser-based DB viewer) — runs on host machine
prisma-studio:
	npx prisma studio

# View running container status
status:
	docker compose ps

# Remove containers and images (keeps volumes/data)
clean:
	docker compose down --rmi local

# ⚠️ DANGER: Remove everything including data volumes
nuke:
	docker compose down -v --rmi all
	@echo "⚠️  All containers, images, AND DATA have been removed!"
