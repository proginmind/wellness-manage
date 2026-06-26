"use client";

import { format } from "date-fns";
import type { UseFormReturn } from "react-hook-form";

import { isVisitDateTimeInPast, type VisitFormValues } from "@/lib/validations/visit";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { VisitStaffSelect } from "@/components/visit-staff-select";

interface VisitManualDatetimeFieldsProps {
  form: UseFormReturn<VisitFormValues>;
  eventTypeId: string;
}

export function VisitManualDatetimeFields({ form, eventTypeId }: VisitManualDatetimeFieldsProps) {
  const todayMin = format(new Date(), "yyyy-MM-dd");
  const watchDate = form.watch("date");
  const minTime = watchDate === todayMin ? format(new Date(), "HH:mm") : undefined;

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Date</FormLabel>
            <FormControl>
              <Input
                type="date"
                min={todayMin}
                {...field}
                onChange={(e) => {
                  const newDate = e.target.value;
                  field.onChange(newDate);
                  const time = form.getValues("time");
                  if (time && isVisitDateTimeInPast(newDate, time)) {
                    form.setValue("time", "");
                    form.clearErrors("time");
                  }
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="time"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Time</FormLabel>
            <FormControl>
              <Input
                type="time"
                min={minTime}
                {...field}
                onChange={(e) => {
                  const newTime = e.target.value;
                  field.onChange(newTime);
                  const date = form.getValues("date");
                  if (date && newTime && isVisitDateTimeInPast(date, newTime)) {
                    form.setError("time", { message: "Time cannot be in the past" });
                  } else {
                    form.clearErrors("time");
                  }
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="staffId"
        render={({ field }) => (
          <VisitStaffSelect
            eventTypeId={eventTypeId}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
    </div>
  );
}
