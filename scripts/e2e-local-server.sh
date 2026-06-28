#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if ! pnpx supabase status >/dev/null 2>&1; then
  echo "Local Supabase is not running. Start it with: pnpm supabase:start" >&2
  exit 1
fi

eval "$(pnpx supabase status -o env 2>/dev/null | grep -E '^(API_URL|ANON_KEY|SERVICE_ROLE_KEY)=')"

export NEXT_PUBLIC_SUPABASE_URL="$API_URL"
export NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="$ANON_KEY"
export SUPABASE_SECRET_KEY="$SERVICE_ROLE_KEY"
export NEXT_PUBLIC_APP_URL="${PLAYWRIGHT_BASE_URL:-http://localhost:3000}"
export NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_APP_URL}/api"
export NEXT_PUBLIC_APP_ENV=local

exec pnpm exec next dev -p "${PLAYWRIGHT_PORT:-3000}"
