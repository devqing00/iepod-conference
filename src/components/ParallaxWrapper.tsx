"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

interface ParallaxWrapperProps {
  children: React.ReactNode;
}

export default function ParallaxWrapper({ children }: ParallaxWrapperProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Only fallback to native simple scroll on small phone viewports (< 768px).
    // NEVER check navigator.maxTouchPoints as touchscreen laptops (Surface, Lenovo, Dell)
    // are full desktop computers that must have parallax active.
    const isMobilePhone =
      typeof window !== "undefined" && window.innerWidth < 768;

    const sections =
      wrapperRef.current?.querySelectorAll<HTMLElement>("[data-stack-section]");

    // Always assign proper z-index stacking order for physical curtain layering
    if (sections && sections.length > 0) {
      sections.forEach((section, i) => {
        gsap.set(section, {
          zIndex: (i + 1) * 10,
          position: "relative",
          willChange: isMobilePhone ? "auto" : "transform",
        });
      });
    }

    // On desktop and tablet screens (>= 768px), enable full stacking curtain parallax
    if (!isMobilePhone && sections && sections.length > 0) {
      sections.forEach((section, i) => {
        const nextSection = sections[i + 1];

        if (nextSection) {
          const isHero = i === 0;

          // If section is taller than viewport, scroll through its content first before pinning
          const getStartTrigger = () => {
            if (isHero) return "top top";
            const overflow = section.offsetHeight - window.innerHeight;
            return overflow > 0 ? "bottom bottom" : "top top";
          };

          // Use pinType: "transform" so GSAP pins via translate3d without toggling position:fixed.
          // This keeps the stacking curtain parallax active across all angled sections with 60fps GPU acceleration.
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: getStartTrigger,
              endTrigger: nextSection,
              end: "top top",
              scrub: true,
              pin: true,
              pinType: "transform",
              pinSpacing: false,
              anticipatePin: 1,
              fastScrollEnd: true,
              invalidateOnRefresh: true,
            },
          });

          // Pinned section moves up slightly creating layered parallax depth as the next curtain slides over
          tl.to(section, {
            y: () => -window.innerHeight * 0.22,
            ease: "none",
          });
        }
      });

      // Subtle differential depth parallax on Hero floating 3D artifacts
      const heroSection = sections[0];
      if (heroSection) {
        const artifacts = heroSection.querySelectorAll(
          ".animate-float-slow-1, .animate-float-slow-2, .animate-float-slow-3, .animate-float-slow-4"
        );
        artifacts.forEach((art, idx) => {
          gsap.to(art, {
            y: idx % 2 === 0 ? -70 : 70,
            ease: "none",
            scrollTrigger: {
              trigger: heroSection,
              start: "top top",
              end: "bottom top",
              scrub: 0.6,
            },
          });
        });
      }
    }

    // Lenis smooth scroll for desktop and tablets
    let lenis: Lenis | null = null;
    let updateRaf: ((time: number) => void) | null = null;

    if (!isMobilePhone) {
      lenis = new Lenis({
        duration: 1.0,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        touchMultiplier: 1.0,
        smoothWheel: true,
      });
      lenis.on("scroll", ScrollTrigger.update);

      updateRaf = (time: number) => {
        lenis?.raf(time * 1000);
      };

      gsap.ticker.add(updateRaf);
      gsap.ticker.lagSmoothing(500, 33);
    }

    // Refresh triggers when layout changes (e.g. window resize or schedule toggle)
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const triggerRefresh = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        lenis?.resize();
        ScrollTrigger.refresh();
      }, 120);
    };

    const scheduleEl = document.getElementById("schedule");
    let ro: ResizeObserver | null = null;
    if (scheduleEl) {
      ro = new ResizeObserver(() => {
        triggerRefresh();
      });
      ro.observe(scheduleEl);
    }

    window.addEventListener("resize", triggerRefresh);
    window.addEventListener("refresh-parallax", triggerRefresh);

    return () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      if (ro) ro.disconnect();
      window.removeEventListener("resize", triggerRefresh);
      window.removeEventListener("refresh-parallax", triggerRefresh);
      ScrollTrigger.getAll().forEach((st) => st.kill());
      if (sections) {
        sections.forEach((sec) => gsap.killTweensOf(sec));
      }
      if (updateRaf) {
        gsap.ticker.remove(updateRaf);
      }
      lenis?.destroy();
    };
  }, []);

  return (
    <div className="parallax w-full relative" ref={wrapperRef}>
      {children}
    </div>
  );
}
