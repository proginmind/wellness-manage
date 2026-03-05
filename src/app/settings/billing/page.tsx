import type { Metadata } from "next";

import { getBilling } from "@/lib/billing";
import { BillingContent } from "@/components/billing/billing-content";

export const metadata: Metadata = {
  title: "Billing",
};

export default async function BillingPage() {
  const data = await getBilling();

  return (
    <div className="min-w-0 space-y-6 overflow-hidden">
      <div className="min-w-0">
        <h2 className="text-2xl font-bold tracking-tight">Billing</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mt-1">
          Manage your subscription, payment method, and billing history
        </p>
      </div>

      <BillingContent data={data} />
    </div>
  );
}
