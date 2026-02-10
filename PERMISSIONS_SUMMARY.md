# Permissions Summary

## Role-Based Access Control (RBAC)

This application uses a granular permission system based on roles, resources, and actions.

## Roles

- **Owner** - Organization owner with full administrative access
- **Staff** - Regular staff member with limited permissions

## Resources & Permissions

### Members

| Action  | Owner | Staff |
| ------- | ----- | ----- |
| View    | ✅    | ✅    |
| Create  | ✅    | ✅    |
| Update  | ✅    | ✅    |
| Delete  | ✅    | ❌    |
| Archive | ✅    | ✅    |
| Export  | ✅    | ✅    |

### Organization

| Action | Owner | Staff |
| ------ | ----- | ----- |
| View   | ✅    | ✅    |
| Update | ✅    | ❌    |
| Delete | ✅    | ❌    |

### Staff Management

| Action | Owner | Staff |
| ------ | ----- | ----- |
| View   | ✅    | ✅    |
| Invite | ✅    | ❌    |
| Remove | ✅    | ❌    |

### Invitations

| Action | Owner | Staff |
| ------ | ----- | ----- |
| View   | ✅    | ❌    |
| Create | ✅    | ❌    |
| Update | ✅    | ❌    |
| Delete | ✅    | ❌    |
| Manage | ✅    | ❌    |

### Event Types (Services)

| Action | Owner | Staff |
| ------ | ----- | ----- |
| View   | ✅    | ✅    |
| Create | ✅    | ❌    |
| Update | ✅    | ❌    |
| Delete | ✅    | ❌    |

**Note:** Staff can view event types (needed for creating bookings), but only owners can create/modify service configurations.

### Profile (Own)

| Action | Owner | Staff |
| ------ | ----- | ----- |
| View   | ✅    | ✅    |
| Update | ✅    | ✅    |

## Usage Examples

### In React Components (Client-side)

```typescript
import { usePermissions } from "@/hooks/usePermissions";

function EventTypesList() {
  const { can } = usePermissions();

  return (
    <div>
      {can("event_types", "create") && (
        <Button onClick={handleCreate}>Create Event Type</Button>
      )}
    </div>
  );
}
```

### In API Routes (Server-side)

```typescript
import { requirePermission } from "@/lib/api-permissions";

export async function POST(request: Request) {
  const result = await requirePermission("event_types", "create");
  if (result instanceof NextResponse) return result;

  const { role, organizationId } = result;
  // ... proceed with creation
}
```

### Direct Permission Check

```typescript
import { can } from "@/lib/permissions";

if (can(userRole, "event_types", "delete")) {
  // User can delete event types
}
```

## Permission Helper Functions

Available in `src/lib/permissions.ts`:

- `can(role, resource, action)` - Check single permission
- `canAny(role, resource, actions[])` - Check if any action is allowed
- `canAll(role, resource, actions[])` - Check if all actions are allowed
- `hasPermission(role, permission)` - Check using permission string (e.g., "event_types.create")
- `getPermissions(role)` - Get all permissions for a role
- `getActions(role, resource)` - Get allowed actions for a resource
- `isOwner(role)` - Check if user is owner
- `isStaff(role)` - Check if user is staff
- `assertPermission(role, resource, action)` - Throw error if not permitted

## Adding New Permissions

To add a new resource:

1. Add to `Resource` type in `src/lib/permissions.ts`
2. Add permissions to `PERMISSIONS` object for each role
3. Add descriptions to `PERMISSION_DESCRIPTIONS`
4. Add N/A combinations for unused action/resource pairs
5. Update this documentation

## Security Notes

- ✅ RLS (Row Level Security) enforced at database level
- ✅ API routes protected with `requirePermission()`
- ✅ UI components use `usePermissions()` hook
- ✅ Type-safe permission strings prevent typos
- ✅ Single source of truth in `PERMISSIONS` constant
