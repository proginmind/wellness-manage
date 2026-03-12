import type { Metadata } from "next";
import Link from "next/link";

import { requireAuth } from "@/lib/auth";
import { buildRoute } from "@/lib/routes";
import { getCurrentUserProfile, getStaffProfiles } from "@/lib/supabase/queries";
import { AppLayout } from "@/components/app-layout";
import { PageHeader } from "@/components/page-header";
import { PermissionGate } from "@/components/PermissionGate";
import { TeamList } from "@/components/settings/team-list";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Team",
};

export default async function TeamPage() {
  const user = await requireAuth();
  const profile = await getCurrentUserProfile(user.id);
  const staff = await getStaffProfiles(profile.organizationId, { includeEventTypes: true });

  return (
    <AppLayout>
      <PageHeader
        title="Team"
        description="View and manage your organization's staff members"
        action={
          <PermissionGate resource="invitations" action="create">
            <Button asChild>
              <Link href={buildRoute.settingsInvitationsNew()}>Invite Staff Member</Link>
            </Button>
          </PermissionGate>
        }
      />

      <div className="container mx-auto px-4 py-6">
        <TeamList fallbackData={{ staff, total: staff.length }} />
      </div>
    </AppLayout>
  );
}
