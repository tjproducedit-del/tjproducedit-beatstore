"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import Header from "@/components/Header";
import { useCartStore } from "@/hooks/use-cart";
import { HiArrowLeft, HiCreditCard, HiLockClosed } from "react-icons/hi2";
import { FaPaypal } from "react-icons/fa";
import toast from "react-hot-toast";
import Link from "next/link";
export const dynamic = "force-dynamic";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

type PaymentMethod = "stripe" | "paypal";

function StripeCheckoutForm({
  email,
  customerName,
}: {
  email: string;
  customerName: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const clearCart = useCartStore((s) => s.clearCart);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        receipt_email: email,
        return_url: `${window.location.origin}/success`,
      },
      redirect: "if_required",
    });

    if (error) {
      toast.error(error.message || "Payment failed");
      setProcessing(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      clearCart();
      router.push(`/success?payment_intent=${paymentIntent.id}`);
    }

    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement
        options={{
          layout: "tabs",
          wallets: { applePay: "auto", googlePay: "auto" },
        }}
      />
      <button
        type="submit"
        disabled={!stripe || processing}
        className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
      >
        <HiLockClosed className="w-4 h-4" />
        {processing ? "Processing..." : "Pay Now"}
      </button>
    </form>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal } = useCartStore();
  const clearCart = useCartStore((s) => s.clearCart);
  const total = getTotal();

  const [email, setEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("stripe");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Create order and get payment intent on load
  useEffect(() => {
    if (items.length === 0) return;
    // We'll create the intent when the user fills in their email and clicks pay
  }, [items]);

  const initializeStripePayment = async () => {
    if (!email) {
      toast.error("Please enter your email");
      return false;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            beatId: i.beat.id,
            licenseType: i.licenseType,
            price: i.price,
          })),
          email,
          customerName,
          paymentMethod: "stripe",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setClientSecret(data.clientSecret);
      setOrderId(data.orderId);
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to initialize payment");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handlePayPalCreateOrder = async () => {
    if (!email) {
      toast.error("Please enter your email");
      throw new Error("Email required");
    }

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({
          beatId: i.beat.id,
          licenseType: i.licenseType,
          price: i.price,
        })),
        email,
        customerName,
        paymentMethod: "paypal",
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    setOrderId(data.orderId);
    return data.paypalOrderId;
  };

  const handlePayPalApprove = async (data: any) => {
    try {
      const res = await fetch("/api/checkout/paypal-capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paypalOrderId: data.orderID,
          orderId,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      clearCart();
      router.push(`/success?order=${orderId}`);
    } catch (err: any) {
      toast.error(err.message || "PayPal capture failed");
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="pt-28 text-center">
          <p className="text-neutral-400 mb-4">Your cart is empty.</p>
          <Link href="/" className="btn-primary inline-block">
            Browse Beats
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />

      <div className="pt-24 pb-32 px-4 sm:px-6 lg:px-8 max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/cart"
            className="text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <HiArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-display font-bold text-2xl text-neutral-50">
            Checkout
          </h1>
        </div>

        {/* Customer Info */}
        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
              Email (for download link)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="input"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
              Name (optional)
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Your name"
              className="input"
            />
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-surface-100 border border-surface-300 rounded-xl p-4 mb-8">
          <h2 className="text-sm font-display font-semibold text-neutral-200 mb-3">
            Order Summary
          </h2>
          {items.map((item) => (
            <div
              key={item.beat.id}
              className="flex justify-between text-sm py-2 border-b border-surface-300 last:border-0"
            >
              <span className="text-neutral-400 truncate pr-4">
                {item.beat.title}{" "}
                <span className="text-neutral-600">({item.licenseType})</span>
              </span>
              <span className="text-neutral-200 shrink-0">
                ${item.price.toFixed(2)}
              </span>
            </div>
          ))}
          <div className="flex justify-between pt-3 mt-1">
            <span className="font-display font-semibold text-neutral-100">
              Total
            </span>
            <span className="font-display font-bold text-accent text-lg">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Payment Method Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setPaymentMethod("stripe")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-sm
                      transition-all ${paymentMethod === "stripe"
                ? "bg-accent text-surface"
                : "bg-surface-200 text-neutral-400 border border-surface-300"
              }`}
          >
            <HiCreditCard className="w-4 h-4" />
            Card / Apple Pay
          </button>
          <button
            onClick={() => setPaymentMethod("paypal")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-sm
                      transition-all ${paymentMethod === "paypal"
                ? "bg-accent text-surface"
                : "bg-surface-200 text-neutral-400 border border-surface-300"
              }`}
          >
            <FaPaypal className="w-4 h-4" />
            PayPal
          </button>
        </div>

        {/* Payment Form */}
        <div className="bg-surface-100 border border-surface-300 rounded-xl p-6">
          {paymentMethod === "stripe" && (
            <>
              {!clientSecret ? (
                <button
                  onClick={initializeStripePayment}
                  disabled={loading || !email}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <HiLockClosed className="w-4 h-4" />
                  {loading ? "Initializing..." : "Continue to Payment"}
                </button>
              ) : (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: "night",
                      variables: {
                        colorPrimary: "#c8ff00",
                        colorBackground: "#1a1a1f",
                        colorText: "#e5e5e5",
                        colorTextSecondary: "#737373",
                        borderRadius: "8px",
                        fontFamily: "DM Sans, system-ui, sans-serif",
                      },
                    },
                  }}
                >
                  <StripeCheckoutForm email={email} customerName={customerName} />
                </Elements>
              )}
            </>
          )}

          {paymentMethod === "paypal" && (
            <PayPalScriptProvider
              options={{
                clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
                currency: "USD",
              }}
            >
              <PayPalButtons
                style={{
                  color: "black",
                  shape: "rect",
                  label: "pay",
                  height: 48,
                }}
                createOrder={handlePayPalCreateOrder}
                onApprove={handlePayPalApprove}
                onError={() => toast.error("PayPal error occurred")}
              />
            </PayPalScriptProvider>
          )}
        </div>

        <p className="text-xs text-neutral-600 text-center mt-4 flex items-center justify-center gap-1">
          <HiLockClosed className="w-3 h-3" />
          Secured with 256-bit SSL encryption
        </p>
      </div>
    </div>
  );
}
