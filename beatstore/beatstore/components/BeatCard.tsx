"use client";

import Image from "next/image";
import { useState } from "react";
import { HiPlay, HiPause, HiShoppingCart } from "react-icons/hi2";
import { usePlayerStore } from "@/hooks/use-player";
import { useCartStore } from "@/hooks/use-cart";
import LicenseModal from "./LicenseModal";
import type { Beat } from "@/types";
import toast from "react-hot-toast";

interface BeatCardProps {
  beat: Beat;
}

export default function BeatCard({ beat }: BeatCardProps) {
  const [showLicense, setShowLicense] = useState(false);
  const { currentBeat, isPlaying, play, pause } = usePlayerStore();
  const addItem = useCartStore((s) => s.addItem);

  const isCurrentBeat = currentBeat?.id === beat.id;
  const isThisPlaying = isCurrentBeat && isPlaying;

  const handlePlay = () => {
    if (isThisPlaying) {
      pause();
    } else {
      play(beat);
    }
  };

  const handleQuickAdd = () => {
    addItem(beat, "BASIC", beat.price);
    toast.success(`"${beat.title}" added to cart`);
  };

  return (
    <>
      <div className="card group">
        {/* Artwork */}
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={beat.artworkUrl}
            alt={beat.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />

          {/* Play overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300
                        flex items-center justify-center">
            <button
              onClick={handlePlay}
              className="w-14 h-14 rounded-full bg-accent text-surface flex items-center justify-center
                       opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100
                       transition-all duration-300 hover:brightness-110"
            >
              {isThisPlaying ? (
                <HiPause className="w-6 h-6" />
              ) : (
                <HiPlay className="w-6 h-6 ml-0.5" />
              )}
            </button>
          </div>

          {/* Playing indicator */}
          {isThisPlaying && (
            <div className="absolute top-3 left-3">
              <div className="flex items-end gap-[2px] h-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-[3px] bg-accent rounded-full animate-pulse-glow"
                    style={{
                      height: `${8 + Math.random() * 8}px`,
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Sold badge */}
          {beat.isSold && (
            <div className="absolute top-3 right-3 px-2 py-1 bg-red-500/90 rounded text-xs font-bold text-white">
              SOLD
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-display font-semibold text-neutral-100 text-sm truncate mb-1">
            {beat.title}
          </h3>

          {/* Tags */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="tag">{beat.bpm} BPM</span>
            <span className="tag">{beat.key}</span>
            <span className="tag">{beat.genre}</span>
          </div>

          {/* Price and actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowLicense(true)}
              className="font-display font-bold text-accent text-lg hover:underline"
            >
              ${beat.price}
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePlay}
                className="p-2 rounded-lg text-neutral-400 hover:text-neutral-100
                         hover:bg-surface-200 transition-all"
              >
                {isThisPlaying ? (
                  <HiPause className="w-4 h-4" />
                ) : (
                  <HiPlay className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={handleQuickAdd}
                disabled={beat.isSold}
                className="p-2 rounded-lg text-neutral-400 hover:text-accent
                         hover:bg-accent/10 transition-all disabled:opacity-30"
              >
                <HiShoppingCart className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* License Selection Modal */}
      {showLicense && (
        <LicenseModal beat={beat} onClose={() => setShowLicense(false)} />
      )}
    </>
  );
}
