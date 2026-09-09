"use client";

import Link from "next/link";
import { ArrowLeftIcon, SparklesIcon, ShieldCheckIcon } from "@heroicons/react/24/solid";
import VisualCoordinateMapper from "@/components/certificate/VisualCoordinateMapper";

export default function CertificateMapperPage() {
  return (
    <div className="min-h-screen bg-[#02001e] text-white flex flex-col selection:bg-[#c6f552] selection:text-[#040032]">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#040032]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <Link
            href="/certificate"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-mono font-bold uppercase transition-colors text-white"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            <span>Attendee View</span>
          </Link>
          <div className="h-4 w-px bg-white/20" />
          <h1 className="text-xs sm:text-sm font-bold font-serif-display text-[#c6f552] truncate">
            Certificate Visual Coordinate Mapper Studio
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/15 text-[11px] font-mono text-white/70 hover:text-white transition-colors"
          >
            Home ↗
          </Link>
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#c6f552]/10 border border-[#c6f552]/30 text-[11px] font-mono text-[#c6f552]">
            <SparklesIcon className="w-3.5 h-3.5" />
            <span>Official 2026 Artwork</span>
          </div>
        </div>
      </header>

      {/* Main Studio Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/5 border border-white/10 p-4 rounded-2xl">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>🎯 Real-Time Certificate Calibration Studio</span>
            </h2>
            <p className="text-xs text-white/60 mt-0.5">
              Drag labels onto the template or nudge coordinates using the inspector panel. Click &quot;Save &amp; Apply&quot; to update the attendee portal instantly.
            </p>
          </div>
          <Link
            href="/certificate"
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-[#c6f552] text-[#040032] font-mono font-bold text-xs uppercase hover:bg-[#b5e640] transition-colors"
          >
            Test Live Verification ❯
          </Link>
        </div>

        {/* Mapper Tool Component */}
        <VisualCoordinateMapper />
      </main>

      {/* Footer */}
      <footer className="py-5 px-4 border-t border-white/10 text-center text-xs font-mono text-white/50">
        IESA Process Day 2026 · Industrial Engineering Students Association · University of Ibadan
      </footer>
    </div>
  );
}
