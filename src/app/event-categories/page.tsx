import type { Metadata } from "next";
import Link from "next/link";

import { requireAuth } from "@/lib/auth";
import { buildRoute } from "@/lib/routes";
import { getCurrentUserProfile, getEventCategories } from "@/lib/supabase/queries";
import { requireTrialAccess } from "@/lib/trial-server";
import { AppLayout } from "@/components/app-layout";
import { EventCategoryListContainer } from "@/components/event-category-list-container";
import { PageHeader } from "@/components/page-header";
import { PermissionGate } from "@/components/PermissionGate";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Categories",
};

export default async function EventCategoriesPage() {
  const user = await requireAuth();
  const profile = await getCurrentUserProfile(user.id);
  await requireTrialAccess(profile.organizationId);
  const eventCategories = await getEventCategories(profile.organizationId);

  return (
    <AppLayout>
      <PageHeader
        title="Categories"
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
        <EventCategoryListContainer
          fallbackData={{
            eventCategories,
            total: eventCategories.length,
            filters: { isActive: null },
          }}
        />
      </div>
    </AppLayout>
  );
}
