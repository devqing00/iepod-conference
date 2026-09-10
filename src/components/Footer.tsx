"use client";

import { useState } from "react";
import TailoredMarqueeStrip from "@/components/TailoredMarqueeStrip";
import ScrollRevealText from "@/components/ScrollRevealText";
import { ArrowUpRightIcon, CheckCircleIcon } from "@heroicons/react/24/solid";

export default function Footer() {
  const [emailInput, setEmailInput] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const marqueeItems = [
    { text: "IESA PROCESS DAY 2026" },
    { text: "INDUSTRIAL ENGINEERING UI CHAPTER" },
    { text: "BUILDING PRACTICAL ENGINEERING LEADERS" },
    { text: "KAAF AUDITORIUM UI" },
  ];

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to subscribe. Please try again.");
      } else {
        setSubscribed(true);
      }
    } catch {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="w-full bg-[#040032] text-[#faf8f2] relative pt-0 pb-12 overflow-hidden">
      {/* Tailored Marquee Strip Entrance Header - Flushed to Angled Clipped Top Edge */}
      <div className="mt-0 mb-6 overflow-visible relative z-30">
        <TailoredMarqueeStrip
          items={marqueeItems}
          rotateClass="rotate-[1.85deg]"
          bgClass="bg-[#c6f552]"
          borderClass="border-[#040032]"
          textClass="text-[#040032]"
        />
      </div>

      {/* Giant Editorial Hero Marquee Banner (Inspo Style) */}
      <div className="relative z-10 my-10 overflow-hidden select-none">
        <div className="flex w-max animate-marquee whitespace-nowrap opacity-90">
          {[...Array(4)].map((_, idx) => (
            <span key={idx} className="font-serif-display text-5xl sm:text-7xl lg:text-9xl font-bold text-[#c6f552] mr-8 tracking-tight">
              FORGE PRACTICAL LEADERSHIP ✦ EMBRACE INNOVATION ✦ IESA 2026 ✦
            </span>
          ))}
        </div>

        {/* Subtext and Action Callout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs sm:text-sm text-[#faf8f2]/70 font-sans max-w-md">
            Happening live today at KAAF Auditorium, University of Ibadan. Building what's next in engineering.
          </p>

          <a
            href="#schedule"
            className="flex items-center gap-2 bg-[#c6f552] hover:bg-[#b5e83a] text-[#040032] font-mono-meta font-extrabold text-xs sm:text-sm px-6 py-3 rounded-full transition-all active:scale-[0.98] group cursor-pointer"
          >
            <span>SEE TODAY'S PROGRAM</span>
            <ArrowUpRightIcon className="w-4 h-4 text-[#040032] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>
      </div>

      {/* Minimalist Footer Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 mt-12 border-t border-white/10 pt-10">
        {/* Top Branding & University Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8 border-b border-white/10">
          <div className="flex items-center gap-3.5">
            <img src="/assets/generated/logo.png" alt="IESA Logo" className="w-10 h-10 object-contain" />
            <div>
              <h3 className="font-serif-display text-xl sm:text-2xl font-bold text-[#faf8f2]">
                IESA Process Day 2026
              </h3>
              <p className="text-[11px] font-mono-meta tracking-wider text-[#faf8f2]/60 uppercase">
                Industrial Engineering Students Association · UI
              </p>
            </div>
          </div>
          <span className="font-mono-meta text-[11px] font-extrabold px-3 py-1 rounded-full border border-white/20 text-[#c6f552] bg-white/5 tracking-wider">
            UNIVERSITY OF IBADAN
          </span>
        </div>

        {/* Minimal Navigation Links Row */}
        <div className="py-6 border-b border-white/10 flex flex-wrap items-center gap-2 sm:gap-6 font-mono-meta text-xs">
          <a
            href="#speakers"
            className="text-[#faf8f2]/80 hover:text-[#c6f552] transition-colors py-1 px-2 rounded hover:bg-white/5 flex items-center gap-1 group"
          >
            <span>Speakers</span>
            <ArrowUpRightIcon className="w-3 h-3 text-[#c6f552] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
          <span className="text-white/20">·</span>
          <a
            href="#hackathon"
            className="text-[#faf8f2]/80 hover:text-[#c6f552] transition-colors py-1 px-2 rounded hover:bg-white/5 flex items-center gap-1 group"
          >
            <span>Hackathon</span>
            <ArrowUpRightIcon className="w-3 h-3 text-[#c6f552] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
          <span className="text-white/20">·</span>
          <a
            href="#call-for-papers"
            className="text-[#faf8f2]/80 hover:text-[#c6f552] transition-colors py-1 px-2 rounded hover:bg-white/5 flex items-center gap-1 group"
          >
            <span>Research</span>
            <ArrowUpRightIcon className="w-3 h-3 text-[#c6f552] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
          <span className="text-white/20">·</span>
          <a
            href="#schedule"
            className="text-[#faf8f2]/80 hover:text-[#c6f552] transition-colors py-1 px-2 rounded hover:bg-white/5 flex items-center gap-1 group"
          >
            <span>Schedule</span>
            <ArrowUpRightIcon className="w-3 h-3 text-[#c6f552] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
          <span className="text-white/20">·</span>
          <a
            href="/certificate"
            className="text-[#c6f552] hover:text-[#b5e83a] transition-colors py-1 px-2 rounded hover:bg-white/5 flex items-center gap-1 group font-bold"
          >
            <span>Certificate</span>
            <ArrowUpRightIcon className="w-3 h-3 text-[#c6f552] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>

        {/* Content Row: Newsletter + Direct Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-b border-white/10">
          {/* Newsletter Column */}
          <div className="space-y-3">
            <h4 className="font-mono-meta text-xs font-bold text-[#c6f552] uppercase tracking-wider">
              SUBSCRIBE TO OUR NEWSLETTER
            </h4>
            <p className="text-xs text-[#faf8f2]/70 leading-relaxed max-w-md font-sans">
              Receive post-conference lecture slides, digital certificates, and career dispatch notes directly to your inbox.
            </p>

            {subscribed ? (
              <div className="p-3 rounded-xl bg-[#c6f552]/10 border border-[#c6f552]/40 text-[#c6f552] text-xs font-mono-meta font-bold flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-[#c6f552] flex-shrink-0" />
                <span>Subscribed! Lecture slides and resources will be delivered to your inbox.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="space-y-2 pt-1">
                <div className="flex flex-col sm:flex-row gap-2 max-w-md">
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="name@email.com"
                    disabled={isLoading}
                    className="flex-grow px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-xs font-mono-meta text-[#faf8f2] placeholder-white/35 focus:outline-none focus:border-[#c6f552] transition-colors disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-5 py-2 rounded-xl bg-[#c6f552] hover:bg-[#b5e83a] text-[#040032] font-mono-meta text-xs font-extrabold transition-all active:scale-[0.98] whitespace-nowrap cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-3 h-3 rounded-full border-2 border-[#040032] border-t-transparent animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Subscribe</span>
                    )}
                  </button>
                </div>
                {errorMessage && (
                  <p className="text-[11px] font-mono text-red-400">
                    {errorMessage}
                  </p>
                )}
              </form>
            )}
          </div>

          {/* Direct Contact & Precinct Column */}
          <div className="space-y-3 font-mono-meta text-xs text-[#faf8f2]/75 md:pl-6">
            <h4 className="font-bold text-[#c6f552] uppercase tracking-wider">
              DIRECT CONTACT & PRECINCT
            </h4>
            <div className="space-y-1.5">
              <p className="text-[#3fffe8]">
                <a href="https://iesaui.org" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-[#c6f552] transition-colors">iesaui.org</a>
                {' · '}
                <a href="mailto:info@iesaui.org" className="hover:underline hover:text-[#c6f552] transition-colors">info@iesaui.org</a>
              </p>
              <p>
                Executives:{' '}
                <a href="tel:08127543064" className="hover:underline hover:text-[#c6f552] transition-colors">08127543064</a> (Vai) /{' '}
                <a href="tel:09152882594" className="hover:underline hover:text-[#c6f552] transition-colors">09152882594</a> (Success)
              </p>
              <p className="text-white/55">
                Department of Industrial Engineering, University of Ibadan, Nigeria
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Check-In Bar */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono-meta text-[#faf8f2]/50">
          <div className="flex items-center gap-3 sm:gap-4">
            <a href="#privacy" className="hover:text-[#c6f552] transition-colors">Privacy Policy</a>
            <span className="text-white/20">|</span>
            <a href="#terms" className="hover:text-[#c6f552] transition-colors">Terms of Service</a>
            <span className="text-white/20">|</span>
            <a href="/check-in" className="text-[#3fffe8] hover:text-[#c6f552] transition-colors font-bold">Gate Check-In</a>
          </div>

          <div>
            Copyright 2026 © IESA UI. All Rights Reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
