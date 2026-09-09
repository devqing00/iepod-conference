"use client";

import { useState } from "react";
import {
  MagnifyingGlassIcon,
  IdentificationIcon,
  EnvelopeIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/solid";

interface ManualLookupTabProps {
  onCheckinSubmit: (data: { matricNumber?: string; email?: string }) => Promise<void>;
  isLoading: boolean;
}

export default function ManualLookupTab({
  onCheckinSubmit,
  isLoading,
}: ManualLookupTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<"matric" | "email">("matric");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchTerm.trim();
    if (!clean) return;

    if (searchType === "matric") {
      await onCheckinSubmit({ matricNumber: clean });
    } else {
      await onCheckinSubmit({ email: clean });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-5 sm:p-6 rounded-3xl bg-[#02001e]/90 border border-white/15 backdrop-blur-xl shadow-xl text-white">
      <div className="text-center space-y-1 mb-5">
        <h3 className="text-lg font-bold font-serif-display text-white">
          Manual Search
        </h3>
        <p className="text-xs text-white/60">
          Look up an attendee by matric number or email.
        </p>
      </div>

      {/* Switcher: Matric vs Email */}
      <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#040032] border border-white/10 mb-4">
        <button
          type="button"
          onClick={() => setSearchType("matric")}
          className={`py-2 px-3 rounded-xl text-xs font-bold font-sans flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            searchType === "matric"
              ? "bg-[#c6f552] text-[#040032] shadow-sm"
              : "text-white/70 hover:text-white"
          }`}
        >
          <IdentificationIcon className="w-4 h-4" />
          <span>Matric No</span>
        </button>

        <button
          type="button"
          onClick={() => setSearchType("email")}
          className={`py-2 px-3 rounded-xl text-xs font-bold font-sans flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            searchType === "email"
              ? "bg-[#3fffe8] text-[#040032] shadow-sm"
              : "text-white/70 hover:text-white"
          }`}
        >
          <EnvelopeIcon className="w-4 h-4" />
          <span>Email</span>
        </button>
      </div>

      {/* Search Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type={searchType === "email" ? "email" : "text"}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              searchType === "matric"
                ? "e.g. 258451"
                : "e.g. student@gmail.com"
            }
            className="w-full px-4 py-3 pl-10 rounded-2xl bg-[#040032] border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-[#c6f552] font-mono text-sm transition-all"
            required
            autoFocus
          />
          <MagnifyingGlassIcon className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-white/40 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !searchTerm.trim()}
          className="w-full py-3 px-4 rounded-2xl bg-[#c6f552] hover:bg-[#b5e83a] disabled:opacity-50 disabled:cursor-not-allowed text-[#040032] font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
        >
          {isLoading ? (
            <div className="w-4 h-4 rounded-full border-2 border-[#040032] border-t-transparent animate-spin" />
          ) : (
            <>
              <span>Check In</span>
              <ArrowRightIcon className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
