import Link from "next/link";

import { buildRoute } from "@/lib/routes";
import { AppLayout } from "@/components/app-layout";
import { EventTypesListContainer } from "@/components/event-types-list-container";
import { PageHeader } from "@/components/page-header";
import { PermissionGate } from "@/components/PermissionGate";
import { Button } from "@/components/ui/button";

export default async function EventTypesPage() {
  // Auth handled by middleware - no manual checks needed

  return (
    <AppLayout>
      <PageHeader
        title="Event Types"
        description="Manage your services and event types"
        action={
          <PermissionGate resource="event_types" action="create">
            <Button asChild>
              <Link href={buildRoute.eventTypesNew()}>Add Event Type</Link>
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
