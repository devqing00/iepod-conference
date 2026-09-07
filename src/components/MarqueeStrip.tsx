"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SparklesIcon, FireIcon, BoltIcon, StarIcon } from "@heroicons/react/24/solid";

export default function MarqueeStrip() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (trackRef.current && containerRef.current) {
      // Scroll-induced horizontal shift & acceleration
      gsap.to(trackRef.current, {
        xPercent: -20,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.6,
        },
      });
    }
  }, []);

  const marqueeItems = [
    { text: "FORGE THE FUTURE", icon: SparklesIcon, color: "text-[#c6f552]" },
    { text: "IESA PROCESS DAY 2026", icon: FireIcon, color: "text-[#3fffe8]" },
    { text: "UNIVERSITY OF IBADAN", icon: StarIcon, color: "text-[#c6f552]" },
    { text: "TECH & AI FACILITATION", icon: BoltIcon, color: "text-[#3fffe8]" },
    { text: "INDUSTRIAL ENGINEERING", icon: SparklesIcon, color: "text-[#c6f552]" },
    { text: "KAAF AUDITORIUM", icon: FireIcon, color: "text-[#3fffe8]" },
  ];

  return (
    <div ref={containerRef} className="w-[108%] -ml-[4%] overflow-visible py-3 -rotate-2 my-3 z-30 relative">
      <div className="w-full bg-[#040032] text-[#faf8f2] py-4 border-y-2 border-[#c6f552] shadow-2xl overflow-hidden">
        <div
          ref={trackRef}
          className="marquee-track flex items-center gap-8 w-max animate-marquee"
        >
          {[
            ...marqueeItems,
            ...marqueeItems,
            ...marqueeItems,
            ...marqueeItems,
            ...marqueeItems,
            ...marqueeItems,
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center gap-3.5 whitespace-nowrap">
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${item.color}`} />
                <span className="font-mono-meta text-xs sm:text-sm md:text-base font-extrabold tracking-widest uppercase">
                  {item.text}
                </span>
                <span className="text-[#faf8f2]/40 text-xs sm:text-sm">✦</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
