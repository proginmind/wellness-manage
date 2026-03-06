import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { requireOwnerServer } from "@/lib/api-permissions";
import { getPlans } from "@/lib/plans";
import { buildRoute } from "@/lib/routes";
import { CheckoutRedirectToast } from "@/components/checkout-redirect-toast";
import { PlansListContainer } from "@/components/plans/plans-list-container";

export const metadata: Metadata = {
  title: "Subscription Plans",
};

interface PlansPageProps {
  searchParams: Promise<{ canceled?: string }>;
}

export default async function PlansPage({ searchParams }: PlansPageProps) {
  const context = await requireOwnerServer();
  if (!context) redirect(buildRoute.settingsProfile());

  const params = await searchParams;
  const data = await getPlans(context.organizationId);

  return (
    <div className="space-y-6">
      <CheckoutRedirectToast canceled={params.canceled === "true"} />
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Subscription Plans</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mt-1">
          Choose the plan that best fits your wellness center
        </p>
      </div>

      <PlansListContainer plans={data.plans} activePlanId={data.activePlanId} />
    </div>
  );
}
