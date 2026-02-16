import type { Metadata } from "next";
import Link from "next/link";

import { requireAuth } from "@/lib/auth";
import { buildRoute } from "@/lib/routes";
import { AppLayout } from "@/components/app-layout";
import { EventCategoryListContainer } from "@/components/event-category-list-container";
import { PageHeader } from "@/components/page-header";
import { PermissionGate } from "@/components/PermissionGate";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Event Categories",
};

export default async function EventCategoriesPage() {
  // Auth is handled by middleware - no need for manual checks!
  await requireAuth();

  return (
    <AppLayout>
      <PageHeader
        title="Event Categories"
        description="Organize your services into categories"
        action={
          <PermissionGate resource="event_categories" action="create">
            <Button asChild>
              <Link href={buildRoute.eventCategoriesNew()}>Add Category</Link>
            </Button>
          </PermissionGate>
        }
      />

      <div className="container mx-auto px-4 py-6">
        <EventCategoryListContainer />
      </div>
    </AppLayout>
  );
}
