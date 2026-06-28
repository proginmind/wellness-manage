# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev              # start dev server
pnpm type-check       # tsc --noEmit
pnpm test             # vitest run (permissions, trial, validations)
pnpm test:watch       # vitest in watch mode
pnpm format           # prettier --write
pnpm format:check     # prettier check (CI)

pnpm supabase:start   # start local Supabase (Docker)
pnpm supabase:stop    # stop local Supabase
pnpm supabase:db:reset  # wipe + re-run migrations + seed (local)
pnpm db:seed          # seed demo data into linked project

pnpm deploy           # deploy Supabase edge functions + db push
pnpm ship:staging     # push staging → PR → wait CI → rebase-merge to main → reset staging
```

Run `pnpm type-check` and `pnpm test` after significant TypeScript or library changes.

## Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript 5
- **Database / Auth:** Supabase (Postgres + Row Level Security)
- **Styling:** Tailwind CSS v4 + Shadcn UI (`src/components/ui/`)
- **Client data fetching:** SWR v2
- **Forms:** react-hook-form + Zod (`src/lib/validations/`)
- **Payments:** Stripe (one-time lifetime plan; webhooks via `/api/webhooks/stripe`)
- **Error monitoring:** Sentry (browser, server, edge, Supabase edge functions)
- **Package manager:** `pnpm` — never npm or yarn

## Architecture

### Data fetching: Server prefetch + SWR

Every data page uses a two-layer pattern:

1. **Server page** (`page.tsx`) — auth/trial guards, initial data fetch, passes as `fallbackData`
2. **Client container** (`*-list-container.tsx`) — SWR with `fallbackData`, `keepPreviousData: true`

```tsx
// page.tsx — server component
const user = await requireAuth(); // 1. auth guard
const profile = await getCurrentUserProfile(user.id); // 2. profile
await requireTrialAccess(profile.organizationId); // 3. trial guard
const data = await getMembers(); // 4. data fetch

return (
  <AppLayout>
    <MembersListContainer fallbackData={data} />
  </AppLayout>
);
```

```tsx
// *-list-container.tsx — client component
const { data, error } = useSWR(url, fetcher, { keepPreviousData: true, fallbackData });
useTrialGuard(error); // redirects to billing on 402
if (!data) return <Spinner />; // not isLoading — fallbackData populates data
```

**Never** add `loading.tsx` alongside server pages that use `await`. **Never** call `fetch()` to your own API routes from server components — use `queries.ts` directly.

The root layout prefetches `getUserData()` unresolved into `SWRConfig`, so `useUser()` resolves instantly on hydration — no loading state needed for user/trial data in UI components.

### Supabase clients

| Client                 | Import                                               | Use when                                         |
| ---------------------- | ---------------------------------------------------- | ------------------------------------------------ |
| Server (session-aware) | `createClient()` from `@/lib/supabase/server`        | Server components, API routes                    |
| Admin (bypasses RLS)   | `createAdminClient()` from `@/lib/supabase/admin`    | Webhooks, privileged ops                         |
| Browser                | `createBrowserClient()` from `@/lib/supabase/client` | Client components needing direct Supabase access |

All DB queries live in `src/lib/supabase/queries.ts` — never inline Supabase queries in pages or API route files. `getCurrentUserProfile(userId)` is wrapped in React `cache()` and safe to call multiple times per request.

### Type mapping

DB rows use `snake_case` (`*Row` interface); app types use `camelCase` (domain types in `src/types/`). Mapping happens inside `queries.ts` via `dbToMember()`, `dbToOrganization()`, etc.

### API routes

All API routes are in `src/app/api/`. Use permission helpers from `@/lib/api-permissions` — don't roll your own auth:

```ts
const result = await requirePermission("members", "create"); // RBAC + trial check
if (result instanceof NextResponse) return result;
const { organizationId, role } = result;

// Owner-only (billing, org settings):
const result = await requireOwner();

