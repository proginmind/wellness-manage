"use client";

import Link from "next/link";

import { buildRoute } from "@/lib/routes";
import { AppLayout } from "@/components/app-layout";
import { PageHeader } from "@/components/page-header";
import { PermissionGate } from "@/components/PermissionGate";
import { Button } from "@/components/ui/button";
import { VisitsListContainer } from "@/components/visits-list-container";

export function VisitsPageClient() {
  return (
    <AppLayout>
      <PageHeader
        title="Appointments"
        description="Manage your wellness center appointments"
        action={
          <PermissionGate resource="visits" action="create">
            <Button asChild>
              <Link href={buildRoute.visitsNew()}>Add Appointment</Link>
            </Button>
          </PermissionGate>
        }
      />

      <div className="container mx-auto px-4 py-6">
        <VisitsListContainer />
      </div>
    </AppLayout>
  );
}
