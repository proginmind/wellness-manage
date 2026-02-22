"use client";

import * as React from "react";
import { endOfMonth, format, startOfMonth } from "date-fns";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";

interface AvailabilityCalendarProps {
  eventTypeId: string;
  selected?: Date;
  onSelect: (date: Date | undefined) => void;
  className?: string;
  disabled?: boolean;
}

export function AvailabilityCalendar({
  eventTypeId,
  selected,
  onSelect,
  className,
  disabled,
}: AvailabilityCalendarProps) {
  const [month, setMonth] = React.useState<Date>(() => selected ?? new Date());
  const [availableDates, setAvailableDates] = React.useState<Set<string>>(new Set());
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!eventTypeId) {
      setAvailableDates(new Set());
      return;
    }
    let cancelled = false;
    setLoading(true);
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const params = new URLSearchParams({
      eventTypeId,
      month: String(start.getMonth() + 1),
      year: String(start.getFullYear()),
    });
    fetch(`/api/availability/dates?${params}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to fetch"))))
      .then((data: { dates: string[] }) => {
        if (!cancelled) setAvailableDates(new Set(data.dates ?? []));
      })
      .catch(() => {
        if (!cancelled) setAvailableDates(new Set());
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [eventTypeId, month]);

  const todayStr = format(new Date(), "yyyy-MM-dd");

  const isDateDisabled = React.useCallback(
    (date: Date) => {
      const key = format(date, "yyyy-MM-dd");
      return key < todayStr || !availableDates.has(key);
    },
    [availableDates, todayStr]
  );

  return (
    <div className={cn("space-y-2 w-full min-w-[min(100%,22rem)]", className)}>
      <Calendar
        mode="single"
        selected={selected}
        onSelect={onSelect}
        month={month}
        onMonthChange={setMonth}
        disabled={(date) => disabled || isDateDisabled(date)}
        modifiers={{
          available: (date) => {
            const key = format(date, "yyyy-MM-dd");
            return key >= todayStr && availableDates.has(key);
          },
        }}
        modifiersClassNames={{
          available:
            "[&>button:not([data-selected-single=true])]:!bg-emerald-500/25 [&>button]:rounded-full [&>button:not([data-selected-single=true])]:text-emerald-900 [&>button:not([data-selected-single=true])]:dark:bg-emerald-500/35 [&>button:not([data-selected-single=true])]:dark:text-emerald-100",
        }}
        className={cn(
          "rounded-md border [--cell-size:2.75rem]",
          loading && "opacity-70 pointer-events-none"
        )}
      />
    </div>
  );
}
