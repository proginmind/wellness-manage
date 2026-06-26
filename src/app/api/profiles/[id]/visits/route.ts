import { NextResponse } from "next/server";

import { requirePermission } from "@/lib/api-permissions";
import { getProfileById, getVisitsByStaffId } from "@/lib/supabase/queries";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const permissionResult = await requirePermission("visits", "view");
    if (permissionResult instanceof NextResponse) return permissionResult;

    const { organizationId } = permissionResult;
    const { id } = await params;

    const profile = await getProfileById(id);
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const visits = await getVisitsByStaffId(id, organizationId);

    return NextResponse.json({
      visits,
      total: visits.length,
    });
  } catch (error) {
    console.error("Error fetching staff visits:", error);
    return NextResponse.json({ error: "Failed to fetch staff visits" }, { status: 500 });
  }
}
