import { NextRequest, NextResponse } from "next/server";
import {
  verifyUsername,
  verifyPassword,
  createSessionToken,
  setSessionCookie,
  clearSession,
} from "@/lib/auth";
import { rateLimit, recordFailedLogin, clearFailedLogins, isLockedOut } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Check lockout first
  if (isLockedOut(req)) {
    return NextResponse.json(
      { error: "Too many failed attempts. Try again in 30 minutes." },
      { status: 429 }
    );
  }

  const limited = await rateLimit(req, "auth");
  if (limited) return limited;

  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password required" },
        { status: 400 }
      );
    }

    const validUser = await verifyUsername(username);
    const validPass = await verifyPassword(password);

    if (!validUser || !validPass) {
      recordFailedLogin(req);
      // Intentionally vague error + delay to slow brute force
      await new Promise((r) => setTimeout(r, 1000 + Math.random() * 2000));
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Successful login - clear failed attempts
    clearFailedLogins(req);
    const token = await createSessionToken();
    await setSessionCookie(token);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  await clearSession();
  return NextResponse.json({ success: true });
}
