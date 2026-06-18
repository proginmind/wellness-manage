"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Archive, CheckCircle, Edit, XCircle } from "lucide-react";
import useSWR from "swr";

import { EventCategory } from "@/types/event-category";
import { fetcher } from "@/lib/fetcher";
import { buildApiRoute, buildRoute } from "@/lib/routes";
import { useTrialGuard } from "@/hooks/useTrialGuard";
import { AppLayout } from "@/components/app-layout";
import { PageHeader } from "@/components/page-header";
import { PermissionGate } from "@/components/PermissionGate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function EventCategoryDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export function EventCategoryDetailPageClient() {
  const params = useParams();
  const id = params.id as string;

  const { data, error } = useSWR<{ eventCategory: EventCategory }>(
    buildApiRoute.eventCategory(id),
    fetcher
  );

  useTrialGuard(error);

  if (!data && !error) {
    return (
      <AppLayout>
        <PageHeader
          title="Category Details"
          backLink={{ href: buildRoute.eventCategories(), label: "Back to Categories" }}
        />
        <EventCategoryDetailSkeleton />
      </AppLayout>
    );
  }

  if (error || !data) {
    return (
      <AppLayout>
        <PageHeader
          title="Category Details"
          backLink={{ href: buildRoute.eventCategories(), label: "Back to Categories" }}
        />
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <Card>
            <CardContent className="pt-6 text-center text-zinc-500">
              {error ? "Failed to load category" : "Category not found"}
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const category = data.eventCategory;

  return (
    <AppLayout>
      <PageHeader
        title="Category Details"
        backLink={{ href: buildRoute.eventCategories(), label: "Back to Categories" }}
        action={
          <div className="flex items-center gap-2">
            {category.isActive ? (
              <>
                <PermissionGate resource="event_categories" action="update">
                  <Button asChild variant="outline">
                    <Link href={buildRoute.eventCategoryEdit(category.id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </Button>
                </PermissionGate>

                <PermissionGate resource="event_categories" action="delete">
                  <Button asChild variant="outline" className="text-red-600 hover:text-red-700">
                    <Link href={buildRoute.eventCategoryArchive(category.id)}>
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </Link>
                  </Button>
                </PermissionGate>
              </>
            ) : (
              <PermissionGate resource="event_categories" action="update">
                <Button asChild variant="outline">
                  <Link href={buildRoute.eventCategoryUnarchive(category.id)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Unarchive
                  </Link>
                </Button>
              </PermissionGate>
            )}
          </div>
        }
      />

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Category Information</CardTitle>
              <Badge variant={category.isActive ? "default" : "secondary"}>
                {category.isActive ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3 mr-1" />
                    Inactive
                  </>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Category Name</p>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg shrink-0"
                  style={{ backgroundColor: category.color }}
                />
                <p className="text-lg font-medium">{category.name}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Color</p>
              <code className="text-sm bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded">
                {category.color}
              </code>
            </div>

            {category.description && (
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Description</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
                  {category.description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
