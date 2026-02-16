import { NextResponse } from "next/server";

import { getCurrentUserProfile, updateProfile } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { profileFormSchema } from "@/lib/validations/profile";

/**
 * GET /api/profile
 * Fetch current user's profile
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await getCurrentUserProfile(user.id);

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/profile
 * Update current user's profile
 */
export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const validation = profileFormSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { firstName, lastName, description, dateOfBirth, phoneNumber, avatarImage } =
      validation.data;

    // Update profile
    const profile = await updateProfile(user.id, {
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      description: description || undefined,
      dateOfBirth: dateOfBirth || undefined,
      phoneNumber: phoneNumber || undefined,
      avatarImage: avatarImage || undefined,
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update profile" },
      { status: 500 }
    );
  }
}
