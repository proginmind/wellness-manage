"use client";

import Link from "next/link";

import { buildRoute } from "@/lib/routes";
import { AppLayout } from "@/components/app-layout";
import { MembersListContainer } from "@/components/members-list-container";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

export function MembersPageClient() {
  return (
    <AppLayout>
      <PageHeader
        title="Clients"
        description="Manage your wellness center clients"
        action={
          <Button asChild>
            <Link href={buildRoute.membersNew()}>Add Client</Link>
          </Button>
        }
      />

      <div className="container mx-auto px-4 py-6">
        <MembersListContainer />
      </div>
    </AppLayout>
  );
}
