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
| Manual E2E scenarios | `docs/e2e-scenarios.md`                     |
| API docs (Scalar)    | `/api/docs` — spec in `public/openapi.yaml` |

## Common commands

```bash
pnpm dev              # local app
pnpm type-check       # tsc --noEmit
pnpm format:check     # prettier check
pnpm supabase:start   # local Supabase (Docker)
pnpm db:seed          # demo data
pnpm deploy           # supabase functions + db push
```

## What goes where

| Document                | Purpose                        | Update frequency                 |
| ----------------------- | ------------------------------ | -------------------------------- |
| `docs/PROJECT_STATE.md` | Sprint state, backlog, handoff | Every significant session        |
| `.cursor/rules/*.mdc`   | How to write code              | Rarely — when conventions change |
| `README.md`             | Setup, deployment, reference   | When features/docs change        |
| `docs/*.md`             | Focused guides (seeding, E2E)  | When that area changes           |

## Session checklist

- [ ] Read `docs/PROJECT_STATE.md`
- [ ] Do the work
- [ ] Run `pnpm type-check` after significant TS changes
- [ ] Update `docs/PROJECT_STATE.md` (active work, completed, decisions)
- [ ] Commit only if the user asked
