"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { buildRoute } from "@/lib/routes";

/**
 * Redirects the user to billing when an API call returns 402 (trial expired).
 * Use this in SWR-based list containers to avoid showing a red error state
 * when the trial ends while the user is actively navigating.
 */
export function useTrialGuard(error: unknown) {
  const router = useRouter();

  useEffect(() => {
    if (error && (error as { status?: number }).status === 402) {
      router.replace(buildRoute.settingsBilling());
    }
  }, [error, router]);
}
