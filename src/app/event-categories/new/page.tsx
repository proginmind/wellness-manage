"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { mutate } from "swr";

import { buildRoute } from "@/lib/routes";
import { EventCategoryFormValues } from "@/lib/validations/event-category";
import { AppLayout } from "@/components/app-layout";
import { EventCategoryForm } from "@/components/event-category-form";

export default function NewEventCategoryPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(data: EventCategoryFormValues) {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/event-categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create category");
      }

      const result = await response.json();

      // Invalidate cache
      mutate("/api/event-categories");
      mutate((key) => typeof key === "string" && key.startsWith("/api/event-categories"));

      toast.success("Category created successfully", {
        description: `${result.eventCategory.name} has been added.`,
      });

      // Redirect to categories page
      router.push(buildRoute.eventCategories());
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Failed to create category", {
        description: error instanceof Error ? error.message : "Please try again later",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={buildRoute.eventCategories()}
            className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Categories
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Add New Category</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create a new category to organize your services
          </p>
        </div>

        {/* Form */}
        <EventCategoryForm
          mode="create"
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          onCancel={() => router.push(buildRoute.eventCategories())}
        />
      </div>
    </AppLayout>
  );
}
