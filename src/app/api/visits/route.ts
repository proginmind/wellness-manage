import { NextResponse } from "next/server";

import { requirePermission } from "@/lib/api-permissions";
import { getVisits } from "@/lib/supabase/queries";

export async function GET(request: Request) {
  try {
    // Check permission: visits.view
    const permissionResult = await requirePermission("visits", "view");
    if (permissionResult instanceof NextResponse) return permissionResult;

    // Get search query from URL params
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;

    // Fetch visits from database (organization-scoped via query function)
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
    // Check permission: visits.create
    const permissionResult = await requirePermission("visits", "create");
    if (permissionResult instanceof NextResponse) return permissionResult;

    const { userId } = permissionResult;

    // Parse request body
    const body = await request.json();

    // Import queries dynamically to avoid circular dependency issues
    const { createVisit } = await import("@/lib/supabase/queries");

    // Create visit in database
    const newVisit = await createVisit(body, userId);

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
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
