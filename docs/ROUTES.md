# Centralized Routes Configuration

This document explains how routes are managed in the application using a centralized configuration file.

## Overview

All application routes (both UI pages and API endpoints) are defined in `/src/lib/routes.ts`. This provides:

- **Single Source of Truth**: All routes in one place
- **Type Safety**: TypeScript autocomplete and validation
- **Easy Refactoring**: Change a route once, update everywhere
- **Consistency**: No hardcoded strings scattered across the codebase
- **Better Developer Experience**: IDE autocomplete for all routes
- **Uniform API**: All routes are functions for consistency

## File Structure

The routes configuration is organized into two main sections:

1. **Page Route Builders (`buildRoute`)** - All UI page routes as functions
2. **API Route Builders (`buildApiRoute`)** - All API endpoint routes as functions

**Important**: All routes are functions for consistency. Static routes (like `/login`) are zero-parameter functions, while dynamic routes (like `/members/:id`) accept parameters.

## Usage Examples

### Static Page Routes

```typescript
import { ROUTES } from "@/lib/routes";
import Link from "next/link";
import { redirect } from "next/navigation";

// In components
<Link href={ROUTES.DASHBOARD}>Dashboard</Link>
<Link href={ROUTES.MEMBERS_NEW}>Add Member</Link>

// In Server Components
if (!user) {
  redirect(ROUTES.LOGIN);
}
```

### Dynamic Page Routes

```typescript
import { buildRoute } from "@/lib/routes";
import Link from "next/link";

// Link to member detail page
<Link href={buildRoute.member(memberId)}>View Member</Link>

// Link to visit edit page
<Link href={buildRoute.visitEdit(visitId)}>Edit Visit</Link>
```

### Static API Routes

```typescript
import useSWR from "swr";

import { API_ROUTES } from "@/lib/routes";

// Fetch from API
const { data } = useSWR(API_ROUTES.MEMBERS, fetcher);

// Post to API
await fetch(API_ROUTES.AUTH_SIGNOUT, { method: "POST" });
```

### Dynamic API Routes

```typescript
import { buildApiRoute } from "@/lib/routes";

// Fetch specific member
const response = await fetch(buildApiRoute.member(memberId));

// Accept invitation
const response = await fetch(buildApiRoute.invitationAccept(token), {
  method: "POST",
});
```

### Route Utilities

```typescript
import { buildRoute, isRouteActive } from "@/lib/routes";

// Check if current path is under a route
const isSettingsActive = isRouteActive("/settings", pathname);

// Usage in component
<Link
  href={buildRoute.settingsProfile()}
  className={isRouteActive("/settings", pathname) ? "active" : ""}
>
  Settings
</Link>
```

## Available Routes

### Page Routes

| Constant                                 | Path                        | Description           |
| ---------------------------------------- | --------------------------- | --------------------- |
| `ROUTES.HOME`                            | `/`                         | Landing page          |
| `ROUTES.LOGIN`                           | `/login`                    | Login page            |
| `ROUTES.FORGOT_PASSWORD`                 | `/forgot-password`          | Forgot password page  |
| `ROUTES.RESET_PASSWORD`                  | `/reset-password`           | Reset password page   |
| `ROUTES.DASHBOARD`                       | `/dashboard`                | Dashboard page        |
| `buildRoute.team()`                      | `/team`                     | Team management       |
| `ROUTES.MEMBERS`                         | `/members`                  | Members list          |
| `ROUTES.MEMBERS_NEW`                     | `/members/new`              | Add new member        |
| `ROUTES.VISITS`                          | `/visits`                   | Visits list           |
| `ROUTES.VISITS_NEW`                      | `/visits/new`               | Add new visit         |
| `ROUTES.SETTINGS_PROFILE`                | `/settings/profile`         | User profile settings |
| `ROUTES.SETTINGS_ORGANIZATION`           | `/settings/organization`    | Organization settings |
| `buildRoute.settingsTeam()` (deprecated) | `/settings/team`            | Use `team()` instead  |
| `ROUTES.SETTINGS_INVITATIONS`            | `/settings/invitations`     | Staff invitations     |
| `ROUTES.SETTINGS_INVITATIONS_NEW`        | `/settings/invitations/new` | Create new invitation |

