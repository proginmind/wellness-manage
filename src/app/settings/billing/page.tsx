import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { requireOwnerServer } from "@/lib/api-permissions";
import { getBilling } from "@/lib/billing";
import { buildRoute } from "@/lib/routes";
import { BillingContent } from "@/components/billing/billing-content";
import { CheckoutRedirectToast } from "@/components/checkout-redirect-toast";

export const metadata: Metadata = {
  title: "Billing",
};

interface BillingPageProps {
  searchParams: Promise<{ success?: string }>;
}

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const context = await requireOwnerServer();
  if (!context) redirect(buildRoute.settingsProfile());

  const params = await searchParams;
  const data = await getBilling(context.organizationId);

  return (
    <div className="min-w-0 space-y-6 overflow-hidden">
      <CheckoutRedirectToast success={params.success === "true"} />
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
