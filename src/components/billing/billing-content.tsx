"use client";

import type { BillingResponse } from "@/types/billing";
import { BillingHistoryCard } from "@/components/billing/billing-history-card";
import { CurrentPlanCard } from "@/components/billing/current-plan-card";
import { PaymentMethodCard } from "@/components/billing/payment-method-card";

interface BillingContentProps {
  data: BillingResponse;
}

export function BillingContent({ data }: BillingContentProps) {
  const { subscription, paymentMethod, invoices } = data;

  return (
    <div className="w-full min-w-0 space-y-6">
      <div className="grid w-full min-w-0 grid-cols-1 gap-6 sm:grid-cols-2">
        <CurrentPlanCard subscription={subscription} />
        <PaymentMethodCard paymentMethod={paymentMethod} />
      </div>

      <BillingHistoryCard invoices={invoices} />
    </div>
  );
}
