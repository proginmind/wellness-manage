"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";

import { EventCategory } from "@/types/event-category";
import { fetcher } from "@/lib/fetcher";
import { buildRoute } from "@/lib/routes";
import { EventCategoryFormValues } from "@/lib/validations/event-category";
import { AppLayout } from "@/components/app-layout";
import { EventCategoryForm } from "@/components/event-category-form";

interface EditEventCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default function EditEventCategoryPage({ params }: EditEventCategoryPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading, error } = useSWR<{ eventCategory: EventCategory }>(
    `/api/event-categories/${id}`,
    fetcher
  );

  async function onSubmit(formData: EventCategoryFormValues) {
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/event-categories/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update category");
      }

      const result = await response.json();

      // Invalidate cache
      mutate("/api/event-categories");
      mutate(`/api/event-categories/${id}`);
      mutate((key) => typeof key === "string" && key.startsWith("/api/event-categories"));

      toast.success("Category updated successfully", {
        description: `${result.eventCategory.name} has been updated.`,
      });

      // Redirect to category details
      router.push(buildRoute.eventCategory(id));
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category", {
        description: error instanceof Error ? error.message : "Please try again later",
      });
    } finally {
      setIsSubmitting(false);
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

  const defaultValues: Partial<EventCategoryFormValues> = {
    name: category.name,
    description: category.description || "",
    color: category.color,
    isActive: category.isActive,
  };

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Category</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Update the category information</p>
        </div>

        {/* Form */}
        <EventCategoryForm
          mode="edit"
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          onCancel={() => router.push(buildRoute.eventCategory(id))}
        />
      </div>
    </AppLayout>
  );
}
