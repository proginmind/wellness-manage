import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireOwner } from "@/lib/api-permissions";

export async function GET(request: Request) {
  try {
    // Check permission: owner only
    const permissionResult = await requireOwner();
    if (permissionResult instanceof NextResponse) return permissionResult;

    const { organizationId } = permissionResult;

    // Get search query from URL params
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase().trim() || "";

    const supabase = await createClient();

    // Fetch all profiles in the organization
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, user_id, role, created_at")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching staff:", error);
      return NextResponse.json(
        { error: "Failed to fetch staff" },
        { status: 500 }
      );
    }

    // Fetch user emails separately from auth.users
    const userIds = (profiles || []).map((p) => p.user_id);
    
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    
    // Create a map of user_id to email
    const emailMap = new Map(
      authUsers?.users.map((u) => [u.id, u.email]) || []
    );

    // Transform data and apply search filter
    let staff = (profiles || []).map((profile: any) => ({
      id: profile.id,
      userId: profile.user_id,
      email: emailMap.get(profile.user_id) || "",
      role: profile.role,
      createdAt: profile.created_at,
    }));

    // Apply search filter
    if (search) {
      staff = staff.filter((member) => {
        const email = member.email.toLowerCase();
        return email.includes(search);
      });
    }

    return NextResponse.json({
      staff,
      total: staff.length,
    });
  } catch (error) {
    console.error("Error fetching staff:", error);
    return NextResponse.json(
      { error: "Failed to fetch staff" },
      { status: 500 }
    );
  }
}
