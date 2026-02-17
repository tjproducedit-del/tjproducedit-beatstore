import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/auth";
import { uploadBeatFile, uploadArtwork, uploadPreview } from "@/lib/cloudinary";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  if (!(await verifyAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await rateLimit(req);
  if (limited) return limited;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string; // "mp3" | "wav" | "artwork" | "preview"

    if (!file || !type) {
      return NextResponse.json(
        { error: "File and type are required" },
        { status: 400 }
      );
    }

    // Validate file types
    const allowedTypes: Record<string, string[]> = {
      mp3: ["audio/mpeg", "audio/mp3"],
      wav: ["audio/wav", "audio/wave", "audio/x-wav"],
      artwork: ["image/jpeg", "image/png", "image/webp"],
      preview: ["audio/mpeg", "audio/mp3"],
    };

    if (!allowedTypes[type]?.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type for ${type}` },
        { status: 400 }
      );
    }

    // Size limits
    const maxSize: Record<string, number> = {
      mp3: 50 * 1024 * 1024, // 50MB
      wav: 200 * 1024 * 1024, // 200MB
      artwork: 10 * 1024 * 1024, // 10MB
      preview: 20 * 1024 * 1024, // 20MB
    };

    if (file.size > maxSize[type]) {
      return NextResponse.json(
        { error: `File too large. Max ${maxSize[type] / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    let result;
    switch (type) {
      case "mp3":
        result = await uploadBeatFile(buffer, "mp3", "video");
        break;
      case "wav":
        result = await uploadBeatFile(buffer, "wav", "video");
        break;
      case "artwork":
        result = await uploadArtwork(buffer);
        break;
      case "preview":
        result = await uploadPreview(buffer);
        break;
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json({
      url: result.url,
      publicId: result.publicId,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}

// Increase body size limit for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};
