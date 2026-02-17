"use client";

import BeatCard from "./BeatCard";
import type { Beat } from "@/types";

interface BeatGridProps {
  beats: Beat[];
}

export default function BeatGrid({ beats }: BeatGridProps) {
  if (beats.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-neutral-500 text-lg font-display">No beats found</p>
        <p className="text-neutral-600 text-sm mt-2">
          Try adjusting your search or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {beats.map((beat) => (
        <BeatCard key={beat.id} beat={beat} />
      ))}
    </div>
  );
}
