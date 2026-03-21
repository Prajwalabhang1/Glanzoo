#!/bin/sh
# Glanzoo Docker Entrypoint
set -e

echo "Starting Glanzoo..."

# Wait for PostgreSQL to be ready
echo "Checking database connection..."
MAX_TRIES=30
i=0
until node scripts/check-db.js > /dev/null 2>&1
do
  i=$((i+1))
  if [ "$i" -ge "$MAX_TRIES" ]; then
    echo "ERROR: Database not ready after ${MAX_TRIES} attempts. Exiting."
    exit 1
  fi
  echo "Retrying database connection ($i/$MAX_TRIES)..."
  sleep 2
done
echo "Database is ready!"

# Use prisma db push to sync schema to PostgreSQL
# Note: We use db push instead of migrate deploy because the existing migration
# files are SQLite-based (PRAGMA SQL) and cannot run on PostgreSQL.
echo "Syncing database schema..."
/app/node_modules/.bin/prisma db push --skip-generate --accept-data-loss && echo "Schema synced!" || {
  echo "WARN: Schema sync failed - continuing anyway (tables may already exist)"
}

echo "Starting server..."
exec "$@"
