import { NextResponse } from "next/server";

import { getMemberStats } from "@/lib/supabase/queries";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId") ?? "";

    const stats = await getMemberStats(organizationId);
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
