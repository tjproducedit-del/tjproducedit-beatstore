import { RateLimiterMemory } from "rate-limiter-flexible";
import { NextRequest, NextResponse } from "next/server";

// General API rate limiter
const apiLimiter = new RateLimiterMemory({
  points: 100, // requests
  duration: 900, // per 15 minutes
});

// Strict limiter for auth endpoints
const authLimiter = new RateLimiterMemory({
  points: 5,
  duration: 900,
});

// Download limiter
const downloadLimiter = new RateLimiterMemory({
  points: 10,
  duration: 3600, // per hour
});

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function rateLimit(
  req: NextRequest,
  type: "api" | "auth" | "download" = "api"
): Promise<NextResponse | null> {
  const ip = getClientIp(req);
  const limiter =
    type === "auth"
      ? authLimiter
      : type === "download"
      ? downloadLimiter
      : apiLimiter;

  try {
    await limiter.consume(ip);
    return null; // allowed
  } catch {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }
}
