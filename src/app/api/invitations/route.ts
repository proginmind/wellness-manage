import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/api-permissions";
import { getInvitations, createInvitation } from "@/lib/supabase/queries";
import { z } from "zod";

// GET /api/invitations - List all invitations for the organization
export async function GET(request: Request) {
  try {
    // Check permission: owner only
    const permissionResult = await requireOwner();
    if (permissionResult instanceof NextResponse) return permissionResult;

    // Fetch invitations (sorted by created_at desc in query)
    const invitations = await getInvitations();

    return NextResponse.json({
      invitations,
      total: invitations.length,
    });
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return NextResponse.json(
      { error: "Failed to fetch invitations" },
      { status: 500 }
    );
  }
}

// POST /api/invitations - Create new invitation
export async function POST(request: Request) {
  try {
    // Check permission: owner only
    const permissionResult = await requireOwner();
    if (permissionResult instanceof NextResponse) return permissionResult;

    // Parse and validate request body
    const body = await request.json();
    
    const invitationSchema = z.object({
      email: z.string().email("Invalid email address"),
    });

    const validationResult = invitationSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: validationResult.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;

    // Create invitation
    const invitation = await createInvitation(email);

    return NextResponse.json(
      {
        invitation,
        message: "Invitation sent successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating invitation:", error);
    const message = error instanceof Error ? error.message : "Failed to create invitation";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
