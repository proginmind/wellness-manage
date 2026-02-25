import { z } from "zod";

export const visitFormSchema = z
  .object({
    memberId: z.string().uuid("Invalid member ID"),

    eventTypeId: z.string().uuid("Invalid event type ID"),

    staffId: z.string().uuid("Invalid staff ID").optional(),

    date: z.string().min(1, "Visit date is required"),

    time: z
      .string()
      .min(1, "Visit time is required")
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),

    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      // Validate that the date is not in the past
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

export type VisitFormValues = z.infer<typeof visitFormSchema>;

export const visitEditFormSchema = z.object({
  memberId: z.string().uuid("Invalid member ID"),
  eventTypeId: z.string().uuid("Invalid event type ID"),
  staffId: z.string().uuid("Invalid staff ID").optional(),
  date: z.string().min(1, "Visit date is required"),
  time: z
    .string()
    .min(1, "Visit time is required")
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  notes: z.string().optional(),
});

export type VisitEditFormValues = z.infer<typeof visitEditFormSchema>;
