import { z } from "zod";

export const organizationAddressSchema = z.object({
  line1: z.string().optional(),
  line2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
});

export const organizationSocialLinksSchema = z.object({
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  instagram: z.string().url("Invalid URL").optional().or(z.literal("")),
  facebook: z.string().url("Invalid URL").optional().or(z.literal("")),
  twitter: z.string().url("Invalid URL").optional().or(z.literal("")),
  linkedin: z.string().url("Invalid URL").optional().or(z.literal("")),
});

export const organizationContactSchema = z.object({
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  address: organizationAddressSchema.optional(),
  socialLinks: organizationSocialLinksSchema.optional(),
});

export type OrganizationContactFormValues = z.infer<typeof organizationContactSchema>;
