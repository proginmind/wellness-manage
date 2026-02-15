"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Archive, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";

import { EventCategory } from "@/types/event-category";
import { fetcher } from "@/lib/fetcher";
import { buildRoute } from "@/lib/routes";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ArchiveEventCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default function ArchiveEventCategoryPage({ params }: ArchiveEventCategoryPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [isArchiving, setIsArchiving] = useState(false);

  const { data, isLoading, error } = useSWR<{ eventCategory: EventCategory }>(
    `/api/event-categories/${id}`,
    fetcher
  );

  async function handleArchive() {
    setIsArchiving(true);

    try {
      const response = await fetch(`/api/event-categories/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to archive category");
      }

      // Invalidate cache
      mutate("/api/event-categories");
      mutate(`/api/event-categories/${id}`);
      mutate((key) => typeof key === "string" && key.startsWith("/api/event-categories"));

      toast.success("Category archived successfully", {
        description: "The category has been archived and is no longer active.",
      });

      // Redirect to categories list
      router.push(buildRoute.eventCategories());
    } catch (error) {
      console.error("Error archiving category:", error);
      toast.error("Failed to archive category", {
        description: error instanceof Error ? error.message : "Please try again later",
      });
    } finally {
      setIsArchiving(false);
    }
  }

  if (error) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12 text-red-500">
            <p>Failed to load category</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
            <p className="mt-4">Loading category...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const category = data?.eventCategory;

  if (!category) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p>Category not found</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={buildRoute.eventCategory(id)}
            className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Category
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Archive Category</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Confirm you want to archive this category
          </p>
        </div>

        {/* Confirmation Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5 text-orange-500" />
              Archive {category.name}?
            </CardTitle>
            <CardDescription>
              This will set the category as inactive. You can unarchive it later if needed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  <strong>Note:</strong> Archived categories won&apos;t be available for new event
                  types, but existing event types using this category will remain unchanged.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleArchive}
                  disabled={isArchiving}
                  variant="destructive"
                  className="flex-1"
                >
                  {isArchiving ? "Archiving..." : "Archive Category"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push(buildRoute.eventCategory(id))}
                  disabled={isArchiving}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
