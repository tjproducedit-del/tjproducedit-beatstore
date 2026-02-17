import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const limited = await rateLimit(req);
  if (limited) return limited;

  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || undefined;
    const genre = searchParams.get("genre") || undefined;

    const where: Record<string, unknown> = { isActive: true };

    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { tags: { has: q.toLowerCase() } },
      ];
    }
    if (genre) {
      where.genre = { equals: genre, mode: "insensitive" };
    }

    const beats = await db.beat.findMany({
      where: where as any,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        bpm: true,
        key: true,
        genre: true,
        tags: true,
        price: true,
        exclusivePrice: true,
        licenseType: true,
        artworkUrl: true,
        previewUrl: true,
        duration: true,
        plays: true,
        isActive: true,
        isSold: true,
        createdAt: true,
        // Never expose mp3Url or wavUrl to the client
      },
    });

    return NextResponse.json(beats);
  } catch (error) {
    console.error("GET /api/beats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch beats" },
      { status: 500 }
    );
  }
}
