# Authentication Guide

This document explains how authentication is handled in the application using a centralized approach.

## Overview

Authentication is handled in two layers:

1. **Middleware** - Route-level protection (redirects unauthenticated users)
2. **Server Utilities** - Functions to get user data when needed

This eliminates the need for repetitive auth checks in every page/component.

## Architecture

### Layer 1: Middleware (Route Protection)

The middleware (`src/lib/supabase/middleware.ts`) automatically:

- ✅ Protects all routes under `/dashboard`, `/members`, `/visits`, `/settings`
- ✅ Redirects unauthenticated users to `/login`
- ✅ Redirects authenticated users away from auth pages (`/login`, `/forgot-password`, etc.)
- ✅ Runs on every request before pages load

**You don't need to add auth checks in pages under protected routes!**

### Layer 2: Server Utilities (User Data)

The auth utilities (`src/lib/auth.ts`) provide functions to get user data:

- `requireAuth()` - Get user or redirect to login
- `getUser()` - Get user or null (no redirect)
- `isAuth()` - Check if authenticated (boolean)
- `requireAuthOr(path)` - Get user or redirect to custom path

## Usage Examples

### Pages That Don't Need User Data

If middleware protects the route and you don't need the user object, **you don't need any auth code**:

```typescript
// src/app/members/page.tsx
import { AppLayout } from "@/components/app-layout";
import { MembersListContainer } from "@/components/members-list-container";

export default async function MembersPage() {
  // That's it! Middleware handles auth protection
  return (
    <AppLayout>
      <MembersListContainer />
    </AppLayout>
  );
}
```

### Pages That Need User Data

If you need the user object (to display name, email, etc.), use `requireAuth()`:

```typescript
// src/app/dashboard/page.tsx
import { requireAuth } from "@/lib/auth";
import { AppLayout } from "@/components/app-layout";

export default async function DashboardPage() {
  // Get the authenticated user (middleware already ensured auth)
  const user = await requireAuth();

  return (
    <AppLayout>
      <h1>Welcome back, {user.email}!</h1>
    </AppLayout>
  );
}
```

### Pages That Work for Both Auth/Unauth Users

For pages that show different content based on auth state, use `getUser()`:

```typescript
// src/app/page.tsx (landing page)
import { getUser } from "@/lib/auth";
import { buildRoute } from "@/lib/routes";
import Link from "next/link";

export default async function HomePage() {
  const user = await getUser();

  return (
    <div>
      {user ? (
        <Link href={buildRoute.dashboard()}>Go to Dashboard</Link>
      ) : (
        <Link href={buildRoute.login()}>Sign In</Link>
      )}
    </div>
  );
}
```

### Custom Redirect Path

If you need to redirect to a specific page instead of login:

```typescript
import { requireAuthOr } from "@/lib/auth";
import { buildRoute } from "@/lib/routes";

export default async function SpecialPage() {
  // Redirect to home page if not authenticated
  const user = await requireAuthOr(buildRoute.home());

  return <div>Special content</div>;
}
```

### Boolean Auth Check

When you only need to know if user is authenticated (not the user object):

```typescript
import { isAuth } from "@/lib/auth";

export default async function NavBar() {
  const authenticated = await isAuth();

  return (
    <nav>
      {authenticated ? <ProfileButton /> : <SignInButton />}
    </nav>
  );
}
```

## Adding New Protected Routes

To protect a new route, simply add it to the middleware:

```typescript
// src/lib/supabase/middleware.ts

const protectedRoutes = [
  "/dashboard",
  "/members",
  "/visits",
  "/settings",
  "/new-route", // Add your new route here
];
```

That's it! All pages under `/new-route/*` are now protected.

## Client-Side Auth (Components)

For client components that need auth checks, use the existing `AuthGate` component:

```typescript
"use client";

import { AuthGate } from "@/components/PermissionGate";

export function MyClientComponent() {
  return (
    <AuthGate fallback={<p>Please sign in</p>}>
      <div>Protected content</div>
    </AuthGate>
  );
}
```

Or use the `usePermissions` hook:

```typescript
"use client";

import { usePermissions } from "@/hooks/usePermissions";

export function MyClientComponent() {
  const { isAuthenticated, isLoading } = usePermissions();

  if (isLoading) return <Loader />;
  if (!isAuthenticated) return <p>Please sign in</p>;

  return <div>Protected content</div>;
}
```

## Migration Guide

### Before (Repetitive)

