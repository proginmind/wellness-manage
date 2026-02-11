import { NextResponse } from "next/server";

import { requirePermission } from "@/lib/api-permissions";
import { archiveEventType, getEventType, unarchiveEventType } from "@/lib/supabase/queries";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check permission: event_types.view
    const permissionResult = await requirePermission("event_types", "view");
    if (permissionResult instanceof NextResponse) return permissionResult;

    const { organizationId } = permissionResult;

    // Get event type ID from params
    const { id } = await params;

    // Fetch event type from database (org-scoped)
    const eventType = await getEventType(id, organizationId);

    if (!eventType) {
      return NextResponse.json({ error: "Event type not found" }, { status: 404 });
    }

    return NextResponse.json({ eventType });
  } catch (error) {
    console.error("Error fetching event type:", error);
    return NextResponse.json({ error: "Failed to fetch event type" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check permission: event_types.update
    const permissionResult = await requirePermission("event_types", "update");
    if (permissionResult instanceof NextResponse) return permissionResult;

    // Get event type ID from params
    const { id } = await params;

    // Parse request body
    const body = await request.json();

    // Check if this is an archive/unarchive request
    if ("isActive" in body && Object.keys(body).length === 1) {
      // Archive/unarchive only
      const updatedEventType =
        body.isActive === false ? await archiveEventType(id) : await unarchiveEventType(id);

      return NextResponse.json({
        eventType: updatedEventType,
        message: "Event type updated successfully",
      });
    }

    // TODO: Add full event type update logic when needed
    return NextResponse.json({ error: "Full update not implemented yet" }, { status: 501 });
  } catch (error) {
    console.error("Error updating event type:", error);
    const message = error instanceof Error ? error.message : "Failed to update event type";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
