"use client";

import Link from "next/link";

import { buildRoute } from "@/lib/routes";
import { useUser } from "@/hooks/useUser";
import { AppLayout } from "@/components/app-layout";
import { Loader } from "@/components/loader";
import { PageHeader } from "@/components/page-header";
import { PermissionGate } from "@/components/PermissionGate";
import { TeamList } from "@/components/settings/team-list";
import { Button } from "@/components/ui/button";

export default function TeamPage() {
  const { isLoading } = useUser();

  if (isLoading) {
    return (
      <AppLayout>
        <PageHeader title="Team" description="View and manage your organization's staff members" />
        <div className="container mx-auto px-4 py-6">
          <Loader />
        </div>
      </AppLayout>
    );
  }

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
        <TeamList />
      </div>
    </AppLayout>
  );
}
