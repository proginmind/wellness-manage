"use client";

import type { UseFormReturn } from "react-hook-form";

import type { VisitFormValues } from "@/lib/validations/visit";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { VisitStaffSelect } from "@/components/visit-staff-select";

interface VisitManualDatetimeFieldsProps {
  form: UseFormReturn<VisitFormValues>;
  eventTypeId: string;
}

export function VisitManualDatetimeFields({ form, eventTypeId }: VisitManualDatetimeFieldsProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Date</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
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
              <Input type="time" {...field} />
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
