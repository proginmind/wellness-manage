import { NextResponse } from "next/server";

import { requireOwner } from "@/lib/api-permissions";
import { getStripe } from "@/lib/stripe";
import { getOrganizationById } from "@/lib/supabase/queries";

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

    const price = await stripe.prices.retrieve(priceId);
    const mode = price.recurring ? ("subscription" as const) : ("payment" as const);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: priceId, quantity: 1 }],
      mode,
      success_url: `${appUrl}/settings/billing?success=true`,
      cancel_url: `${appUrl}/settings/plans?canceled=true`,
      metadata: { organization_id: organizationId },
      ...(organization.stripeCustomerId
        ? { customer: organization.stripeCustomerId }
        : userEmail
          ? { customer_email: userEmail }
          : {}),
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
