import { NextResponse } from "next/server";

import { requirePermission } from "@/lib/api-permissions";
import { getEventTypes } from "@/lib/supabase/queries";

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

    return NextResponse.json({
      eventTypes,
      total: eventTypes.length,
      filters: {
        isActive: filters.isActive !== undefined ? filters.isActive : null,
        isBookable: filters.isBookable !== undefined ? filters.isBookable : null,
      },
    });
  } catch (error) {
    console.error("Error fetching event types:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch event types";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
