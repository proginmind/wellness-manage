"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { z } from "zod";

import { OrganizationContact } from "@/types/organization";
import { fetcher } from "@/lib/fetcher";
import { buildRoute } from "@/lib/routes";
import {
  organizationAddressSchema,
  organizationSocialLinksSchema,
} from "@/lib/validations/organization";
import { CurrencySelect, VALID_CURRENCY_CODES } from "@/components/currency-select";
import { OwnerGate } from "@/components/PermissionGate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const editSchema = z.object({
  name: z.string().min(1, "Name is required"),
  currency: z
    .string()
    .min(1, "Currency is required")
    .refine((v) => VALID_CURRENCY_CODES.has(v), "Unsupported currency code"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  address: organizationAddressSchema.optional(),
  socialLinks: organizationSocialLinksSchema.optional(),
});

type EditFormValues = z.infer<typeof editSchema>;

interface OrgData {
  user: {
    organization?: {
      name: string;
      currency: string;
    };
  };
}

async function updateOrg(url: string, { arg }: { arg: { name: string; currency: string } }) {
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error ?? "Failed to update organization");
  }
  return res.json();
}

async function upsertContact(
  url: string,
  {
    arg,
  }: {
    arg: {
      phone?: string;
      email?: string;
      address?: EditFormValues["address"];
      socialLinks?: EditFormValues["socialLinks"];
    };
  }
) {
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error ?? "Failed to update contact info");
  }
  return res.json();
}

function EditOrganizationForm() {
  const router = useRouter();

  const {
    data: orgData,
    isLoading: orgLoading,
    error: orgError,
  } = useSWR<OrgData>("/api/auth/me", fetcher);
  const {
    data: contactResp,
    isLoading: contactLoading,
    error: contactError,
  } = useSWR<{ contact: OrganizationContact | null }>("/api/organization/contact", fetcher);

  const { trigger: triggerOrg, isMutating: isOrgMutating } = useSWRMutation(
    "/api/organization",
    updateOrg
  );
  const { trigger: triggerContact, isMutating: isContactMutating } = useSWRMutation(
    "/api/organization/contact",
    upsertContact
  );

  const isMutating = isOrgMutating || isContactMutating;
  const isLoading = orgLoading || contactLoading;
  const organization = orgData?.user?.organization;
  const contactData = contactResp?.contact;

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: "",
      currency: "USD",
      phone: "",
      email: "",
      address: { line1: "", line2: "", city: "", state: "", postalCode: "", country: "" },
      socialLinks: { website: "", instagram: "", facebook: "", twitter: "", linkedin: "" },
    },
  });

  useEffect(() => {
    if (!organization || contactResp === undefined) return;
    form.reset({
      name: organization.name,
      currency: organization.currency ?? "USD",
      phone: contactData?.phone ?? "",
      email: contactData?.email ?? "",
      address: {
        line1: contactData?.address?.line1 ?? "",
        line2: contactData?.address?.line2 ?? "",
        city: contactData?.address?.city ?? "",
        state: contactData?.address?.state ?? "",
        postalCode: contactData?.address?.postalCode ?? "",
        country: contactData?.address?.country ?? "",
      },
      socialLinks: {
        website: contactData?.socialLinks?.website ?? "",
        instagram: contactData?.socialLinks?.instagram ?? "",
        facebook: contactData?.socialLinks?.facebook ?? "",
        twitter: contactData?.socialLinks?.twitter ?? "",
        linkedin: contactData?.socialLinks?.linkedin ?? "",
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization, contactResp]);

  const handleSubmit = async (values: EditFormValues) => {
    try {
      const { name, currency, phone, email, address, socialLinks } = values;
      await Promise.all([
        triggerOrg({ name, currency }),
        triggerContact({ phone, email, address, socialLinks }),
      ]);
      toast.success("Organization updated successfully");
      router.push(buildRoute.settingsOrganization());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update organization");
    }
  };

  const handleCancel = () => {
    router.push(buildRoute.settingsOrganization());
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-zinc-200 dark:bg-zinc-700 rounded w-1/4" />
        <div className="h-40 bg-zinc-200 dark:bg-zinc-700 rounded" />
        <div className="h-32 bg-zinc-200 dark:bg-zinc-700 rounded" />
      </div>
    );
  }

  if (orgError || contactError || !organization) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-zinc-500 dark:text-zinc-400">
            {orgError || contactError ? "Failed to load organization" : "Organization not found"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Organization */}
        <Card>
          <CardHeader>
            <CardTitle>Organization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter organization name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <FormControl>
                    <CurrencySelect
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isMutating}
                      className="w-full sm:w-72"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="+1 (555) 000-0000" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="contact@example.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle>Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="address.line1"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Address Line 1</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="123 Main St" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address.line2"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Address Line 2</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Suite 100" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="San Francisco" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address.state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State / Province</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="CA" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address.postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="94102" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address.country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="United States" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle>Social Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(
              [
                {
                  name: "socialLinks.website",
                  label: "Website",
                  placeholder: "https://yoursite.com",
                },
                {
                  name: "socialLinks.instagram",
                  label: "Instagram",
                  placeholder: "https://instagram.com/yourhandle",
                },
                {
                  name: "socialLinks.facebook",
                  label: "Facebook",
                  placeholder: "https://facebook.com/yourpage",
                },
                {
                  name: "socialLinks.twitter",
                  label: "Twitter / X",
                  placeholder: "https://x.com/yourhandle",
                },
                {
                  name: "socialLinks.linkedin",
                  label: "LinkedIn",
                  placeholder: "https://linkedin.com/company/yourcompany",
                },
              ] as const
            ).map(({ name, label, placeholder }) => (
              <FormField
                key={name}
                control={form.control}
                name={name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={placeholder} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button type="submit" disabled={isMutating}>
            {isMutating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isMutating}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function EditOrganizationPage() {
  return (
    <OwnerGate>
      <div className="space-y-6">
        <div className="mb-8">
          <Link
            href={buildRoute.settingsOrganization()}
            className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Organization
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Edit Organization</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            Update your organization details and contact information
          </p>
        </div>

        <EditOrganizationForm />
      </div>
    </OwnerGate>
  );
}
