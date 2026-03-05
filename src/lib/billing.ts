import type { BillingResponse } from "@/types/billing";

export async function getBilling(): Promise<BillingResponse> {
  return {
    subscription: {
      id: "sub_mock_lifetime",
      status: "active",
      currentPeriodStart: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      canceledAt: null,
      plan: {
        id: "lifetime",
        nickname: "Lifetime",
        amount: 5000,
        currency: "usd",
        interval: "one_time",
      },
    },
    paymentMethod: {
      id: "pm_mock_123",
      type: "card",
      card: {
        brand: "visa",
        last4: "4242",
        expMonth: 12,
        expYear: 2034,
      },
    },
    customer: {
      email: "demo@example.com",
      name: "Acme Wellness",
      address: {
        line1: "123 Serenity Lane",
        line2: "Suite 200",
        city: "San Francisco",
        state: "CA",
        postalCode: "94102",
        country: "US",
      },
    },
    invoices: [
      {
        id: "in_mock_001",
        number: "INV-001",
        status: "paid",
        amountPaid: 5000,
        currency: "usd",
        created: "2024-01-15T10:00:00Z",
        hostedInvoiceUrl: null,
        invoicePdf: null,
      },
    ],
    usage: {
      membersUsed: 5,
      membersLimit: 100,
    },
  };
}