### Dynamic Page Route Builders

| Function                    | Parameters      | Example                                              |
| --------------------------- | --------------- | ---------------------------------------------------- |
| `buildRoute.member(id)`     | `id: string`    | `buildRoute.member("123")` → `/members/123`          |
| `buildRoute.memberEdit(id)` | `id: string`    | `buildRoute.memberEdit("123")` → `/members/123/edit` |
| `buildRoute.visit(id)`      | `id: string`    | `buildRoute.visit("456")` → `/visits/456`            |
| `buildRoute.visitEdit(id)`  | `id: string`    | `buildRoute.visitEdit("456")` → `/visits/456/edit`   |
| `buildRoute.invite(token)`  | `token: string` | `buildRoute.invite("abc")` → `/invite/abc`           |

### API Routes

| Constant                         | Path                       | Description          |
| -------------------------------- | -------------------------- | -------------------- |
| `API_ROUTES.AUTH_ME`             | `/api/auth/me`             | Get current user     |
| `API_ROUTES.AUTH_SIGNOUT`        | `/api/auth/signout`        | Sign out user        |
| `API_ROUTES.MEMBERS`             | `/api/members`             | Members CRUD         |
| `API_ROUTES.VISITS`              | `/api/visits`              | Visits CRUD          |
| `API_ROUTES.EVENT_TYPES`         | `/api/event-types`         | Event types CRUD     |
| `API_ROUTES.INVITATIONS`         | `/api/invitations`         | Invitations CRUD     |
| `buildApiRoute.profiles()`       | `/api/profiles`            | Profiles/staff list  |
| `API_ROUTES.STATS`               | `/api/stats`               | Dashboard statistics |
| `API_ROUTES.HEALTH`              | `/api/health`              | Health check         |
| `API_ROUTES.UPLOAD_MEMBER_IMAGE` | `/api/upload/member-image` | Upload member image  |

### Dynamic API Route Builders

| Function                                 | Parameters      | Example                                                                         |
| ---------------------------------------- | --------------- | ------------------------------------------------------------------------------- |
| `buildApiRoute.member(id)`               | `id: string`    | `buildApiRoute.member("123")` → `/api/members/123`                              |
| `buildApiRoute.visit(id)`                | `id: string`    | `buildApiRoute.visit("456")` → `/api/visits/456`                                |
| `buildApiRoute.invitation(id)`           | `id: string`    | `buildApiRoute.invitation("789")` → `/api/invitations/789`                      |
| `buildApiRoute.invitationProcess(token)` | `token: string` | `buildApiRoute.invitationProcess("abc")` → `/api/invitations/process/abc`       |
| `buildApiRoute.invitationAccept(token)`  | `token: string` | `buildApiRoute.invitationAccept("abc")` → `/api/invitations/process/abc/accept` |
| `buildApiRoute.profile(id)`              | `id: string`    | `buildApiRoute.profile("123")` → `/api/profiles/123`                            |
| `buildApiRoute.profileEventTypes(id)`    | `id: string`    | `buildApiRoute.profileEventTypes("123")` → `/api/profiles/123/event-types`      |

## Adding New Routes

All routes are functions for consistency. Add static routes as zero-parameter functions, and dynamic routes with parameters.

### 1. Add Static Page Route

```typescript
// In src/lib/routes.ts - buildRoute section

export const buildRoute = {
  // ... existing routes
  newFeature: () => "/new-feature" as const,
} as const;
```

### 2. Add Dynamic Page Route

```typescript
// In src/lib/routes.ts - buildRoute section

export const buildRoute = {
  // ... existing routes
  newFeature: (id: string) => `/new-feature/${id}` as const,
} as const;
```

### 3. Add Static API Route

```typescript
// In src/lib/routes.ts - buildApiRoute section

export const buildApiRoute = {
  // ... existing routes
  newFeatureApi: () => "/api/new-feature" as const,
} as const;
```

### 4. Add Dynamic API Route

