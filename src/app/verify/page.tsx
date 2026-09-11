"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  CheckBadgeIcon,
  SparklesIcon,
  BuildingLibraryIcon,
} from "@heroicons/react/24/solid";

export default function GlobalVerifyPortalPage() {
  const router = useRouter();
  const [certQuery, setCertQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = certQuery.trim();
    if (!clean) {
      setError("Please enter a valid certificate number or recipient name.");
      return;
    }

    setIsLoading(true);
    setError(null);

    // Format certificate ID or redirect to direct lookup
    router.push(`/verify/${encodeURIComponent(clean)}`);
  };

  return (
    <div className="min-h-screen bg-[#02001e] text-white flex flex-col justify-between selection:bg-[#c6f552] selection:text-[#040032]">
      {/* Background Ambient Glow */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#3fffe8]/10 via-[#c6f552]/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Header */}
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between p-4 sm:p-6">
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-mono font-bold uppercase transition-colors text-white"
        >
          <ArrowLeftIcon className="w-3.5 h-3.5" />
          <span>Conference Home</span>
        </Link>

        <span className="text-xs font-mono text-[#c6f552] font-bold">
          IESA PROCESS DAY 2026
        </span>
      </header>

      {/* Center Search Card */}
      <main className="w-full max-w-xl mx-auto px-4 py-6 sm:py-10 space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#c6f552]/10 border border-[#c6f552]/30 text-xs font-mono font-bold text-[#c6f552]">
            <ShieldCheckIcon className="w-4 h-4" />
            <span>Global Credential Verification Portal</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif-display font-extrabold text-white">
            Verify Certificate Authenticity
          </h1>

          <p className="text-xs sm:text-sm text-white/70 max-w-md mx-auto leading-relaxed">
            Instant global verification for certificates issued by the Department of Industrial &amp; Production Engineering, University of Ibadan.
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-[#040032]/90 border border-white/20 backdrop-blur-xl shadow-2xl space-y-4">
          <form onSubmit={handleVerify} className="space-y-3">
            <label className="block text-xs font-mono text-[#c6f552] uppercase tracking-wider">
              Certificate Number or Recipient Name
            </label>

            <div className="relative flex items-center">
              <input
                type="text"
                value={certQuery}
                onChange={(e) => setCertQuery(e.target.value)}
                placeholder="e.g. IESA-2026-CERT-B829FA1 or 244079"
                className="w-full pl-4 pr-32 py-3.5 rounded-2xl bg-white/5 border border-white/20 text-white placeholder-white/30 text-sm font-mono focus:outline-none focus:border-[#c6f552]"
                autoFocus
              />
              <button
                type="submit"
                disabled={isLoading}
                className="absolute right-1.5 px-5 py-2.5 rounded-xl bg-[#c6f552] text-[#040032] text-xs font-mono font-bold uppercase hover:bg-[#b5e640] transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-[#040032] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <MagnifyingGlassIcon className="w-3.5 h-3.5" />
                    <span>Verify</span>
                  </>
                )}
              </button>
            </div>

            {error && (
              <p className="text-xs text-rose-400 font-mono mt-1">{error}</p>
            )}
          </form>

          {/* Security Guarantee Box */}
          <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono text-white/70">
            <div className="flex items-center gap-2">
              <CheckBadgeIcon className="w-4 h-4 text-[#c6f552] shrink-0" />
              <span>Tamper-proof HMAC SHA-256</span>
            </div>
            <div className="flex items-center gap-2">
              <BuildingLibraryIcon className="w-4 h-4 text-[#3fffe8] shrink-0" />
              <span>University of Ibadan Chapter</span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/certificate"
            className="text-xs font-mono text-[#3fffe8] hover:underline"
          >
            Are you a conference delegate? Claim and download your certificate here →
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-4xl mx-auto py-6 text-center text-xs font-mono text-white/40">
        © 2026 Industrial Engineering Students Association (IESA) · University of Ibadan
      </footer>
    </div>
  );
}
