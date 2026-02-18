# Test Accounts

This document describes test data and accounts for development and testing.

## For Local Development

When using `supabase db reset` locally, the seed script will attempt to use existing users or prompt you to create one.

### Local Setup Steps

1. Start Supabase: `supabase start`
2. Reset database: `supabase db reset`
3. If no users exist, sign up at http://localhost:3000
4. Run seed again: `supabase db seed`

## For Remote/Production Testing

The seed script **does not auto-create users** on remote databases for security reasons.

### Remote Setup Steps

1. Create a user via:
   - Sign up through your application
   - Or Supabase Dashboard > Authentication > Add User
2. Push migrations: `supabase db push`
3. The seed script will use your existing user account

## What the Seed Script Creates

- 🏢 **1 Organization:** "Wellness Center Demo" (owned by the first available user)
- 👥 **10 Client Members:** Sample members with names, emails, and dates
- 📋 **3 Event Categories:** Massage Therapy, Yoga & Fitness, Wellness Consultation
- 🎯 **4 Event Types:** Swedish Massage, Deep Tissue, Vinyasa Yoga, Wellness Consultation

## Adding Staff Members

### Option 1: Manual Creation for Local Testing

For local development, you can create staff users and profiles:

1. **Create users in Supabase Dashboard:**
   - Go to Supabase Dashboard > Authentication > Add User
   - Create users with emails: `staff1@example.com`, `staff2@example.com`
   - Set passwords (e.g., `password123`)

2. **Run the seed script:**
   ```bash
   supabase db reset
   ```
   The seed script will automatically create profiles for these staff users with:
   - **staff1@example.com**: Alice Johnson (Massage Therapist)
   - **staff2@example.com**: Bob Martinez (Yoga Instructor)

### Option 2: Using the Invitation System (Recommended)

Staff members can be added through the application:

1. Log in as the owner
2. Go to **Settings > Team**
3. Click **Invite Staff Member**
4. Enter their email
5. They'll receive an invitation link
6. After they accept, assign services via **Team > [Member] > Edit**

## Usage

### Running the Seed Script

```bash
# Reset database and run seed script
supabase db reset

# Or run seed script only (after migrations)
supabase db seed
```

### Testing Different Roles

1. **Test as Owner:**
   - The user you created becomes the owner automatically
   - Access all features including Team management and Settings

2. **Test as Staff:**
   - Invite a second user via Settings > Team > Invite
   - Accept the invitation (check email or use test email service)
   - Log in with that account to test staff permissions

## Seeded Sample Data

After running the seed script, your database will have:

- 🏢 1 Organization: "Wellness Center Demo"
- 👤 1 Owner profile (linked to your user account)
- 👥 10 Client Members (Emma, Liam, Olivia, etc.)
- 📋 3 Event Categories (Massage Therapy, Yoga & Fitness, Wellness Consultation)
- 🎯 4 Event Types/Services (Swedish Massage, Deep Tissue, Vinyasa Yoga, etc.)
- 👨‍💼 2 Staff profiles (if users exist: staff1@example.com, staff2@example.com)

## Security Note

⚠️ **These are test accounts for local development only!**

- Never use these credentials in production
- Change all default passwords before deploying
- Use proper authentication and security measures in production

## Resetting Test Data

To start fresh:

```bash
# Complete reset (drops all data and re-runs migrations + seed)
supabase db reset

# This will:
# 1. Drop all tables and data
# 2. Run all migrations
# 3. Run the seed script
# 4. Create all test accounts again
```
