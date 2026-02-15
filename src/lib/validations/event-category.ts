import { z } from "zod";

export const eventCategoryFormSchema = z.object({
  // Basic Information
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),

  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .or(z.literal("")),

  color: z
    .string()
    .min(1, "Color is required")
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color (e.g., #FF5733)"),

  // Status
  isActive: z.boolean(),
});

export type EventCategoryFormValues = z.infer<typeof eventCategoryFormSchema>;
