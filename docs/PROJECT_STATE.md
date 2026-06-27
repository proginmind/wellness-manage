# Project State

> **Last updated:** 2026-06-18  
> **Updated by:** agent (beta readiness re-evaluation)

Agents and humans: read this file at the **start** of a work session and update it at the **end** when work meaningfully changed. Keep entries factual and brief — link to files/PRs, don't duplicate README or `.cursor/rules/`.

---

## Current focus

No active implementation in progress.

---

## Active work

| Item | Status | Notes             |
| ---- | ------ | ----------------- |
| —    | —      | Nothing in flight |

---

## Recently completed

| Item                                           | Date       | Notes                                                                               |
| ---------------------------------------------- | ---------- | ----------------------------------------------------------------------------------- |
| **README + `.env.example` drift fix**          | 2026-06-18 | Scripts, routes, tooling; env template completed                                    |
| **`docs/BETA_GUIDE.md`** for concierge testers | 2026-06-26 | Onboarding checklist + copy-paste tester handout                                    |
| **Production `notify` on prod Supabase**       | 2026-06-26 | `wsiattkcxmdoswkirkjg`; RESEND + `APP_ENV=production`                               |
| **Cancel/reschedule email notifications**      | 2026-06-26 | 4 templates in `notify`; wired on PATCH cancel/edit                                 |
| Client profile: **appointment history**        | 2026-06-26 | `GET /api/members/[id]/visits`, `VisitHistoryCard`; E2E MH-01–04 pass               |
| Manual **add staff** from Staff page           | 2026-06-26 | `POST /api/profiles`, `/team/new`; profile without login; email auth link on signup |
| Hide payment method UI for lifetime plans      | 2026-06-26 | Billing page only shows payment method for recurring subscriptions                  |
| Mark appointment as **completed**              | 2026-06-26 | `completeVisit()`, PATCH `status: completed`, detail page + guards                  |
| Project state tracking setup                   | 2026-06-26 | Added `docs/PROJECT_STATE.md`, `AGENTS.md`, `.cursor/rules/project-state.mdc`       |

---

## Backlog (prioritized)

### Product — beta / paid pilot blockers

_None remaining for first concierge cohort — use [`BETA_GUIDE.md`](./BETA_GUIDE.md) to onboard testers._

### Deferred (after small-audience beta validation)

| Item                                                  | Gate                                                                                                  |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Public **signup page**                                | Product loop validated with concierge users; support polish in place                                  |
| **Subscription plans** (monthly/yearly)               | Lifetime license sufficient for first beta cohort; recurring billing for later stages / broader users |
| **Payment method update** (Customer Portal or custom) | With subscription plans — not needed for lifetime one-time checkout                                   |
| In-app **feedback channel**                           | Email/chat + [`docs/beta-feedback.md`](./beta-feedback.md) sufficient for now                         |
| **Email/auth staff invitations**                      | Manual profile add sufficient for beta; invite flow if self-serve signup ships                        |

### Infrastructure

| Priority | Item                              | Why                                                                   |
| -------- | --------------------------------- | --------------------------------------------------------------------- |
| P0       | GitHub Actions CI                 | `type-check`, `format:check`, `build` — no `.github/workflows/` today |
| P1       | Vitest for core libs              | `permissions.ts`, `trial.ts`, Zod schemas — no test framework         |
| P2       | Playwright for top E2E scenarios  | Spec in `docs/e2e-scenarios.md` (BK-01, BK-09, etc.)                  |
| P2       | Automate Supabase deploy on merge | App on Vercel; DB/functions manual via `scripts/deploy.sh`            |

---

## Decisions log

| Date       | Decision                                                | Rationale                                                                                                                                                                                                                                      |
| ---------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-06-26 | State lives in `docs/PROJECT_STATE.md`, not in rules    | Rules = stable conventions; state = volatile progress                                                                                                                                                                                          |
| 2026-06-26 | Concierge beta viable before self-serve signup          | Core booking works; onboarding/billing polish lags                                                                                                                                                                                             |
| 2026-06-26 | Product name stays **Wellness Manage**                  | Fits wellness salons and other small practice managers (osteopaths, etc.); no rebrand planned                                                                                                                                                  |
| 2026-06-26 | **No public signup** — concierge beta only              | Product not ready for self-serve; test with small audience first. Accounts created manually (Supabase/seed). Feedback via direct channels (call, email, shared doc) — not in-app. Revisit signup + feedback UI after beta validates core loop. |
| 2026-06-26 | **First beta users:** small-business **owners**         | Massage salons, osteopath practices, similar — owner-operators or owner-managed cabinets; not enterprise chains. Likely solo or small team (staff invite gap matters less if owner-only at first).                                             |
| 2026-06-26 | **Stripe: lifetime license only**                       | One-time lifetime product configured in Dashboard; no subscription plans for beta. Recurring subscriptions deferred to later stages / other user segments.                                                                                     |
| 2026-06-26 | **Beta feedback:** email/chat → `docs/beta-feedback.md` | No in-app feedback; owner collects via email or chat apps and logs entries in repo under `docs/`.                                                                                                                                              |
| 2026-06-26 | **Manual staff add** (no email invite)                  | Owner creates staff profile on `/team/new`; `user_id` null until same email signs up                                                                                                                                                           |
| 2026-06-26 | **Concierge beta: go** (not public launch)              | Core scheduling loop, emails, billing, and BETA_GUIDE sufficient for 1–3 owner-operators with hand onboarding                                                                                                                                  |

