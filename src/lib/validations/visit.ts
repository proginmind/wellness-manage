import { format } from "date-fns";
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

export function isVisitDateTimeInPast(date: string, time: string): boolean {
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);
  const visitAt = new Date(year, month - 1, day, hours ?? 0, minutes ?? 0, 0, 0);
  return visitAt < new Date();
}

function addNotInPastIssue(
  data: { date: string; time: string },
  ctx: z.RefinementCtx,
  todayStr: string
): void {
  if (!isVisitDateTimeInPast(data.date, data.time)) return;
  ctx.addIssue({
    code: "custom",
    message:
      data.date === todayStr
        ? "Time cannot be in the past"
        : "Appointment cannot be scheduled in the past",
    path: data.date === todayStr ? ["time"] : ["date"],
  });
}

function withNotInPastValidation<T extends z.ZodType>(schema: T) {
  return schema.superRefine((data, ctx) => {
    const parsed = visitFormBaseSchema.pick({ date: true, time: true }).safeParse(data);
    if (!parsed.success) return;
    const today = format(new Date(), "yyyy-MM-dd");
    addNotInPastIssue(parsed.data, ctx, today);
  });
}

export function normalizeVisitTime(time: string): string {
  if (time.includes("T")) return format(new Date(time), "HH:mm");
  return time.slice(0, 5);
}

export interface OriginalVisitDateTime {
  date: string;
  time: string;
}

function withNotInPastValidationUnlessUnchanged<T extends z.ZodType>(
  schema: T,
  original?: OriginalVisitDateTime
) {
  return schema.superRefine((data, ctx) => {
    const parsed = visitFormBaseSchema.pick({ date: true, time: true }).safeParse(data);
    if (!parsed.success) return;

    if (original) {
      const origDate = original.date.includes("T")
        ? format(new Date(original.date), "yyyy-MM-dd")
        : original.date;
      const origTime = normalizeVisitTime(original.time);
      if (parsed.data.date === origDate && parsed.data.time === origTime) {
        return;
      }
    }

    const today = format(new Date(), "yyyy-MM-dd");
    addNotInPastIssue(parsed.data, ctx, today);
  });
}

export const visitFormSchema = withNotInPastValidation(visitFormBaseSchema);

export const visitManualFormSchema = withNotInPastValidation(
  visitFormBaseSchema.extend({
    staffId: z.string().uuid("Staff member is required"),
  })
);

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

/** UI-only: includes past datetime validation for the booking wizard */
export function getVisitCreateUiSchema(mode: VisitBookingMode) {
  return getVisitCreateSchema(mode);
}

export function getVisitEditSchema(mode: VisitBookingMode) {
  return mode === "manual" ? visitManualEditFormSchema : visitEditFormSchema;
}

/** UI-only: includes past datetime validation; skips check when date/time unchanged */
export function getVisitEditUiSchema(mode: VisitBookingMode, original?: OriginalVisitDateTime) {
  const base = getVisitEditSchema(mode);
  return withNotInPastValidationUnlessUnchanged(base, original);
}
