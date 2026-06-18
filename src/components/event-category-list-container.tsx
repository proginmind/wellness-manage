"use client";

import useSWR from "swr";

import { EventCategoriesListResponse } from "@/types/api";
import { fetcher } from "@/lib/fetcher";
import { useTrialGuard } from "@/hooks/useTrialGuard";
import { EventCategoryList } from "@/components/event-category-list";
import { MembersListSkeleton } from "@/components/list-skeletons";

interface EventCategoryListContainerProps {
  fallbackData?: EventCategoriesListResponse;
}

export function EventCategoryListContainer({ fallbackData }: EventCategoryListContainerProps) {
  const { data, error } = useSWR<EventCategoriesListResponse>("/api/event-categories", fetcher, {
    fallbackData,
  });

  useTrialGuard(error);

  if (error) {
    return (
      <div className="text-center py-12 text-red-500 dark:text-red-400">
        <p className="text-lg font-medium mb-2">Failed to load service categories</p>
        <p className="text-sm">{error.info?.error || "Please try again later"}</p>
      </div>
    );
  }

  if (!data) return <MembersListSkeleton />;

  return <EventCategoryList categories={data.eventCategories} />;
}
