import Link from "next/link";

import { buildRoute } from "@/lib/routes";
import { AppLayout } from "@/components/app-layout";
import { PageHeader } from "@/components/page-header";
import { PermissionGate } from "@/components/PermissionGate";
import { Button } from "@/components/ui/button";
import { VisitsListContainer } from "@/components/visits-list-container";

export default async function VisitsPage() {
  // Auth is handled by middleware - no need for manual checks!

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
        <VisitsListContainer />
      </div>
    </AppLayout>
  );
}
