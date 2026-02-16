# Test Accounts

This document lists all test accounts created by the seed script for local development.

## Owner Account

The owner has full administrative access to all features.

| Email              | Password      | Role  | Access Level      |
| ------------------ | ------------- | ----- | ----------------- |
| `test@example.com` | `password123` | Owner | Full admin access |

**Permissions:**

- ✅ Manage organization settings
- ✅ Invite and manage staff members
- ✅ Create/edit/delete all resources
- ✅ View all data and reports

## Staff Accounts

Staff members have limited access focused on service delivery.

| Email                              | Password      | Role  | Assigned Services                      |
| ---------------------------------- | ------------- | ----- | -------------------------------------- |
| `sarah.johnson@wellnessdemo.com`   | `password123` | Staff | Swedish Massage, Deep Tissue Massage   |
| `michael.chen@wellnessdemo.com`    | `password123` | Staff | Vinyasa Yoga                           |
| `emily.rodriguez@wellnessdemo.com` | `password123` | Staff | Wellness Consultation, Swedish Massage |

**Permissions:**

- ✅ View members and visits
- ✅ View event types/services
- ✅ View their assigned visits
- ❌ Cannot manage organization settings
- ❌ Cannot invite other staff members
- ❌ Cannot delete resources

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
   - Login with `test@example.com` / `password123`
   - Access all features including Team management and Settings

2. **Test as Staff:**
   - Login with any staff account (e.g., `sarah.johnson@wellnessdemo.com` / `password123`)
   - Verify limited access to team management features

### Assigning Staff to Visits

When creating a visit, you can now select from the 3 staff members:

- Sarah Johnson (Massage Therapist)
- Michael Chen (Yoga Instructor)
- Emily Rodriguez (Wellness Consultant)

## Sample Data Created

The seed script also creates:

- 🏢 1 Organization: "Wellness Center Demo"
- 👥 10 Client Members (Emma, Liam, Olivia, etc.)
- 📋 3 Event Categories (Massage Therapy, Yoga & Fitness, Wellness Consultation)
- 🎯 4 Event Types/Services (Swedish Massage, Deep Tissue, Vinyasa Yoga, etc.)

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
