import { NextResponse } from "next/server";

import { requirePermission } from "@/lib/api-permissions";
import { sendVisitCreatedNotifications } from "@/lib/notify";
import { getMemberById, getProfileById, getVisits } from "@/lib/supabase/queries";
import { visitCreateRequestSchema } from "@/lib/validations/visit";
import { isVisitOverlapError } from "@/lib/visit-errors";

export async function GET(request: Request) {
  try {
    const permissionResult = await requirePermission("visits", "view");
    if (permissionResult instanceof NextResponse) return permissionResult;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;

    const visitsData = await getVisits(search);

    return NextResponse.json({
      visits: visitsData.map((visit) => ({
        visit: visit.visit,
        member: visit.member,
      })),
      total: visitsData.length,
      search: search || null,
    });
  } catch (error) {
    console.error("Error fetching visits:", error);
    return NextResponse.json({ error: "Failed to fetch visits" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const permissionResult = await requirePermission("visits", "create");
    if (permissionResult instanceof NextResponse) return permissionResult;

    const { userId } = permissionResult;

    const body = await request.json();
    const parsed = visitCreateRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const { bookingMode: _bookingMode, ...formData } = parsed.data;

    const { createVisit } = await import("@/lib/supabase/queries");
    const newVisit = await createVisit(formData, userId);

    const member = await getMemberById(newVisit.memberId);
    const staff = newVisit.staffId ? await getProfileById(newVisit.staffId) : null;

    if (!member?.email) {
      return NextResponse.json({ error: "Member email not found" }, { status: 400 });
    }

    const { client: clientResult, staff: staffResult } = await sendVisitCreatedNotifications({
      visit: newVisit,
      member,
      staff,
    });

    if (!clientResult.ok) {
      console.error("Notify (visit_created_client) failed:", clientResult.error);
    }
    if (staffResult && !staffResult.ok) {
      console.error("Notify (visit_created_staff) failed:", staffResult.error);
    }

    return NextResponse.json(
      {
        visit: newVisit,
        message: "Visit created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating visit:", error);
    const message = error instanceof Error ? error.message : "Failed to create visit";
    const status = isVisitOverlapError(message) ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
