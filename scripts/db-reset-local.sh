#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if ! pnpx supabase status >/dev/null 2>&1; then
  echo "Local Supabase is not running. Start it with: pnpm supabase:start" >&2
  exit 1
fi

pnpm exec supabase db reset
pnpm exec tsx scripts/seed-db.ts --local
