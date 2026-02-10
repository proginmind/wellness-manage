# EventType Permissions

## Overview

EventType management is primarily **owner-controlled**, but staff have read-only access to view available services when creating bookings.

## Permission Matrix

| Action | Owner | Staff | Reason                                               |
| ------ | ----- | ----- | ---------------------------------------------------- |
| View   | ✅    | ✅    | All users need to see available services for booking |
| Create | ✅    | ❌    | Only owners can define new services                  |
| Update | ✅    | ❌    | Only owners can modify pricing/settings              |
| Delete | ✅    | ❌    | Only owners can remove services                      |

## Rationale

### Why Owner-Only for Management?

1. **Business Control** - Service pricing and offerings are strategic business decisions
2. **Consistency** - Centralized control prevents conflicting service definitions
3. **Compliance** - Pricing changes should be authorized at the highest level
4. **Revenue Protection** - Prevents accidental price changes or service removal
5. **Professional Standards** - Maintains service quality standards

### Why Staff Can View?

Staff need read access to event types because they:

- ✅ **Create bookings/visits** for members and need to select services
- ✅ **View service details** (duration, price) when scheduling
- ✅ **See available options** to properly assist members
- ✅ **Understand scheduling** (duration + buffers) for calendar planning

### What Staff CAN Do

- ✅ **View all event types** in their organization
- ✅ **See service details** (name, duration, price, description)
- ✅ **Select event types** when creating bookings
- ✅ **Read scheduling info** (duration, buffers)

### What Staff CANNOT Do

- ❌ **Create new services** - Owner only
- ❌ **Modify pricing** - Owner only
- ❌ **Change service settings** - Owner only
- ❌ **Delete services** - Owner only

## Implementation

### Database Level (RLS Policies)

```sql
-- Users can view event types in their organization
CREATE POLICY "Users can view event types in their organization"
  ON public.event_types FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id
      FROM public.profiles
      WHERE id = auth.uid()
    )
  );

-- Only owners can delete event types
CREATE POLICY "Owners can delete event types in their organization"
  ON public.event_types FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT o.id
      FROM public.organizations o
      INNER JOIN public.profiles p ON p.user_id = o.owner_id
      WHERE p.id = auth.uid()
    )
  );
```

### Application Level

**Permission Definition** (`src/lib/permissions.ts`):

```typescript
export const PERMISSIONS = {
  owner: {
    event_types: ["view", "create", "update", "delete"] as Action[],
  },
  staff: {
    event_types: ["view"] as Action[], // Read-only access
  },
};
```

### Usage Examples

#### API Route Protection

```typescript
// src/app/api/event-types/route.ts
import { requirePermission } from "@/lib/api-permissions";

export async function POST(request: Request) {
  // This will return 403 for staff users
  const result = await requirePermission("event_types", "create");
  if (result instanceof NextResponse) return result;

  const { organizationId } = result;
  // ... create event type
}
```

#### UI Component

```typescript
// src/components/event-types/event-type-list.tsx
import { usePermissions } from "@/hooks/usePermissions";

export function EventTypeList() {
  const { can } = usePermissions();

  return (
    <div>
      {/* Both owners and staff can view */}
      <EventTypeGrid eventTypes={eventTypes} />

      {/* Only owners will see management buttons */}
      {can("event_types", "create") && (
        <Button>Create Event Type</Button>
      )}

      {can("event_types", "update") && (
        <Button>Edit</Button>
      )}
    </div>
  );
}
```

#### Direct Check

```typescript
import { can } from "@/lib/permissions";

// Check if user can modify event types
if (can(userRole, "event_types", "update")) {
  // Show edit form
} else {
  // Show read-only view
}
```

## Future Considerations

### Option 1: Add Staff View Permission

If staff need to view event types (e.g., for reporting or planning):

```typescript
staff: {
  event_types: ["view"] as Action[], // Read-only access
}
```

### Option 2: Add Manager Role

For larger organizations, consider a "manager" role:

```typescript
export type UserRole = "owner" | "manager" | "staff";

export const PERMISSIONS = {
  manager: {
    event_types: ["view", "create", "update"] as Action[], // No delete
  },
};
```

### Option 3: Granular Permissions

For complex scenarios, consider splitting permissions:

```typescript
export type Resource =
  | "event_types.pricing" // Only owner
  | "event_types.scheduling" // Owner + manager
  | "event_types.details"; // Owner + manager
```

## Testing Permissions

### Owner User

```typescript
const ownerRole = "owner";
console.log(can(ownerRole, "event_types", "view")); // true
console.log(can(ownerRole, "event_types", "create")); // true
console.log(can(ownerRole, "event_types", "update")); // true
console.log(can(ownerRole, "event_types", "delete")); // true
```

### Staff User

```typescript
const staffRole = "staff";
console.log(can(staffRole, "event_types", "view")); // true ✅
console.log(can(staffRole, "event_types", "create")); // false
console.log(can(staffRole, "event_types", "update")); // false
console.log(can(staffRole, "event_types", "delete")); // false
```

## Error Handling

When a staff user tries to modify event types:

**API Response (for create/update/delete):**

```json
{
  "error": "Forbidden",
  "message": "You don't have permission to create event_types"
}
```

**HTTP Status:** `403 Forbidden`

**Note:** Staff will NOT get errors when viewing event types (they have read permission).

## Next Steps

1. ✅ Permissions configured (DONE)
2. 📝 Create API routes with permission checks
3. 🎨 Build UI with role-based rendering
4. 🧪 Add integration tests for permission enforcement
5. 📚 Update user documentation

## Related Files

- `src/lib/permissions.ts` - Permission definitions
- `src/lib/api-permissions.ts` - API middleware
- `src/hooks/usePermissions.ts` - React hook
- `supabase/migrations/009_create_event_types_table.sql` - RLS policies
