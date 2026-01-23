import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const supabase = await createClient();

    // Get invitation by token
    const { data: invitation, error } = await supabase
      .from("invitations")
      .select(
        `
        email,
        status,
        expires_at,
        organizations:organization_id (
          name
        )
        `
      )
      .eq("token", token)
      .single();

    if (error || !invitation) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    // Check if expired
    const isExpired = new Date(invitation.expires_at) < new Date();
    if (isExpired && invitation.status === "pending") {
      // Auto-expire if needed
      await supabase
        .from("invitations")
        .update({ status: "expired" })
        .eq("token", token);
    }

    return NextResponse.json({
      invitation: {
        email: invitation.email,
        organizationName: (invitation.organizations as any)?.name || "Unknown Organization",
        expiresAt: invitation.expires_at,
        status: isExpired ? "expired" : invitation.status,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/invitations/[token]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
