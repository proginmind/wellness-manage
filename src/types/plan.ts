export interface Plan {
  id: string;
  title: string;
  price: number;
  currency: string;
  description: string;
  features: string[];
}

export interface SubscriptionPlansResponse {
  plans: Plan[];
  activePlanId: string | null;
}
