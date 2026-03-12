import { redirect } from "next/navigation";

import { buildRoute } from "@/lib/routes";
import { getLatestSubscriptionByOrganizationId, getOrganizationById } from "@/lib/supabase/queries";
import { getTrialStatus } from "@/lib/trial";

/**
 * Checks the trial status for the given organization and redirects to billing
 * if the trial has expired and no active subscription exists.
 * Call this in server page components before fetching any restricted data.
 */
export async function requireTrialAccess(organizationId: string): Promise<void> {
  const [org, latestSub] = await Promise.all([
    getOrganizationById(organizationId),
    getLatestSubscriptionByOrganizationId(organizationId),
  ]);

  const trialStatus = getTrialStatus(org?.trialEndsAt ?? null, latestSub?.status === "active");

  if (trialStatus.isExpired) {
    redirect(buildRoute.settingsBilling());
  }
}
