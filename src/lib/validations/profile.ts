import { z } from "zod";

export const profileFormSchema = z.object({
  firstName: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((val) => {
      if (!val || val === "") return true;
      return val.length >= 2 && val.length <= 50;
    }, "First name must be between 2 and 50 characters"),

  lastName: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((val) => {
      if (!val || val === "") return true;
      return val.length >= 2 && val.length <= 50;
    }, "Last name must be between 2 and 50 characters"),

  description: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((val) => {
      if (!val || val === "") return true;
      return val.length <= 500;
    }, "Description must be less than 500 characters"),

  dateOfBirth: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((val) => {
      if (!val || val === "") return true;
      const birthDate = new Date(val);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 0 && age <= 120;
    }, "Please enter a valid date of birth"),

  phoneNumber: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((val) => {
      if (!val || val === "") return true;
      // Basic phone validation: allow digits, spaces, parentheses, dashes, and plus
      return /^[\d\s()\-+]+$/.test(val) && val.length >= 10 && val.length <= 20;
    }, "Please enter a valid phone number (10-20 characters)"),

  avatarImage: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((val) => {
      if (!val || val === "") return true;
      // Allow relative paths (our uploads) or full URLs
      return val.startsWith("/") || val.startsWith("http://") || val.startsWith("https://");
    }, "Invalid image path or URL"),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
