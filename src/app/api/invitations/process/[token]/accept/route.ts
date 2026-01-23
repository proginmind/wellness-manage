import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get invitation by token
    const { data: invitation, error: invitationError } = await supabase
      .from("invitations")
      .select("*")
      .eq("token", token)
      .single();

    if (invitationError || !invitation) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    // Validate invitation
    if (invitation.status === "accepted") {
      return NextResponse.json(
        { error: "This invitation has already been accepted" },
        { status: 409 }
      );
    }

    if (invitation.status === "expired") {
      return NextResponse.json(
        { error: "This invitation has expired" },
        { status: 410 }
      );
    }

    const isExpired = new Date(invitation.expires_at) < new Date();
    if (isExpired) {
      // Auto-expire and return error
      await supabase
        .from("invitations")
        .update({ status: "expired" })
        .eq("token", token);

      return NextResponse.json(
        { error: "This invitation has expired" },
        { status: 410 }
      );
    }

    // Verify email matches
    if (user.email?.toLowerCase() !== invitation.email.toLowerCase()) {
      return NextResponse.json(
        { error: "Email mismatch. This invitation is for a different email address." },
        { status: 403 }
      );
    }

    // Check if user already has a profile in this organization
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .eq("organization_id", invitation.organization_id)
      .single();

    if (existingProfile) {
      return NextResponse.json(
        { error: "You are already a member of this organization" },
        { status: 409 }
      );
    }

    // Accept invitation (this will trigger the database function to create profile)
    const { error: updateError } = await supabase
      .from("invitations")
      .update({ status: "accepted" })
      .eq("token", token);

    if (updateError) {
      console.error("Error accepting invitation:", updateError);
      return NextResponse.json(
        { error: "Failed to accept invitation" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in POST /api/invitations/[token]/accept:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
