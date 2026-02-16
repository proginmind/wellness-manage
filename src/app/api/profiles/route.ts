import { NextResponse } from "next/server";

import { StaffListResponse } from "@/types/api";
import { requirePermission } from "@/lib/api-permissions";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    // Check permission: all authenticated users can view profiles (for visit assignment)
    const permissionResult = await requirePermission("staff", "view");
    if (permissionResult instanceof NextResponse) return permissionResult;

    const { organizationId } = permissionResult;

    // Get query params from URL
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase().trim() || "";
    const role = searchParams.get("role"); // Optional role filter (e.g., "staff", "owner")

    const supabase = await createClient();

    // Query profiles with email filtering
    let profileQuery = supabase
      .from("profiles")
      .select("id, user_id, role, email, created_at")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });

    // Apply role filter if provided
    if (role) {
      profileQuery = profileQuery.eq("role", role);
    }

    // Apply email search filter
    if (search) {
      profileQuery = profileQuery.ilike("email", `%${search}%`);
    }

    const { data: profiles, error } = await profileQuery;

    if (error) {
      console.error("Error fetching profiles:", error);
      return NextResponse.json({ error: "Failed to fetch profiles" }, { status: 500 });
    }

    const staff = (profiles || []).map((profile: any) => ({
      id: profile.id,
      userId: profile.user_id,
      email: profile.email,
      role: profile.role,
      createdAt: profile.created_at,
    }));

    const response: StaffListResponse = {
      staff,
      total: staff.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching profiles:", error);
    return NextResponse.json({ error: "Failed to fetch profiles" }, { status: 500 });
  }
}