// Any authenticated user:
const result = await requireAuth();
```

Errors: always `NextResponse.json({ error: "message" }, { status: NNN })`. Status codes: 401 Unauthorized, 403 Forbidden, 402 Trial expired, 404 Not found, 500 Server error. Wrap in try/catch; log with `console.error`.

### Permission system

Two roles: `owner` and `staff`. Defined in `src/lib/permissions.ts`.

- **Server/API:** `requirePermission()` from `@/lib/api-permissions`; `can()` / `isOwner()` from `@/lib/permissions`
- **Client components:** `usePermissions()` hook → `can()`, `isOwner`, `canAny()`, etc.
- **JSX gates:** `<PermissionGate resource="staff" action="remove">` / `<OwnerGate>`

### Trial enforcement — four layers

Apply all relevant layers when adding protected functionality:

| Layer       | File                                                  | What it does                                   |
| ----------- | ----------------------------------------------------- | ---------------------------------------------- |
| Middleware  | `src/lib/supabase/middleware.ts`                      | Redirects expired trial users from page routes |
| Server page | `src/lib/trial-server.ts` → `requireTrialAccess()`    | Redirects before any data fetch                |
| API         | `src/lib/api-permissions.ts` → `requirePermission()`  | Returns 402 when trial expired                 |
| Client SWR  | `src/hooks/useTrialGuard.ts` → `useTrialGuard(error)` | Redirects to billing on 402                    |

`billing`, `plans`, `profile`, `organization` are always accessible (defined in `TRIAL_ALLOWED_RESOURCES` in `@/lib/trial.ts`).

## Conventions

### Routes

All routes come from `buildRoute` / `buildApiRoute` in `@/lib/routes` — never hardcode strings like `"/members"` or `"/api/members"`. All exports are functions; always call them: `buildRoute.dashboard()`, `buildRoute.member(id)`.

### Utilities

- `cn()` from `@/lib/utils` for className merging
- `formatCurrency()` from `@/lib/currency` for all money display
- `fetcher` from `@/lib/fetcher` for SWR calls (attaches `.info` and `.status` to errors)

### Component naming

| Type            | File pattern           |
| --------------- | ---------------------- |
| SWR container   | `*-list-container.tsx` |
| Pure list/table | `*-list.tsx`           |
| Card            | `*-card.tsx`           |
| Form            | `*-form.tsx`           |

Shadcn primitives in `src/components/ui/` — do not edit. Always import from `@/components/ui/*`, not from Radix directly.

### UI labels vs code names

| Code entity         | UI label     |
| ------------------- | ------------ |
| `members`           | Clients      |
| `visits`            | Appointments |
| `event_types`       | Services     |
| `team` / `profiles` | Staff        |
| `event_categories`  | Categories   |

### Page structure

```tsx
export const metadata: Metadata = { title: "Clients" }; // UI label

export default async function MembersPage() {
  const user = await requireAuth();
  const profile = await getCurrentUserProfile(user.id);
  await requireTrialAccess(profile.organizationId);
  const data = await getMembers();

  return (
    <AppLayout>
      <PageHeader title="Clients" description="..." action={<Button>...</Button>} />
      <div className="container mx-auto px-4 py-6">
        <MembersListContainer fallbackData={data} />
      </div>
    </AppLayout>
  );
}
```

Wrap everything in `<AppLayout>`. Use `<PageHeader>` for title + action button.

### TypeScript

No `any`. Explicit return types on exported functions. Prefer `interface` over `type` for object shapes.

### No comments

No explanatory comments in code ("// fetch the data"). Only comment non-obvious WHY (hidden constraint, workaround).

## Git / PRs

- **Never** run `git add`, `git commit`, or `git push` without explicit user request.
- "Fix this" or "implement X" is not permission to commit — wait for an explicit request.
- Always show the proposed commit message and file list, then wait for approval before committing.
- Show proposed PR title + body before creating/updating a PR if the user didn't supply exact text.
- Do not include agent attribution (tool names, "Made with X") in commits or PR text unless explicitly requested.

## Project context

- **Product:** Wellness Manage — back-office scheduling for small wellness businesses (massage salons, osteopath practices)
- **Status:** Concierge beta — no public `/signup`; accounts created via Supabase dashboard or `pnpm db:seed`
- **Stripe:** live one-time product "Wellness Manage" ~$149 (`price_1TCOglGOA5x15O90WqKOde51`); no subscriptions for beta
- **State tracking:** `docs/PROJECT_STATE.md` — read at session start, update when work meaningfully changes
- **API docs:** `/api/docs` (Scalar UI); spec at `public/openapi.yaml`
