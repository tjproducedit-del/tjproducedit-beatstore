import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createPaymentIntent } from "@/lib/stripe";
import { createPayPalOrder } from "@/lib/paypal";
import { rateLimit } from "@/lib/rate-limit";

interface CheckoutItem {
  beatId: string;
  licenseType: "BASIC" | "PREMIUM" | "EXCLUSIVE";
  price: number;
}

interface CheckoutBody {
  items: CheckoutItem[];
  email: string;
  customerName?: string;
  paymentMethod: "stripe" | "paypal";
}

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req);
  if (limited) return limited;

  try {
    const body: CheckoutBody = await req.json();
    const { items, email, customerName, paymentMethod } = body;

    // Validate input
    if (!items?.length || !email || !paymentMethod) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Verify beats exist and prices match server-side
    const beatIds = items.map((i) => i.beatId);
    const beats = await db.beat.findMany({
      where: { id: { in: beatIds }, isActive: true },
    });

    if (beats.length !== items.length) {
      return NextResponse.json(
        { error: "One or more beats are unavailable" },
        { status: 400 }
      );
    }

    // Server-side price calculation (never trust client prices)
    let total = 0;
    const verifiedItems = items.map((item) => {
      const beat = beats.find((b) => b.id === item.beatId)!;
      let serverPrice: number;

      switch (item.licenseType) {
        case "BASIC":
          serverPrice = beat.price;
          break;
        case "PREMIUM":
          serverPrice = beat.price * 2;
          break;
        case "EXCLUSIVE":
          serverPrice = beat.exclusivePrice || beat.price * 10;
          break;
        default:
          throw new Error("Invalid license type");
      }

      total += serverPrice;
      return { ...item, price: serverPrice };
    });

    // Create order in database
    const tokenExpiry = new Date();
    tokenExpiry.setDate(tokenExpiry.getDate() + 7); // 7 day expiry

    // We'll set the real paymentId after creating the payment
    const order = await db.order.create({
      data: {
        email,
        customerName: customerName || null,
        total,
        status: "PENDING",
        paymentProvider: paymentMethod === "stripe" ? "STRIPE" : "PAYPAL",
        paymentId: `pending_${Date.now()}`, // temporary, updated after payment creation
        tokenExpiresAt: tokenExpiry,
        items: {
          create: verifiedItems.map((item) => ({
            beatId: item.beatId,
            price: item.price,
            licenseType: item.licenseType,
          })),
        },
      },
    });

    if (paymentMethod === "stripe") {
      const paymentIntent = await createPaymentIntent(total, {
        orderId: order.id,
        email,
      });

      // Update order with real payment ID
      await db.order.update({
        where: { id: order.id },
        data: { paymentId: paymentIntent.id },
      });

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        orderId: order.id,
      });
    }

    if (paymentMethod === "paypal") {
      const paypalOrder = await createPayPalOrder(total, {
        orderId: order.id,
      });

      await db.order.update({
        where: { id: order.id },
        data: { paymentId: paypalOrder.id },
      });

      return NextResponse.json({
        paypalOrderId: paypalOrder.id,
        orderId: order.id,
      });
    }

    return NextResponse.json(
      { error: "Invalid payment method" },
      { status: 400 }
    );
  } catch (error) {
    console.error("POST /api/checkout error:", error);
    return NextResponse.json(
      { error: "Checkout failed. Please try again." },
      { status: 500 }
    );
  }
}
