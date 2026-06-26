import { NextResponse } from "next/server";
import { format } from "date-fns";

import { requirePermission } from "@/lib/api-permissions";
import { getAvailableDates } from "@/lib/supabase/availability";

export async function GET(request: Request) {
  try {
    const permissionResult = await requirePermission("visits", "create");
    if (permissionResult instanceof NextResponse) return permissionResult;

    const { searchParams } = new URL(request.url);
    const eventTypeId = searchParams.get("eventTypeId");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    if (!eventTypeId || !month || !year) {
      return NextResponse.json(
        { error: "eventTypeId, month, and year are required" },
        { status: 400 }
      );
    }

    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    if (isNaN(m) || isNaN(y) || m < 1 || m > 12) {
      return NextResponse.json({ error: "Invalid month or year" }, { status: 400 });
    }

    // JS month is zero-indexed, so we need to subtract 1
    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0);
    const startStr = format(startDate, "yyyy-MM-dd");
    const endStr = format(endDate, "yyyy-MM-dd");

    const { qualifiedDates, unqualifiedOnlyDates } = await getAvailableDates(
      eventTypeId,
      startStr,
      endStr
    );
    return NextResponse.json({ qualifiedDates, unqualifiedOnlyDates });
  } catch (error) {
    console.error("Error fetching available dates:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch available dates" },
      { status: 500 }
    );
  }
}
