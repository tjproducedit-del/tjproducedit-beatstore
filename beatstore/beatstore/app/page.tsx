import { Suspense } from "react";
import { db } from "@/lib/db";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchFilter from "@/components/SearchFilter";
import BeatGrid from "@/components/BeatGrid";
import GlobalPlayer from "@/components/player/GlobalPlayer";
import { HiCheck, HiMusicalNote, HiShieldCheck, HiBolt } from "react-icons/hi2";

interface PageProps {
  searchParams: Promise<{ q?: string; genre?: string }>;
}

async function getBeats(q?: string, genre?: string) {
  const where: Record<string, unknown> = { isActive: true };

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { tags: { has: q.toLowerCase() } },
      { key: { contains: q, mode: "insensitive" } },
    ];
  }

  if (genre && genre !== "All") {
    where.genre = { equals: genre, mode: "insensitive" };
  }

  const beats = await db.beat.findMany({
    where: where as any,
    orderBy: { createdAt: "desc" },
  });

  return JSON.parse(JSON.stringify(beats));
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const beats = await getBeats(params.q, params.genre);

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-glow" />
            <span className="text-xs font-mono text-accent">New beats added weekly</span>
          </div>

          <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-neutral-50 leading-tight tracking-tight mb-6">
            Premium Beats for
            <br />
            <span className="text-gradient">Serious Artists</span>
          </h1>

          <p className="text-neutral-400 text-lg max-w-xl mx-auto mb-8 leading-relaxed">
            Exclusive instrumentals crafted with intention. Preview, license, and download
            instantly. Your next hit starts here.
          </p>

          <div className="flex items-center justify-center gap-6 text-sm text-neutral-500">
            <div className="flex items-center gap-2">
              <HiBolt className="w-4 h-4 text-accent" />
              Instant download
            </div>
            <div className="flex items-center gap-2">
              <HiShieldCheck className="w-4 h-4 text-accent" />
              Licensed & legal
            </div>
            <div className="flex items-center gap-2">
              <HiMusicalNote className="w-4 h-4 text-accent" />
              {beats.length}+ beats
            </div>
          </div>
        </div>
      </section>

      {/* Beats Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-8">
        <Suspense fallback={null}>
          <SearchFilter />
        </Suspense>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-24">
        <BeatGrid beats={beats} />
      </section>

      {/* License Info Section */}
      <section id="licenses" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-24">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-neutral-50 mb-3">
            Simple Licensing
          </h2>
          <p className="text-neutral-500 max-w-lg mx-auto">
            Choose the license that fits your project. Upgrade anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            {
              name: "Basic Lease",
              from: "$20",
              features: [
                "MP3 download (tagged)",
                "Up to 5,000 streams",
                "Non-exclusive rights",
                "Credit required",
              ],
            },
            {
              name: "Premium Lease",
              from: "$50",
              features: [
                "MP3 + WAV download",
                "Up to 50,000 streams",
                "Non-exclusive rights",
                "1 music video",
              ],
              popular: true,
            },
            {
              name: "Exclusive Rights",
              from: "$250",
              features: [
                "All file formats",
                "Unlimited streams",
                "Full exclusive rights",
                "Beat removed from store",
              ],
            },
          ].map((tier) => (
            <div
              key={tier.name}
              className={`rounded-xl border p-6 transition-all ${
                tier.popular
                  ? "border-accent/30 bg-accent/5 glow-sm relative"
                  : "border-surface-300 bg-surface-100"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-accent
                              text-surface text-xs font-display font-bold rounded-full">
                  Popular
                </div>
              )}
              <h3 className="font-display font-semibold text-neutral-100 mb-1">
                {tier.name}
              </h3>
              <p className="font-display font-bold text-2xl text-accent mb-4">
                {tier.from}
              </p>
              <ul className="space-y-2.5">
                {tier.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm text-neutral-400"
                  >
                    <HiCheck className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <Footer />
      <GlobalPlayer />
    </div>
  );
}
