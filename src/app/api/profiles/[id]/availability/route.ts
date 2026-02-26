import { NextResponse } from "next/server";

import { requireAuth, requireOwner } from "@/lib/api-permissions";
import {
  getProfileById,
  getStaffAvailability,
  upsertStaffAvailability,
} from "@/lib/supabase/queries";
import { staffAvailabilityPutSchema } from "@/lib/validations/staff-availability";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: profileId } = await params;
    const result = await requireAuth();
    if (result instanceof NextResponse) return result;

    const { organizationId } = result;

    const profile = await getProfileById(profileId);
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const slots = await getStaffAvailability(profileId, organizationId);
    return NextResponse.json({ slots });
  } catch (error) {
    console.error("GET /api/profiles/[id]/availability error:", error);
    return NextResponse.json({ error: "Failed to fetch staff availability" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: profileId } = await params;
    const result = await requireOwner();
    if (result instanceof NextResponse) return result;

    const { organizationId } = result;

    const profile = await getProfileById(profileId);
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const parsed = staffAvailabilityPutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    await upsertStaffAvailability(profileId, organizationId, parsed.data.slots);

    const slots = await getStaffAvailability(profileId, organizationId);
    return NextResponse.json({ slots });
  } catch (error) {
    console.error("PUT /api/profiles/[id]/availability error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save staff availability" },
      { status: 500 }
    );
  }
}
