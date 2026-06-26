"use client";

import type { BillingResponse, Subscription } from "@/types/billing";
import { cn } from "@/lib/utils";
import { BillingHistoryCard } from "@/components/billing/billing-history-card";
import { CurrentPlanCard } from "@/components/billing/current-plan-card";
import { PaymentMethodCard } from "@/components/billing/payment-method-card";

interface BillingContentProps {
  data: BillingResponse;
}

/** Payment method updates apply to recurring subscriptions only, not lifetime checkout. */
function showPaymentMethodCard(subscription: Subscription | null): boolean {
  if (!subscription) return false;
  if (subscription.plan.interval === "one_time") return false;
  return subscription.status === "active" || subscription.status === "trialing";
}

export function BillingContent({ data }: BillingContentProps) {
  const { subscription, paymentMethod, invoices } = data;
  const showPaymentMethod = showPaymentMethodCard(subscription);

  return (
    <div className="w-full min-w-0 space-y-6">
      <div
        className={cn(
          "grid w-full min-w-0 grid-cols-1 gap-6",
          showPaymentMethod && "sm:grid-cols-2"
        )}
      >
        <CurrentPlanCard subscription={subscription} />
        {showPaymentMethod && <PaymentMethodCard paymentMethod={paymentMethod} />}
      </div>

      <BillingHistoryCard invoices={invoices} />
    </div>
  );
}
