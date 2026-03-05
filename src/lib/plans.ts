import type { SubscriptionPlansResponse } from "@/types/plan";

const MOCK_PLANS_RESPONSE: SubscriptionPlansResponse = {
  plans: [
    {
      id: "lifetime",
      title: "Lifetime",
      price: 50,
      currency: "USD",
      description:
        "One-time payment for lifetime access. No recurring fees, no limits. Perfect for wellness centers and practitioners who want full control.",
      features: [
        "Member management",
        "Team management",
        "Visit and booking management",
        "Event types and categories",
        "Staff availability scheduling",
        "Organization settings",
        "Staff invitations",
        "Dashboard and analytics",
      ],
    },
  ],
  activePlanId: "lifetime",
};

export async function getPlans(): Promise<SubscriptionPlansResponse> {
  return MOCK_PLANS_RESPONSE;
}
