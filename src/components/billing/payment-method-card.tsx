"use client";

import { CreditCard } from "lucide-react";
import { toast } from "sonner";

import type { PaymentMethod } from "@/types/billing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PaymentMethodCardProps {
  paymentMethod: PaymentMethod | null;
}

function formatBrand(brand: string): string {
  return brand.charAt(0).toUpperCase() + brand.slice(1);
}

function formatExpiry(month: number, year: number): string {
  const m = String(month).padStart(2, "0");
  const y = String(year).slice(-2);
  return `${m}/${y}`;
}

export function PaymentMethodCard({ paymentMethod }: PaymentMethodCardProps) {
  const handleUpdate = () => {
    toast.info("Update payment method", {
      description: "This will be implemented with Stripe integration.",
    });
  };

  if (!paymentMethod || paymentMethod.type !== "card") {
    return (
      <Card className="min-w-0 overflow-hidden">
        <CardHeader>
          <CardTitle>Payment method</CardTitle>
          <CardDescription>No payment method on file</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleUpdate}>
            <CreditCard className="h-4 w-4 mr-2" />
            Add payment method
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { card } = paymentMethod;

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
        <div className="min-w-0 flex-1">
          <CardTitle className="truncate">Payment method</CardTitle>
          <CardDescription>Card used for billing</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleUpdate} className="shrink-0">
          Update
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border bg-zinc-50 dark:bg-zinc-900">
            <CreditCard className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="truncate font-medium">
              {formatBrand(card.brand)} •••• {card.last4}
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Expires {formatExpiry(card.expMonth, card.expYear)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
