import Link from "next/link";

import { buildRoute } from "@/lib/routes";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";

export default function EventCategoryNotFound() {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Category Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The event category you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button asChild>
            <Link href={buildRoute.eventCategories()}>Back to Categories</Link>
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
