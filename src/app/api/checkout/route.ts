import { NextResponse } from "next/server";

import { requireOwner } from "@/lib/api-permissions";
import { getStripe } from "@/lib/stripe";
import { getOrganizationById, updateOrganization } from "@/lib/supabase/queries";

export async function POST(request: Request) {
  try {
    const result = await requireOwner();
    if (result instanceof NextResponse) return result;

    const { organizationId, userEmail } = result;

    const body = await request.json().catch(() => ({}));
    const priceId = typeof body?.priceId === "string" ? body.priceId.trim() : "";

    if (!priceId) {
      return NextResponse.json({ error: "priceId is required" }, { status: 400 });
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 });
    }

    const organization = await getOrganizationById(organizationId);
    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 500 });
    }

    // Ensure a persistent Stripe customer exists for this org before checkout.
    // Using customer_email alone doesn't guarantee a Customer object is created
    // for one-time payments, so session.customer would be null in the webhook.
    let stripeCustomerId = organization.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: userEmail ?? undefined,
        metadata: { organization_id: organizationId },
      });
      stripeCustomerId = customer.id;
      await updateOrganization(organizationId, { stripeCustomerId });
    }

    const price = await stripe.prices.retrieve(priceId);
    const mode = price.recurring ? ("subscription" as const) : ("payment" as const);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: priceId, quantity: 1 }],
      mode,
      success_url: `${appUrl}/settings/billing?success=true`,
      cancel_url: `${appUrl}/settings/plans?canceled=true`,
      metadata: { organization_id: organizationId },
      customer: stripeCustomerId,
    });

    if (!session.url) {
      return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("POST /api/checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
