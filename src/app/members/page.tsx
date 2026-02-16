import type { Metadata } from "next";
import Link from "next/link";

import { buildRoute } from "@/lib/routes";
import { AppLayout } from "@/components/app-layout";
import { MembersListContainer } from "@/components/members-list-container";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Members",
};

export default async function MembersPage() {
  // Auth is handled by middleware - no need for manual checks!

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
        <MembersListContainer />
      </div>
    </AppLayout>
  );
}
