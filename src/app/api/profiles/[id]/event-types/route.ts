import { NextResponse } from "next/server";

import { requirePermission } from "@/lib/api-permissions";
import { assignEventTypeToProfile, removeEventTypeFromProfile } from "@/lib/supabase/queries";

// Assign event type to profile
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: profileId } = await params;
    const permissionResult = await requirePermission("staff", "update");
    if (permissionResult instanceof NextResponse) return permissionResult;

    const { organizationId } = permissionResult;
    const { eventTypeId } = await request.json();

    await assignEventTypeToProfile(profileId, eventTypeId, organizationId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error assigning event type:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to assign event type" },
      { status: 500 }
    );
  }
}

// Remove event type from profile
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: profileId } = await params;
    const permissionResult = await requirePermission("staff", "update");
    if (permissionResult instanceof NextResponse) return permissionResult;

    const { searchParams } = new URL(request.url);
    const eventTypeId = searchParams.get("eventTypeId");

    if (!eventTypeId) {
      return NextResponse.json({ error: "eventTypeId is required" }, { status: 400 });
    }

    await removeEventTypeFromProfile(profileId, eventTypeId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing event type:", error);
    return NextResponse.json({ error: "Failed to remove event type" }, { status: 500 });
  }
}
