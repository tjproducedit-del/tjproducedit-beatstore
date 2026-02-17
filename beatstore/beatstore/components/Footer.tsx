import Link from "next/link";
import { HiOutlineEnvelope } from "react-icons/hi2";
import { FaInstagram, FaYoutube, FaSoundcloud } from "react-icons/fa";

export default function Footer() {
  return (
    <footer id="contact" className="border-t border-surface-300 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <span className="font-display font-bold text-surface text-sm">V</span>
              </div>
              <span className="font-display font-bold text-lg text-neutral-50">
                VOID<span className="text-accent">BEATS</span>
              </span>
            </div>
            <p className="text-sm text-neutral-500 leading-relaxed max-w-xs">
              Premium beats and instrumentals crafted for artists who demand quality.
              Instant delivery after purchase.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display font-semibold text-neutral-200 text-sm uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <div className="flex flex-col gap-2">
              <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors">
                Browse Beats
              </Link>
              <Link href="/#licenses" className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors">
                License Info
              </Link>
              <Link href="/cart" className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors">
                Cart
              </Link>
            </div>
          </div>

          {/* Socials */}
          <div>
            <h4 className="font-display font-semibold text-neutral-200 text-sm uppercase tracking-wider mb-4">
              Connect
            </h4>
            <div className="flex gap-3 mb-4">
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-surface-200 border border-surface-300
                         flex items-center justify-center text-neutral-400 hover:text-accent
                         hover:border-accent/30 transition-all"
              >
                <FaInstagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-surface-200 border border-surface-300
                         flex items-center justify-center text-neutral-400 hover:text-accent
                         hover:border-accent/30 transition-all"
              >
                <FaYoutube className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-surface-200 border border-surface-300
                         flex items-center justify-center text-neutral-400 hover:text-accent
                         hover:border-accent/30 transition-all"
              >
                <FaSoundcloud className="w-4 h-4" />
              </a>
            </div>
            <a
              href="mailto:contact@voidbeats.com"
              className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              <HiOutlineEnvelope className="w-4 h-4" />
              contact@voidbeats.com
            </a>
          </div>
        </div>

        <div className="border-t border-surface-300 mt-12 pt-8 text-center">
          <p className="text-xs text-neutral-600">
            &copy; {new Date().getFullYear()} VOIDBEATS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
