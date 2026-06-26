"use client";

import * as React from "react";
import { format, startOfMonth } from "date-fns";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";

interface AvailabilityCalendarProps {
  eventTypeId?: string;
  selected?: Date;
  onSelect: (date: Date | undefined) => void;
  className?: string;
  disabled?: boolean;
  /** availability: green highlights for bookable dates; plain: no highlights, any future date */
  variant?: "availability" | "plain";
}

export function AvailabilityCalendar({
  eventTypeId,
  selected,
  onSelect,
  className,
  disabled,
  variant = "availability",
}: AvailabilityCalendarProps) {
  const showAvailability = variant === "availability";
  const [month, setMonth] = React.useState<Date>(() => selected ?? new Date());
  const [qualifiedDates, setQualifiedDates] = React.useState<Set<string>>(new Set());
  const [unqualifiedOnlyDates, setUnqualifiedOnlyDates] = React.useState<Set<string>>(new Set());
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!showAvailability || !eventTypeId) {
      setQualifiedDates(new Set());
      setUnqualifiedOnlyDates(new Set());
      return;
    }
    let cancelled = false;
    setLoading(true);
    const start = startOfMonth(month);
    const params = new URLSearchParams({
      eventTypeId,
      month: String(start.getMonth() + 1),
      year: String(start.getFullYear()),
    });
    fetch(`/api/availability/dates?${params}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to fetch"))))
      .then((data: { qualifiedDates: string[]; unqualifiedOnlyDates: string[] }) => {
        if (!cancelled) {
          setQualifiedDates(new Set(data.qualifiedDates ?? []));
          setUnqualifiedOnlyDates(new Set(data.unqualifiedOnlyDates ?? []));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQualifiedDates(new Set());
          setUnqualifiedOnlyDates(new Set());
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [eventTypeId, month, showAvailability]);

  const todayStr = format(new Date(), "yyyy-MM-dd");

  const bookableDates = React.useMemo(() => {
    return new Set([...qualifiedDates, ...unqualifiedOnlyDates]);
  }, [qualifiedDates, unqualifiedOnlyDates]);

  const isDateDisabled = React.useCallback(
    (date: Date) => {
      const key = format(date, "yyyy-MM-dd");
      if (key < todayStr) return true;
      if (!showAvailability) return false;
      return !bookableDates.has(key);
    },
    [bookableDates, showAvailability, todayStr]
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
        modifiers={
          showAvailability
            ? {
                qualified: (date) => {
                  const key = format(date, "yyyy-MM-dd");
                  return key >= todayStr && qualifiedDates.has(key);
                },
                unqualifiedOnly: (date) => {
                  const key = format(date, "yyyy-MM-dd");
                  return key >= todayStr && unqualifiedOnlyDates.has(key);
                },
              }
            : undefined
        }
        modifiersClassNames={
          showAvailability
            ? {
                qualified:
                  "[&>button:not([data-selected-single=true])]:!bg-emerald-500/25 [&>button]:rounded-full [&>button:not([data-selected-single=true])]:text-emerald-900 [&>button:not([data-selected-single=true])]:dark:bg-emerald-500/35 [&>button:not([data-selected-single=true])]:dark:text-emerald-100",
                unqualifiedOnly:
                  "[&>button:not([data-selected-single=true])]:!bg-transparent [&>button]:rounded-full [&>button:not([data-selected-single=true])]:border-2 [&>button:not([data-selected-single=true])]:border-emerald-500 [&>button:not([data-selected-single=true])]:text-emerald-900 [&>button:not([data-selected-single=true])]:dark:border-emerald-400 [&>button:not([data-selected-single=true])]:dark:text-emerald-100 [&>button[data-selected-single=true]]:!bg-transparent [&>button[data-selected-single=true]]:!text-foreground [&>button[data-selected-single=true]]:border-2 [&>button[data-selected-single=true]]:!border-foreground",
              }
            : undefined
        }
        className={cn(
          "rounded-md border [--cell-size:2.75rem]",
          !showAvailability &&
            "[&_button[data-selected-single=true]]:!bg-transparent [&_button[data-selected-single=true]]:!text-foreground [&_button[data-selected-single=true]]:border-2 [&_button[data-selected-single=true]]:!border-foreground [&_button[data-selected-single=true]]:rounded-full",
          showAvailability && loading && "opacity-70 pointer-events-none"
        )}
      />
    </div>
  );
}
