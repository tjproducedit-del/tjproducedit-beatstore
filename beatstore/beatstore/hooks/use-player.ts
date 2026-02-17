"use client";

import { create } from "zustand";
import type { Beat } from "@/types";

interface PlayerStore {
  currentBeat: Beat | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  audio: HTMLAudioElement | null;

  play: (beat: Beat) => void;
  pause: () => void;
  toggle: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  setProgress: (p: number) => void;
  setDuration: (d: number) => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentBeat: null,
  isPlaying: false,
  progress: 0,
  duration: 0,
  volume: 0.8,
  audio: null,

  play: (beat) => {
    const state = get();
    let audio = state.audio;

    if (state.currentBeat?.id === beat.id && audio) {
      audio.play();
      set({ isPlaying: true });
      return;
    }

    // Stop existing audio
    if (audio) {
      audio.pause();
      audio.src = "";
    }

    audio = new Audio(beat.previewUrl);
    audio.volume = state.volume;

    audio.addEventListener("timeupdate", () => {
      set({ progress: audio!.currentTime });
    });

    audio.addEventListener("loadedmetadata", () => {
      set({ duration: audio!.duration });
    });

    audio.addEventListener("ended", () => {
      set({ isPlaying: false, progress: 0 });
    });

    audio.play();
    set({ audio, currentBeat: beat, isPlaying: true, progress: 0 });

    // Track play count
    fetch(`/api/beats/${beat.id}/play`, { method: "POST" }).catch(() => {});
  },

  pause: () => {
    get().audio?.pause();
    set({ isPlaying: false });
  },

  toggle: () => {
    const { isPlaying, currentBeat } = get();
    if (!currentBeat) return;
    if (isPlaying) get().pause();
    else get().play(currentBeat);
  },

  seek: (time) => {
    const audio = get().audio;
    if (audio) {
      audio.currentTime = time;
      set({ progress: time });
    }
  },

  setVolume: (vol) => {
    const audio = get().audio;
    if (audio) audio.volume = vol;
    set({ volume: vol });
  },

  setProgress: (p) => set({ progress: p }),
  setDuration: (d) => set({ duration: d }),
}));
