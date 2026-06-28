# Agent guide — wellness-manage

Entry point for Cursor agents (and humans) working in this repo.

## Start here

1. **Read [`docs/PROJECT_STATE.md`](docs/PROJECT_STATE.md)** — current focus, active work, backlog, decisions, handoff notes.
2. **Skim [`.cursor/rules/`](.cursor/rules/)** — coding conventions (stack, API, pages, permissions, database, components). Rules are stable; do not put sprint progress there.
3. **Update `docs/PROJECT_STATE.md`** when you finish meaningful work (move backlog items, add decisions, refresh "Last updated").

## Repo map

| Area                 | Location                                    |
| -------------------- | ------------------------------------------- |
| Next.js app          | `src/app/`, `src/components/`, `src/lib/`   |
| API routes           | `src/app/api/`                              |
| Supabase migrations  | `supabase/migrations/`                      |
| Edge functions       | `supabase/functions/`                       |
| Seed script          | `scripts/seed-db.ts` (`pnpm db:seed`)       |
| Deploy (Supabase)    | `pnpm deploy` → `scripts/deploy.sh`         |
| Concierge beta guide | `docs/BETA_GUIDE.md`                        |
| Beta feedback log    | `docs/beta-feedback.md`                     |
| API docs (Scalar)    | `/api/docs` — spec in `public/openapi.yaml` |

## Common commands

```bash
pnpm dev              # local app
pnpm type-check       # tsc --noEmit
pnpm test             # vitest (permissions, trial, validations)
pnpm format:check     # prettier check
pnpm supabase:start   # local Supabase (Docker)
pnpm db:seed          # demo data
pnpm deploy           # supabase functions + db push
pnpm ship:staging     # push staging → PR → wait CI → rebase-merge to main → reset staging to main
```

## What goes where

| Document                | Purpose                        | Update frequency                 |
| ----------------------- | ------------------------------ | -------------------------------- |
| `docs/PROJECT_STATE.md` | Sprint state, backlog, handoff | Every significant session        |
| `docs/BETA_GUIDE.md`    | Concierge tester onboarding    | When beta process changes        |
| `docs/beta-feedback.md` | Raw tester feedback            | When feedback arrives            |
| `.cursor/rules/*.mdc`   | How to write code              | Rarely — when conventions change |
| `README.md`             | Setup, deployment, reference   | When features/docs change        |
| `docs/*.md`             | Focused guides (seeding, etc.) | When that area changes           |

## Session checklist

- [ ] Read `docs/PROJECT_STATE.md`
- [ ] Do the work
- [ ] Run `pnpm type-check` and `pnpm test` after significant TS/lib changes
- [ ] Update `docs/PROJECT_STATE.md` (active work, completed, decisions)
- [ ] Commit only if the user asked — **show proposed commit message and wait for approval** before running `git commit` (see `.cursor/rules/git-commits.mdc`)
- [ ] **No Cursor attribution** in commits or PR titles/bodies unless the user explicitly asked for it (see `git-commits.mdc`)
