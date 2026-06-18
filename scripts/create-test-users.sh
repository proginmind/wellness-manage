#!/bin/bash

# Creates auth users and links them to pre-seeded profiles.
# Prefer: pnpm db:seed (handles data + auth in one step).
#
# Usage: ./scripts/create-test-users.sh

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🔐 Creating Test Auth Users${NC}"
echo -e "${BLUE}========================================${NC}"

if [ ! -f .env.local ]; then
  echo -e "${RED}❌ Error: .env.local not found${NC}"
  exit 1
fi

SUPABASE_URL=$(grep -v '^#' .env.local | grep NEXT_PUBLIC_SUPABASE_URL | cut -d '=' -f2- | tr -d '"' | tr -d "'")
SERVICE_ROLE_KEY=$(grep -v '^#' .env.local | grep -E 'SUPABASE_SERVICE_ROLE_KEY|SUPABASE_SECRET_KEY' | head -1 | cut -d '=' -f2- | tr -d '"' | tr -d "'")
PASSWORD="${SEED_OWNER_PASSWORD:-password123}"

if [ -z "$SUPABASE_URL" ] || [ -z "$SERVICE_ROLE_KEY" ]; then
  echo -e "${RED}❌ Error: Could not read Supabase config from .env.local${NC}"
  exit 1
fi

echo -e "${BLUE}📡 Using Supabase URL: ${SUPABASE_URL}${NC}"
echo ""

link_profile() {
  local email=$1
  local user_id=$2

  curl -s -X PATCH "${SUPABASE_URL}/rest/v1/profiles?email=eq.${email}" \
    -H "apikey: ${SERVICE_ROLE_KEY}" \
    -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=minimal" \
    -d "{\"user_id\": \"${user_id}\"}" > /dev/null
}

create_user() {
  local email=$1
  local name=$2

  echo -e "${BLUE}Creating user: ${email}${NC}"

  response=$(curl -s -X POST "${SUPABASE_URL}/auth/v1/admin/users" \
    -H "apikey: ${SERVICE_ROLE_KEY}" \
    -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"${email}\",
      \"password\": \"${PASSWORD}\",
      \"email_confirm\": true,
      \"user_metadata\": {
        \"full_name\": \"${name}\"
      }
    }")

  user_id=$(echo "$response" | grep -o '"id":"[^"]*"' | head -1 | cut -d '"' -f4)

  if [ -n "$user_id" ]; then
    link_profile "$email" "$user_id"
    echo -e "${GREEN}✅ Created and linked: ${email} (password: ${PASSWORD})${NC}"
  elif echo "$response" | grep -qi "already"; then
    echo -e "${GREEN}📌 Already exists: ${email} — link profile manually or run pnpm db:seed${NC}"
  else
    echo -e "${RED}❌ Failed: ${email}${NC}"
    echo -e "${RED}Response: ${response}${NC}"
  fi
  echo ""
}

OWNER_EMAIL="${SEED_OWNER_EMAIL:-owner@example.com}"
create_user "$OWNER_EMAIL" "John Smith"
create_user "staff1@example.com" "Alice Johnson"
create_user "staff2@example.com" "Bob Martinez"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Test users created!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}💡 Log in with ${OWNER_EMAIL} / ${PASSWORD}${NC}"
