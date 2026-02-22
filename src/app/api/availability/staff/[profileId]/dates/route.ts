import { NextResponse } from "next/server";
import { format } from "date-fns";

import { requirePermission } from "@/lib/api-permissions";
import { getAvailableDatesForStaff } from "@/lib/supabase/availability";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ profileId: string }> }
) {
  try {
    const permissionResult = await requirePermission("staff", "view");
    if (permissionResult instanceof NextResponse) return permissionResult;

    const { profileId } = await params;
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    if (!profileId || !month || !year) {
      return NextResponse.json(
        { error: "profileId, month, and year are required" },
        { status: 400 }
      );
    }

    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    if (isNaN(m) || isNaN(y) || m < 1 || m > 12) {
      return NextResponse.json({ error: "Invalid month or year" }, { status: 400 });
    }

    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0);
    const startStr = format(startDate, "yyyy-MM-dd");
    const endStr = format(endDate, "yyyy-MM-dd");

    const dates = await getAvailableDatesForStaff(profileId, startStr, endStr);
    return NextResponse.json({ dates });
  } catch (error) {
    console.error("Error fetching staff available dates:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch staff available dates",
      },
      { status: 500 }
    );
  }
}
