"use client";

import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import GlobalPlayer from "@/components/player/GlobalPlayer";
import { useCartStore } from "@/hooks/use-cart";
import { HiXMark, HiArrowLeft, HiShoppingBag } from "react-icons/hi2";
export const dynamic = "force-dynamic";

export default function CartPage() {
  const { items, removeItem, getTotal } = useCartStore();
  const total = getTotal();

  return (
    <div className="min-h-screen">
      <Header />

      <div className="pt-24 pb-32 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/" className="text-neutral-400 hover:text-neutral-200 transition-colors">
            <HiArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-display font-bold text-2xl text-neutral-50">Your Cart</h1>
          <span className="text-sm text-neutral-500">({items.length} items)</span>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <HiShoppingBag className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
            <p className="text-neutral-400 font-display text-lg mb-2">Cart is empty</p>
            <p className="text-neutral-600 text-sm mb-6">Browse beats and add them to your cart.</p>
            <Link href="/" className="btn-primary inline-block">
              Browse Beats
            </Link>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-3 mb-8">
              {items.map((item) => (
                <div
                  key={item.beat.id}
                  className="flex items-center gap-4 p-4 bg-surface-100 border border-surface-300
                           rounded-xl transition-all hover:border-surface-400"
                >
                  <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 relative">
                    <Image
                      src={item.beat.artworkUrl}
                      alt={item.beat.title}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-neutral-100 text-sm truncate">
                      {item.beat.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="tag text-[10px]">{item.licenseType}</span>
                      <span className="text-xs text-neutral-500">
                        {item.beat.bpm} BPM / {item.beat.key}
                      </span>
                    </div>
                  </div>

                  <span className="font-display font-bold text-accent">
                    ${item.price.toFixed(2)}
                  </span>

                  <button
                    onClick={() => removeItem(item.beat.id)}
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400
                             hover:bg-red-400/10 transition-all"
                  >
                    <HiXMark className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-surface-100 border border-surface-300 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <span className="text-neutral-400">Total</span>
                <span className="font-display font-bold text-2xl text-accent">
                  ${total.toFixed(2)}
                </span>
              </div>

              <Link
                href="/checkout"
                className="btn-primary block text-center w-full"
              >
                Proceed to Checkout
              </Link>

              <p className="text-xs text-neutral-600 text-center mt-4">
                Secure payment via Stripe or PayPal. Instant download after purchase.
              </p>
            </div>
          </>
        )}
      </div>

      <GlobalPlayer />
    </div>
  );
}
