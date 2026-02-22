import { NextResponse } from "next/server";

import { requirePermission } from "@/lib/api-permissions";
import { getAvailableSlots } from "@/lib/supabase/availability";

export async function GET(request: Request) {
  try {
    const permissionResult = await requirePermission("visits", "create");
    if (permissionResult instanceof NextResponse) return permissionResult;

    const { searchParams } = new URL(request.url);
    const eventTypeId = searchParams.get("eventTypeId");
    const date = searchParams.get("date");
    const memberId = searchParams.get("memberId") ?? undefined;

    if (!eventTypeId || !date) {
      return NextResponse.json({ error: "eventTypeId and date are required" }, { status: 400 });
    }

    const slots = await getAvailableSlots(eventTypeId, date, memberId);
    return NextResponse.json({ slots });
  } catch (error) {
    console.error("Error fetching available slots:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch available slots" },
      { status: 500 }
    );
  }
}
