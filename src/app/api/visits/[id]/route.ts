import { NextResponse } from "next/server";

import { requirePermission } from "@/lib/api-permissions";
import { getVisitById, updateVisit } from "@/lib/supabase/queries";
import { visitEditFormSchema } from "@/lib/validations/visit";

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

    const { organizationId } = permissionResult;
    const { id } = await params;

    const body = await request.json();

    // Archive branch: status update to cancelled
    if ("status" in body && body.status === "cancelled") {
      const { archiveVisit } = await import("@/lib/supabase/queries");
      const updatedVisit = await archiveVisit(id);
      return NextResponse.json({ visit: updatedVisit, message: "Visit archived successfully" });
    }

    // Guard: cannot edit a cancelled visit
    const existing = await getVisitById(id, organizationId);
    if (!existing) {
      return NextResponse.json({ error: "Visit not found" }, { status: 404 });
    }
    if (existing.visit.status === "cancelled") {
      return NextResponse.json({ error: "Cannot edit a cancelled visit" }, { status: 409 });
    }

    // Validate body
    const parsed = visitEditFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const updatedVisit = await updateVisit(id, organizationId, parsed.data);

    return NextResponse.json({ visit: updatedVisit });
  } catch (error) {
    console.error("Error updating visit:", error);
    const message = error instanceof Error ? error.message : "Failed to update visit";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
