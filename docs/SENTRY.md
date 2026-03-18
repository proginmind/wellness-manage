# Sentry Error Monitoring

## Overview

Sentry is integrated for error monitoring, performance tracing, and user context across all runtime environments: browser, Node.js server, Edge middleware, and Supabase Edge Functions.

- **Project**: `wellness-manage` on org `proginmind`
- **Dashboard**: https://proginmind.sentry.io/projects/wellness-manage/

---

## Architecture

### Next.js (3 runtimes)

| File                                     | Runtime | Purpose                                       |
| ---------------------------------------- | ------- | --------------------------------------------- |
| `src/instrumentation-client.ts`          | Browser | Client-side error + performance tracking      |
| `sentry.server.config.ts`                | Node.js | API routes, server components                 |
| `sentry.edge.config.ts`                  | Edge    | Middleware (`src/lib/supabase/middleware.ts`) |
| `src/instrumentation.ts`                 | —       | Registers server + edge configs with Next.js  |
| `src/app/global-error.tsx`               | Browser | Top-level React error boundary                |
| `src/components/sentry-user-context.tsx` | Browser | Attaches user/org context to every event      |

### Supabase Edge Functions

`supabase/functions/notify/index.ts` uses the Sentry Deno SDK.
Each request is wrapped in `Sentry.withScope()` to prevent context leaking between concurrent requests.

---

## Environments

Errors are tagged by environment so staging and production are clearly separated in the Sentry UI.

| Where              | Variable                                    | Value                    |
| ------------------ | ------------------------------------------- | ------------------------ |
| Local dev          | `NEXT_PUBLIC_APP_ENV` in `.env.local`       | `local`                  |
| Staging Vercel     | `NEXT_PUBLIC_APP_ENV` in Vercel env vars    | `staging`                |
| Production Vercel  | `NEXT_PUBLIC_APP_ENV` in Vercel env vars    | `production`             |
| Supabase functions | `APP_ENV` secret via `supabase secrets set` | `staging` / `production` |

Filter by environment in Sentry: **Issues → Environment dropdown**.

---

## User Context

`SentryUserContext` (rendered in root layout) calls `Sentry.setUser()` on every authenticated session:

```ts
{
  id: user.id,
  email: user.email,
  organizationId: user.organization?.id,
  organizationName: user.organization?.name,
}
```

This appears under **"User"** on every Sentry issue — useful for identifying which org is affected.

---

## Source Maps

Source maps are uploaded automatically on every build via `withSentryConfig` in `next.config.ts`.

**Required environment variable** (set in Vercel project settings):

```
SENTRY_AUTH_TOKEN=sntrys_eyJ...
```

Get a token from: **Sentry → Settings → Auth Tokens → Create New Token**
Required scopes: `project:releases`, `org:read`

---

## Sample Rates

| Environment              | `tracesSampleRate` |
| ------------------------ | ------------------ |
| `local` / `development`  | `1.0` (100%)       |
| `staging` / `production` | `0.1` (10%)        |

Adjust in `src/instrumentation-client.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`.

---

## Supabase Edge Function Secrets

Set per project via Supabase CLI:

```bash
pnpx supabase secrets set \
  SENTRY_DSN=https://417f...@sentry.io/... \
  APP_ENV=staging \
  --project-ref <your-project-ref>
```

For local function development, create `supabase/functions/.env` (git-ignored):

```bash
RESEND_API_KEY=re_...
SENTRY_DSN=https://417f...@sentry.io/...
APP_ENV=local
```

---

## Ad Blocker Bypass

Sentry browser requests are tunnelled through the app's own domain via `tunnelRoute: "/monitoring"` in `next.config.ts`. This prevents ad blockers from silently dropping error reports.

---

## Alert Rules

Configure in **Sentry → Alerts**. Recommended setup:

- Alert on new issues in `production` environment only
- Ignore `local` and `staging` to avoid noise
