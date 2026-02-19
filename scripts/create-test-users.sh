#!/bin/bash

# Script to create test auth users for local Supabase development
# This creates the auth.users records that will auto-link to pre-seeded profiles

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🔐 Creating Test Auth Users${NC}"
echo -e "${BLUE}========================================${NC}"

# Read from .env.local (ignore commented lines)
if [ ! -f .env.local ]; then
  echo -e "${RED}❌ Error: .env.local not found${NC}"
  exit 1
fi

SUPABASE_URL=$(grep -v '^#' .env.local | grep NEXT_PUBLIC_SUPABASE_URL | cut -d '=' -f2)
SERVICE_ROLE_KEY=$(grep -v '^#' .env.local | grep SUPABASE_SECRET_KEY | cut -d '=' -f2)

if [ -z "$SUPABASE_URL" ] || [ -z "$SERVICE_ROLE_KEY" ]; then
  echo -e "${RED}❌ Error: Could not read Supabase config from .env.local${NC}"
  echo -e "${RED}SUPABASE_URL: '${SUPABASE_URL}'${NC}"
  echo -e "${RED}SERVICE_ROLE_KEY: '${SERVICE_ROLE_KEY}'${NC}"
  exit 1
fi

echo -e "${BLUE}📡 Using Supabase URL: ${SUPABASE_URL}${NC}"
echo ""

# Function to create a user
create_user() {
  local email=$1
  local password=$2
  local name=$3
  
  echo -e "${BLUE}Creating user: ${email}${NC}"
  
  response=$(curl -s -X POST "${SUPABASE_URL}/auth/v1/admin/users" \
    -H "apikey: ${SERVICE_ROLE_KEY}" \
    -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"${email}\",
      \"password\": \"${password}\",
      \"email_confirm\": true,
      \"user_metadata\": {
        \"full_name\": \"${name}\"
      }
    }")
  
  # Check if creation was successful
  if echo "$response" | grep -q '"id"'; then
    echo -e "${GREEN}✅ Created: ${email} (password: ${password})${NC}"
  elif echo "$response" | grep -q "already exists"; then
    echo -e "${GREEN}📌 Already exists: ${email}${NC}"
  else
    echo -e "${RED}❌ Failed: ${email}${NC}"
    echo -e "${RED}Response: ${response}${NC}"
  fi
  echo ""
}

# Create test users
create_user "owner@example.com" "password123" "John Smith"
create_user "staff1@example.com" "password123" "Alice Johnson"
create_user "staff2@example.com" "password123" "Bob Martinez"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Test users created!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}💡 You can now log in with:${NC}"
echo -e "   • owner@example.com / password123"
echo -e "   • staff1@example.com / password123"
echo -e "   • staff2@example.com / password123"
echo ""
echo -e "${BLUE}📝 Note: These users are automatically linked to pre-seeded profiles${NC}"
