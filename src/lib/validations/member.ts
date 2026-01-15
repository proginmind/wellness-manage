import { z } from "zod";

export const memberFormSchema = z.object({
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
  
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 0 && age <= 120;
    }, "Please enter a valid date of birth"),
  
  dateJoined: z
    .string()
    .min(1, "Date joined is required")
    .refine((date) => {
      const joinDate = new Date(date);
      const today = new Date();
      return joinDate <= today;
    }, "Date joined cannot be in the future"),
  
  image: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
});

export type MemberFormValues = z.infer<typeof memberFormSchema>;
