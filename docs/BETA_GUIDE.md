# Wellness Manage — Concierge beta guide

This document is for **you** (the person running the beta) and for **testers** you onboard manually. There is no public signup — each practice gets an account you create.

Related: [`beta-feedback.md`](./beta-feedback.md) (log feedback), [`PROJECT_STATE.md`](./PROJECT_STATE.md) (product strategy).

---

## How you should use this file

### Your role

You are the concierge: create the org, send login details, answer questions, and collect feedback. Testers should not need the repo or Supabase.

### Per-tester onboarding checklist

1. **Create their organization** (Supabase Dashboard → Auth user + profile, or extend `pnpm db:seed` pattern for a dedicated org).
2. **Set trial** — new orgs get **14 days** by default (`trial_ends_at`). Extend in DB if needed for a longer pilot.
3. **Fill in the [Tester handout](#tester-handout-copy-paste)** below (URL, email, password, your contact).
4. **Send** via email or chat (PDF export optional — copy the handout section only).
5. **Optional:** 15‑minute walkthrough call using the [Suggested first-week tasks](#suggested-first-week-tasks).
6. **Log feedback** in [`beta-feedback.md`](./beta-feedback.md) after each conversation or email thread.
7. **Prioritize fixes** in [`PROJECT_STATE.md`](./PROJECT_STATE.md) backlog.

### What to customize each time

| Placeholder            | You fill in                                                          |
| ---------------------- | -------------------------------------------------------------------- |
| `[APP_URL]`            | Production or staging URL (e.g. Vercel deployment)                   |
| `[LOGIN_EMAIL]`        | Owner login you created for them                                     |
| `[TEMP_PASSWORD]`      | Initial password (ask them to change via Forgot password if enabled) |
| `[YOUR_NAME]`          | Your name                                                            |
| `[YOUR_EMAIL]`         | Support email                                                        |
| `[YOUR_PHONE_OR_CHAT]` | WhatsApp / Telegram / phone (optional)                               |
| `[TRIAL_END_DATE]`     | When their trial ends                                                |

### What not to share

- Do not send Supabase keys, Stripe secrets, or repo access unless you explicitly want technical co-testers.
- Do not promise features listed under [Known limitations](#known-limitations).

### After the beta

- Export or note anything they need kept (clients, appointments) before deactivating trial accounts.
- Summarize themes from `beta-feedback.md` into `PROJECT_STATE.md` decisions or backlog.

---

## Tester handout (copy-paste)

Send everything between the lines below to your tester.

---

**Wellness Manage — beta access**

Hi,

You're invited to try **Wellness Manage**, a simple back-office tool for small wellness practices (clients, appointments, staff, services). This is an early beta: we're looking for honest feedback, not perfection.

### Login

|              |                 |
| ------------ | --------------- |
| **App**      | [APP_URL]       |
| **Email**    | [LOGIN_EMAIL]   |
| **Password** | [TEMP_PASSWORD] |

Use **Sign in** on the login page. If you forget your password, use **Forgot password** (if enabled for your account) or contact us.

**Trial period:** access until **[TRIAL_END_DATE]**. After that, billing settings explain how to continue with a lifetime license (one-time payment, no subscription required for beta).

### What to use it for

- **Clients** — your customer list (not clinical records).
- **Appointments** — book, edit, cancel, mark completed.
- **Staff** — team members who provide services (you can add staff manually).
- **Services & Categories** — massage, yoga, etc.
- **Dashboard** — overview and revenue from completed appointments.

### Suggested first-week tasks

Try these in order (~30–45 minutes total):

1. Add **2–3 clients** (Clients → Add Client).
2. Review **Services** — edit names/duration/price if needed.
3. **Book an appointment** (Appointments → New) — use guided booking from staff availability.
4. Open the appointment → **Mark completed** and check Dashboard revenue.
5. **Edit** another appointment (change date/time) — client and staff should get a reschedule email.
6. **Archive/cancel** an appointment — client and staff should get a cancellation email.
7. Add a **staff member** (Staff → Add Staff) and assign services + availability.
8. Skim **Settings → Billing** so you know what happens when the trial ends.

### Email notifications

When appointments are created, rescheduled, or cancelled, clients and assigned staff receive email (if Resend is configured for your environment). Check spam folders during testing.

### Getting help & giving feedback

We want to hear what's confusing, broken, or missing.

|                   |                                                           |
| ----------------- | --------------------------------------------------------- |
| **Contact**       | [YOUR_NAME] — [YOUR_EMAIL] / [YOUR_PHONE_OR_CHAT]         |
| **Best feedback** | Short screen recording or screenshots + what you expected |

There is **no feedback button in the app** — reply by email or chat.

### Known limitations (beta)

Please don't expect these yet:

- **No public signup** — accounts are created for you.
- **No client self-booking portal** — you book appointments inside the app.
- **No clinical / medical records** — general client contact info only.
- **Staff login** — staff profiles can exist before they have a login; full multi-user polish is still evolving.
- **Subscriptions** — beta uses a **lifetime license** (one-time), not monthly plans.
- **English only** for now.

### Privacy

Use test or real client data at your discretion. This is beta software — treat sensitive data accordingly and tell us if you need data export or deletion.

Thank you for helping shape Wellness Manage.

— [YOUR_NAME]

---

## Operator reference

### Creating a tester account (typical path)

**Production / hosted Supabase:**

1. Supabase Dashboard → **Authentication** → create user with `[LOGIN_EMAIL]`.
2. Ensure a **profile** row exists with `role = owner` and correct `organization_id`.
3. Organization row should have `trial_ends_at` set (14 days from start is the seed default).
4. Optionally seed services, staff, and availability via SQL or have the tester create their own.

**Local demo only (not for real testers):**

```bash
pnpm supabase:start
pnpm db:seed
# Login: owner@example.com / password123
```

### UI labels (code vs screen)

| In the database / code | What testers see |
| ---------------------- | ---------------- |
| members                | Clients          |
| visits                 | Appointments     |
| profiles / team        | Staff            |
| event_types            | Services         |
| event_categories       | Categories       |

### Trial & billing

- **Trial:** 14 days from org creation unless you change `trial_ends_at`.
- **When trial expires:** app redirects to **Settings → Billing**; core pages are blocked until they purchase the lifetime license (Stripe checkout).
- **Allowed during expired trial:** billing, plans, profile, organization settings.

### What to watch during beta

- Do they complete the [first-week tasks](#suggested-first-week-tasks) without a call?
- Do emails (confirm / reschedule / cancel) arrive?
- Do they hit trial/billing confusion?
- Do they ask for signup, client portal, or subscriptions? (Deferred — log in `beta-feedback.md`.)

### Internal QA

Before inviting someone, smoke-test the same flows on `[APP_URL]`.
