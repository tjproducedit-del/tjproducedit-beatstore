import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;

export async function uploadBeatFile(
  buffer: Buffer,
  folder: string,
  resourceType: "video" | "image" | "raw" = "video"
) {
  return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `beatstore/${folder}`,
        resource_type: resourceType,
        // Prevent public access -- use signed URLs
        type: "authenticated",
        access_mode: "authenticated",
      },
      (error, result) => {
        if (error || !result) return reject(error || new Error("Upload failed"));
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    uploadStream.end(buffer);
  });
}

export async function uploadArtwork(buffer: Buffer) {
  return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "beatstore/artwork",
        resource_type: "image",
        transformation: [
          { width: 500, height: 500, crop: "fill", quality: "auto" },
        ],
      },
      (error, result) => {
        if (error || !result) return reject(error || new Error("Upload failed"));
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    uploadStream.end(buffer);
  });
}

export async function uploadPreview(buffer: Buffer) {
  // Preview is a short tagged/watermarked clip for the public player
  return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "beatstore/previews",
        resource_type: "video",
        // Previews are public for streaming
        type: "upload",
      },
      (error, result) => {
        if (error || !result) return reject(error || new Error("Upload failed"));
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    uploadStream.end(buffer);
  });
}

export function getSignedDownloadUrl(publicId: string, resourceType: string) {
  // Generate a time-limited signed URL for secure download
  const expiresAt = Math.floor(Date.now() / 1000) + 3600; // 1 hour
  return cloudinary.utils.private_download_url(publicId, "mp3", {
    resource_type: resourceType,
    type: "authenticated",
    expires_at: expiresAt,
    attachment: true,
  });
}
