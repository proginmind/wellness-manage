import { NextResponse } from "next/server";

import { requirePermission } from "@/lib/api-permissions";
import { getAvailableSlotsForStaff } from "@/lib/supabase/availability";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ profileId: string }> }
) {
  try {
    const permissionResult = await requirePermission("staff", "view");
    if (permissionResult instanceof NextResponse) return permissionResult;

    const { profileId } = await params;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!profileId || !date) {
      return NextResponse.json({ error: "profileId and date are required" }, { status: 400 });
    }

    const slots = await getAvailableSlotsForStaff(profileId, date);
    return NextResponse.json({ slots });
  } catch (error) {
    console.error("Error fetching staff available slots:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch staff available slots",
      },
      { status: 500 }
    );
  }
}
