import { Calendar, Layers } from "lucide-react";

import { EventType } from "@/types/event-type";
import { EventTypeCard } from "@/components/event-type-card";

interface EventTypesListProps {
  eventTypes: EventType[];
  currency: string;
}

export function EventTypesList({ eventTypes, currency }: EventTypesListProps) {
  // Display event types list or empty state
  if (eventTypes.length > 0) {
    return (
      <div className="flex flex-col gap-4">
        {eventTypes.map((eventType) => (
          <EventTypeCard key={eventType.id} eventType={eventType} currency={currency} />
        ))}
      </div>
    );
  }

  // Empty state - no event types
  return (
    <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
      <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
      <p className="text-lg font-medium mb-2">No services yet</p>
      <p className="text-sm">Get started by creating your first service</p>
    </div>
  );
}