```typescript
// ❌ Old way - repetitive in every page
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function MembersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // ... rest of page
}
```

### After (Clean)

```typescript
// ✅ Or if you need user data:
import { requireAuth } from "@/lib/auth";

// ✅ New way - no auth code needed!
export default async function MembersPage() {
  // Middleware handles auth protection
  // ... rest of page
}

export default async function DashboardPage() {
  const user = await requireAuth();
  // ... rest of page
}
```

## Benefits

✅ **No Repetition** - Auth protection in one place (middleware)  
✅ **Cleaner Code** - Pages focus on their logic, not auth  
✅ **Type Safe** - All utilities return typed User objects  
✅ **Centralized** - Easy to update auth logic across the app  
✅ **Performance** - Middleware runs once per request  
✅ **Flexible** - Multiple utilities for different use cases

## Available Auth Utilities

| Function              | Returns        | Redirects | Use Case                          |
| --------------------- | -------------- | --------- | --------------------------------- |
| `requireAuth()`       | `User`         | Yes       | Pages that require authentication |
| `getUser()`           | `User \| null` | No        | Pages that work for both          |
| `isAuth()`            | `boolean`      | No        | Simple auth checks                |
| `requireAuthOr(path)` | `User`         | Yes       | Custom redirect path              |

## Protected Routes

The following route patterns are automatically protected by middleware:

- `/dashboard` - Dashboard and all sub-routes
- `/members` - Members management
- `/visits` - Visits management
- `/settings` - Settings and all sub-routes (profile, team, invitations, etc.)

## Public Routes

These routes are accessible to everyone:

- `/` - Landing page
- `/login` - Sign in page
- `/forgot-password` - Password recovery
- `/reset-password` - Password reset
- `/invite/:token` - Accept invitations

## Auth Flow

1. **User visits `/members`**
2. **Middleware checks authentication**
   - If authenticated → Allow access
   - If not authenticated → Redirect to `/login`
3. **Page loads** (user is guaranteed to be authenticated)
4. **Page uses `requireAuth()` only if it needs user data**

## Best Practices

1. **Trust Middleware** - If a route is protected by middleware, you don't need additional checks
2. **Use `requireAuth()` only when you need user data** - Not for protection
3. **Add new routes to middleware** - Keep the protected routes list updated
4. **Use `getUser()` for optional auth** - Landing pages, public pages with personalization
5. **Use `AuthGate` for client components** - Client-side conditional rendering

## Common Patterns

### Personalized Landing Page

```typescript
import { getUser } from "@/lib/auth";
import { buildRoute } from "@/lib/routes";

export default async function HomePage() {
  const user = await getUser();

  if (user) {
    return <AuthenticatedHomePage user={user} />;
  }

  return <PublicHomePage />;
}
```

### Conditional Navigation

```typescript
import { isAuth } from "@/lib/auth";
import { buildRoute } from "@/lib/routes";

export default async function NavBar() {
  const authenticated = await isAuth();

  return (
    <nav>
      <Link href={buildRoute.home()}>Home</Link>
      {authenticated ? (
        <>
          <Link href={buildRoute.dashboard()}>Dashboard</Link>
          <Link href={buildRoute.members()}>Members</Link>
          <SignOutButton />
        </>
      ) : (
        <Link href={buildRoute.login()}>Sign In</Link>
      )}
    </nav>
  );
}
```

### Profile Page with Guaranteed User

```typescript
import { requireAuth } from "@/lib/auth";
import { getCurrentUserProfile } from "@/lib/supabase/queries";

export default async function ProfilePage() {
  const user = await requireAuth();
  const profile = await getCurrentUserProfile(user.id);

  return (
    <div>
      <h1>{user.email}</h1>
      <p>Organization: {profile.organization.name}</p>
    </div>
  );
}
```

## Troubleshooting

### "I'm logged in but getting redirected to login"

Check that your route is in the `protectedRoutes` array in middleware.

### "Page says user doesn't exist but I'm on a protected route"

The page might be trying to use `user` without calling `requireAuth()` or `getUser()`. Middleware protects routes but doesn't inject user data into pages.

### "Client component needs auth but server utilities don't work"

Server utilities only work in Server Components. For client components, use `usePermissions` hook or `AuthGate` component.

## Related Documentation

- [Centralized Routes](./ROUTES.md)
- [Permissions System](../src/lib/permissions.md)
- [API Permissions](./API_OPTIMIZATION.md)
