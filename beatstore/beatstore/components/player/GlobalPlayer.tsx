"use client";

import Image from "next/image";
import { usePlayerStore } from "@/hooks/use-player";
import {
  HiPlay,
  HiPause,
  HiSpeakerWave,
  HiSpeakerXMark,
} from "react-icons/hi2";

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function GlobalPlayer() {
  const {
    currentBeat,
    isPlaying,
    progress,
    duration,
    volume,
    toggle,
    seek,
    setVolume,
  } = usePlayerStore();

  if (!currentBeat) return null;

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-surface-300">
      {/* Progress bar (thin line at top) */}
      <div className="h-0.5 bg-surface-300 relative">
        <div
          className="absolute inset-y-0 left-0 bg-accent transition-all duration-100"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 h-16">
          {/* Beat info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 relative">
              <Image
                src={currentBeat.artworkUrl}
                alt={currentBeat.title}
                fill
                className="object-cover"
                sizes="40px"
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-neutral-100 truncate">
                {currentBeat.title}
              </p>
              <p className="text-xs text-neutral-500">
                {currentBeat.bpm} BPM / {currentBeat.key}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-500 font-mono w-10 text-right hidden sm:block">
              {formatTime(progress)}
            </span>

            <button
              onClick={toggle}
              className="w-10 h-10 rounded-full bg-accent text-surface flex items-center justify-center
                       hover:brightness-110 active:scale-95 transition-all"
            >
              {isPlaying ? (
                <HiPause className="w-5 h-5" />
              ) : (
                <HiPlay className="w-5 h-5 ml-0.5" />
              )}
            </button>

            <span className="text-xs text-neutral-500 font-mono w-10 hidden sm:block">
              {formatTime(duration)}
            </span>
          </div>

          {/* Seek bar */}
          <div className="hidden md:flex flex-1 items-center max-w-xs">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={progress}
              onChange={(e) => seek(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Volume */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
              className="text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              {volume === 0 ? (
                <HiSpeakerXMark className="w-4 h-4" />
              ) : (
                <HiSpeakerWave className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-20"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
