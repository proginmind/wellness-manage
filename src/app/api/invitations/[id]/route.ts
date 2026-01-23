import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireOwner } from "@/lib/api-permissions";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const permissionResult = await requireOwner();
    if (permissionResult instanceof NextResponse) return permissionResult;

    const { organizationId } = permissionResult;
    const { id } = await params;
    const supabase = await createClient();

    // Verify invitation belongs to this organization
    const { data: invitation, error: fetchError } = await supabase
      .from("invitations")
      .select("id, organization_id, status")
      .eq("id", id)
      .single();

    if (fetchError || !invitation) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    if (invitation.organization_id !== organizationId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    if (invitation.status !== "pending") {
      return NextResponse.json(
        { error: "Can only cancel pending invitations" },
        { status: 400 }
      );
    }

    // Update invitation status to expired
    const { error: updateError } = await supabase
      .from("invitations")
      .update({ status: "expired" })
      .eq("id", id);

    if (updateError) {
      console.error("Error canceling invitation:", updateError);
      return NextResponse.json(
        { error: "Failed to cancel invitation" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/invitations/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
