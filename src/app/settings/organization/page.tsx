import type { Metadata } from "next";
import Link from "next/link";
import { Pencil } from "lucide-react";

import { requireAuth } from "@/lib/auth";
import { buildRoute } from "@/lib/routes";
import { getCurrentUserProfile, getOrganizationById } from "@/lib/supabase/queries";
import { OrganizationContent } from "@/components/settings/organization-content";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Organization Settings",
};

export default async function OrganizationSettingsPage() {
  const user = await requireAuth();
  const profile = await getCurrentUserProfile(user.id);
  const organization = await getOrganizationById(profile.organizationId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Organization</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">Manage your organization settings</p>
        </div>
        {profile.role === "owner" && (
          <Button asChild>
            <Link href={buildRoute.settingsOrganizationEdit()}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
        )}
      </div>

      {organization ? (
        <OrganizationContent organization={organization} profile={profile} />
      ) : (
        <p className="text-center text-zinc-500 dark:text-zinc-400">Organization not found</p>
      )}
    </div>
  );
}
