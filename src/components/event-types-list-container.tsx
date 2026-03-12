"use client";

import useSWR from "swr";

import { EventTypesListResponse } from "@/types/api";
import { fetcher } from "@/lib/fetcher";
import { buildApiRoute } from "@/lib/routes";
import { EventTypesList } from "@/components/event-types-list";

interface EventTypesListContainerProps {
  fallbackData?: EventTypesListResponse;
  currency?: string;
}

export function EventTypesListContainer({
  fallbackData,
  currency = "USD",
}: EventTypesListContainerProps) {
  const { data, error } = useSWR<EventTypesListResponse>(buildApiRoute.eventTypes(), fetcher, {
    fallbackData,
  });

  if (error) {
    return (
      <div className="text-center py-12 text-red-500 dark:text-red-400">
        <p className="text-lg font-medium mb-2">Failed to load event types</p>
        <p className="text-sm">{error.info?.error || "Please try again later"}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        <p className="mt-4 text-sm">Loading event types...</p>
      </div>
    );
  }

  return <EventTypesList eventTypes={data.eventTypes} currency={currency} />;
}
