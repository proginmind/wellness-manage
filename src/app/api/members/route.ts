import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getMembers } from "@/lib/supabase/queries";

export async function GET(request: Request) {
  try {
    // Check authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get search query from URL params
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;

    // Fetch members from database
    const members = await getMembers(search);

    return NextResponse.json({
      members,
      total: members.length,
      search: search || null,
    });
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();

    // Import queries dynamically to avoid circular dependency issues
    const { createMember } = await import("@/lib/supabase/queries");
    
    // Create member in database
    const newMember = await createMember(body, user.id);

    return NextResponse.json(
      {
        member: newMember,
        message: "Member created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating member:", error);
    const message = error instanceof Error ? error.message : "Failed to create member";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
