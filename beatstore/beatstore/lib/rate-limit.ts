import { RateLimiterMemory } from "rate-limiter-flexible";
import { NextRequest, NextResponse } from "next/server";

// General API rate limiter
const apiLimiter = new RateLimiterMemory({
  points: 100,
  duration: 900, // per 15 minutes
});

// Strict limiter for auth endpoints: 3 attempts per 30 minutes
const authLimiter = new RateLimiterMemory({
  points: 3,
  duration: 1800,
});

// Download limiter
const downloadLimiter = new RateLimiterMemory({
  points: 10,
  duration: 3600, // per hour
});

// Track consecutive failed login attempts per IP for lockout
const failedAttempts = new Map<string, { count: number; lockedUntil: number }>();
const MAX_FAILED = 5;
const LOCKOUT_MS = 30 * 60 * 1000; // 30 minutes

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function recordFailedLogin(req: NextRequest): void {
  const ip = getClientIp(req);
  const record = failedAttempts.get(ip) || { count: 0, lockedUntil: 0 };
  record.count += 1;
  if (record.count >= MAX_FAILED) {
    record.lockedUntil = Date.now() + LOCKOUT_MS;
  }
  failedAttempts.set(ip, record);
}

export function clearFailedLogins(req: NextRequest): void {
  const ip = getClientIp(req);
  failedAttempts.delete(ip);
}

export function isLockedOut(req: NextRequest): boolean {
  const ip = getClientIp(req);
  const record = failedAttempts.get(ip);
  if (!record) return false;
  if (record.lockedUntil > Date.now()) return true;
  // Lockout expired, clear it
  if (record.lockedUntil > 0 && record.lockedUntil <= Date.now()) {
    failedAttempts.delete(ip);
  }
  return false;
}

export async function rateLimit(
  req: NextRequest,
  type: "api" | "auth" | "download" = "api"
): Promise<NextResponse | null> {
  const ip = getClientIp(req);

  // Check lockout for auth requests
  if (type === "auth" && isLockedOut(req)) {
    return NextResponse.json(
      { error: "Account locked. Try again in 30 minutes." },
      { status: 429 }
    );
  }

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