```typescript
// In src/lib/routes.ts - buildApiRoute section

export const buildApiRoute = {
  // ... existing routes
  newFeatureApi: (id: string) => `/api/new-feature/${id}` as const,
} as const;
```

## Migration Guide

If you have existing hardcoded routes, here's how to migrate them:

### Before (Hardcoded)

```typescript
// ❌ Don't do this
<Link href="/dashboard">Dashboard</Link>
<Link href={`/members/${id}`}>Member</Link>
const response = await fetch("/api/members");
router.push("/login");
```

### After (Function-Based)

```typescript
// ✅ Do this instead
import { buildApiRoute, buildRoute } from "@/lib/routes";

// Always call functions with ()
<Link href={buildRoute.dashboard()}>Dashboard</Link>
<Link href={buildRoute.member(id)}>Member</Link>
const response = await fetch(buildApiRoute.members());
router.push(buildRoute.login());
```

**Important**: All routes are functions now, even static ones. Always call with `()` for static routes.

## Benefits

### 1. Consistency

All routes use the same pattern - they're all functions. This makes the API more predictable and easier to learn.

```typescript
// Everything follows the same pattern
buildRoute.dashboard(); // static route - no params
buildRoute.member(id); // dynamic route - with params
buildApiRoute.members(); // static API - no params
buildApiRoute.member(id); // dynamic API - with params
```

### 2. Easy Refactoring

If you need to change `/members` to `/team-members`, you only need to update one place:

```typescript
export const buildRoute = {
  members: () => "/team-members" as const, // Changed here only
};
```

All links and references automatically update.

### 3. Type Safety

TypeScript will catch typos and invalid routes:

```typescript
// ✅ TypeScript happy
<Link href={buildRoute.dashboard()}>Dashboard</Link>

// ❌ TypeScript error - property doesn't exist
<Link href={buildRoute.dashbord()}>Dashboard</Link>

// ❌ TypeScript error - missing required parameter
<Link href={buildRoute.member()}>Member</Link>
```

### 4. Autocomplete

Your IDE will show you all available routes:

```typescript
import { buildRoute } from "@/lib/routes";

buildRoute. // IDE shows: dashboard(), members(), member(id), etc.
```

### 5. Find All Usages

You can easily find where a route is used by searching for the function:

```
buildRoute.members  // Find all references to the members route
```

## Best Practices

1. **Always import from `@/lib/routes`** - Never hardcode route strings
2. **Always call functions** - Even for static routes, use `buildRoute.dashboard()` not `buildRoute.dashboard`
3. **Use camelCase naming** - Follow JavaScript conventions (`membersNew`, not `MEMBERS_NEW`)
4. **Keep routes organized** - Group related routes together
5. **Document new routes** - Add comments for complex routes
6. **Use descriptive names** - Make it clear what each route does

## Common Patterns

### Search Parameters

```typescript
// For routes with search params, use template strings
const url = `${buildRoute.login()}?invitation=${token}`;
const url = `${buildApiRoute.members()}?search=${query}`;
```

### Form Actions

```typescript
// Use buildApiRoute for form actions - call functions with ()
<form action={buildApiRoute.authSignout()} method="post">
  <Button type="submit">Sign Out</Button>
</form>
```

### Conditional Redirects

```typescript
// Check user state and redirect appropriately - call functions with ()
if (!user) {
  redirect(buildRoute.login());
} else if (!user.profile) {
  redirect(buildRoute.settingsProfile());
} else {
  redirect(buildRoute.dashboard());
}
```

### Active Route Highlighting

```typescript
import { usePathname } from "next/navigation";
import { buildRoute, isRouteActive } from "@/lib/routes";

const pathname = usePathname();
const isActive = isRouteActive("/settings", pathname);

<Link
  href={buildRoute.settingsProfile()}
  className={isActive ? "active" : ""}
>
  Settings
</Link>
```

## Related Documentation

- [Project Structure](../PROJECT_STRUCTURE.md)
- [API Documentation](./API_OPTIMIZATION.md)
- [TypeScript Best Practices](../README.md#development)
