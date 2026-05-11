import type { Metadata } from "next";

import { requireAuth } from "@/lib/auth";
import { getCurrentUserProfile, getStaffProfiles } from "@/lib/supabase/queries";
import { requireTrialAccess } from "@/lib/trial-server";
import { AppLayout } from "@/components/app-layout";
import { PageHeader } from "@/components/page-header";
import { TeamList } from "@/components/settings/team-list";

export const metadata: Metadata = {
  title: "Staff",
};

export default async function TeamPage() {
  const user = await requireAuth();
  const profile = await getCurrentUserProfile(user.id);
  await requireTrialAccess(profile.organizationId);
  const staff = await getStaffProfiles(profile.organizationId, { includeEventTypes: true });

  return (
    <AppLayout>
      <PageHeader title="Staff" description="View and manage your organization's staff" />

      <div className="container mx-auto px-4 py-6">
        <TeamList fallbackData={{ staff, total: staff.length }} />
      </div>
    </AppLayout>
  );
}
