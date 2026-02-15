import { NextResponse } from "next/server";

import { EventTypesListResponse } from "@/types/api";
import { requirePermission } from "@/lib/api-permissions";
import { createEventType, getEventTypes } from "@/lib/supabase/queries";
import { eventTypeFormSchema } from "@/lib/validations/event-type";

export async function GET(request: Request) {
  try {
    // Check permission (both owner and staff can view)
    const result = await requirePermission("event_types", "view");
    if (result instanceof NextResponse) return result;

    const { organizationId } = result;

    // Get filter params from URL
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("is_active");
    const isBookable = searchParams.get("is_bookable");

    // Build filters object
    const filters: { isActive?: boolean; isBookable?: boolean } = {};

    if (isActive !== null) {
      filters.isActive = isActive === "true";
    }

    if (isBookable !== null) {
      filters.isBookable = isBookable === "true";
    }

    // Fetch event types (organizationId is required)
    const eventTypes = await getEventTypes(
      organizationId,
      Object.keys(filters).length > 0 ? filters : undefined
    );

    const response: EventTypesListResponse = {
      eventTypes,
      total: eventTypes.length,
      filters: {
        isActive: filters.isActive !== undefined ? filters.isActive : null,
        isBookable: filters.isBookable !== undefined ? filters.isBookable : null,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching event types:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch event types";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Check permission: event_types.create
    const permissionResult = await requirePermission("event_types", "create");
    if (permissionResult instanceof NextResponse) return permissionResult;

    const { organizationId } = permissionResult;

    // Parse request body
    const body = await request.json();

    // Validate with zod schema
    const validationResult = eventTypeFormSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const validated = validationResult.data;

    // Convert null to undefined for maxAdvanceBookingDays
    const eventTypeData = {
      ...validated,
      maxAdvanceBookingDays:
        validated.maxAdvanceBookingDays === null ? undefined : validated.maxAdvanceBookingDays,
    };

    // Create event type in database
    const newEventType = await createEventType(eventTypeData, organizationId);

    return NextResponse.json(
      {
        eventType: newEventType,
        message: "Event type created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating event type:", error);
    const message = error instanceof Error ? error.message : "Failed to create event type";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
