import { NextResponse } from "next/server";

import { requirePermission } from "@/lib/api-permissions";
import {
  archiveEventCategory,
  getEventCategoryById,
  updateEventCategory,
} from "@/lib/supabase/queries";
import { eventCategoryFormSchema } from "@/lib/validations/event-category";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Check permission: event_categories.view
    const result = await requirePermission("event_categories", "view");
    if (result instanceof NextResponse) return result;

    const { organizationId } = result;

    // Fetch event category (organization-scoped)
    const eventCategory = await getEventCategoryById(id, organizationId);

    if (!eventCategory) {
      return NextResponse.json({ error: "Event category not found" }, { status: 404 });
    }

    return NextResponse.json({ eventCategory });
  } catch (error) {
    console.error("Error fetching event category:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch event category";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Check permission: event_categories.update (owner only)
    const permissionResult = await requirePermission("event_categories", "update");
    if (permissionResult instanceof NextResponse) return permissionResult;

    const { organizationId } = permissionResult;

    // Verify category belongs to organization
    const existingCategory = await getEventCategoryById(id, organizationId);
    if (!existingCategory) {
      return NextResponse.json({ error: "Event category not found" }, { status: 404 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = eventCategoryFormSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    // Update event category
    const updatedCategory = await updateEventCategory(id, validationResult.data);

    return NextResponse.json({
      eventCategory: updatedCategory,
      message: "Event category updated successfully",
    });
  } catch (error) {
    console.error("Error updating event category:", error);
    const message = error instanceof Error ? error.message : "Failed to update event category";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Check permission: event_categories.delete (owner only)
    const permissionResult = await requirePermission("event_categories", "delete");
    if (permissionResult instanceof NextResponse) return permissionResult;

    const { organizationId } = permissionResult;

    // Verify category belongs to organization
    const existingCategory = await getEventCategoryById(id, organizationId);
    if (!existingCategory) {
      return NextResponse.json({ error: "Event category not found" }, { status: 404 });
    }

    // Archive (soft delete) the category
    const archivedCategory = await archiveEventCategory(id);

    return NextResponse.json({
      eventCategory: archivedCategory,
      message: "Event category archived successfully",
    });
  } catch (error) {
    console.error("Error archiving event category:", error);
    const message = error instanceof Error ? error.message : "Failed to archive event category";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
