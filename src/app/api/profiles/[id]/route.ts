import { NextResponse } from "next/server";

import { requirePermission } from "@/lib/api-permissions";
import { getProfileWithEventTypes } from "@/lib/supabase/queries";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const permissionResult = await requirePermission("staff", "view");
    if (permissionResult instanceof NextResponse) return permissionResult;

    const { organizationId } = permissionResult;
    const profile = await getProfileWithEventTypes(id, organizationId);

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}
