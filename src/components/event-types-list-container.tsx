"use client";

import useSWR from "swr";

import { EventType } from "@/types/event-type";
import { fetcher } from "@/lib/fetcher";
import { buildApiRoute } from "@/lib/routes";
import { useUser } from "@/hooks/useUser";
import { EventTypesList } from "@/components/event-types-list";

interface EventTypesResponse {
  eventTypes: EventType[];
  total: number;
}

export function EventTypesListContainer() {
  const { data, error, isLoading } = useSWR<EventTypesResponse>(
    buildApiRoute.eventTypes(),
    fetcher
  );
  const { user } = useUser();

  if (error) {
    return (
      <div className="text-center py-12 text-red-500 dark:text-red-400">
        <p className="text-lg font-medium mb-2">Failed to load event types</p>
        <p className="text-sm">{error.info?.error || "Please try again later"}</p>
      </div>
    );
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        <p className="mt-4 text-sm">Loading event types...</p>
      </div>
    );
  }

  return (
    <EventTypesList
      eventTypes={data?.eventTypes || []}
      currency={user?.organization?.currency ?? "USD"}
    />
  );
}
