import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { mockMembers } from "@/lib/mock-data";
import { memberFormSchema } from "@/lib/validations/member";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get member ID from params
    const { id } = await params;

    // Find member by ID in mock data
    // In the future, this will be: await supabase.from('members').select('*').eq('id', id).single()
    const member = mockMembers.find((m) => m.id === id);

    if (!member) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ member });
  } catch (error) {
    console.error("Error fetching member:", error);
    return NextResponse.json(
      { error: "Failed to fetch member" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get member ID from params
    const { id } = await params;

    // Parse request body
    const body = await request.json();

    // Find member by ID in mock data
    const memberIndex = mockMembers.findIndex((m) => m.id === id);

    if (memberIndex === -1) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }

    // Check if this is a status update (archive/unarchive) or full member update
    if ("status" in body && Object.keys(body).length === 1) {
      // Status update only (archive/unarchive)
      // In the future, this will be: await supabase.from('members').update({ status, archivedAt }).eq('id', id)
      if (body.status === "archived") {
        mockMembers[memberIndex].status = "archived";
        mockMembers[memberIndex].archivedAt = new Date();
      } else if (body.status === "active") {
        mockMembers[memberIndex].status = "active";
        mockMembers[memberIndex].archivedAt = undefined;
      }
    } else {
      // Full member update
      // Validate with zod schema
      const validationResult = memberFormSchema.safeParse(body);
      
      if (!validationResult.success) {
        return NextResponse.json(
          { error: "Validation failed", details: validationResult.error.issues },
          { status: 400 }
        );
      }

      const validated = validationResult.data;

      // Update member fields
      // In the future, this will be: await supabase.from('members').update(validated).eq('id', id)
      mockMembers[memberIndex].firstName = validated.firstName;
      mockMembers[memberIndex].lastName = validated.lastName;
      mockMembers[memberIndex].email = validated.email;
      mockMembers[memberIndex].dateOfBirth = new Date(validated.dateOfBirth);
      mockMembers[memberIndex].dateJoined = new Date(validated.dateJoined);
      mockMembers[memberIndex].image = validated.image || undefined;
    }

    return NextResponse.json({
      member: mockMembers[memberIndex],
      message: "Member updated successfully",
    });
  } catch (error) {
    console.error("Error updating member:", error);
    return NextResponse.json(
      { error: "Failed to update member" },
      { status: 500 }
    );
  }
}
