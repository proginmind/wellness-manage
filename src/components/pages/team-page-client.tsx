"use client";

import { AppLayout } from "@/components/app-layout";
import { PageHeader } from "@/components/page-header";
import { TeamList } from "@/components/settings/team-list";

export function TeamPageClient() {
  return (
    <AppLayout>
      <PageHeader title="Staff" description="View and manage your organization's staff" />

      <div className="container mx-auto px-4 py-6">
        <TeamList />
      </div>
    </AppLayout>
  );
}
