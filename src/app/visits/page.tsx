import Link from "next/link";

import { buildRoute } from "@/lib/routes";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { VisitsListContainer } from "@/components/visits-list-container";

export default async function VisitsPage() {
  // Auth is handled by middleware - no need for manual checks!

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Visits</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your wellness center visits
            </p>
          </div>
          <Button asChild>
            <Link href={buildRoute.visitsNew()}>
              <span className="mr-2">+</span>
              Add Visit
            </Link>
          </Button>
        </div>

        {/* Members List with Search */}
        <VisitsListContainer />
      </div>
    </AppLayout>
  );
}
