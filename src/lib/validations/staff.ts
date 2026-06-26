import { z } from "zod";

import { profileFormSchema } from "@/lib/validations/profile";

export const staffFormSchema = profileFormSchema.extend({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  firstName: z
    .string()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters"),
});

export type StaffFormValues = z.infer<typeof staffFormSchema>;
