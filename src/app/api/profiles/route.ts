import { NextResponse } from "next/server";

import { StaffListResponse } from "@/types/api";
import { requirePermission } from "@/lib/api-permissions";
import { createStaffProfile } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { staffFormSchema } from "@/lib/validations/staff";

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
    const includeEventTypes = searchParams.get("include") === "eventTypes"; // Optional include event types

    const supabase = await createClient();

    // Query profiles with email filtering
    let profileQuery = supabase
      .from("profiles")
      .select(
        "id, user_id, role, email, first_name, last_name, description, date_of_birth, phone_number, avatar_image, created_at"
      )
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

    // Fetch event types for each profile if requested
    let staff = (profiles || []).map((profile: any) => ({
      id: profile.id,
      userId: profile.user_id,
      email: profile.email,
      role: profile.role,
      firstName: profile.first_name,
      lastName: profile.last_name,
      description: profile.description,
      dateOfBirth: profile.date_of_birth,
      phoneNumber: profile.phone_number,
      avatarImage: profile.avatar_image,
      createdAt: profile.created_at,
      eventTypes: [] as any[],
    }));

    if (includeEventTypes && staff.length > 0) {
      // Fetch event types for all profiles in a single query
      const { data: assignments } = await supabase
        .from("profiles_event_types")
        .select("profile_id, event_types(id, name, color)")
        .eq("organization_id", organizationId)
        .in(
          "profile_id",
          staff.map((s) => s.id)
        );

      // Map event types to profiles
      if (assignments) {
        const eventTypesByProfile = new Map<string, any[]>();
        assignments.forEach((assignment: any) => {
          if (!eventTypesByProfile.has(assignment.profile_id)) {
            eventTypesByProfile.set(assignment.profile_id, []);
          }
          if (assignment.event_types) {
            eventTypesByProfile.get(assignment.profile_id)!.push(assignment.event_types);
          }
        });

        staff = staff.map((member) => ({
          ...member,
          eventTypes: eventTypesByProfile.get(member.id) || [],
        }));
      }
    }

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

export async function POST(request: Request) {
  try {
    const permissionResult = await requirePermission("staff", "create");
    if (permissionResult instanceof NextResponse) return permissionResult;

    const { organizationId } = permissionResult;
    const body = await request.json();
    const parsed = staffFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, description, dateOfBirth, phoneNumber, avatarImage } =
      parsed.data;

    try {
      const profile = await createStaffProfile(organizationId, {
        firstName,
        lastName,
        email,
        description: description || undefined,
        dateOfBirth: dateOfBirth || undefined,
        phoneNumber: phoneNumber || undefined,
        avatarImage: avatarImage || undefined,
      });

      return NextResponse.json(
        { profile, message: "Staff member created successfully" },
        { status: 201 }
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create staff profile";
      if (message.includes("already exists")) {
        return NextResponse.json({ error: message }, { status: 409 });
      }
      throw error;
    }
  } catch (error) {
    console.error("Error creating staff profile:", error);
    const message = error instanceof Error ? error.message : "Failed to create staff profile";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
