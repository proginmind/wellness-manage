"use client";

import Link from "next/link";

import { buildRoute } from "@/lib/routes";
import { AppLayout } from "@/components/app-layout";
import { PageHeader } from "@/components/page-header";
import { PermissionGate } from "@/components/PermissionGate";
import { TeamList } from "@/components/settings/team-list";
import { Button } from "@/components/ui/button";

export function TeamPageClient() {
  return (
    <AppLayout>
      <PageHeader
        title="Staff"
        description="View and manage your organization's staff"
        action={
          <PermissionGate resource="staff" action="create">
            <Button asChild>
              <Link href={buildRoute.teamNew()}>Add Staff</Link>
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
