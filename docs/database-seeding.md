# Database Seeding

This guide covers seeding sample data for **local development** and **production** Supabase projects.

## Recommended approach: `pnpm db:seed`

Use the TypeScript seed script (`scripts/seed-db.ts`). It is the canonical method because it:

- Reads credentials from **`.env.local`**
- Works against **local and remote** Supabase (no direct SQL access required)
- Seeds **visits with relative dates** (dashboard charts work immediately)
- Creates **auth users** and **links them to profiles** (required since the signup auto-link trigger was removed)
- Supports a full **`--reset`** wipe before seeding

`supabase/seed.sql` still runs on `pnpm supabase:db:reset` but is older (no visits, different staff count). Prefer `pnpm db:seed` after a local reset.

---

## What you need to provide

### 1. `.env.local` (required)

Point at the Supabase project you want to seed:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

You can find both in [Supabase Dashboard](https://supabase.com/dashboard) → Project → **Settings** → **API**.

> Use the **service role** key, not the anon key. The script needs admin access to create users and bypass RLS.

### 2. Seed options (optional, in `.env.local`)

```env
# Email for the login account (default: owner@example.com)
SEED_OWNER_EMAIL=you@yourdomain.com

# Password for the auth user (default: password123)
SEED_OWNER_PASSWORD=choose-a-strong-password

# Which auth users to create: owner | all | false (default: owner)
SEED_CREATE_AUTH_USERS=owner
```

| Variable                 | Default             | Description                                                     |
| ------------------------ | ------------------- | --------------------------------------------------------------- |
| `SEED_OWNER_EMAIL`       | `owner@example.com` | Owner profile + login email                                     |
| `SEED_OWNER_PASSWORD`    | `password123`       | Password for created auth user(s)                               |
| `SEED_CREATE_AUTH_USERS` | `owner`             | `owner` = one login; `all` = owner + staff; `false` = data only |

### 3. Confirmation for production

Seeding with `--reset` **permanently deletes**:

- All `auth.users` accounts
- All organizations, profiles, members, visits, and related data

Only proceed if you intend to wipe the target database.

---

## Production: one test user + clean seed data

Use this when you want a **fresh production database** with **one login** and demo content.

### Step 1 — Link your machine to production

In `.env.local`, set production Supabase URL and service role key (see above).

Set your test account:

```env
SEED_OWNER_EMAIL=you@yourdomain.com
SEED_OWNER_PASSWORD=YourSecurePassword123!
SEED_CREATE_AUTH_USERS=owner
```

### Step 2 — Apply migrations (if needed)

Ensure the remote schema is up to date:

```bash
pnpm supabase:db:push
```

### Step 3 — Reset and seed

```bash
pnpm db:reset-and-seed
```

This runs `pnpm db:seed -- --reset`, which:

1. Deletes all auth users
2. Deletes all organizations (cascades to members, visits, staff, etc.)
3. Creates demo org **Wellness Center Demo**
4. Seeds staff, clients, services, availability, and visits
5. Creates **one** auth user for `SEED_OWNER_EMAIL` and links it to the owner profile

### Step 4 — Verify

1. Open your production app URL
2. Log in with `SEED_OWNER_EMAIL` / `SEED_OWNER_PASSWORD`
3. Confirm dashboard shows visits, members, and staff

### What you get

| Item         | Details                                                         |
| ------------ | --------------------------------------------------------------- |
| Organization | Wellness Center Demo (14-day trial)                             |
| Login        | Your `SEED_OWNER_EMAIL` as **owner**                            |
| Staff        | 2 staff profiles (no login unless `SEED_CREATE_AUTH_USERS=all`) |
| Clients      | 5 members                                                       |
| Services     | Swedish Massage, Vinyasa Yoga                                   |
| Visits       | 13 appointments (past, upcoming, cancelled)                     |

Staff profiles exist for UI/testing but cannot log in unless you set `SEED_CREATE_AUTH_USERS=all`.

---

## Local development

### Full reset + seed

```bash
pnpm supabase:db:reset   # migrations (+ legacy seed.sql)
pnpm db:seed             # refresh with full demo data + auth
```

Or in one step after migrations are applied:

```bash
pnpm db:reset-and-seed
```

### Seed without wiping auth

```bash
pnpm db:seed
```

Refreshes demo org data for the existing organization. Re-links owner auth if missing.

---

## Commands reference

| Command                          | Description                                            |
| -------------------------------- | ------------------------------------------------------ |
| `pnpm db:seed`                   | Seed / refresh demo data                               |
| `pnpm db:seed -- --reset`        | Wipe all data + auth, then seed                        |
| `pnpm db:reset-and-seed`         | Alias for seed with `--reset`                          |
| `pnpm supabase:db:reset`         | Local only: reset DB + run migrations + `seed.sql`     |
| `./scripts/create-test-users.sh` | Legacy: create auth users only (prefer `pnpm db:seed`) |

---

## How auth linking works

1. The seed script creates **profiles** with email but no `user_id`
2. It creates an **auth user** via the Admin API (`email_confirm: true`)
3. It sets `profiles.user_id` to the new auth user id

The old `handle_new_user` database trigger was removed; linking must be done explicitly (the seed script handles this).

---

## Troubleshooting

**"Missing NEXT_PUBLIC_SUPABASE_URL"**  
Check `.env.local` exists in the project root and contains the correct variables.

**"Failed to create auth user"**  
Confirm you are using the **service role** key, not the anon key.

**Login works but dashboard is empty**  
Run `pnpm db:seed` again without `--reset` to refresh org data, or check `SEED_OWNER_EMAIL` matches the account you log in with.

**Production still has old users after reset**  
Re-run `pnpm db:reset-and-seed` and check the script output for auth user deletion count. Verify `.env.local` points at the correct project URL.
