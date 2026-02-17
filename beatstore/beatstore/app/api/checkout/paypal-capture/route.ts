import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { capturePayPalOrder } from "@/lib/paypal";
import { rateLimit } from "@/lib/rate-limit";
import { fulfillOrder } from "../../webhooks/stripe/fulfill";

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req);
  if (limited) return limited;

  try {
    const { paypalOrderId, orderId } = await req.json();

    if (!paypalOrderId || !orderId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Capture the payment
    const captureData = await capturePayPalOrder(paypalOrderId);

    if (captureData.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      );
    }

    // Fulfill the order (same logic as Stripe webhook)
    await fulfillOrder(orderId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PayPal capture error:", error);
    return NextResponse.json(
      { error: "Failed to capture payment" },
      { status: 500 }
    );
  }
}
