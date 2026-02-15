import Link from "next/link";
import { notFound } from "next/navigation";
import { Archive, CheckCircle, Edit, XCircle } from "lucide-react";

import { requireAuth } from "@/lib/auth";
import { buildRoute } from "@/lib/routes";
import { getCurrentUserProfile, getEventCategoryById } from "@/lib/supabase/queries";
import { AppLayout } from "@/components/app-layout";
import { PageHeader } from "@/components/page-header";
import { PermissionGate } from "@/components/PermissionGate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EventCategoryDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventCategoryDetailPage({ params }: EventCategoryDetailPageProps) {
  const { id } = await params;

  // Get authenticated user
  const user = await requireAuth();

  // Get user's profile and organization
  const profile = await getCurrentUserProfile(user.id);

  // Fetch category
  const category = await getEventCategoryById(id, profile.organizationId);

  if (!category) {
    notFound();
  }

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
        {/* Category Information */}
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
            {/* Name with Color */}
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

            {/* Color Value */}
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Color</p>
              <div className="flex items-center gap-3">
                <code className="text-sm bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded">
                  {category.color}
                </code>
              </div>
            </div>

            {/* Description */}
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
