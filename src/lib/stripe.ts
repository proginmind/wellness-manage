/**
 * Stripe server-side client
 *
 * Use this only in server-side code (API routes, server components).
 * Never expose the secret key to the client.
 */

import Stripe from "stripe";

let stripeClient: Stripe | null = null;

/**
 * Get Stripe client instance (lazy initialization)
 * Returns null if STRIPE_SECRET_KEY is not set
 */
export function getStripe(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, { typescript: true });
  }

  return stripeClient;
}

/**
 * Check if Stripe is configured
 */
export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}
