import { z } from "zod";

export const visitFormSchema = z.object({
  memberId: z
    .string()
    .min(1, "Member ID is required"),
  
  visitDate: z
    .string()
    .min(1, "Visit date is required"),
  
  visitTime: z
    .string()
    .min(1, "Visit time is required"),
  
  visitDuration: z
    .number()
    .min(1, "Visit duration is required"),
  
  visitType: z
    .string()
    .min(1, "Visit type is required"),

  visitNotes: z
    .string()
    .optional(),
});

export type VisitFormValues = z.infer<typeof visitFormSchema>;
