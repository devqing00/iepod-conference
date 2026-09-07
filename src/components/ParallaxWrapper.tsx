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

    const sections = wrapperRef.current?.querySelectorAll<HTMLElement>("[data-stack-section]");

    if (sections && sections.length > 0) {
      sections.forEach((section, i) => {
        const nextSection = sections[i + 1];

        // Assign explicit z-index stacking order for physical curtain layering
        gsap.set(section, { zIndex: (i + 1) * 10 });

        if (nextSection) {
          const isHero = i === 0;

          // Sections containing iframes or marked with data-no-pin must NOT be pinned.
          // In Chromium/WebKit, pinning toggles position:fixed which forces iframe documents to reload on scroll!
          const hasIframe =
            section.querySelector("iframe") !== null ||
            section.getAttribute("data-no-pin") === "true";

          const getStartTrigger = () => {
            if (isHero) return "top top";
            const overflow = section.offsetHeight - window.innerHeight;
            return overflow > 0 ? "bottom bottom" : "top top";
          };

          if (!hasIframe) {
            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: section,
                start: getStartTrigger,
                endTrigger: nextSection,
                end: "top top",
                scrub: true,
                pin: true,
                pinSpacing: false,
                anticipatePin: 1,
                fastScrollEnd: true,
                invalidateOnRefresh: true,
              },
            });

            // Move up slightly based on viewport height, not section height, to prevent tall sections from outrunning the scroll
            tl.to(section, {
              y: () => -window.innerHeight * 0.25,
              ease: "none",
            });
          }
        }
      });
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    lenis.on("scroll", ScrollTrigger.update);

    const updateRaf = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateRaf);
    gsap.ticker.lagSmoothing(0);

    // Refresh triggers when layout changes (e.g. window resize or schedule toggle)
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const triggerRefresh = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        lenis.resize();
        ScrollTrigger.refresh();
      }, 100);
    };

    // Only observe schedule container for dynamic height changes (not all pinned sections)
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
      gsap.ticker.remove(updateRaf);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="parallax w-full relative" ref={wrapperRef}>
      {children}
    </div>
  );
}
