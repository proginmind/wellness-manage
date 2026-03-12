import type { Metadata } from "next";
import Link from "next/link";

import { requireAuth } from "@/lib/auth";
import { buildRoute } from "@/lib/routes";
import { getCurrentUserProfile, getMembers } from "@/lib/supabase/queries";
import { requireTrialAccess } from "@/lib/trial-server";
import { AppLayout } from "@/components/app-layout";
import { MembersListContainer } from "@/components/members-list-container";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Members",
};

export default async function MembersPage() {
  const user = await requireAuth();
  const profile = await getCurrentUserProfile(user.id);
  await requireTrialAccess(profile.organizationId);
  const members = await getMembers();

  return (
    <AppLayout>
      <PageHeader
        title="Members"
        description="Manage your wellness center members"
        action={
          <Button asChild>
            <Link href={buildRoute.membersNew()}>Add Member</Link>
          </Button>
        }
      />

      <div className="container mx-auto px-4 py-6">
        <MembersListContainer fallbackData={{ members, total: members.length, search: null }} />
      </div>
    </AppLayout>
  );
}
