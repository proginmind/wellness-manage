# Project State

> **Last updated:** 2026-06-26  
> **Updated by:** agent (hide payment method for lifetime)

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

| Item                                      | Date       | Notes                                                                         |
| ----------------------------------------- | ---------- | ----------------------------------------------------------------------------- |
| Hide payment method UI for lifetime plans | 2026-06-26 | Billing page only shows payment method for recurring subscriptions            |
| Mark appointment as **completed**         | 2026-06-26 | `completeVisit()`, PATCH `status: completed`, detail page + guards            |
| Project state tracking setup              | 2026-06-26 | Added `docs/PROJECT_STATE.md`, `AGENTS.md`, `.cursor/rules/project-state.mdc` |

---

## Backlog (prioritized)

### Product — beta / paid pilot blockers

| Priority | Item                                           | Why                                                                            |
| -------- | ---------------------------------------------- | ------------------------------------------------------------------------------ |
| P1       | Staff invite / add flow                        | Invitations removed (`040_drop_invitations_feature.sql`); team is list-only    |
| P2       | Client profile: appointment history            | Not on member detail page                                                      |
| P2       | Cancel/reschedule email notifications          | Only visit-created emails via `notify` edge function                           |
| P2       | Commit `docs/e2e-scenarios.md`                 | Manual E2E checklist exists but untracked                                      |
| P2       | **`docs/BETA_GUIDE.md`** for concierge testers | Login, scope/limitations, how to reach you — replaces public signup UX for now |

### Deferred (after small-audience beta validation)

| Item                                                  | Gate                                                                                                  |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Public **signup page**                                | Product loop validated with concierge users; support polish in place                                  |
| **Subscription plans** (monthly/yearly)               | Lifetime license sufficient for first beta cohort; recurring billing for later stages / broader users |
| **Payment method update** (Customer Portal or custom) | With subscription plans — not needed for lifetime one-time checkout                                   |
| In-app **feedback channel**                           | Email/chat + [`docs/beta-feedback.md`](./beta-feedback.md) sufficient for now                         |

### Infrastructure

| Priority | Item                              | Why                                                                   |
| -------- | --------------------------------- | --------------------------------------------------------------------- |
| P0       | GitHub Actions CI                 | `type-check`, `format:check`, `build` — no `.github/workflows/` today |
| P1       | Vitest for core libs              | `permissions.ts`, `trial.ts`, Zod schemas — no test framework         |
| P1       | Fix README drift                  | Documents `pnpm lint` / ESLint but neither exists                     |
| P1       | Complete `.env.example`           | Missing Sentry, seed vars, `APP_ENV`                                  |
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
| 2026-06-26 | **Defer payment method update** for lifetime beta       | Lifetime is one-time Checkout; hide billing payment-method card until subscription plans ship                                                                                                                                                  |

---

## Beta audience (concierge test)

**Who:** first few users are **owners** of small businesses — e.g. massage salon, osteopath cabinet/practice, comparable wellness or bodywork practices.

**Profile:** owner does their own admin (or one receptionist later); needs client list + internal appointment booking, not clinical records or online client booking yet.

**Feedback:** email or chat apps → logged in [`docs/beta-feedback.md`](./beta-feedback.md).

---

## Product readiness snapshot

**Target users (beta):** owners of small massage salons, osteopath cabinets, and similar practices — back-office scheduling, not clinical records. Product name: **Wellness Manage**.

| Scenario                                      | Ready?                                       |
| --------------------------------------------- | -------------------------------------------- |
| Guided beta (you set up account, 2-week test) | Yes — **intended path**                      |
| Self-serve signup → trial → pay               | **Deferred** — not a current gap             |
| Solo practitioner daily use                   | Yes — complete visit from appointment detail |
| Owner + staff with separate logins            | No — no staff invite UI                      |

**Strong:** RBAC, trial gating, appointment booking + availability, services, Stripe webhook design.  
**Weak:** staff onboarding (multi-login), billing polish, notifications beyond create.  
**Intentionally out of scope for now:** public signup, in-app feedback, subscription billing.

---

## Infrastructure snapshot

**Strong:** TypeScript strict, Prettier/Husky, 40 Supabase migrations, Sentry, OpenAPI at `/api/docs`, Cursor rules in `.cursor/rules/`.  
**Missing:** CI, automated tests, ESLint (README stale), pre-commit only runs Prettier.

**Stripe:** integrated — checkout, webhooks, billing page. **Currently configured:** lifetime (one-time) license only in Stripe Dashboard; code also supports subscriptions when products exist. Dev without `STRIPE_SECRET_KEY` uses mock “Lifetime $50”. Subscription plans = later. In-app payment method update still a stub.

---

## Open questions

_None — see Decisions log._

---

## Agent handoff notes

- **Do not commit** unless the user explicitly asks (see `.cursor/rules/git-commits.mdc`).
- **Trial enforcement:** four layers — see `.cursor/rules/permissions-and-trial.mdc`.
- **Page labels vs code:** members → Clients, visits → Appointments, event_types → Services (see `page-conventions.mdc`).
- **Beta onboarding:** no `/signup` — create users via Supabase Dashboard or `pnpm db:seed`; see Decisions log.
- When picking up backlog items, move row from Backlog → Active work, then to Recently completed when done.
- If this file grows past ~200 lines, archive old "Recently completed" rows to `docs/PROJECT_STATE_ARCHIVE.md`.
