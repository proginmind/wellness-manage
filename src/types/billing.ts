export type SubscriptionStatus = "active" | "canceled" | "past_due" | "trialing" | "unpaid";

export type PlanInterval = "month" | "year" | "one_time";

export interface SubscriptionPlan {
  id: string;
  nickname: string;
  amount: number;
  currency: string;
  interval: PlanInterval;
}

export interface Subscription {
  id: string;
  status: SubscriptionStatus;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  plan: SubscriptionPlan;
}

export interface PaymentMethodCard {
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
}

export interface PaymentMethod {
  id: string;
  type: "card";
  card: PaymentMethodCard;
}

export type InvoiceStatus = "draft" | "open" | "paid" | "void" | "uncollectible";

export interface Invoice {
  id: string;
  number: string | null;
  status: InvoiceStatus;
  amountPaid: number;
  currency: string;
  created: string;
  hostedInvoiceUrl: string | null;
  invoicePdf: string | null;
}

export interface BillingAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface Customer {
  email: string;
  name: string | null;
  address: BillingAddress | null;
}

export interface BillingUsage {
  membersUsed: number;
  membersLimit: number | null;
}

export interface BillingResponse {
  subscription: Subscription | null;
  paymentMethod: PaymentMethod | null;
  customer: Customer | null;
  invoices: Invoice[];
  usage: BillingUsage;
}
