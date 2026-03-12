import { NextResponse } from "next/server";

import {
  getCurrentUserProfile,
  getLatestSubscriptionByOrganizationId,
  getOrganizationById,
} from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { getTrialStatus } from "@/lib/trial";

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

    let profile = null;
    let organization = null;
    let trialStatus = null;

    try {
      profile = await getCurrentUserProfile(user.id);

      if (profile) {
        const [org, latestSub] = await Promise.all([
          getOrganizationById(profile.organizationId),
          getLatestSubscriptionByOrganizationId(profile.organizationId),
        ]);
        organization = org;
        trialStatus = getTrialStatus(org?.trialEndsAt ?? null, latestSub?.status === "active");
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
      trial: trialStatus
        ? {
            isOnTrial: trialStatus.isOnTrial,
            isExpired: trialStatus.isExpired,
            endsAt: trialStatus.endsAt,
            daysLeft: trialStatus.daysLeft,
          }
        : null,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}