---

## Beta audience (concierge test)

**Who:** first few users are **owners** of small businesses — e.g. massage salon, osteopath cabinet/practice, comparable wellness or bodywork practices.

**Profile:** owner does their own admin (or one receptionist later); needs client list + internal appointment booking, not clinical records or online client booking yet.

**Feedback:** email or chat apps → logged in [`docs/beta-feedback.md`](./beta-feedback.md).

---

## Product readiness snapshot

**Target users (beta):** owners of small massage salons, osteopath cabinets, and similar practices — back-office scheduling, not clinical records. Product name: **Wellness Manage**.

**Verdict (2026-06-26):** **Yes — ready to present to target clients via concierge beta.** Not ready for self-serve public launch.

| Scenario                                                             | Ready?       | Notes                                                              |
| -------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------ |
| **Concierge beta** (you onboard 1–3 owners, 14-day trial, hand-hold) | **Yes**      | Use [`BETA_GUIDE.md`](./BETA_GUIDE.md); core daily loop complete   |
| **Demo to prospect** (live walkthrough, you operate Supabase/Stripe) | **Yes**      | Show booking → complete → dashboard; emails if prod smoke-tested   |
| **Hand client a URL and leave** (no onboarding call)                 | **No**       | Expect confusion on staff login, trial/billing, services setup     |
| Self-serve signup → trial → pay                                      | **Deferred** | By design                                                          |
| Solo owner daily use (clients + appointments + complete)             | **Yes**      | Primary beta persona                                               |
| Owner + staff with separate logins                                   | **Partial**  | Manual staff add; login only when staff email matches auth account |
| Client self-booking portal                                           | **No**       | Out of scope for beta                                              |

**Strong:** RBAC, trial gating, guided + manual booking, staff availability, services/categories, mark completed + dashboard revenue, client/staff appointment history, email notifications (create / cancel / reschedule), lifetime Stripe checkout (live product **Wellness Manage** ~$149), concierge onboarding doc.

**Acceptable gaps for beta** (disclose in handout): no public signup, no client portal, partial staff login story, English only, no in-app feedback, no subscriptions.

**Weak (operator / scale, not client blockers):** no CI, no automated tests, manual Supabase function deploys, README/env-example drift.

**Intentionally out of scope:** clinical records, public signup, subscription billing, in-app feedback.

### Pre-flight before first real client

- [ ] Smoke-test **production** URL (not local): book → confirm email → reschedule → cancel email ([`e2e-scenarios.md`](./e2e-scenarios.md) NT-01, NT-02)
- [ ] Confirm Vercel production env: `NEXT_PUBLIC_SUPABASE_URL` → `wsiattkcxmdoswkirkjg`, live Stripe keys
- [ ] Create org + owner auth in **production** Supabase; set `trial_ends_at`
- [ ] Send customized [`BETA_GUIDE.md`](./BETA_GUIDE.md) handout
- [ ] Optional: seed 1–2 services + staff availability so Day 1 is not empty

---

## Infrastructure snapshot

**Strong:** TypeScript strict, Prettier/Husky, 40 Supabase migrations, Sentry, OpenAPI at `/api/docs`, Cursor rules in `.cursor/rules/`.  
**Missing:** CI, automated tests, ESLint (README no longer claims it), pre-commit only runs Prettier.

**Stripe (live):** product **Wellness Manage** — one-time **$149 USD** (`price_1TCOglGOA5x15O90WqKOde51`). Test mode had separate “Lifetime” $50 product. Code supports multiple prices when configured.

---

## Open questions

_None — see Decisions log._

---

## Beta go/no-go log

| Date       | Assessment                                                                 | Decision                                                      |
| ---------- | -------------------------------------------------------------------------- | ------------------------------------------------------------- |
| 2026-06-26 | Core product + prod notify + BETA_GUIDE in place; product blockers cleared | **Go** for concierge beta (1–3 owners), not for public launch |

---

## Agent handoff notes

- **Do not commit** unless the user explicitly asks (see `.cursor/rules/git-commits.mdc`).
- **Trial enforcement:** four layers — see `.cursor/rules/permissions-and-trial.mdc`.
- **Page labels vs code:** members → Clients, visits → Appointments, event_types → Services (see `page-conventions.mdc`).
- **Beta onboarding:** no `/signup` — use [`docs/BETA_GUIDE.md`](./BETA_GUIDE.md); log feedback in [`docs/beta-feedback.md`](./beta-feedback.md).
- When picking up backlog items, move row from Backlog → Active work, then to Recently completed when done.
- **MH E2E (2026-06-26):** MH-01 pass (Emma Johnson, 3 visits newest-first); MH-02 pass (row → visit detail); MH-03 pass (empty state + Book appointment); MH-04 pass (Pending/Completed/Cancelled badges on Olivia Brown); MH-05 not browser-tested — staff has `visits.view` + `members.view` per permissions.
- If this file grows past ~200 lines, archive old "Recently completed" rows to `docs/PROJECT_STATE_ARCHIVE.md`.
