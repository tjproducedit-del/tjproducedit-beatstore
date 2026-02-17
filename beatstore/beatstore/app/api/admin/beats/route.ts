import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdminRequest } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  if (!(await verifyAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const beats = await db.beat.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { orderItems: true } },
      },
    });
    return NextResponse.json(beats);
  } catch (error) {
    console.error("Admin GET beats error:", error);
    return NextResponse.json({ error: "Failed to fetch beats" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await rateLimit(req);
  if (limited) return limited;

  try {
    const body = await req.json();

    const {
      title,
      bpm,
      key,
      genre,
      tags,
      price,
      exclusivePrice,
      artworkUrl,
      artworkPublicId,
      mp3Url,
      mp3PublicId,
      wavUrl,
      wavPublicId,
      previewUrl,
      duration,
    } = body;

    // Validate required fields
    if (!title || !bpm || !key || !genre || !price) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate slug
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Check slug uniqueness
    const existing = await db.beat.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const beat = await db.beat.create({
      data: {
        title,
        slug: finalSlug,
        bpm: Number(bpm),
        key,
        genre,
        tags: tags || [],
        price: Number(price),
        exclusivePrice: exclusivePrice ? Number(exclusivePrice) : null,
        artworkUrl,
        artworkPublicId: artworkPublicId || "",
        mp3Url,
        mp3PublicId: mp3PublicId || "",
        wavUrl,
        wavPublicId: wavPublicId || "",
        previewUrl: previewUrl || mp3Url,
        duration: duration || 0,
      },
    });

    return NextResponse.json(beat, { status: 201 });
  } catch (error) {
    console.error("Admin POST beat error:", error);
    return NextResponse.json(
      { error: "Failed to create beat" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await verifyAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await req.json();
    await db.beat.update({
      where: { id },
      data: { isActive: false },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin DELETE beat error:", error);
    return NextResponse.json(
      { error: "Failed to delete beat" },
      { status: 500 }
    );
  }
}
