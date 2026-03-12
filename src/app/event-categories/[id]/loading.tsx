import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { buildRoute } from "@/lib/routes";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function EventCategoryDetailLoading() {
  return (
    <AppLayout>
      {/* Page Header */}
      <div className="border-b bg-white dark:bg-zinc-950">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <Link
            href={buildRoute.eventCategories()}
            className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Categories
          </Link>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
              Category Details
            </h1>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Category Information</CardTitle>
              <Skeleton className="h-6 w-16" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Category Name</p>
              <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                <Skeleton className="h-6 w-40" />
              </div>
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Color</p>
              <Skeleton className="h-7 w-24 rounded" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Description</p>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3 mt-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
