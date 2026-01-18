import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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
    const supabaseAdmin = createAdminClient();

    // Step 1: Get all auth users to access emails (requires admin client)
    const { data: authUsersData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError || !authUsersData) {
      console.error("Error fetching auth users:", authError);
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      );
    }
    
    const authUsers = authUsersData.users;

    // Step 2: If search provided, filter users by email and get matching user_ids
    let userIdsToFetch: string[] | undefined;
    
    if (search) {
      const matchingUsers = authUsers.filter((user) =>
        user.email?.toLowerCase().includes(search)
      );
      userIdsToFetch = matchingUsers.map((u) => u.id);
      
      // If no matching emails, return empty result early
      if (userIdsToFetch.length === 0) {
        return NextResponse.json({
          staff: [],
          total: 0,
        });
      }
    }

    // Step 3: Query profiles from Supabase with optional user_id filter
    let profileQuery = supabase
      .from("profiles")
      .select("id, user_id, role, created_at")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });

    // Apply user_id filter if search was provided
    if (userIdsToFetch) {
      profileQuery = profileQuery.in("user_id", userIdsToFetch);
    }

    const { data: profiles, error } = await profileQuery;

    if (error) {
      console.error("Error fetching staff:", error);
      return NextResponse.json(
        { error: "Failed to fetch staff" },
        { status: 500 }
      );
    }

    // Step 4: Create email map and transform results
    const emailMap = new Map(
      authUsers.map((u) => [u.id, u.email || ""])
    );

    const staff = (profiles || []).map((profile: any) => ({
      id: profile.id,
      userId: profile.user_id,
      email: emailMap.get(profile.user_id) || "",
      role: profile.role,
      createdAt: profile.created_at,
    }));

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
