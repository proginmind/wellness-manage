import { NextResponse } from "next/server";

import { requirePermission } from "@/lib/api-permissions";
import { getVisitById, updateVisit } from "@/lib/supabase/queries";
import { getVisitEditSchema, type VisitBookingMode } from "@/lib/validations/visit";
import { isVisitOverlapError } from "@/lib/visit-errors";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const permissionResult = await requirePermission("visits", "view");
    if (permissionResult instanceof NextResponse) return permissionResult;

    const { organizationId } = permissionResult;
    const { id } = await params;

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
    const permissionResult = await requirePermission("visits", "update");
    if (permissionResult instanceof NextResponse) return permissionResult;

    const { organizationId } = permissionResult;
    const { id } = await params;

    const body = await request.json();

    if ("status" in body && body.status === "cancelled") {
      const existing = await getVisitById(id, organizationId);
      if (!existing) {
        return NextResponse.json({ error: "Visit not found" }, { status: 404 });
      }
      if (existing.visit.status === "completed") {
        return NextResponse.json({ error: "Cannot archive a completed visit" }, { status: 409 });
      }
      if (existing.visit.status === "cancelled") {
        return NextResponse.json({ visit: existing.visit, message: "Visit archived successfully" });
      }

      const { archiveVisit } = await import("@/lib/supabase/queries");
      const updatedVisit = await archiveVisit(id);
      return NextResponse.json({ visit: updatedVisit, message: "Visit archived successfully" });
    }

    if ("status" in body && body.status === "completed") {
      const { completeVisit } = await import("@/lib/supabase/queries");
      try {
        const updatedVisit = await completeVisit(id, organizationId);
        return NextResponse.json({
          visit: updatedVisit,
          message: "Visit marked as completed",
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to complete visit";
        if (message === "Visit not found") {
          return NextResponse.json({ error: message }, { status: 404 });
        }
        if (message === "Only pending visits can be marked as completed") {
          return NextResponse.json({ error: message }, { status: 409 });
        }
        throw error;
      }
    }

    const existing = await getVisitById(id, organizationId);
    if (!existing) {
      return NextResponse.json({ error: "Visit not found" }, { status: 404 });
    }
    if (existing.visit.status === "cancelled") {
      return NextResponse.json({ error: "Cannot edit a cancelled visit" }, { status: 409 });
    }
    if (existing.visit.status === "completed") {
      return NextResponse.json({ error: "Cannot edit a completed visit" }, { status: 409 });
    }

    const bookingMode = (body.bookingMode as VisitBookingMode | undefined) ?? "guided";
    const schema = getVisitEditSchema(bookingMode);
    const { bookingMode: _bookingMode, ...formBody } = body;
    const parsed = schema.safeParse(formBody);

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
    const status = isVisitOverlapError(message) ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
