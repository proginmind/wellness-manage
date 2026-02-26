import { z } from "zod";

const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

export const staffAvailabilitySlotSchema = z
  .object({
    dayOfWeek: z
      .number()
      .int("Day must be 0-6")
      .min(0, "Day must be 0 (Sun) to 6 (Sat)")
      .max(6, "Day must be 0 (Sun) to 6 (Sat)"),
    startTime: z.string().regex(timeRegex, "Start time must be HH:mm (e.g., 09:00)"),
    endTime: z.string().regex(timeRegex, "End time must be HH:mm (e.g., 17:00)"),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "Start time must be before end time",
    path: ["endTime"],
  });

export const staffAvailabilityPutSchema = z.object({
  slots: z.array(staffAvailabilitySlotSchema).max(56, "Maximum 56 slots (8 per day × 7 days)"),
});

export type StaffAvailabilitySlot = z.infer<typeof staffAvailabilitySlotSchema>;
export type StaffAvailabilityPutBody = z.infer<typeof staffAvailabilityPutSchema>;
