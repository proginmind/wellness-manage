import { z } from "zod";

export const visitFormSchema = z.object({
  memberId: z.string().min(1, "Member ID is required"),

  date: z.string().min(1, "Visit date is required"),

  time: z.string().min(1, "Visit time is required"),

  duration: z.number().min(1, "Visit duration is required"),

  type: z.string().min(1, "Visit type is required"),

  notes: z.string().optional(),
});

export type VisitFormValues = z.infer<typeof visitFormSchema>;
