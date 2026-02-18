"use client";

import Link from "next/link";
import { useState } from "react";
import { useCartStore } from "@/hooks/use-cart";
import { HiOutlineShoppingBag, HiOutlineBars3, HiXMark } from "react-icons/hi2";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const itemCount = useCartStore((s) => s.getItemCount());

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center
                          group-hover:scale-105 transition-transform">
              <span className="font-display font-bold text-surface text-sm">Tj</span>
            </div>
            <span className="font-display font-bold text-lg text-neutral-50 tracking-tight">
              TjProduced<span className="text-accent">It</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-sm font-medium text-neutral-400 hover:text-neutral-100 transition-colors"
            >
              Beats
            </Link>
            <Link
              href="/#licenses"
              className="text-sm font-medium text-neutral-400 hover:text-neutral-100 transition-colors"
            >
              Licenses
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link
              href="/cart"
              className="relative p-2 text-neutral-400 hover:text-neutral-100 transition-colors"
            >
              <HiOutlineShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent text-surface
                               text-[10px] font-bold rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Mobile toggle */}
            <button
              className="md:hidden p-2 text-neutral-400"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <HiXMark className="w-5 h-5" />
              ) : (
                <HiOutlineBars3 className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-surface-300 bg-surface-50">
          <nav className="px-4 py-4 flex flex-col gap-3">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-neutral-300 py-2"
            >
              Beats
            </Link>
            <Link
              href="/#licenses"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-neutral-300 py-2"
            >
              Licenses
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
