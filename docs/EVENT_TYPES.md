# EventType Feature

## Overview

EventTypes are service templates that define the configuration for bookable services (similar to Calendly's event types). Each EventType represents a specific service offering with its own duration, price, and booking rules.

## Permissions

EventType management is primarily an **owner-controlled** feature:

**Owner:**

- ✅ View event types
- ✅ Create new event types
- ✅ Update event types
- ✅ Delete event types

**Staff:**

- ✅ View event types (read-only)
- ❌ Create, update, or delete event types

Staff need read access to view available services when creating bookings/visits for members.

## Files Created

### 1. Database Migration

**`supabase/migrations/009_create_event_types_table.sql`**

- Creates `event_types` table with all necessary columns
- Includes indexes for performance
- RLS policies for multi-tenant security
- Automatic timestamp updates

### 2. TypeScript Interface

**`src/types/event-type.ts`**

- `EventType` interface matching the database schema
- Exported from `src/types/index.ts` for easy imports

### 3. Zod Validation Schemas

**`src/lib/validations/event-type.ts`**

- `eventTypeFormSchema` - For creating event types
- `eventTypeUpdateSchema` - For partial updates
- Includes validation rules and error messages

## Database Schema

```sql
event_types (
  id                        UUID PRIMARY KEY
  organization_id           UUID (references organizations)
  name                      TEXT
  description               TEXT
  color                     TEXT (hex color, default: #3b82f6)
  category                  TEXT
  duration                  INTEGER (minutes)
  buffer_before             INTEGER (minutes, default: 0)
  buffer_after              INTEGER (minutes, default: 0)
  price                     DECIMAL(10,2)
  currency                  TEXT (default: USD)
  is_active                 BOOLEAN (default: true)
  is_bookable               BOOLEAN (default: true)
  requires_approval         BOOLEAN (default: false)
  max_advance_booking_days  INTEGER (nullable)
  min_advance_booking_hours INTEGER (default: 24)
  created_at                TIMESTAMPTZ
  updated_at                TIMESTAMPTZ
)
```

## TypeScript Usage

### Import

```typescript
import { EventType } from "@/types/event-type";
import { eventTypeFormSchema, EventTypeFormValues } from "@/lib/validations/event-type";
```

### Example EventType Object

```typescript
const massageService: EventType = {
  id: "uuid",
  organizationId: "org-uuid",
  name: "60-Minute Swedish Massage",
  description: "Relaxing full-body massage with aromatherapy oils",
  color: "#10b981",
  category: "massage",
  duration: 60,
  bufferBefore: 10, // 10 min setup time
  bufferAfter: 10, // 10 min cleanup time
  price: 89.99,
  currency: "USD",
  isActive: true,
  isBookable: true,
  requiresApproval: false,
  maxAdvanceBookingDays: 90,
  minAdvanceBookingHours: 24,
  createdAt: new Date(),
  updatedAt: new Date(),
};
```

### Form Validation Example

```typescript
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { eventTypeFormSchema } from "@/lib/validations/event-type";

const form = useForm({
  resolver: zodResolver(eventTypeFormSchema),
  defaultValues: {
    name: "",
    description: "",
    color: "#3b82f6",
    category: "",
    duration: 60,
    bufferBefore: 0,
    bufferAfter: 0,
    price: 0,
    currency: "USD",
    isActive: true,
    isBookable: true,
    requiresApproval: false,
    minAdvanceBookingHours: 24,
  },
});
```

## Example Use Cases

### 1. Massage Therapy

```typescript
{
  name: "Deep Tissue Massage",
  duration: 90,
  price: 120.00,
  category: "massage",
  bufferBefore: 15,
  bufferAfter: 15,
  requiresApproval: false
}
```

### 2. Consultation (Free)

```typescript
{
  name: "Free 15-Min Consultation",
  duration: 15,
  price: 0.00,
  category: "consultation",
  requiresApproval: true, // manual approval
  maxAdvanceBookingDays: 30
}
```

### 3. Premium Service

```typescript
{
  name: "VIP Wellness Package",
  duration: 120,
  price: 299.99,
  category: "package",
  bufferBefore: 30,
  bufferAfter: 30,
  requiresApproval: true,
  minAdvanceBookingHours: 48 // 2 days notice
}
```

## Field Explanations

### Scheduling Fields

- **duration**: Main service time in minutes
- **bufferBefore**: Setup/prep time before the service
- **bufferAfter**: Cleanup/transition time after the service

Example: 60-min massage with 10-min buffers = 80 total minutes blocked on calendar

### Booking Control

- **isActive**: Service is available (can be temporarily disabled)
- **isBookable**: Customers can book online (vs. staff-only booking)
- **requiresApproval**: Bookings need manual approval before confirmation

### Advance Booking Limits

- **maxAdvanceBookingDays**: How far ahead customers can book (e.g., 90 days)
- **minAdvanceBookingHours**: Minimum notice required (e.g., 24 hours)

### Visual Organization

- **color**: Hex color code for calendar display
- **category**: Group similar services (massage, consultation, therapy)

## Next Steps

To complete the booking system, you'll need:

1. **Add `event_type_id` to Visits table**
   - Reference to EventType
   - Snapshot fields for historical data

2. **Create EventType CRUD operations**
   - `getEventTypes()`
   - `createEventType()`
   - `updateEventType()`
   - `deleteEventType()`

3. **Create EventType management UI**
   - List view with all event types
   - Form for creating/editing
   - Color picker for calendar display

4. **Update Visit creation**
   - Select from available EventTypes
   - Pre-fill duration, price from EventType
   - Calculate total time including buffers

## Migration

To apply the database changes:

```bash
# If using Supabase CLI
supabase migration up

# Or manually apply the SQL file to your database
```

## Benefits of This Approach

✅ **Reusability** - Create service once, use many times
✅ **Consistency** - Same service always has same duration/price
✅ **Flexibility** - Easy to add new services without code changes
✅ **Analytics** - Track bookings per service type
✅ **Pricing History** - Change prices without affecting past bookings
✅ **Calendar Display** - Color-coded services for easy viewing
