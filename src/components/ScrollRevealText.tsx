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
      const isDesktop = window.innerWidth >= 768;

      const tween = gsap.fromTo(
        words,
        {
          opacity: 0.2,
          y: 4,
          ...(isDesktop ? { filter: "blur(3px)" } : {}),
        },
        {
          opacity: 1,
          y: 0,
          ...(isDesktop ? { filter: "blur(0px)" } : {}),
          stagger: 0.06,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 88%",
            end: "bottom 60%",
            scrub: 0.5,
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
