"use client";

import * as React from "react";
import { format, startOfMonth } from "date-fns";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface StaffAvailabilityCardProps {
  profileId: string;
  className?: string;
}

export function StaffAvailabilityCard({ profileId, className }: StaffAvailabilityCardProps) {
  const [month, setMonth] = React.useState<Date>(() => new Date());
  const [availableDates, setAvailableDates] = React.useState<Set<string>>(new Set());
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined);
  const [slots, setSlots] = React.useState<string[]>([]);
  const [datesLoading, setDatesLoading] = React.useState(false);
  const [slotsLoading, setSlotsLoading] = React.useState(false);

  // Fetch available dates for the current month
  React.useEffect(() => {
    if (!profileId) {
      setAvailableDates(new Set());
      return;
    }
    let cancelled = false;
    setDatesLoading(true);
    const start = startOfMonth(month);
    const params = new URLSearchParams({
      month: String(start.getMonth() + 1),
      year: String(start.getFullYear()),
    });
    fetch(`/api/availability/staff/${profileId}/dates?${params}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to fetch"))))
      .then((data: { dates: string[] }) => {
        if (!cancelled) setAvailableDates(new Set(data.dates ?? []));
      })
      .catch(() => {
        if (!cancelled) setAvailableDates(new Set());
      })
      .finally(() => {
        if (!cancelled) setDatesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [profileId, month]);

  // When we have dates and no selection yet, select the first available date (>= today)
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const sortedAvailableDates = React.useMemo(() => {
    return Array.from(availableDates)
      .filter((d) => d >= todayStr)
      .sort();
  }, [availableDates, todayStr]);

  // Default to first available date when we have dates and selection is empty or not in current month
  React.useEffect(() => {
    if (sortedAvailableDates.length === 0) return;
    const selectedStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null;
    const stillAvailable = selectedStr && availableDates.has(selectedStr);
    if (stillAvailable) return;
    const first = sortedAvailableDates[0];
    if (first) setSelectedDate(new Date(first + "T12:00:00"));
  }, [sortedAvailableDates, availableDates, selectedDate]);

  // Fetch slots when selected date changes
  const selectedDateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null;
  React.useEffect(() => {
    if (!profileId || !selectedDateStr) {
      setSlots([]);
      return;
    }
    let cancelled = false;
    setSlotsLoading(true);
    const params = new URLSearchParams({ date: selectedDateStr });
    fetch(`/api/availability/staff/${profileId}/slots?${params}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to fetch"))))
      .then((data: { slots: string[] }) => {
        if (!cancelled) setSlots(data.slots ?? []);
      })
      .catch(() => {
        if (!cancelled) setSlots([]);
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [profileId, selectedDateStr]);

  const isDateDisabled = React.useCallback(
    (date: Date) => {
      const key = format(date, "yyyy-MM-dd");
      return key < todayStr || !availableDates.has(key);
    },
    [availableDates, todayStr]
  );

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Availability</CardTitle>
        <CardDescription>When this team member has free slots (60 min)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="w-full min-w-[min(100%,22rem)]">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            month={month}
            onMonthChange={setMonth}
            disabled={isDateDisabled}
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
              datesLoading && "opacity-70 pointer-events-none"
            )}
          />
        </div>
        {selectedDateStr && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Time slots on {format(selectedDate!, "EEEE, MMM d")}
            </p>
            {slotsLoading ? (
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-8 w-14 rounded-md bg-muted animate-pulse" aria-hidden />
                ))}
              </div>
            ) : slots.length === 0 ? (
              <p className="text-sm text-muted-foreground">No available slots for this date.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {slots.map((time) => (
                  <span
                    key={time}
                    className={cn(
                      "inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-medium",
                      "border-zinc-200 bg-zinc-50 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    )}
                  >
                    {time}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
