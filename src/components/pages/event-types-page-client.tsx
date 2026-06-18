"use client";

import Link from "next/link";

import { buildRoute } from "@/lib/routes";
import { AppLayout } from "@/components/app-layout";
import { EventTypesListContainer } from "@/components/event-types-list-container";
import { PageHeader } from "@/components/page-header";
import { PermissionGate } from "@/components/PermissionGate";
import { Button } from "@/components/ui/button";

export function EventTypesPageClient() {
  return (
    <AppLayout>
      <PageHeader
        title="Services"
        description="Manage the services your wellness center offers"
        action={
          <PermissionGate resource="event_types" action="create">
            <Button asChild>
              <Link href={buildRoute.eventTypesNew()}>Add Service</Link>
            </Button>
          </PermissionGate>
        }
      />

      <div className="container mx-auto px-4 py-6">
        <EventTypesListContainer />
      </div>
    </AppLayout>
  );
}
