#!/bin/bash
# generate-migration.sh
# Uses wrangler d1 migrations apply to generate a new migration from schema.

# Exit on error
set -e

if [ -z "$1" ]; then
  echo "Usage: ./generate-migration.sh <migration_name>"
  exit 1
fi

MIGRATION_NAME=$1

echo "Generating migration: $MIGRATION_NAME"
# Generate an empty migration file
pnpm wrangler d1 migrations create vetting-loop-db "$MIGRATION_NAME"

echo "Migration created. Please edit the generated SQL file in migrations/ directory."
echo "To apply locally: pnpm wrangler d1 migrations apply vetting-loop-db --local"
echo "To apply to remote: pnpm wrangler d1 migrations apply vetting-loop-db --remote"
