# Event Types API

## Overview

The Event Types API provides endpoints for managing service templates (event types) in the wellness management system.

## Base URL

```
/api/event-types
```

## Authentication

All endpoints require authentication. Include the session cookie in your requests.

## Permissions

- **View** (GET) - Available to both `owner` and `staff` roles
- **Create** (POST) - Owner only (not yet implemented)
- **Update** (PUT/PATCH) - Owner only (not yet implemented)
- **Delete** (DELETE) - Owner only (not yet implemented)

---

## Endpoints

### GET /api/event-types

Retrieve all event types for the authenticated user's organization.

#### Query Parameters

| Parameter     | Type    | Required | Description                                   |
| ------------- | ------- | -------- | --------------------------------------------- |
| `is_active`   | boolean | No       | Filter by active status (`true` or `false`)   |
| `is_bookable` | boolean | No       | Filter by bookable status (`true` or `false`) |

#### Request Example

```bash
# Get all event types
GET /api/event-types

# Get only active event types
GET /api/event-types?is_active=true

# Get only bookable event types
GET /api/event-types?is_bookable=true

# Get active and bookable event types
GET /api/event-types?is_active=true&is_bookable=true
```

#### Response

**Status: 200 OK**

```json
{
  "eventTypes": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "organizationId": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Swedish Massage",
      "description": "Relaxing full-body massage with aromatherapy oils",
      "color": "#10b981",
      "category": "massage",
      "duration": 60,
      "bufferBefore": 10,
      "bufferAfter": 10,
      "price": 89.99,
      "currency": "USD",
      "isActive": true,
      "isBookable": true,
      "requiresApproval": false,
      "maxAdvanceBookingDays": 90,
      "minAdvanceBookingHours": 24,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "organizationId": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Deep Tissue Massage",
      "description": "Intensive therapeutic massage for muscle tension",
      "color": "#3b82f6",
      "category": "massage",
      "duration": 90,
      "bufferBefore": 15,
      "bufferAfter": 15,
      "price": 120.0,
      "currency": "USD",
      "isActive": true,
      "isBookable": true,
      "requiresApproval": false,
      "maxAdvanceBookingDays": 60,
      "minAdvanceBookingHours": 48,
      "createdAt": "2024-01-15T11:00:00.000Z",
      "updatedAt": "2024-01-15T11:00:00.000Z"
    }
  ],
  "total": 2,
  "filters": {
    "isActive": true,
    "isBookable": null
  }
}
```

#### Response Fields

| Field                    | Type    | Description                                  |
| ------------------------ | ------- | -------------------------------------------- |
| `id`                     | string  | Unique event type identifier (UUID)          |
| `organizationId`         | string  | Organization this event type belongs to      |
| `name`                   | string  | Service name                                 |
| `description`            | string  | Detailed description (optional)              |
| `color`                  | string  | Hex color code for calendar display          |
| `category`               | string  | Service category (optional)                  |
| `duration`               | number  | Service duration in minutes                  |
| `bufferBefore`           | number  | Preparation time before service (minutes)    |
| `bufferAfter`            | number  | Cleanup time after service (minutes)         |
| `price`                  | number  | Service price                                |
| `currency`               | string  | Currency code (USD, EUR, etc.)               |
| `isActive`               | boolean | Whether the service is currently active      |
| `isBookable`             | boolean | Whether customers can book online            |
| `requiresApproval`       | boolean | Whether bookings need manual approval        |
| `maxAdvanceBookingDays`  | number  | Maximum days in advance bookings can be made |
| `minAdvanceBookingHours` | number  | Minimum hours notice required                |
| `createdAt`              | string  | ISO 8601 timestamp                           |
| `updatedAt`              | string  | ISO 8601 timestamp                           |

#### Error Responses

**Status: 401 Unauthorized**

```json
{
  "error": "Unauthorized"
}
```

**Status: 403 Forbidden**

```json
{
  "error": "Forbidden",
  "message": "You don't have permission to view event_types"
}
```

**Status: 500 Internal Server Error**

```json
{
  "error": "Failed to fetch event types"
}
```

---

## Usage Examples

### React/Next.js with SWR

```typescript
import useSWR from "swr";

import { EventType } from "@/types/event-type";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface EventTypesResponse {
  eventTypes: EventType[];
  total: number;
  filters: {
    isActive: boolean | null;
    isBookable: boolean | null;
  };
}

export function useEventTypes(isActive?: boolean, isBookable?: boolean) {
  const params = new URLSearchParams();
  if (isActive !== undefined) params.set("is_active", String(isActive));
  if (isBookable !== undefined) params.set("is_bookable", String(isBookable));

  const url = `/api/event-types${params.toString() ? `?${params}` : ""}`;

  const { data, error, isLoading, mutate } = useSWR<EventTypesResponse>(url, fetcher);

  return {
    eventTypes: data?.eventTypes,
    total: data?.total,
    filters: data?.filters,
    isLoading,
    error,
    mutate,
  };
}
```

### Usage in Component

```typescript
import { useEventTypes } from "@/hooks/useEventTypes";

export function EventTypeSelector() {
  // Get only active and bookable event types
  const { eventTypes, isLoading, error } = useEventTypes(true, true);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading services</div>;

  return (
    <select>
      {eventTypes?.map((eventType) => (
        <option key={eventType.id} value={eventType.id}>
          {eventType.name} - ${eventType.price} ({eventType.duration} min)
        </option>
      ))}
    </select>
  );
}
```

### Direct Fetch

```typescript
async function fetchEventTypes() {
  try {
    const response = await fetch("/api/event-types?is_active=true");

    if (!response.ok) {
      throw new Error("Failed to fetch event types");
    }

    const data = await response.json();
    console.log(`Found ${data.total} event types`);
    return data.eventTypes;
  } catch (error) {
    console.error("Error:", error);
  }
}
```

---

## Notes

- Event types are automatically filtered by the authenticated user's organization
- The API uses Row Level Security (RLS) at the database level for additional security
- Results are ordered alphabetically by name
- All timestamps are in UTC (ISO 8601 format)
- The `price` field is returned as a number (converted from DECIMAL)

## Coming Soon

- `POST /api/event-types` - Create new event type (owner only)
- `GET /api/event-types/:id` - Get single event type by ID
- `PUT /api/event-types/:id` - Update event type (owner only)
- `DELETE /api/event-types/:id` - Delete event type (owner only)
