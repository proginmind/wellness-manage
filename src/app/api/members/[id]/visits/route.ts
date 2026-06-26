import { NextResponse } from "next/server";

import { requirePermission } from "@/lib/api-permissions";
import { getMemberById, getVisitsByMemberId } from "@/lib/supabase/queries";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const permissionResult = await requirePermission("visits", "view");
    if (permissionResult instanceof NextResponse) return permissionResult;

    const { organizationId } = permissionResult;
    const { id } = await params;

    const member = await getMemberById(id);
    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const visits = await getVisitsByMemberId(id, organizationId);

    return NextResponse.json({
      visits,
      total: visits.length,
    });
  } catch (error) {
    console.error("Error fetching member visits:", error);
    return NextResponse.json({ error: "Failed to fetch member visits" }, { status: 500 });
  }
}
