export interface TrialStatus {
  /** Trial is active (not expired) and org has no active subscription */
  isOnTrial: boolean;
  /** Trial end date has passed and org has no active subscription */
  isExpired: boolean;
  /** The trial end date. null = grandfathered org, no trial enforcement */
  endsAt: Date | null;
  /** Days remaining. 0 when expired or no trial */
  daysLeft: number;
}

/**
 * Compute trial status for an organization.
 *
 * Rules:
 * - trialEndsAt = null → grandfathered org, full access, no enforcement
 * - hasActiveSubscription = true → paid, full access regardless of trial date
 * - trialEndsAt in future → active trial
 * - trialEndsAt in past → expired trial, restrict access
 */
export function getTrialStatus(
  trialEndsAt: Date | null | undefined,
  hasActiveSubscription: boolean
): TrialStatus {
  if (!trialEndsAt) {
    return { isOnTrial: false, isExpired: false, endsAt: null, daysLeft: 0 };
  }

  if (hasActiveSubscription) {
    return { isOnTrial: false, isExpired: false, endsAt: trialEndsAt, daysLeft: 0 };
  }

  const now = new Date();
  const isExpired = trialEndsAt <= now;
  const msLeft = trialEndsAt.getTime() - now.getTime();
  const daysLeft = isExpired ? 0 : Math.ceil(msLeft / (1000 * 60 * 60 * 24));

  return {
    isOnTrial: !isExpired,
    isExpired,
    endsAt: trialEndsAt,
    daysLeft,
  };
}

/** Resources that remain accessible even when the trial has expired */
export const TRIAL_ALLOWED_RESOURCES = new Set([
  "billing",
  "plans",
  "profile",
  "organization",
] as const);

/** Page path prefixes that remain accessible when the trial has expired */
export const TRIAL_ALLOWED_PATHS = [
  "/settings/profile",
  "/settings/organization",
  "/settings/billing",
  "/settings/plans",
  "/login",
  "/forgot-password",
  "/reset-password",
  "/invite",
  "/api",
] as const;
