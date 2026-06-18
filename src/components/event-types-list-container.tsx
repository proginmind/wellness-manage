"use client";

import useSWR from "swr";

import { EventTypesListResponse } from "@/types/api";
import { fetcher } from "@/lib/fetcher";
import { buildApiRoute } from "@/lib/routes";
import { useTrialGuard } from "@/hooks/useTrialGuard";
import { useUser } from "@/hooks/useUser";
import { EventTypesList } from "@/components/event-types-list";
import { MembersListSkeleton } from "@/components/list-skeletons";

interface EventTypesListContainerProps {
  fallbackData?: EventTypesListResponse;
}

export function EventTypesListContainer({ fallbackData }: EventTypesListContainerProps) {
  const { user } = useUser();
  const currency = user?.organization?.currency ?? "USD";

  const { data, error } = useSWR<EventTypesListResponse>(buildApiRoute.eventTypes(), fetcher, {
    fallbackData,
  });

  useTrialGuard(error);

  if (error) {
    return (
      <div className="text-center py-12 text-red-500 dark:text-red-400">
        <p className="text-lg font-medium mb-2">Failed to load services</p>
        <p className="text-sm">{error.info?.error || "Please try again later"}</p>
      </div>
    );
  }

  if (!data) return <MembersListSkeleton />;

  return <EventTypesList eventTypes={data.eventTypes} currency={currency} />;
}
