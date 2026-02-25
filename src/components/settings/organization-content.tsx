import currencies from "@/data/currencies.json";
import { format } from "date-fns";

import { Organization } from "@/types/organization";
import { Profile } from "@/types/profile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface OrganizationContentProps {
  organization: Organization;
  profile: Profile;
}

export function OrganizationContent({ organization, profile }: OrganizationContentProps) {
  const currencyEntry = currencies.find((c) => c.code === (organization.currency ?? "USD"));
  const currencyLabel = currencyEntry
    ? `${currencyEntry.code} · ${currencyEntry.name} (${currencyEntry.symbol})`
    : (organization.currency ?? "USD");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Information</CardTitle>
        <CardDescription>Your organization details</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Organization Name:</span>
            <span className="text-sm text-zinc-600 dark:text-zinc-400">{organization.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">Currency:</span>
            <span className="text-sm text-zinc-600 dark:text-zinc-400">{currencyLabel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">Your Role:</span>
            <span className="text-sm text-zinc-600 dark:text-zinc-400 capitalize">
              {profile.role}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">Organization ID:</span>
            <span className="text-sm text-zinc-600 dark:text-zinc-400 font-mono">
              {organization.id.slice(0, 8)}...
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">Created:</span>
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {format(new Date(organization.createdAt), "PPP")}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
