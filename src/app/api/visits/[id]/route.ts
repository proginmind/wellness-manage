import { NextResponse } from "next/server";

import { requirePermission } from "@/lib/api-permissions";
import { getVisitById } from "@/lib/supabase/queries";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check permission: visits.view
    const permissionResult = await requirePermission("visits", "view");
    if (permissionResult instanceof NextResponse) return permissionResult;

    const { organizationId } = permissionResult;

    // Get visit ID from params
    const { id } = await params;

    // Fetch visit from database (org-scoped)
    const result = await getVisitById(id, organizationId);

    if (!result) {
      return NextResponse.json({ error: "Visit not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching visit:", error);
    return NextResponse.json({ error: "Failed to fetch visit" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check permission: visits.update
    const permissionResult = await requirePermission("visits", "update");
    if (permissionResult instanceof NextResponse) return permissionResult;

    // Get visit ID from params
    const { id } = await params;

    // Parse request body
    const body = await request.json();

    // Import archive function dynamically
    const { archiveVisit } = await import("@/lib/supabase/queries");

    // Check if this is a status update (archive)
    if ("status" in body && body.status === "cancelled") {
      // Archive visit (set status to cancelled)
      const updatedVisit = await archiveVisit(id);

      return NextResponse.json({
        visit: updatedVisit,
        message: "Visit archived successfully",
      });
    }

    // TODO: Add full visit update logic when needed
    return NextResponse.json({ error: "Update not implemented yet" }, { status: 501 });
  } catch (error) {
    console.error("Error updating visit:", error);
    const message = error instanceof Error ? error.message : "Failed to update visit";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
