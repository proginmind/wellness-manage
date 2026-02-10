import { NextResponse } from "next/server";

import { getCurrentUserProfile, getOrganizationById } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's profile (includes organization_id and role)
    let profile = null;
    let organization = null;

    try {
      profile = await getCurrentUserProfile(user.id);

      // Get organization details if profile exists
      if (profile) {
        organization = await getOrganizationById(profile.organizationId);
      }
    } catch (error) {
      // Profile not found - this is okay for new users
      console.log("Profile not found for user:", user.id);
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        profile: profile || undefined,
        organization: organization || undefined,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}
