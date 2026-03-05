import type { Metadata } from "next";

import { getPlans } from "@/lib/plans";
import { PlansListContainer } from "@/components/plans/plans-list-container";

export const metadata: Metadata = {
  title: "Subscription Plans",
};

export default async function PlansPage() {
  const data = await getPlans();

  return (
    <div className="space-y-6">
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
