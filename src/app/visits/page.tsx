import type { Metadata } from "next";
import Link from "next/link";

import { requireAuth } from "@/lib/auth";
import { buildRoute } from "@/lib/routes";
import { getCurrentUserProfile, getVisits } from "@/lib/supabase/queries";
import { requireTrialAccess } from "@/lib/trial-server";
import { AppLayout } from "@/components/app-layout";
import { PageHeader } from "@/components/page-header";
import { PermissionGate } from "@/components/PermissionGate";
import { Button } from "@/components/ui/button";
import { VisitsListContainer } from "@/components/visits-list-container";

export const metadata: Metadata = {
  title: "Appointments",
};

export default async function VisitsPage() {
  const user = await requireAuth();
  const profile = await getCurrentUserProfile(user.id);
  await requireTrialAccess(profile.organizationId);
  const visitsData = await getVisits();

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
        <VisitsListContainer
          fallbackData={{
            visits: visitsData.map((v) => ({ visit: v.visit, member: v.member })),
            total: visitsData.length,
            search: null,
          }}
        />
      </div>
    </AppLayout>
  );
}
