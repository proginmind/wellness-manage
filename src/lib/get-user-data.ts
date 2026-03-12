import {
  getCurrentUserProfile,
  getLatestSubscriptionByOrganizationId,
  getOrganizationById,
} from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { getTrialStatus } from "@/lib/trial";

export interface UserData {
  user: {
    id: string;
    email: string | undefined;
    created_at: string;
    profile?: unknown;
    organization?: unknown;
  };
  trial: {
    isOnTrial: boolean;
    isExpired: boolean;
    endsAt: Date | null;
    daysLeft: number;
  } | null;
}

/**
 * Server-side equivalent of GET /api/auth/me.
 * Returns the same shape so it can be used as SWR fallback data in the layout,
 * eliminating the client-side loading flash for useUser().
 */
export async function getUserData(): Promise<UserData | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return null;

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
    } catch {
      // Profile not found – new users without a profile yet
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        profile: profile ?? undefined,
        organization: organization ?? undefined,
      },
      trial: trialStatus
        ? {
            isOnTrial: trialStatus.isOnTrial,
            isExpired: trialStatus.isExpired,
            endsAt: trialStatus.endsAt,
            daysLeft: trialStatus.daysLeft,
          }
        : null,
    };
  } catch {
    return null;
  }
}
