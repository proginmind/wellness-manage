import { NextResponse } from "next/server";

import { EventCategoriesListResponse } from "@/types/api";
import { requirePermission } from "@/lib/api-permissions";
import { createEventCategory, getEventCategories } from "@/lib/supabase/queries";
import { eventCategoryFormSchema } from "@/lib/validations/event-category";

export async function GET(request: Request) {
  try {
    // Check permission (both owner and staff can view)
    const result = await requirePermission("event_categories", "view");
    if (result instanceof NextResponse) return result;

    const { organizationId } = result;

    // Get filter params from URL
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("is_active");

    // Build filters object
    const filters: { isActive?: boolean } = {};

    if (isActive !== null) {
      filters.isActive = isActive === "true";
    }

    // Fetch event categories (organizationId is required)
    const eventCategories = await getEventCategories(
      organizationId,
      Object.keys(filters).length > 0 ? filters : undefined
    );

    const response: EventCategoriesListResponse = {
      eventCategories,
      total: eventCategories.length,
      filters: {
        isActive: filters.isActive !== undefined ? filters.isActive : null,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching event categories:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch event categories";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Check permission: event_categories.create (owner only)
    const permissionResult = await requirePermission("event_categories", "create");
    if (permissionResult instanceof NextResponse) return permissionResult;

    const { organizationId } = permissionResult;

    // Parse request body
    const body = await request.json();

    // Validate with zod schema
    const validationResult = eventCategoryFormSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const validated = validationResult.data;

    // Create event category in database
    const newCategory = await createEventCategory(validated, organizationId);

    return NextResponse.json(
      {
        eventCategory: newCategory,
        message: "Event category created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating event category:", error);
    const message = error instanceof Error ? error.message : "Failed to create event category";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
