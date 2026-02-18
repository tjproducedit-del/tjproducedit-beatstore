import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // --- Block admin page access without secret key ---
  if (pathname === "/admin") {
    const accessKey = searchParams.get("key");
    const secretPath = process.env.ADMIN_SECRET_PATH;

    // If no secret is configured or key doesn't match, return 404
    if (!secretPath || accessKey !== secretPath) {
      return new NextResponse("Not Found", { status: 404 });
    }
  }

  // --- Protect admin API routes (except auth) ---
  if (pathname.startsWith("/api/admin") && !pathname.startsWith("/api/admin/auth")) {
    const token = req.cookies.get("admin_session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await verifySessionToken(token);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // --- Security headers on all responses ---
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  return response;
}

export const config = {
  matcher: ["/admin", "/api/admin/:path*"],
};
