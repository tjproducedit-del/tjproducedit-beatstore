"use client";

import { HiXMark, HiCheck } from "react-icons/hi2";
import { useCartStore } from "@/hooks/use-cart";
import { LICENSE_OPTIONS } from "@/types";
import type { Beat, LicenseType } from "@/types";
import toast from "react-hot-toast";

interface LicenseModalProps {
  beat: Beat;
  onClose: () => void;
}

function getPriceForLicense(beat: Beat, type: LicenseType): number {
  switch (type) {
    case "BASIC":
      return beat.price;
    case "PREMIUM":
      return beat.price * 2;
    case "EXCLUSIVE":
      return beat.exclusivePrice || beat.price * 10;
  }
}

export default function LicenseModal({ beat, onClose }: LicenseModalProps) {
  const addItem = useCartStore((s) => s.addItem);

  const handleSelect = (type: LicenseType) => {
    const price = getPriceForLicense(beat, type);
    addItem(beat, type, price);
    toast.success(`"${beat.title}" (${type}) added to cart`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-surface-100 border border-surface-300 rounded-2xl w-full max-w-2xl max-h-[90vh]
                  overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-300">
          <div>
            <h2 className="font-display font-bold text-neutral-50 text-lg">
              Choose a License
            </h2>
            <p className="text-sm text-neutral-500 mt-1">{beat.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface-200 text-neutral-400 transition-colors"
          >
            <HiXMark className="w-5 h-5" />
          </button>
        </div>

        {/* License Options */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {LICENSE_OPTIONS.map((license) => {
            const price = getPriceForLicense(beat, license.type);
            const isExclusive = license.type === "EXCLUSIVE";
            const isSold = isExclusive && beat.isSold;

            return (
              <div
                key={license.type}
                className={`rounded-xl border p-5 transition-all ${
                  isExclusive
                    ? "border-accent/30 bg-accent/5"
                    : "border-surface-300 bg-surface-200"
                } ${isSold ? "opacity-50" : "hover:border-accent/40"}`}
              >
                <div className="mb-4">
                  <h3 className="font-display font-semibold text-neutral-100 text-sm">
                    {license.label}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    {license.description}
                  </p>
                </div>

                <div className="mb-4">
                  <span className="font-display font-bold text-2xl text-accent">
                    ${price}
                  </span>
                </div>

                <ul className="space-y-2 mb-6">
                  {license.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-xs text-neutral-400"
                    >
                      <HiCheck className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelect(license.type)}
                  disabled={isSold}
                  className={`w-full py-2.5 rounded-lg font-display font-semibold text-sm transition-all ${
                    isExclusive
                      ? "btn-primary"
                      : "btn-secondary"
                  }`}
                >
                  {isSold ? "Sold Out" : "Add to Cart"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
