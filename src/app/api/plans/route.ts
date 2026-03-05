import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/api-permissions";
import { getPlans } from "@/lib/plans";

export async function GET() {
  try {
    const result = await requireAuth();
    if (result instanceof NextResponse) return result;

    const data = await getPlans();
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/plans error:", error);
    return NextResponse.json({ error: "Failed to fetch plans" }, { status: 500 });
  }
}
