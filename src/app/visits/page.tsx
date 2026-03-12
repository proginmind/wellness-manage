import type { Metadata } from "next";
import Link from "next/link";

import { buildRoute } from "@/lib/routes";
import { getVisits } from "@/lib/supabase/queries";
import { AppLayout } from "@/components/app-layout";
import { PageHeader } from "@/components/page-header";
import { PermissionGate } from "@/components/PermissionGate";
import { Button } from "@/components/ui/button";
import { VisitsListContainer } from "@/components/visits-list-container";

export const metadata: Metadata = {
  title: "Visits",
};

export default async function VisitsPage() {
  const visitsData = await getVisits();

  return (
    <AppLayout>
      <PageHeader
        title="Visits"
        description="Manage your wellness center visits"
        action={
          <PermissionGate resource="visits" action="create">
            <Button asChild>
              <Link href={buildRoute.visitsNew()}>Add Visit</Link>
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
