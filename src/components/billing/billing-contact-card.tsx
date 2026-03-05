"use client";

import { Mail, MapPin, User } from "lucide-react";
import { toast } from "sonner";

import type { Customer } from "@/types/billing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface BillingContactCardProps {
  customer: Customer | null;
}

function formatAddress(address: NonNullable<Customer["address"]>): string {
  const parts = [
    address.line1,
    address.line2,
    [address.city, address.state, address.postalCode].filter(Boolean).join(", "),
    address.country,
  ].filter(Boolean);
  return parts.join("\n");
}

export function BillingContactCard({ customer }: BillingContactCardProps) {
  const handleEdit = () => {
    toast.info("Edit billing info", {
      description: "This will be implemented with Stripe integration.",
    });
  };

  if (!customer) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Billing contact</CardTitle>
          <CardDescription>No billing information on file</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleEdit}>Edit billing info</Button>
        </CardContent>
      </Card>
    );
  }

  const { email, name, address } = customer;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Billing contact</CardTitle>
          <CardDescription>Contact and address for invoices</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleEdit}>
          Edit
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {name && (
          <div className="flex items-start gap-2">
            <User className="h-4 w-4 mt-0.5 text-zinc-500" />
            <p className="text-sm">{name}</p>
          </div>
        )}
        <div className="flex items-start gap-2">
          <Mail className="h-4 w-4 mt-0.5 text-zinc-500" />
          <a
            href={`mailto:${email}`}
            className="text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            {email}
          </a>
        </div>
        {address && (address.line1 || address.city || address.country) && (
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-0.5 text-zinc-500 shrink-0" />
            <pre className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap font-sans">
              {formatAddress(address)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
