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
  align?: "left" | "center" | "right";
}

export default function ScrollRevealText({
  text,
  className = "",
  wordClassName = "",
  highlightWords = [],
  highlightClass = "text-[#c6f552]",
  align,
}: ScrollRevealTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (containerRef.current) {
      const words = containerRef.current.querySelectorAll(".reveal-word");

      const tween = gsap.fromTo(
        words,
        {
          opacity: 0.25,
          y: 6,
        },
        {
          opacity: 1,
          y: 0,
          stagger: 0.04,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 90%",
            end: "bottom 65%",
            scrub: 0.4,
          },
        }
      );

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    }
  }, [text]);

  const words = text.split(" ");

  const isLeft = align === "left" || className.includes("text-left");
  const isRight = align === "right" || className.includes("text-right");
  const alignClass = isLeft
    ? "justify-start text-left"
    : isRight
    ? "justify-end text-right"
    : "justify-center text-center";

  return (
    <div ref={containerRef} className={`flex flex-wrap ${alignClass} gap-x-[0.3em] gap-y-[0.1em] ${className}`}>
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
