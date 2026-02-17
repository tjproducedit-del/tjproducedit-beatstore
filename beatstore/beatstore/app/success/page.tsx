"use client";

import Link from "next/link";
import Header from "@/components/Header";
import { HiCheckCircle, HiEnvelope, HiArrowDownTray } from "react-icons/hi2";

export default function SuccessPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <div className="pt-28 pb-20 px-4 sm:px-6 max-w-lg mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
          <HiCheckCircle className="w-8 h-8 text-accent" />
        </div>

        <h1 className="font-display font-bold text-3xl text-neutral-50 mb-3">
          Payment Successful
        </h1>

        <p className="text-neutral-400 mb-8 leading-relaxed">
          Your beats are ready. Check your email for the download link
          and license agreement.
        </p>

        <div className="bg-surface-100 border border-surface-300 rounded-xl p-6 mb-8 text-left">
          <h2 className="font-display font-semibold text-neutral-200 text-sm mb-4">
            What happens next
          </h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <HiEnvelope className="w-4 h-4 text-accent" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-200">Check your email</p>
                <p className="text-xs text-neutral-500">
                  A download link and license PDF have been sent to your email.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <HiArrowDownTray className="w-4 h-4 text-accent" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-200">Download your files</p>
                <p className="text-xs text-neutral-500">
                  The link expires in 7 days with up to 5 downloads.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Link href="/" className="btn-secondary inline-block">
          Back to Beats
        </Link>
      </div>
    </div>
  );
}
