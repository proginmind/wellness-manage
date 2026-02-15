import { NextResponse } from "next/server";
import { z } from "zod";

import { requireOwner } from "@/lib/api-permissions";
import { getInvitations } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";

const inviteSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const permissionResult = await requireOwner();
    if (permissionResult instanceof NextResponse) return permissionResult;

    const { organizationId } = permissionResult;

    const body = await request.json();
    const validation = inviteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const { email } = validation.data;
    const supabase = await createClient();

    // Check if user is already a member of this organization
    const { data: existingProfiles } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("organization_id", organizationId);

    if (existingProfiles) {
      const existingEmails = existingProfiles.map((p) => p.email).filter(Boolean);

      if (existingEmails.includes(email.toLowerCase())) {
        return NextResponse.json(
          { error: "User is already a member of this organization" },
          { status: 409 }
        );
      }
    }

    // Check for existing pending invitation
    const { data: existingInvitation } = await supabase
      .from("invitations")
      .select("id")
      .eq("email", email.toLowerCase())
      .eq("organization_id", organizationId)
      .eq("status", "pending")
      .single();

    if (existingInvitation) {
      return NextResponse.json(
        { error: "An invitation has already been sent to this email" },
        { status: 409 }
      );
    }

    // Create invitation
    const { data: invitation, error } = await supabase
      .from("invitations")
      .insert({
        email: email.toLowerCase(),
        organization_id: organizationId,
        status: "pending",
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating invitation:", error);
      return NextResponse.json({ error: "Failed to create invitation" }, { status: 500 });
    }

    return NextResponse.json({ invitation });
  } catch (error) {
    console.error("Error in POST /api/invitations:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const permissionResult = await requireOwner();
    if (permissionResult instanceof NextResponse) return permissionResult;

    const invitations = await getInvitations();

    return NextResponse.json({ invitations });
  } catch (error) {
    console.error("Error in GET /api/invitations:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
