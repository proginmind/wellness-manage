import Link from "next/link";

import { buildRoute } from "@/lib/routes";
import { AppLayout } from "@/components/app-layout";
import { EventTypesListContainer } from "@/components/event-types-list-container";
import { PermissionGate } from "@/components/PermissionGate";
import { Button } from "@/components/ui/button";

export default async function EventTypesPage() {
  // Auth handled by middleware - no manual checks needed

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Event Types</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your services and event types
            </p>
          </div>
          <PermissionGate resource="event_types" action="create">
            <Button asChild>
              <Link href={buildRoute.eventTypesNew()}>
                <span className="mr-2">+</span>
                Add Event Type
              </Link>
            </Button>
          </PermissionGate>
        </div>

        {/* Event Types List */}
        <EventTypesListContainer />
      </div>
    </AppLayout>
  );
}
