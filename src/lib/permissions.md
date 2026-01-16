# Permission System Documentation

## Overview

This application uses a **Granular Resource-Action** permission system (Option B) that provides fine-grained control over who can do what.

## Architecture

```
┌─────────────────────────────────────────┐
│         Permission Layers               │
├─────────────────────────────────────────┤
│ 1. Database (RLS)     ✅ Enforced       │
│ 2. API Routes         ✅ Implemented    │
│ 3. UI Components      ✅ Implemented    │
└─────────────────────────────────────────┘
```

## Core Concepts

### Resources
- `members` - Wellness center members
- `organization` - Organization settings
- `staff` - Staff management
- `invitations` - Staff invitations
- `profile` - User profile

### Actions
- `view` - Read access
- `create` - Create new items
- `update` - Modify existing items
- `delete` - Permanent deletion
- `archive` - Soft deletion
- `export` - Data export
- `invite` - Send invitations
- `remove` - Remove access
- `manage` - Full management

### Permission Format
Permissions are expressed as `resource.action`:
- `members.delete` - Delete members
- `staff.invite` - Invite staff
- `organization.update` - Update organization

## Permission Matrix

| Resource | Owner | Staff |
|----------|-------|-------|
| **Members** |
| view | ✅ | ✅ |
| create | ✅ | ✅ |
| update | ✅ | ✅ |
| archive | ✅ | ✅ |
| delete | ✅ | ❌ |
| export | ✅ | ✅ |
| **Organization** |
| view | ✅ | ✅ |
| update | ✅ | ❌ |
| delete | ✅ | ❌ |
| **Staff** |
| view | ✅ | ✅ |
| invite | ✅ | ❌ |
| remove | ✅ | ❌ |
| **Invitations** |
| view | ✅ | ❌ |
| manage | ✅ | ❌ |

## Usage

### 1. Server-Side (API Routes)

```typescript
import { requirePermission } from "@/lib/api-permissions";

export async function DELETE(request: Request) {
  // Check permission before processing
  const result = await requirePermission('members', 'delete');
  if (result instanceof NextResponse) return result;
  
  const { role, organizationId } = result;
  // ... proceed with delete
}
```

**Other API helpers:**
```typescript
requireOwner()      // Require owner role
requireAuth()       // Require any authenticated user
checkPermission()   // Non-throwing permission check
```

### 2. Client-Side (React Components)

#### Using Hooks

```typescript
import { usePermissions, useMemberPermissions } from "@/hooks/usePermissions";

function MyComponent() {
  const { can, isOwner } = usePermissions();
  const { canDelete, canArchive } = useMemberPermissions();
  
  return (
    <>
      {can('members', 'create') && <AddButton />}
      {canDelete && <DeleteButton />}
      {isOwner && <OwnerPanel />}
    </>
  );
}
```

#### Using Permission Gate

```typescript
import { PermissionGate, OwnerGate } from "@/components/PermissionGate";

function MyComponent() {
  return (
    <>
      <PermissionGate resource="staff" action="invite">
        <InviteButton />
      </PermissionGate>
      
      <OwnerGate fallback={<p>Owner only</p>}>
        <SettingsPanel />
      </OwnerGate>
    </>
  );
}
```

### 3. Utility Functions

```typescript
import { can, hasPermission, assertPermission } from "@/lib/permissions";

// Check permission
if (can('staff', 'members', 'delete')) {
  // ...
}

// Check with string format
if (hasPermission('owner', 'staff.invite')) {
  // ...
}

// Throw error if denied
assertPermission('staff', 'members', 'delete');
// throws: PermissionError if denied
```

## Available Hooks

### usePermissions()
Main hook with all permission checking functions.

```typescript
const {
  user,                    // Current user
  role,                    // User's role
  isOwner,                 // Is owner?
  isStaff,                 // Is staff?
  can,                     // Check permission
  hasPermission,           // Check by string
  canAny,                  // Any of actions?
  canAll,                  // All actions?
} = usePermissions();
```

### useMemberPermissions()
Member-specific permissions.

```typescript
const {
  canView,
  canCreate,
  canUpdate,
  canDelete,
  canArchive,
  canExport,
} = useMemberPermissions();
```

