# Test Accounts

This document describes test data and accounts for development and testing.

## Quick Start (Works Everywhere!)

The seed script now works without requiring auth users to exist first!

### Setup Steps

1. **Reset database:**
   - **Local:** `pnpx supabase db reset`
   - **Remote:** `supabase db push && supabase db seed`

2. **Create auth users** (choose one method):

   **Option A: Use the helper script (recommended for local):**

   ```bash
   ./scripts/create-test-users.sh
   ```

   Creates all test users with password `password123` and auto-links them to profiles.

   **Option B: Sign up manually at your app** with one of these emails:
   - `owner@example.com` - Becomes the organization owner
   - `staff1@example.com` - Alice Johnson (Massage Therapist)
   - `staff2@example.com` - Bob Martinez (Yoga Instructor)
   - `staff3@example.com` - Carol Lee (Wellness Consultant)
   - `staff4@example.com` - David Chen (Massage & Yoga)

3. **That's it!** Your auth accounts automatically link to the pre-created profiles!

## How Auto-Linking Works

1. Seed script creates profiles **without** auth accounts
2. You sign up with a matching email (e.g., `owner@example.com`)
3. The `handle_new_user()` trigger:
   - Detects your email matches a profile
   - Links your `auth.users.id` to that profile
   - Your role and organization are already set!

## Test Accounts

| Email                | Role  | Name          | Password (via script) |
| -------------------- | ----- | ------------- | --------------------- |
| `owner@example.com`  | Owner | John Smith    | `password123`         |
| `staff1@example.com` | Staff | Alice Johnson | `password123`         |
| `staff2@example.com` | Staff | Bob Martinez  | `password123`         |
| `staff3@example.com` | Staff | Carol Lee     | `password123`         |
| `staff4@example.com` | Staff | David Chen    | `password123`         |

_Note: If you sign up manually instead of using the script, you can choose any password._

## Seeded Sample Data

After running the seed script:

- 🏢 **Organization:** "Wellness Center Demo"
- 👤 **1 Owner profile:** owner@example.com (John Smith)
- 👨‍💼 **4 Staff profiles** (with event types and availability):
  - staff1@example.com (Alice Johnson - Massage: Swedish, Deep Tissue)
  - staff2@example.com (Bob Martinez - Vinyasa Yoga)
  - staff3@example.com (Carol Lee - Wellness Consultation)
  - staff4@example.com (David Chen - Swedish, Yoga, Wellness)
- 👥 **10 Client Members:** Emma Johnson, Liam Smith, Olivia Brown, etc.
- 📋 **3 Event Categories:** Massage Therapy, Yoga & Fitness, Wellness Consultation
- 🎯 **4 Event Types:** Swedish Massage, Deep Tissue, Vinyasa Yoga, Wellness Consultation

## Testing Different Roles

### Owner Access

1. Sign up with `owner@example.com`
2. Full access to:
   - Dashboard and analytics
   - Team management (invite, edit roles)
   - All settings
   - Create/edit/archive all resources

### Staff Access

1. Sign up with `staff1@example.com` through `staff4@example.com`
2. Limited access:
   - View dashboard
   - View team members (read-only)
   - Create/view/edit visits
   - View members and event types
   - Cannot: manage team, change settings

## Running the Seed Script

```bash
# Local: Complete reset + create auth users
pnpx supabase db reset
./scripts/create-test-users.sh

# Remote: Push migrations and seed
supabase db push
supabase db seed
# (then create users via UI or script)

# Just run seed (after migrations already applied)
supabase db seed
```

## Benefits of This Approach

✅ **No manual user creation** - Just run seed and sign up  
✅ **Works on remote databases** - No permission issues  
✅ **Predictable roles** - Sign up with specific email = specific role  
✅ **Easy testing** - Create/delete auth accounts without touching profiles  
✅ **Flexible** - Profiles can exist before anyone logs in

## Security Note

⚠️ **These are test accounts for local development only!**

- Never use these emails in production
- Change the seed script emails before deploying
- Use proper invitation flow for production users
