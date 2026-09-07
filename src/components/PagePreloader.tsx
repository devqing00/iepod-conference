"use client";

import { useEffect, useState } from "react";
import gsap from "gsap";

export default function PagePreloader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const letters = document.querySelectorAll(".cascade-letter");
    const logoIcon = document.querySelector(".cascade-logo");

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(".preloader-screen", {
          yPercent: -100,
          duration: 0.9,
          ease: "power4.inOut",
          onComplete: () => setIsLoading(false),
        });
      },
    });

    tl.fromTo(
      logoIcon,
      { opacity: 0, scale: 0.5, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "back.out(1.7)" }
    ).fromTo(
      letters,
      { opacity: 0, y: 40, filter: "blur(6px)" },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        stagger: 0.04,
        duration: 0.6,
        ease: "power3.out",
      },
      "+=0.3"
    );
  }, []);

  if (!isLoading) return null;

  const brandText = "IESA Process Day 2026";

  return (
    <div className="preloader-screen fixed inset-0 h-[100dvh] w-screen z-[100] bg-[#faf8f2] text-[#040032] flex flex-col items-center justify-center pointer-events-auto">
      <div className="flex flex-col items-center space-y-1">
        {/* Brand Logo Icon */}
        <img src="/assets/generated/logo.png" alt="IESA Logo" className="cascade-logo opacity-0 w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 object-contain" />

        {/* Kinetic Letter Cascade Text */}
        <div className="flex justify-center text-center w-full mx-auto px-4">
          {brandText.split("").map((char, idx) => (
            <span
              key={idx}
              className="cascade-letter opacity-0 inline-block font-serif-display text-base sm:text-lg md:text-xl lg:text-2xl font-bold tracking-tighter text-[#040032] whitespace-nowrap"
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </div>


      </div>
    </div>
  );
}