### useStaffPermissions()
Staff management permissions.

```typescript
const {
  canViewStaff,
  canInviteStaff,
  canRemoveStaff,
  canViewInvitations,
  canManageInvitations,
} = useStaffPermissions();
```

### useOrganizationPermissions()
Organization management permissions.

```typescript
const {
  canView,
  canUpdate,
  canDelete,
} = useOrganizationPermissions();
```

## Security Layers

### ✅ Layer 1: Database (RLS)
PostgreSQL Row Level Security enforces organization isolation and permission checks at the database level.

- **Cannot be bypassed** by application code
- Prevents cross-organization data leaks
- Enforces owner-only deletes

### ✅ Layer 2: API Routes
Permission middleware checks before processing requests.

- Validates user authentication
- Checks role permissions
- Returns 403 if denied

### ✅ Layer 3: UI Components
Hide/show UI elements based on permissions.

- Improves UX (don't show unusable buttons)
- Not a security layer (can be bypassed)
- Always backed by Layer 1 & 2

## Adding New Permissions

### 1. Update Permission Definition

```typescript
// src/lib/permissions.ts

export const PERMISSIONS = {
  owner: {
    reports: ["view", "create", "export"], // ← Add here
  },
  staff: {
    reports: ["view"],                      // ← Add here
  },
};
```

### 2. Add API Middleware

```typescript
// src/app/api/reports/route.ts

export async function GET() {
  const result = await requirePermission('reports', 'view');
  if (result instanceof NextResponse) return result;
  // ...
}
```

### 3. Update UI

```typescript
// src/components/ReportsPage.tsx

const { can } = usePermissions();

return (
  <>
    {can('reports', 'export') && <ExportButton />}
  </>
);
```

## Best Practices

1. **Always check at API level** - Never trust client-side checks alone
2. **Use RLS for data isolation** - Database enforces organization boundaries
3. **Hide UI for better UX** - Don't show buttons users can't use
4. **Use permission gates** - Cleaner than conditional rendering
5. **Check early** - Fail fast with permission checks
6. **Test both roles** - Verify owner and staff experiences

## Examples

### Example 1: Delete Button (Owner Only)

```typescript
// API Route
export async function DELETE(request: Request) {
  const result = await requirePermission('members', 'delete');
  if (result instanceof NextResponse) return result;
  // ✅ Only owners reach here
}

// UI Component
function DeleteButton() {
  const { canDelete } = useMemberPermissions();
  
  if (!canDelete) return null; // ❌ Staff won't see this
  
  return <Button variant="destructive">Delete</Button>;
}
```

### Example 2: Invite Staff (Owner Only)

```typescript
// UI with Gate
<PermissionGate resource="staff" action="invite">
  <Button onClick={handleInvite}>
    Invite Staff
  </Button>
</PermissionGate>

// API Route
export async function POST(request: Request) {
  const result = await requireOwner(); // ← Shortcut for owner check
  if (result instanceof NextResponse) return result;
  // ...
}
```

### Example 3: Conditional Features

```typescript
function Dashboard() {
  const { isOwner } = usePermissions();
  const { canExport } = useMemberPermissions();
  
  return (
    <>
      <h1>Dashboard</h1>
      
      {/* Everyone sees this */}
      <MemberList />
      
      {/* Only if can export */}
      {canExport && <ExportButton />}
      
      {/* Owner-only panel */}
      {isOwner && <BillingPanel />}
    </>
  );
}
```

## Troubleshooting

### Permission Denied in API
- Check user has profile in database
- Verify role is set correctly
- Check PERMISSIONS matrix in `permissions.ts`

### UI shows button but API blocks
- This is correct behavior (defense in depth)
- Fix by hiding button: `{can('resource', 'action') && <Button />}`

### Staff can access owner features
- Check RLS policies in database
- Verify API route uses `requirePermission()`
- Check UI uses permission gates

## Files Reference

- `src/lib/permissions.ts` - Core permission system
- `src/lib/api-permissions.ts` - API middleware
- `src/hooks/usePermissions.ts` - React hooks
- `src/components/PermissionGate.tsx` - Gate components
- `supabase/migrations/003_*.sql` - RLS policies
