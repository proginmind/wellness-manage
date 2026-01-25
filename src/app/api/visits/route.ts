import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getMembers, getVisits } from "@/lib/supabase/queries";

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
    const visitsData = await getVisits(search);

    return NextResponse.json({
      visits: visitsData.map((visit) => ({
        visit: visit.visit,
        member: visit.member,
      })),
      total: visitsData.length,
      search: search || null,
    });
  } catch (error) {
    console.error("Error fetching visits:", error);
    return NextResponse.json(
      { error: "Failed to fetch visits" },
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
    const { createVisit } = await import("@/lib/supabase/queries");
    
    // Create visit in database
    const newVisit = await createVisit(body, user.id);

    return NextResponse.json(
      {
        visit: newVisit,
        message: "Visit created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating visit:", error);
    const message = error instanceof Error ? error.message : "Failed to create visit";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
