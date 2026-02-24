"use client";

import { useEffect, useState } from "react";
import currencies from "@/data/currencies.json";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import useSWRMutation from "swr/mutation";
import { z } from "zod";

import { useOrganizationPermissions } from "@/hooks/usePermissions";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const VALID_CURRENCY_CODES = new Set(currencies.map((c) => c.code));

const currencySchema = z.object({
  currency: z
    .string()
    .min(1, "Currency is required")
    .refine((v) => VALID_CURRENCY_CODES.has(v), "Unsupported currency code"),
});

type CurrencyFormValues = z.infer<typeof currencySchema>;

async function updateCurrency(url: string, { arg }: { arg: CurrencyFormValues }) {
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error ?? "Failed to update currency");
  }
  return res.json();
}

export default function OrganizationSettingsPage() {
  const { user, isLoading, mutate } = useUser({
    onSuccess: (data) => {
      const currency = data.user.organization?.currency;
      if (currency) {
        currencyForm.reset({ currency });
      }
    },
  });
  const { canUpdate } = useOrganizationPermissions();
  const [isEditing, setIsEditing] = useState(false);
  const [orgName, setOrgName] = useState("");

  const organization = user?.organization;
  const profile = user?.profile;
  const isOwner = profile?.role === "owner";

  const { trigger, isMutating } = useSWRMutation("/api/organization", updateCurrency);

  const currencyForm = useForm<CurrencyFormValues>({
    resolver: zodResolver(currencySchema),
  });

  useEffect(() => {
    if (organization?.currency) {
      currencyForm.setValue("currency", organization.currency);
    }
  }, [organization?.currency, currencyForm]);

  console.log("cur: ", organization?.currency);

  // Initialize org name when data loads
  if (organization && !orgName && !isEditing) {
    setOrgName(organization.name);
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Organization</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">Manage your organization settings</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-4 w-full bg-zinc-200 dark:bg-zinc-700 animate-pulse rounded"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Organization</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">Manage your organization settings</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-zinc-500 dark:text-zinc-400">Organization not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSave = async () => {
    // TODO: Implement organization update API
    console.log("Save organization:", orgName);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setOrgName(organization.name);
    setIsEditing(false);
  };

  const handleCurrencySubmit = async (values: CurrencyFormValues) => {
    try {
      await trigger(values);
      await mutate();
      toast.success("Currency updated successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update currency");
      currencyForm.reset({ currency: organization.currency ?? "USD" });
    }
  };

  const currentCurrency = currencyForm.watch("currency");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Organization</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mt-1">Manage your organization settings</p>
      </div>

      {/* Organization Details */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Information</CardTitle>
          <CardDescription>Your organization details</CardDescription>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="org-name">Organization Name</Label>
                <Input
                  id="org-name"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Enter organization name"
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave}>
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Organization Name:</span>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  {organization.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Your Role:</span>
                <span className="text-sm text-zinc-600 dark:text-zinc-400 capitalize">
                  {profile?.role || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Organization ID:</span>
                <span className="text-sm text-zinc-600 dark:text-zinc-400 font-mono">
                  {organization.id.slice(0, 8)}...
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Created:</span>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  {format(new Date(organization.createdAt), "PPP")}
                </span>
              </div>
              {canUpdate && (
                <div className="pt-2">
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                    Edit Organization
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Currency */}
      <Card>
        <CardHeader>
          <CardTitle>Currency</CardTitle>
          <CardDescription>
            {isOwner
              ? "Set the currency used across your organization for pricing and reporting"
              : "The currency used across your organization for pricing and reporting"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isOwner ? (
            <Form {...currencyForm}>
              <form
                onSubmit={currencyForm.handleSubmit(handleCurrencySubmit)}
                className="space-y-4"
              >
                <FormField
                  control={currencyForm.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Currency</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isMutating}
                      >
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
                <Button
                  type="submit"
                  size="sm"
                  disabled={isMutating || currentCurrency === (organization.currency ?? "USD")}
                >
                  {isMutating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Save Currency
                </Button>
              </form>
            </Form>
          ) : (
            <div className="flex justify-between">
              <span className="text-sm font-medium">Currency:</span>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {(() => {
                  const c = currencies.find((x) => x.code === (organization.currency ?? "USD"));
                  return c
                    ? `${c.code} · ${c.name} (${c.symbol})`
                    : (organization.currency ?? "USD");
                })()}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
