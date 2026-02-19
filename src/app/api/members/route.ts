import { NextResponse } from "next/server";

import { MembersListResponse } from "@/types/api";
import { getMembers } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";

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

    const response: MembersListResponse = {
      members,
      total: members.length,
      search: search || null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
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
    const newMember = await createMember(body);

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
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
