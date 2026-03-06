import Stripe from "stripe";

import type {
  BillingResponse,
  Invoice,
  InvoiceStatus,
  PaymentMethod,
  PlanInterval,
  Subscription,
  SubscriptionPlan,
  SubscriptionStatus,
} from "@/types/billing";
import { getStripe } from "@/lib/stripe";
import {
  getLatestSubscriptionByOrganizationId,
  getMembersCount,
  getOrganizationById,
} from "@/lib/supabase/queries";

const VALID_SUBSCRIPTION_STATUSES: SubscriptionStatus[] = [
  "active",
  "canceled",
  "past_due",
  "trialing",
  "unpaid",
];

function toSubscriptionStatus(status: string): SubscriptionStatus {
  return VALID_SUBSCRIPTION_STATUSES.includes(status as SubscriptionStatus)
    ? (status as SubscriptionStatus)
    : "canceled";
}

function toInvoiceStatus(status: string): InvoiceStatus {
  const valid: InvoiceStatus[] = ["draft", "open", "paid", "void", "uncollectible"];
  return valid.includes(status as InvoiceStatus) ? (status as InvoiceStatus) : "void";
}

/**
 * Fetch billing data for an organization
 *
 * Uses DB for subscription state and Stripe API for customer, payment method, invoices.
 * Falls back to empty state when Stripe is not configured.
 */
export async function getBilling(organizationId: string): Promise<BillingResponse> {
  const [organization, subscriptionRow, membersUsed] = await Promise.all([
    getOrganizationById(organizationId),
    getLatestSubscriptionByOrganizationId(organizationId),
    getMembersCount(organizationId),
  ]);

  const stripe = getStripe();
  const stripeCustomerId = organization?.stripeCustomerId;

  // Base response - no subscription, no Stripe data
  const baseResponse: BillingResponse = {
    subscription: null,
    paymentMethod: null,
    customer: null,
    invoices: [],
    usage: {
      membersUsed,
      membersLimit: null,
    },
  };

  // No Stripe configured - return base
  if (!stripe) {
    return baseResponse;
  }

  // Build subscription from DB row if we have one
  let subscription: Subscription | null = null;
  if (subscriptionRow && ["active", "trialing"].includes(subscriptionRow.status)) {
    try {
      const price = await stripe.prices.retrieve(subscriptionRow.stripe_price_id, {
        expand: ["product"],
      });
      const product = price.product as Stripe.Product;

      const interval: PlanInterval =
        price.recurring?.interval === "year"
          ? "year"
          : price.recurring?.interval === "month"
            ? "month"
            : "one_time";

      const plan: SubscriptionPlan = {
        id: price.id,
        nickname: typeof product === "object" ? product.name : "Plan",
        amount: price.unit_amount ?? 0,
        currency: price.currency ?? "usd",
        interval,
      };

      subscription = {
        id: subscriptionRow.stripe_subscription_id,
        status: toSubscriptionStatus(subscriptionRow.status),
        currentPeriodStart: subscriptionRow.current_period_start,
        currentPeriodEnd: subscriptionRow.current_period_end,
        cancelAtPeriodEnd: subscriptionRow.cancel_at_period_end,
        canceledAt: subscriptionRow.canceled_at,
        plan,
      };
    } catch (error) {
      console.error("Error fetching Stripe price for subscription:", error);
    }
  }

  // No Stripe customer - return with subscription if we have it
  if (!stripeCustomerId) {
    return {
      ...baseResponse,
      subscription,
      usage: { membersUsed, membersLimit: null },
    };
  }

  // Fetch customer, payment method, invoices from Stripe
  let paymentMethod: PaymentMethod | null = null;
  let customer: BillingResponse["customer"] = null;
  let invoices: Invoice[] = [];

  try {
    const [customerData, invoicesData] = await Promise.all([
      stripe.customers.retrieve(stripeCustomerId),
      stripe.invoices.list({ customer: stripeCustomerId, limit: 12 }),
    ]);

    if (customerData && !("deleted" in customerData && customerData.deleted)) {
      customer = {
        email: customerData.email ?? "",
        name: customerData.name ?? null,
        address: customerData.address
          ? {
              line1: customerData.address.line1 ?? undefined,
              line2: customerData.address.line2 ?? undefined,
              city: customerData.address.city ?? undefined,
              state: customerData.address.state ?? undefined,
              postalCode: customerData.address.postal_code ?? undefined,
              country: customerData.address.country ?? undefined,
            }
          : null,
      };

      // Fetch default payment method if set
      const defaultPm = customerData.invoice_settings?.default_payment_method;
      const pmId =
        typeof defaultPm === "string"
          ? defaultPm
          : defaultPm && typeof defaultPm === "object" && "id" in defaultPm
            ? (defaultPm as { id: string }).id
            : null;

      if (pmId) {
        const pm = await stripe.paymentMethods.retrieve(pmId);
        if (pm.type === "card" && pm.card) {
          paymentMethod = {
            id: pm.id,
            type: "card",
            card: {
              brand: pm.card.brand,
              last4: pm.card.last4 ?? "",
              expMonth: pm.card.exp_month,
              expYear: pm.card.exp_year,
            },
          };
        }
      }
    }

    invoices = invoicesData.data.map((inv) => ({
      id: inv.id,
      number: inv.number ?? null,
      status: toInvoiceStatus(inv.status ?? "void"),
      amountPaid: inv.amount_paid ?? 0,
      currency: inv.currency ?? "usd",
      created: new Date((inv.created ?? 0) * 1000).toISOString(),
      hostedInvoiceUrl: inv.hosted_invoice_url ?? null,
      invoicePdf: inv.invoice_pdf ?? null,
    }));
  } catch (error) {
    console.error("Error fetching Stripe customer/invoices:", error);
  }

  return {
    subscription,
    paymentMethod,
    customer,
    invoices,
    usage: { membersUsed, membersLimit: null },
  };
}
