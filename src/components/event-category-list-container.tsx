"use client";

import useSWR from "swr";

import { EventCategoriesListResponse } from "@/types/api";
import { fetcher } from "@/lib/fetcher";
import { EventCategoryList } from "@/components/event-category-list";

interface EventCategoryListContainerProps {
  fallbackData?: EventCategoriesListResponse;
}

export function EventCategoryListContainer({ fallbackData }: EventCategoryListContainerProps) {
  const { data, error } = useSWR<EventCategoriesListResponse>("/api/event-categories", fetcher, {
    fallbackData,
  });

  if (error) {
    return (
      <div className="text-center py-12 text-red-500 dark:text-red-400">
        <p className="text-lg font-medium mb-2">Failed to load categories</p>
        <p className="text-sm">{error.info?.error || "Please try again later"}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        <p className="mt-4 text-sm">Loading categories...</p>
      </div>
    );
  }

  return <EventCategoryList categories={data.eventCategories} />;
}
