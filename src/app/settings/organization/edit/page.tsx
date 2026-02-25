"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import currencies from "@/data/currencies.json";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { z } from "zod";

import { fetcher } from "@/lib/fetcher";
import { buildRoute } from "@/lib/routes";
import { OwnerGate } from "@/components/PermissionGate";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const VALID_CURRENCY_CODES = new Set(currencies.map((c) => c.code));

const orgSchema = z.object({
  name: z.string().min(1, "Name is required"),
  currency: z
    .string()
    .min(1, "Currency is required")
    .refine((v) => VALID_CURRENCY_CODES.has(v), "Unsupported currency code"),
});

type OrgFormValues = z.infer<typeof orgSchema>;

interface OrgData {
  user: {
    organization?: {
      name: string;
      currency: string;
    };
  };
}

async function updateOrganization(url: string, { arg }: { arg: OrgFormValues }) {
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

function EditOrganizationForm() {
  const router = useRouter();
  const { data, isLoading, error } = useSWR<OrgData>("/api/auth/me", fetcher);
  const { trigger, isMutating } = useSWRMutation("/api/organization", updateOrganization);

  const organization = data?.user?.organization;

  const form = useForm<OrgFormValues>({
    resolver: zodResolver(orgSchema),
    values: organization
      ? { name: organization.name, currency: organization.currency ?? "USD" }
      : undefined,
  });

  const handleSubmit = async (values: OrgFormValues) => {
    try {
      await trigger(values);
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
      <div className="animate-pulse">
        <div className="h-8 bg-zinc-200 dark:bg-zinc-700 rounded w-1/4 mb-8" />
        <div className="h-64 bg-zinc-200 dark:bg-zinc-700 rounded" />
      </div>
    );
  }

  if (error || !organization) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-zinc-500 dark:text-zinc-400">
            {error ? "Failed to load organization" : "Organization not found"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardContent className="pt-6 space-y-4">
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
                  <Select value={field.value} onValueChange={field.onChange} disabled={isMutating}>
                    <FormControl>
                      <SelectTrigger className="w-full sm:w-72">
                        <SelectValue placeholder="Select a currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-72 overflow-y-auto">
                      {currencies.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.code} · {c.name} ({c.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            Update your organization name and currency
          </p>
        </div>

        <EditOrganizationForm />
      </div>
    </OwnerGate>
  );
}
