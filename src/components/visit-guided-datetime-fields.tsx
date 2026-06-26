"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import type { UseFormReturn } from "react-hook-form";

import type { VisitFormValues } from "@/lib/validations/visit";
import { AvailabilityCalendar } from "@/components/availability-calendar";
import { TimeSlotPicker, type TimeSlotOption } from "@/components/time-slot-picker";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface VisitGuidedDatetimeFieldsProps {
  form: UseFormReturn<VisitFormValues>;
  eventTypeId: string;
  memberId?: string;
  excludeVisitId?: string;
}

export function VisitGuidedDatetimeFields({
  form,
  eventTypeId,
  memberId,
  excludeVisitId,
}: VisitGuidedDatetimeFieldsProps) {
  const [slots, setSlots] = useState<TimeSlotOption[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const watchDate = form.watch("date");

  useEffect(() => {
    if (!eventTypeId || !watchDate) {
      setSlots([]);
      return;
    }
    let cancelled = false;
    setSlotsLoading(true);
    const params = new URLSearchParams({
      eventTypeId,
      date: watchDate,
      ...(memberId ? { memberId } : {}),
      ...(excludeVisitId ? { excludeVisitId } : {}),
    });
    fetch(`/api/availability/slots?${params}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: { slots: TimeSlotOption[] }) => {
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
  }, [eventTypeId, watchDate, memberId, excludeVisitId]);

  const visibleSlots = useMemo(() => {
    if (!watchDate || !slots.length) return slots;
    const todayStr = format(new Date(), "yyyy-MM-dd");
    if (watchDate !== todayStr) return slots;
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    return slots.filter((slot) => {
      const [h, m] = slot.time.split(":").map(Number);
      const slotMins = (h ?? 0) * 60 + (m ?? 0);
      return slotMins > nowMins;
    });
  }, [slots, watchDate]);

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Date</FormLabel>
            <FormControl>
              <AvailabilityCalendar
                eventTypeId={eventTypeId}
                selected={field.value ? new Date(field.value + "T12:00:00") : undefined}
                onSelect={(d) => {
                  field.onChange(d ? format(d, "yyyy-MM-dd") : "");
                  form.setValue("time", "");
                  form.setValue("staffId", undefined);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {watchDate && (
        <FormField
          control={form.control}
          name="time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Time & staff</FormLabel>
              <FormControl>
                <TimeSlotPicker
                  slots={visibleSlots}
                  selectedTime={field.value || undefined}
                  selectedStaffId={form.watch("staffId")}
                  onSelect={(time, staffId) => {
                    field.onChange(time);
                    form.setValue("staffId", staffId);
                  }}
                  isLoading={slotsLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
