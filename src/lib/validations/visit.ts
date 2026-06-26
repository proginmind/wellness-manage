import { z } from "zod";

export type VisitBookingMode = "guided" | "manual";

const timeField = z
  .string()
  .min(1, "Visit time is required")
  .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format");

export const visitFormBaseSchema = z.object({
  memberId: z.string().uuid("Invalid member ID"),
  eventTypeId: z.string().uuid("Invalid event type ID"),
  staffId: z.string().uuid("Invalid staff ID").optional(),
  date: z.string().min(1, "Visit date is required"),
  time: timeField,
  notes: z.string().optional(),
});

export const visitFormSchema = visitFormBaseSchema.refine(
  (data) => {
    const visitDate = new Date(data.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return visitDate >= today;
  },
  {
    message: "Visit date cannot be in the past",
    path: ["date"],
  }
);

export const visitManualFormSchema = visitFormBaseSchema.extend({
  staffId: z.string().uuid("Staff member is required"),
});

export type VisitFormValues = z.infer<typeof visitFormBaseSchema>;

export const visitEditFormSchema = visitFormBaseSchema;

export const visitManualEditFormSchema = visitFormBaseSchema.extend({
  staffId: z.string().uuid("Staff member is required"),
});

export type VisitEditFormValues = z.infer<typeof visitEditFormSchema>;

export const visitCreateRequestSchema = z.discriminatedUnion("bookingMode", [
  visitFormSchema.extend({ bookingMode: z.literal("guided") }),
  visitManualFormSchema.extend({ bookingMode: z.literal("manual") }),
]);

export type VisitCreateRequest = z.infer<typeof visitCreateRequestSchema>;

export function getVisitCreateSchema(mode: VisitBookingMode) {
  return mode === "manual" ? visitManualFormSchema : visitFormSchema;
}

export function getVisitEditSchema(mode: VisitBookingMode) {
  return mode === "manual" ? visitManualEditFormSchema : visitEditFormSchema;
}
