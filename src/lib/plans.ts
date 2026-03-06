import Stripe from "stripe";

import type { Plan, SubscriptionPlansResponse } from "@/types/plan";
import { getStripe } from "@/lib/stripe";

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

/**
 * Get features from Stripe product
 * Prefers marketing_features (Stripe's built-in field for pricing tables).
 * Falls back to metadata.features (JSON array string) for backwards compatibility.
 */
function getFeatures(product: Stripe.Product): string[] {
  // Marketing feature list - Stripe's intended field for customer-facing features
  const marketing = product.marketing_features;
  return (marketing ?? []).map((item) => item.name).filter((name): name is string => !!name);
}

/**
 * Map Stripe Price to our Plan type
 * Uses price.id as plan id (needed for checkout)
 */
function mapPriceToPlan(product: Stripe.Product, price: Stripe.Price): Plan {
  const amount = price.unit_amount ?? 0;
  return {
    id: price.id,
    title: product.name,
    price: amount / 100,
    currency: (price.currency ?? "usd").toUpperCase(),
    description: product.description ?? "",
    features: getFeatures(product),
  };
}

/**
 * Fetch subscription plans from Stripe
 *
 * When STRIPE_SECRET_KEY is not set, returns mock data for development.
 * activePlanId is resolved from the org's latest subscription when status is active/trialing.
 */
export async function getPlans(organizationId: string): Promise<SubscriptionPlansResponse> {
  const stripe = getStripe();

  if (!stripe) {
    return { ...MOCK_PLANS_RESPONSE, activePlanId: null };
  }

  try {
    const { getLatestSubscriptionByOrganizationId } = await import("@/lib/supabase/queries");
    const subscription = await getLatestSubscriptionByOrganizationId(organizationId);

    const activePlanId =
      subscription && ["active", "trialing"].includes(subscription.status)
        ? subscription.stripe_price_id
        : null;

    const products = await stripe.products.list({
      active: true,
      limit: 100,
      expand: ["data.default_price"],
    });

    const plans: Plan[] = [];

    for (const product of products.data) {
      // Fetch all active prices for this product (supports monthly + yearly, etc.)
      const prices = await stripe.prices.list({
        product: product.id,
        active: true,
        limit: 100,
      });

      for (const price of prices.data) {
        plans.push(mapPriceToPlan(product, price));
      }
    }

    // Sort by price ascending
    plans.sort((a, b) => a.price - b.price);

    return {
      plans,
      activePlanId,
    };
  } catch (error) {
    console.error("Stripe plans fetch error:", error);
    return {
      ...MOCK_PLANS_RESPONSE,
      activePlanId: null,
    };
  }
}
