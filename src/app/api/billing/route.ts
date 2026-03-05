import { NextResponse } from "next/server";

import { requireOwner } from "@/lib/api-permissions";
import { getBilling } from "@/lib/billing";

export async function GET() {
  try {
    const result = await requireOwner();
    if (result instanceof NextResponse) return result;

    const data = await getBilling();
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/billing error:", error);
    return NextResponse.json({ error: "Failed to fetch billing" }, { status: 500 });
  }
}
