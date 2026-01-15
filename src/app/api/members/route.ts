import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { mockMembers } from "@/lib/mock-data";
import { Member } from "@/types/member";

// In-memory storage for new members (will be replaced with database)
let additionalMembers: Member[] = [];

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
    const search = searchParams.get("search")?.toLowerCase().trim() || "";

    // Combine mock members with additional members
    const allMembers = [...mockMembers, ...additionalMembers];

    // Filter out archived members by default (only show active members)
    let filteredMembers = allMembers.filter((member) => member.status === "active");
    
    // Apply search filter if provided
    if (search) {
      filteredMembers = filteredMembers.filter((member) => {
        const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
        const email = member.email.toLowerCase();
        
        return fullName.includes(search) || email.includes(search);
      });
    }

    // Return filtered members data
    // In the future, this will use Supabase database queries
    return NextResponse.json({
      members: filteredMembers,
      total: filteredMembers.length,
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
    
    // Create new member with generated ID
    const newMember: Member = {
      id: `${Date.now()}`, // Simple ID generation for mock data
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      image: body.image || undefined,
      dateJoined: new Date(body.dateJoined),
      dateOfBirth: new Date(body.dateOfBirth),
      status: "active",
    };

    // Add to in-memory storage
    // In the future, this will be: await supabase.from('members').insert(newMember)
    additionalMembers.push(newMember);

    return NextResponse.json({
      member: newMember,
      message: "Member created successfully",
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating member:", error);
    return NextResponse.json(
      { error: "Failed to create member" },
      { status: 500 }
    );
  }
}
