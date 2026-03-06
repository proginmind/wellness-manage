# Stripe Integration Setup Guide

This guide walks you through setting up Stripe for subscription plans in the wellness-manage app.

## Prerequisites

- A [Stripe account](https://dashboard.stripe.com/register)
- Node.js 18+ (already in project)

---

## Step 1: Install Stripe SDK

From the project root:

```bash
pnpm add stripe
```

---

## Step 2: Get Your Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → **Developers** → **API keys**
2. Copy your keys:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`) – safe for client-side
   - **Secret key** (starts with `sk_test_` or `sk_live_`) – **server-side only, never expose**

---

## Step 3: Add Environment Variables

Add to your `.env.local` (create from `.env.example` if needed):

```env
# Stripe (add these to .env.local)
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

**Important:** Use `sk_test_` and `pk_test_` for development. Switch to `sk_live_` and `pk_live_` for production.

---

## Step 4: Create Products and Prices in Stripe

### Option A: Stripe Dashboard (recommended for initial setup)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → **Products** → **Add product**
2. Create your first plan, e.g. **Lifetime**:
   - **Name:** Lifetime
   - **Description:** One-time payment for lifetime access. No recurring fees, no limits.
   - **Pricing:** One-time, $50 USD
   - **Marketing feature list:** Click "+ Add line" and add each feature, e.g.:
     - Member management
     - Team management
     - Visit and booking management
     - Event types and categories
     - Staff availability scheduling
     - Organization settings
     - Staff invitations
     - Dashboard and analytics

3. Add more products as needed (e.g., Monthly Pro, Annual Pro).

### Option B: Stripe CLI (for automation)

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe products create \
  --name="Lifetime" \
  --description="One-time payment for lifetime access" \
  -d "metadata[features]=[\"Member management\",\"Team management\"]"

stripe prices create \
  --product=prod_xxx \
  --unit-amount=5000 \
  --currency=usd
```

---

## Step 5: Features for Plans

Use the **Marketing feature list** for each product (Stripe's intended field for pricing tables). Add each feature with "+ Add line".

**Fallback:** If you use `metadata.features` instead, it must be a JSON array string, e.g.  
`["Member management","Team management",...]`

---

## Step 6: Verify the Integration

1. Ensure `STRIPE_SECRET_KEY` is set in `.env.local`
2. Run the app: `pnpm dev`
3. Visit `/settings/plans` (as owner)
4. You should see plans fetched from Stripe

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  Stripe Dashboard                                            │
│  • Products (name, description, marketing_features)           │
│  • Prices (amount, currency, recurring/one_time)             │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Stripe API
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  getPlans() in src/lib/plans.ts                              │
│  • Fetches active products with expanded prices               │
│  • Maps to Plan type (id, title, price, features)           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  /settings/plans page                                        │
│  • Server component calls getPlans()                         │
│  • Renders PlansListContainer with fetched plans             │
└─────────────────────────────────────────────────────────────┘
```

## Fallback Behavior

When `STRIPE_SECRET_KEY` is not set:

- **Development:** `getPlans()` returns mock data so the app works without Stripe
- **Production:** Consider failing or returning empty if Stripe is required

---

## Next Steps (Checkout Flow)

To implement checkout:

1. Create checkout session API route: `POST /api/checkout`
2. Use `stripe.checkout.sessions.create()` with `price_id` and `success_url`/`cancel_url`
3. Add webhook: `POST /api/webhooks/stripe` for `checkout.session.completed`, `customer.subscription.*`
4. Store subscription in DB (webhook payload)

See [Stripe Checkout docs](https://docs.stripe.com/checkout) for details.
