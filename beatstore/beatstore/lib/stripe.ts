import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
  typescript: true,
});

export async function createPaymentIntent(
  amount: number,
  metadata: Record<string, string>
) {
  return stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // cents
    currency: "usd",
    automatic_payment_methods: {
      enabled: true, // enables Apple Pay, Google Pay, cards
    },
    metadata,
  });
}

export async function constructWebhookEvent(
  body: string | Buffer,
  signature: string
) {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not set");
  }
  return stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
}
