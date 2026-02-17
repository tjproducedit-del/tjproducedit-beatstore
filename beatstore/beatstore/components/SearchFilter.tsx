"use client";

import { useState, useEffect, useCallback } from "react";
import { HiMagnifyingGlass, HiXMark } from "react-icons/hi2";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

const GENRES = [
  "All",
  "Trap",
  "Hip Hop",
  "R&B",
  "Drill",
  "Pop",
  "Lo-fi",
  "Afrobeat",
  "Reggaeton",
];

export default function SearchFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [genre, setGenre] = useState(searchParams.get("genre") || "All");

  const updateParams = useCallback(
    (q: string, g: string) => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (g && g !== "All") params.set("genre", g);
      const qs = params.toString();
      router.push(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, pathname]
  );

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      updateParams(search, genre);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, genre, updateParams]);

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      {/* Search Input */}
      <div className="relative flex-1 w-full sm:max-w-md">
        <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search beats..."
          className="input pl-10 pr-9"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
          >
            <HiXMark className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Genre Filter */}
      <div className="flex gap-2 flex-wrap">
        {GENRES.map((g) => (
          <button
            key={g}
            onClick={() => setGenre(g)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              genre === g
                ? "bg-accent text-surface"
                : "bg-surface-200 text-neutral-400 border border-surface-300 hover:border-surface-400 hover:text-neutral-200"
            }`}
          >
            {g}
          </button>
        ))}
      </div>
    </div>
  );
}
