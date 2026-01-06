#!/usr/bin/env bash
set -euo pipefail

# Run Prisma seed inside the web service container using compose override.
# Assumes you are in the app directory on EC2 (~/apps/forest-app).
# Usage: ./deploy/scripts/seed.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$APP_DIR"

# Start required services if they are not up and run seed in a one-off container
# Using `run --rm` starts a fresh container with the same environment.
docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm web sh -c "npx prisma db seed"
