import type { Metadata } from "next";
import Link from "next/link";

import { requireAuth } from "@/lib/auth";
import { buildRoute } from "@/lib/routes";
import { getCurrentUserProfile, getEventTypes, getOrganizationById } from "@/lib/supabase/queries";
import { requireTrialAccess } from "@/lib/trial-server";
import { AppLayout } from "@/components/app-layout";
import { EventTypesListContainer } from "@/components/event-types-list-container";
import { PageHeader } from "@/components/page-header";
import { PermissionGate } from "@/components/PermissionGate";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Services",
};

export default async function EventTypesPage() {
  const user = await requireAuth();
  const profile = await getCurrentUserProfile(user.id);
  await requireTrialAccess(profile.organizationId);
  const [eventTypes, organization] = await Promise.all([
    getEventTypes(profile.organizationId),
    getOrganizationById(profile.organizationId),
  ]);

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
        <EventTypesListContainer
          fallbackData={{
            eventTypes,
            total: eventTypes.length,
            filters: { isActive: null, isBookable: null },
          }}
          currency={organization?.currency ?? "USD"}
        />
      </div>
    </AppLayout>
  );
}
