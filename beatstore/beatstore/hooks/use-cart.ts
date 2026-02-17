"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Beat, CartItem, LicenseType } from "@/types";

interface CartStore {
  items: CartItem[];
  addItem: (beat: Beat, licenseType: LicenseType, price: number) => void;
  removeItem: (beatId: string) => void;
  updateLicense: (beatId: string, licenseType: LicenseType, price: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (beat, licenseType, price) => {
        const exists = get().items.find((item) => item.beat.id === beat.id);
        if (exists) return;
        set((state) => ({
          items: [...state.items, { beat, licenseType, price }],
        }));
      },

      removeItem: (beatId) => {
        set((state) => ({
          items: state.items.filter((item) => item.beat.id !== beatId),
        }));
      },

      updateLicense: (beatId, licenseType, price) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.beat.id === beatId ? { ...item, licenseType, price } : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotal: () =>
        get().items.reduce((sum, item) => sum + item.price, 0),

      getItemCount: () => get().items.length,
    }),
    {
      name: "beat-cart",
      storage: createJSONStorage(() => {
        if (typeof window !== "undefined") return localStorage;
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
    }
  )
);
