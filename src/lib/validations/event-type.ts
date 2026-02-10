import { z } from "zod";

export const eventTypeFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),

  description: z.string().max(500, "Description must be less than 500 characters").optional(),

  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex code (e.g., #3b82f6)")
    .default("#3b82f6"),

  category: z
    .string()
    .max(50, "Category must be less than 50 characters")
    .optional()
    .or(z.literal("")),

  // Scheduling
  duration: z
    .number()
    .min(1, "Duration must be at least 1 minute")
    .max(1440, "Duration cannot exceed 24 hours"),

  bufferBefore: z.number().min(0, "Buffer before must be 0 or greater").default(0),

  bufferAfter: z.number().min(0, "Buffer after must be 0 or greater").default(0),

  // Pricing
  price: z
    .number()
    .min(0, "Price must be 0 or greater")
    .max(999999.99, "Price cannot exceed 999,999.99"),

  currency: z
    .string()
    .length(3, "Currency must be a 3-letter code (e.g., USD)")
    .toUpperCase()
    .default("USD"),

  // Availability
  isActive: z.boolean().default(true),

  isBookable: z.boolean().default(true),

  requiresApproval: z.boolean().default(false),

  // Booking Limits
  maxAdvanceBookingDays: z
    .number()
    .min(1, "Must be at least 1 day")
    .max(365, "Cannot exceed 365 days")
    .optional()
    .or(z.literal(null))
    .transform((val) => (val === null ? undefined : val)),

  minAdvanceBookingHours: z
    .number()
    .min(0, "Must be 0 or greater")
    .max(168, "Cannot exceed 7 days (168 hours)")
    .default(24),
});

export type EventTypeFormValues = z.infer<typeof eventTypeFormSchema>;

// Schema for partial updates
export const eventTypeUpdateSchema = eventTypeFormSchema.partial();

export type EventTypeUpdateValues = z.infer<typeof eventTypeUpdateSchema>;
