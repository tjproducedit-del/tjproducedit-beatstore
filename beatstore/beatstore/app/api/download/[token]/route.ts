import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import cloudinary from "@/lib/cloudinary";
export const dynamic = "force-dynamic";
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  // Rate limit downloads
  const limited = await rateLimit(req, "download");
  if (limited) return limited;

  try {
    const { token } = await params;

    // Find order by download token
    const order = await db.order.findUnique({
      where: { downloadToken: token },
      include: {
        items: {
          include: { beat: true },
        },
      },
    });

    // Validate
    if (!order) {
      return NextResponse.json(
        { error: "Invalid download link" },
        { status: 404 }
      );
    }

    if (order.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Order has not been completed" },
        { status: 403 }
      );
    }

    if (new Date() > new Date(order.tokenExpiresAt)) {
      return NextResponse.json(
        { error: "Download link has expired" },
        { status: 410 }
      );
    }

    if (order.downloadCount >= order.maxDownloads) {
      return NextResponse.json(
        { error: "Maximum downloads reached" },
        { status: 429 }
      );
    }

    // Increment download count
    await db.order.update({
      where: { id: order.id },
      data: { downloadCount: { increment: 1 } },
    });

    // Generate signed download URLs for each beat
    const downloads = order.items.map((item) => {
      const beat = item.beat;
      const isPremiumOrExclusive =
        item.licenseType === "PREMIUM" || item.licenseType === "EXCLUSIVE";

      // Generate time-limited signed Cloudinary URL
      const expiresAt = Math.floor(Date.now() / 1000) + 3600; // 1 hour

      const urls: { format: string; url: string }[] = [];

      // MP3 always included
      urls.push({
        format: "mp3",
        url: cloudinary.url(beat.mp3PublicId, {
          resource_type: "video",
          type: "authenticated",
          sign_url: true,
          expires_at: expiresAt,
          flags: "attachment",
        }),
      });

      // WAV for Premium/Exclusive
      if (isPremiumOrExclusive) {
        urls.push({
          format: "wav",
          url: cloudinary.url(beat.wavPublicId, {
            resource_type: "video",
            type: "authenticated",
            sign_url: true,
            expires_at: expiresAt,
            flags: "attachment",
          }),
        });
      }

      return {
        title: beat.title,
        licenseType: item.licenseType,
        files: urls,
      };
    });

    // Return download page data (or redirect for single file)
    return NextResponse.json({
      order: {
        id: order.id,
        email: order.email,
        downloadsRemaining: order.maxDownloads - order.downloadCount,
      },
      downloads,
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "Download failed" },
      { status: 500 }
    );
  }
}
