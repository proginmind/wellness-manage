import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getCurrentUserProfile,
  getOrganizationById,
} from "@/lib/supabase/queries";

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
    const profile = await getCurrentUserProfile();

    // Get organization details if profile exists
    let organization = null;
    if (profile) {
      organization = await getOrganizationById(profile.organizationId);
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        profile: profile || undefined,
        organization: organization || undefined,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
