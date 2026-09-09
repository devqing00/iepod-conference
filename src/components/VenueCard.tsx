"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import TailoredMarqueeStrip from "@/components/TailoredMarqueeStrip";
import ScrollRevealText from "@/components/ScrollRevealText";
import VenueMapTerminal from "@/components/VenueMapTerminal";
import {
  CalendarDaysIcon,
  ArrowTopRightOnSquareIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";

export default function VenueCard() {
  const marqueeItems = [
    { text: "KAAF AUDITORIUM" },
    { text: "HUMAN NUTRITION PRECINCT" },
    { text: "UNIVERSITY OF IBADAN" },
    { text: "10TH SEPTEMBER 2026" },
    { text: "LIVE TODAY AT UI" },
  ];

  return (
    <section id="venue" className="pt-0 pb-20 lg:pb-28 bg-[#ece7d8] text-[#040032] relative">
      {/* Tailored Marquee Strip Entrance Header - Flushed to top edge */}
      <div className="mt-0 mb-8 overflow-visible">
        <TailoredMarqueeStrip
          items={marqueeItems}
          rotateClass="rotate-[1.85deg]"
          bgClass="bg-[#040032]"
          borderClass="border-[#3fffe8]"
          textClass="text-[#3fffe8]"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-[#040032]/10 pb-8">
          <div>
            <span className="font-mono-meta text-[10px] sm:text-xs font-bold text-[#0a3825] uppercase tracking-widest block mb-2">
              CONFERENCE VENUE · UNIVERSITY OF IBADAN
            </span>
            <h2 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#040032]">
              KAAF <span className="font-serif-italic text-[#0a3825]">Auditorium</span>
            </h2>
          </div>

          <div className="max-w-md text-left">
            <ScrollRevealText
              text="Located right inside the Department of Human Nutrition & Dietetics precinct, University of Ibadan. Fully air-conditioned, power-backed, and ready for you."
              className="text-sm sm:text-base text-[#040032]/80 leading-relaxed text-left justify-start"
              align="left"
              highlightWords={["Human", "Nutrition", "Ibadan", "air-conditioned"]}
              highlightClass="text-[#0a3825] font-bold"
            />
          </div>
        </div>

        {/* Venue Pass Ticket Component */}
        <div className="liquid-metal-card">
          <div className="bg-[#faf8f2] rounded-[1.4rem] p-5 sm:p-8 lg:p-10 border-2 border-[#040032] grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
            {/* Left Column: Technical Details */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-[#c6f552] text-[#040032] rounded-full text-xs font-mono-meta font-extrabold uppercase border border-[#040032]">
                  MAIN AUDITORIUM
                </span>
                <span className="text-xs font-mono-meta text-[#0a3825] font-bold">
                  UNIVERSITY OF IBADAN
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="font-serif-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#040032]">
                  KAAF Auditorium
                </h3>
                <p className="text-xs sm:text-sm font-mono-meta font-bold text-[#0a3825]">
                  Department of Human Nutrition and Dietetics, Faculty Precinct
                </p>
                <p className="text-xs sm:text-sm text-[#040032]/75 font-sans leading-relaxed">
                  The premier conference hall located within the faculty precinct at the University of Ibadan, Ibadan, Nigeria. Fully air-conditioned with modern audio-visual technology and ample parking.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 p-3.5 sm:p-4 bg-[#ece7d8]/60 rounded-xl border border-[#040032]/10 font-mono-meta text-xs">
                <div>
                  <span className="text-[#040032]/60 uppercase font-bold block text-[10px]">CAPACITY</span>
                  <span className="font-extrabold text-[#040032]">500+ Seats</span>
                </div>
                <div>
                  <span className="text-[#040032]/60 uppercase font-bold block text-[10px]">FACILITIES</span>
                  <span className="font-extrabold text-[#040032]">AC / Projector / WiFi</span>
                </div>
              </div>

              <a
                href="https://www.google.com/maps/dir/?api=1&destination=7.4478715,3.8947055"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#040032] hover:bg-[#0a3825] text-[#faf8f2] font-bold text-xs sm:text-sm px-6 py-3 rounded-full transition-all group w-full sm:w-auto cursor-pointer"
              >
                <span>OPEN IN GOOGLE MAPS</span>
                <ArrowTopRightOnSquareIcon className="w-4 h-4 text-[#c6f552] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>

            {/* Right Column: Venue Image Box */}
            <div className="relative h-52 sm:h-72 lg:h-80 rounded-2xl overflow-hidden border-2 border-[#040032] shadow-xl group">
              <Image
                src="/assets/generated/kaaf_keynote.png"
                alt="KAAF Auditorium Interior"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-[#040032]/90 backdrop-blur-md text-[#faf8f2] p-3 rounded-xl border border-white/20 flex items-center justify-between text-xs font-mono-meta">
                <div className="flex items-center gap-2">
                  <SparklesIcon className="w-4 h-4 text-[#c6f552]" />
                  <span>KAAF MAIN HALL</span>
                </div>
                <span className="text-[#3fffe8] font-bold">LIVE LOCATION</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Mapbox 3D Vector Map & 360° Street View Navigation Console */}
        <VenueMapTerminal />
      </div>
    </section>
  );
}
