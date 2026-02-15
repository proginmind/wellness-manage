"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";

import { EventCategory } from "@/types/event-category";
import { fetcher } from "@/lib/fetcher";
import { buildRoute } from "@/lib/routes";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface UnarchiveEventCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default function UnarchiveEventCategoryPage({ params }: UnarchiveEventCategoryPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [isUnarchiving, setIsUnarchiving] = useState(false);

  const { data, isLoading, error } = useSWR<{ eventCategory: EventCategory }>(
    `/api/event-categories/${id}`,
    fetcher
  );

  async function handleUnarchive() {
    setIsUnarchiving(true);

    try {
      const response = await fetch(`/api/event-categories/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data?.eventCategory,
          isActive: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to unarchive category");
      }

      // Invalidate cache
      mutate("/api/event-categories");
      mutate(`/api/event-categories/${id}`);
      mutate((key) => typeof key === "string" && key.startsWith("/api/event-categories"));

      toast.success("Category unarchived successfully", {
        description: "The category is now active and available for use.",
      });

      // Redirect to category details
      router.push(buildRoute.eventCategory(id));
    } catch (error) {
      console.error("Error unarchiving category:", error);
      toast.error("Failed to unarchive category", {
        description: error instanceof Error ? error.message : "Please try again later",
      });
    } finally {
      setIsUnarchiving(false);
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Unarchive Category</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Confirm you want to unarchive this category
          </p>
        </div>

        {/* Confirmation Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Unarchive {category.name}?
            </CardTitle>
            <CardDescription>
              This will set the category as active and make it available for use.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm text-green-800 dark:text-green-200">
                  The category will be available for new event types once unarchived.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleUnarchive} disabled={isUnarchiving} className="flex-1">
                  {isUnarchiving ? "Unarchiving..." : "Unarchive Category"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push(buildRoute.eventCategory(id))}
                  disabled={isUnarchiving}
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
