import { NextResponse } from "next/server";
import Stripe from "stripe";

import { getStripe } from "@/lib/stripe";
import {
  getOrganizationByStripeCustomerId,
  insertSubscription,
  updateOrganization,
} from "@/lib/supabase/queries";

export const runtime = "nodejs";

/**
 * Stripe webhook handler
 *
 * Handles:
 * - checkout.session.completed: set stripe_customer_id on org (from metadata.organization_id)
 * - customer.subscription.created/updated/deleted: insert subscription row
 *
 * Requires STRIPE_WEBHOOK_SECRET in env.
 */
export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    console.error("Stripe webhook: missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const body = await request.text();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Stripe webhook signature verification failed:", message);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId =
          typeof session.customer === "string" ? session.customer : session.customer?.id;
        const organizationId = session.metadata?.organization_id;

        if (organizationId && customerId) {
          await updateOrganization(organizationId, { stripeCustomerId: customerId });
        }

        // For one-time payments there are no subscription events, so we insert a
        // subscription row here to record the purchase.
        if (session.mode === "payment" && session.payment_status === "paid" && organizationId) {
          const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
            limit: 1,
          });
          const priceId = lineItems.data[0]?.price?.id;
          const paymentIntentId =
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : (session.payment_intent?.id ?? session.id);

          if (priceId) {
            await insertSubscription({
              organizationId,
              stripeSubscriptionId: paymentIntentId,
              stripePriceId: priceId,
              status: "active",
              currentPeriodStart: null,
              currentPeriodEnd: null,
              cancelAtPeriodEnd: false,
              canceledAt: null,
            });
          } else {
            console.warn(
              "Stripe webhook: no price found in checkout session line items",
              session.id
            );
          }
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer?.id;

        if (!customerId) break;

        const org = await getOrganizationByStripeCustomerId(customerId);
        if (!org) {
          console.warn("Stripe webhook: no org found for customer", customerId);
          break;
        }

        const priceId = subscription.items?.data?.[0]?.price?.id;
        if (!priceId) {
          console.warn("Stripe webhook: subscription has no price", subscription.id);
          break;
        }

        const status = subscription.status ?? "canceled";
        const validStatuses = ["active", "canceled", "past_due", "trialing", "unpaid"];
        const dbStatus = validStatuses.includes(status) ? status : "canceled";

        await insertSubscription({
          organizationId: org.id,
          stripeSubscriptionId: subscription.id,
          stripePriceId: priceId,
          status: dbStatus,
          currentPeriodStart: subscription.current_period_start
            ? new Date(subscription.current_period_start * 1000)
            : null,
          currentPeriodEnd: subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000)
            : null,
          cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false,
          canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
        });
        break;
      }

      default:
        // Unhandled event type - return 200 to acknowledge
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
