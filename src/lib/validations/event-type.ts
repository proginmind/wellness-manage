import { z } from "zod";

export const eventTypeFormSchema = z.object({
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

  category: z
    .string()
    .max(50, "Category must be less than 50 characters")
    .optional()
    .or(z.literal("")),

  // Scheduling Configuration (in minutes)
  duration: z
    .number()
    .int("Duration must be a whole number")
    .min(5, "Duration must be at least 5 minutes")
    .max(1440, "Duration cannot exceed 24 hours (1440 minutes)"),

  bufferBefore: z
    .number()
    .int("Buffer before must be a whole number")
    .min(0, "Buffer before cannot be negative")
    .max(480, "Buffer before cannot exceed 8 hours (480 minutes)"),

  bufferAfter: z
    .number()
    .int("Buffer after must be a whole number")
    .min(0, "Buffer after cannot be negative")
    .max(480, "Buffer after cannot exceed 8 hours (480 minutes)"),

  // Pricing
  price: z
    .number()
    .min(0, "Price cannot be negative")
    .max(999999.99, "Price is too high")
    .refine((val) => {
      // Check for max 2 decimal places
      return /^\d+(\.\d{1,2})?$/.test(val.toString());
    }, "Price can have at most 2 decimal places"),

  currency: z
    .string()
    .min(1, "Currency is required")
    .length(3, "Currency must be a 3-letter code (e.g., USD, EUR)")
    .regex(/^[A-Z]{3}$/, "Currency must be uppercase letters (e.g., USD)"),

  // Availability Settings
  isActive: z.boolean(),

  isBookable: z.boolean(),

  requiresApproval: z.boolean(),

  // Booking Limits
  maxAdvanceBookingDays: z
    .number()
    .int("Max advance booking days must be a whole number")
    .min(1, "Must be at least 1 day")
    .max(730, "Cannot exceed 2 years (730 days)")
    .optional()
    .nullable(),

  minAdvanceBookingHours: z
    .number()
    .int("Min advance booking hours must be a whole number")
    .min(0, "Cannot be negative")
    .max(8760, "Cannot exceed 1 year (8760 hours)"),
});

export type EventTypeFormValues = z.infer<typeof eventTypeFormSchema>;
