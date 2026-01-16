import { NextResponse } from "next/server";
import { getMemberById } from "@/lib/supabase/queries";
import { memberFormSchema } from "@/lib/validations/member";
import { requirePermission } from "@/lib/api-permissions";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check permission: members.view
    const permissionResult = await requirePermission("members", "view");
    if (permissionResult instanceof NextResponse) return permissionResult;

    // Get member ID from params
    const { id } = await params;

    // Fetch member from database (org-scoped via RLS)
    const member = await getMemberById(id);

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
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
    // Check permission: members.update (covers both status and full update)
    const permissionResult = await requirePermission("members", "update");
    if (permissionResult instanceof NextResponse) return permissionResult;

    // Get member ID from params
    const { id } = await params;

    // Parse request body
    const body = await request.json();

    // Import queries dynamically
    const { archiveMember, unarchiveMember, updateMember } = await import(
      "@/lib/supabase/queries"
    );

    // Check if this is a status update (archive/unarchive) or full member update
    if ("status" in body && Object.keys(body).length === 1) {
      // Status update only (archive/unarchive)
      const updatedMember =
        body.status === "archived"
          ? await archiveMember(id)
          : await unarchiveMember(id);

      return NextResponse.json({
        member: updatedMember,
        message: "Member updated successfully",
      });
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

      // Convert form data to Member partial
      const updates = {
        firstName: validated.firstName,
        lastName: validated.lastName,
        email: validated.email,
        dateOfBirth: new Date(validated.dateOfBirth),
        dateJoined: new Date(validated.dateJoined),
        image: validated.image || undefined,
      };

      // Update member in database
      const updatedMember = await updateMember(id, updates);

      return NextResponse.json({
        member: updatedMember,
        message: "Member updated successfully",
      });
    }
  } catch (error) {
    console.error("Error updating member:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update member";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
