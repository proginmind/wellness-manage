# Project State

> **Last updated:** 2026-06-26  
> **Updated by:** agent (initial setup)

Agents and humans: read this file at the **start** of a work session and update it at the **end** when work meaningfully changed. Keep entries factual and brief — link to files/PRs, don't duplicate README or `.cursor/rules/`.

---

## Current focus

No active implementation in progress. Last discussion was **product/infrastructure assessment** for osteopath beta readiness and paid plans.

---

## Active work

| Item | Status | Notes             |
| ---- | ------ | ----------------- |
| —    | —      | Nothing in flight |

---

## Recently completed

| Item                         | Date       | Notes                                                                         |
| ---------------------------- | ---------- | ----------------------------------------------------------------------------- |
| Project state tracking setup | 2026-06-26 | Added `docs/PROJECT_STATE.md`, `AGENTS.md`, `.cursor/rules/project-state.mdc` |

---

## Backlog (prioritized)

### Product — beta / paid pilot blockers

| Priority | Item                                                    | Why                                                                                                    |
| -------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| P0       | Mark appointment as **completed** in UI                 | Visits stay `pending`; dashboard revenue/charts empty (`createVisit` in `src/lib/supabase/queries.ts`) |
| P0       | **Signup page** (or document concierge-only onboarding) | No `/signup`; users created via Supabase/seed                                                          |
| P1       | Rebrand "Wellness" → neutral / per-org                  | Sidebar, `layout.tsx`, `constants.ts` still say Wellness                                               |
| P1       | Stripe payment method update (or Customer Portal)       | Stub in `src/components/billing/payment-method-card.tsx`                                               |
| P1       | Staff invite / add flow                                 | Invitations removed (`040_drop_invitations_feature.sql`); team is list-only                            |
| P2       | Client profile: appointment history                     | Not on member detail page                                                                              |
| P2       | Cancel/reschedule email notifications                   | Only visit-created emails via `notify` edge function                                                   |
| P2       | Commit `docs/e2e-scenarios.md`                          | Manual E2E checklist exists but untracked                                                              |

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

| Date       | Decision                                             | Rationale                                             |
| ---------- | ---------------------------------------------------- | ----------------------------------------------------- |
| 2026-06-26 | State lives in `docs/PROJECT_STATE.md`, not in rules | Rules = stable conventions; state = volatile progress |
| 2026-06-26 | Concierge beta viable before self-serve signup       | Core booking works; onboarding/billing polish lags    |

---

## Product readiness snapshot

**Target user:** small practice owner (e.g. solo osteopath) — back-office scheduling, not clinical records.

| Scenario                                      | Ready?                            |
| --------------------------------------------- | --------------------------------- |
| Guided beta (you set up account, 2-week test) | Yes, with caveats                 |
| Self-serve signup → trial → pay               | No                                |
| Solo practitioner daily use                   | Mostly — missing "complete visit" |
| Owner + staff with separate logins            | No — no staff invite UI           |

**Strong:** RBAC, trial gating, appointment booking + availability, services, Stripe webhook design.  
**Weak:** signup, staff onboarding, visit completion, billing polish, notifications beyond create.

---

## Infrastructure snapshot

**Strong:** TypeScript strict, Prettier/Husky, 40 Supabase migrations, Sentry, OpenAPI at `/api/docs`, Cursor rules in `.cursor/rules/`.  
**Missing:** CI, automated tests, ESLint (README stale), pre-commit only runs Prettier.

---

## Open questions

- Brand name for production (still "Wellness Manage")?
- Concierge-only beta vs build signup first?
- Stripe live products configured for which plan(s)?

---

## Agent handoff notes

- **Do not commit** unless the user explicitly asks (see `.cursor/rules/stack.mdc`).
- **Trial enforcement:** four layers — see `.cursor/rules/permissions-and-trial.mdc`.
- **Page labels vs code:** members → Clients, visits → Appointments, event_types → Services (see `page-conventions.mdc`).
- When picking up backlog items, move row from Backlog → Active work, then to Recently completed when done.
- If this file grows past ~200 lines, archive old "Recently completed" rows to `docs/PROJECT_STATE_ARCHIVE.md`.
