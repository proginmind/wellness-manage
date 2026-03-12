import Link from "next/link";
import { format } from "date-fns";
import { AlertCircle, Clock } from "lucide-react";

import { buildRoute } from "@/lib/routes";
import { TrialStatus } from "@/lib/trial";

interface TrialBannerProps {
  trial: TrialStatus;
}

export function TrialBanner({ trial }: TrialBannerProps) {
  if (!trial.isOnTrial && !trial.isExpired) return null;

  if (trial.isExpired) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm dark:border-red-800 dark:bg-red-950">
        <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
        <p className="flex-1 text-red-800 dark:text-red-200">
          Your free trial has ended.{" "}
          <Link
            href={buildRoute.settingsPlans()}
            className="font-semibold underline underline-offset-2 hover:no-underline"
          >
            Upgrade now
          </Link>{" "}
          to restore access to all features.
        </p>
      </div>
    );
  }

  const endsOnLabel = trial.endsAt ? format(trial.endsAt, "MMM d, yyyy") : null;
  const urgency = trial.daysLeft <= 3;

  return (
    <div
      className={
        urgency
          ? "flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm dark:border-amber-800 dark:bg-amber-950"
          : "flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm dark:border-blue-800 dark:bg-blue-950"
      }
    >
      <Clock
        className={
          urgency
            ? "h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400"
            : "h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400"
        }
      />
      <p
        className={
          urgency
            ? "flex-1 text-amber-800 dark:text-amber-200"
            : "flex-1 text-blue-800 dark:text-blue-200"
        }
      >
        {trial.daysLeft === 1 ? (
          <>Your trial ends tomorrow</>
        ) : (
          <>
            Your trial ends in <span className="font-semibold">{trial.daysLeft} days</span>
          </>
        )}
        {endsOnLabel && <span className="text-xs opacity-75"> ({endsOnLabel})</span>}.{" "}
        <Link
          href={buildRoute.settingsPlans()}
          className="font-semibold underline underline-offset-2 hover:no-underline"
        >
          Upgrade to keep full access
        </Link>
      </p>
    </div>
  );
}
