"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

import { useUser } from "@/hooks/useUser";

/**
 * Sets Sentry user context whenever the authenticated user changes.
 * Renders nothing — place once inside the root layout.
 */
export function SentryUserContext() {
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      Sentry.setUser({
        id: user.id,
        email: user.email,
        // organizationId visible in Sentry's "Additional Data" section
        organizationId: user.organization?.id,
        organizationName: user.organization?.name,
      });
    } else {
      Sentry.setUser(null);
    }
  }, [user]);

  return null;
}
