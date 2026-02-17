import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Generate admin password hash
  const adminHash = await bcrypt.hash("changeme123", 12);
  console.log(`\nAdmin password hash (add to .env as ADMIN_PASSWORD_HASH):\n${adminHash}\n`);

  // Demo beats (using placeholder artwork URLs)
  const beats = [
    {
      title: "Midnight Drive",
      slug: "midnight-drive",
      bpm: 140,
      key: "C Minor",
      genre: "Trap",
      tags: ["dark", "melodic", "atmospheric"],
      price: 29.99,
      exclusivePrice: 299.99,
      artworkUrl: "https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/nature-mountains",
      artworkPublicId: "demo",
      mp3Url: "https://res.cloudinary.com/demo/video/upload/v1/samples/sea-waves.mp3",
      mp3PublicId: "demo-mp3",
      wavUrl: "https://res.cloudinary.com/demo/video/upload/v1/samples/sea-waves.mp3",
      wavPublicId: "demo-wav",
      previewUrl: "https://res.cloudinary.com/demo/video/upload/v1/samples/sea-waves.mp3",
      duration: 180,
    },
    {
      title: "Neon Glow",
      slug: "neon-glow",
      bpm: 128,
      key: "A Minor",
      genre: "R&B",
      tags: ["smooth", "vibes", "guitar"],
      price: 34.99,
      exclusivePrice: 349.99,
      artworkUrl: "https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/architecture-signs",
      artworkPublicId: "demo",
      mp3Url: "https://res.cloudinary.com/demo/video/upload/v1/samples/sea-waves.mp3",
      mp3PublicId: "demo-mp3",
      wavUrl: "https://res.cloudinary.com/demo/video/upload/v1/samples/sea-waves.mp3",
      wavPublicId: "demo-wav",
      previewUrl: "https://res.cloudinary.com/demo/video/upload/v1/samples/sea-waves.mp3",
      duration: 210,
    },
    {
      title: "Ghost Protocol",
      slug: "ghost-protocol",
      bpm: 145,
      key: "F# Minor",
      genre: "Drill",
      tags: ["hard", "aggressive", "808"],
      price: 24.99,
      exclusivePrice: 249.99,
      artworkUrl: "https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/beach-boat",
      artworkPublicId: "demo",
      mp3Url: "https://res.cloudinary.com/demo/video/upload/v1/samples/sea-waves.mp3",
      mp3PublicId: "demo-mp3",
      wavUrl: "https://res.cloudinary.com/demo/video/upload/v1/samples/sea-waves.mp3",
      wavPublicId: "demo-wav",
      previewUrl: "https://res.cloudinary.com/demo/video/upload/v1/samples/sea-waves.mp3",
      duration: 165,
    },
    {
      title: "Purple Haze",
      slug: "purple-haze",
      bpm: 90,
      key: "D Minor",
      genre: "Lo-fi",
      tags: ["chill", "lofi", "piano"],
      price: 19.99,
      exclusivePrice: 199.99,
      artworkUrl: "https://res.cloudinary.com/demo/image/upload/v1/samples/food/dessert",
      artworkPublicId: "demo",
      mp3Url: "https://res.cloudinary.com/demo/video/upload/v1/samples/sea-waves.mp3",
      mp3PublicId: "demo-mp3",
      wavUrl: "https://res.cloudinary.com/demo/video/upload/v1/samples/sea-waves.mp3",
      wavPublicId: "demo-wav",
      previewUrl: "https://res.cloudinary.com/demo/video/upload/v1/samples/sea-waves.mp3",
      duration: 195,
    },
  ];

  for (const beat of beats) {
    await prisma.beat.upsert({
      where: { slug: beat.slug },
      update: beat,
      create: beat,
    });
  }

  console.log(`Seeded ${beats.length} demo beats.`);
  console.log("Done!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
