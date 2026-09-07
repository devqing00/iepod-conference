"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface ScrollRevealTextProps {
  text: string;
  className?: string;
  wordClassName?: string;
  highlightWords?: string[];
  highlightClass?: string;
}

export default function ScrollRevealText({
  text,
  className = "",
  wordClassName = "",
  highlightWords = [],
  highlightClass = "text-[#c6f552]",
}: ScrollRevealTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (containerRef.current) {
      const words = containerRef.current.querySelectorAll(".reveal-word");

      gsap.fromTo(
        words,
        { opacity: 0.15, filter: "blur(4px)", y: 4 },
        {
          opacity: 1,
          filter: "blur(0px)",
          y: 0,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 85%",
            end: "bottom 55%",
            scrub: 0.5,
          },
        }
      );
    }
  }, [text]);

  const words = text.split(" ");

  return (
    <div ref={containerRef} className={`flex flex-wrap justify-center text-center gap-x-[0.3em] gap-y-[0.1em] ${className}`}>
      {words.map((word, idx) => {
        const cleanWord = word.replace(/[^a-zA-Z0-9]/g, "");
        const isHighlighted = highlightWords.some(
          (h) => h.toLowerCase() === cleanWord.toLowerCase()
        );

        return (
          <span
            key={idx}
            className={`reveal-word inline-block transition-colors ${
              isHighlighted ? highlightClass : ""
            } ${wordClassName}`}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
}
