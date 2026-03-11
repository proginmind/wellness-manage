import { NextResponse } from "next/server";

import { requireOwner } from "@/lib/api-permissions";
import { getStripe } from "@/lib/stripe";
import { getLatestSubscriptionByOrganizationId, insertSubscription } from "@/lib/supabase/queries";

export async function POST() {
  try {
    const result = await requireOwner();
    if (result instanceof NextResponse) return result;

    const { organizationId } = result;

    const subscriptionRow = await getLatestSubscriptionByOrganizationId(organizationId);

    if (!subscriptionRow || subscriptionRow.status !== "active") {
      return NextResponse.json({ error: "No active subscription found" }, { status: 400 });
    }

    const isStripeSubscription = subscriptionRow.stripe_subscription_id.startsWith("sub_");

    if (isStripeSubscription) {
      const stripe = getStripe();
      if (!stripe) {
        return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 });
      }

      // Cancel at period end — user keeps access until billing period ends
      const updated = await stripe.subscriptions.update(subscriptionRow.stripe_subscription_id, {
        cancel_at_period_end: true,
      });

      // Insert updated row immediately so the UI reflects it before webhook arrives
      await insertSubscription({
        organizationId,
        stripeSubscriptionId: updated.id,
        stripePriceId: subscriptionRow.stripe_price_id,
        status: "active",
        currentPeriodStart: subscriptionRow.current_period_start
          ? new Date(subscriptionRow.current_period_start)
          : null,
        currentPeriodEnd: subscriptionRow.current_period_end
          ? new Date(subscriptionRow.current_period_end)
          : null,
        cancelAtPeriodEnd: true,
        canceledAt: null,
      });
    } else {
      // One-time purchase (payment intent ID) — no Stripe subscription to cancel,
      // just mark as canceled in our DB
      await insertSubscription({
        organizationId,
        stripeSubscriptionId: subscriptionRow.stripe_subscription_id,
        stripePriceId: subscriptionRow.stripe_price_id,
        status: "canceled",
        currentPeriodStart: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        canceledAt: new Date(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/billing/cancel error:", error);
    return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 });
  }
}
