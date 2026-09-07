"use client";

import { useState, useEffect, useMemo } from "react";
import { ArrowUpRightIcon } from "@heroicons/react/24/outline";


interface ProgramSession {
  id: string;
  startMinutes: number; // minutes from midnight (e.g. 10:00 AM = 600)
  endMinutes: number;   // minutes from midnight (e.g. 10:35 AM = 635)
  title: string;
}

// 14 Official Conference Sessions for 10th September 2026 (10:00 AM - 4:00 PM)
const CONFERENCE_SESSIONS: ProgramSession[] = [
  { id: "s1", startMinutes: 600, endMinutes: 635, title: "Arrival & Welcome" },
  { id: "s2", startMinutes: 635, endMinutes: 665, title: "VC Opening Keynote" },
  { id: "s3", startMinutes: 665, endMinutes: 675, title: "Headline Sponsor Address" },
  { id: "s4", startMinutes: 675, endMinutes: 705, title: "Dr. Ayoola Keynote" },
  { id: "s5", startMinutes: 705, endMinutes: 710, title: "Delegate Giveaway" },
  { id: "s6", startMinutes: 710, endMinutes: 740, title: "Annual Debate" },
  { id: "s7", startMinutes: 740, endMinutes: 770, title: "Engr. Otokiti Keynote" },
  { id: "s8", startMinutes: 770, endMinutes: 780, title: "Speaker Honors & Break" },
  { id: "s9", startMinutes: 780, endMinutes: 810, title: "Workshops" },
  { id: "s10", startMinutes: 810, endMinutes: 825, title: "Chairman Keynote" },
  { id: "s11", startMinutes: 825, endMinutes: 870, title: "Hackathon Finals" },
  { id: "s12", startMinutes: 870, endMinutes: 885, title: "Community Games" },
  { id: "s13", startMinutes: 885, endMinutes: 950, title: "Paper Presentations" },
  { id: "s14", startMinutes: 950, endMinutes: 960, title: "Closing Protocols" },
];

const NAV_SECTIONS = [
  { id: "why-attend", label: "Highlights" },
  { id: "speakers", label: "Speakers" },
  { id: "call-for-papers", label: "Papers" },
  { id: "schedule", label: "Agenda" },
  { id: "venue", label: "Venue" },
  { id: "faq", label: "FAQs" },
];

export default function Navbar() {
  const [activeSection, setActiveSection] = useState<string>("hero");
  const [isVisible, setIsVisible] = useState<boolean>(false);

  // Check if today is the conference day (September 10, 2026) and current time is in conference window
  const isConferenceDayActive = useMemo(() => {
    const now = new Date();
    const isConferenceDate =
      now.getFullYear() === 2026 &&
      now.getMonth() === 8 && // September is month 8 (0-indexed)
      now.getDate() === 10;

    if (!isConferenceDate) return false;

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    return currentMinutes >= 600 && currentMinutes <= 960;
  }, []);

  // Dynamic Section Spy on Scroll & Hero / Footer Visibility Detection (rAF Throttled)
  useEffect(() => {
    let ticking = false;

    const updateScrollState = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;

      // 1. Hero Check: Navbar is hidden while hero section is in view
      const heroEl = document.getElementById("hero-section");
      let isHeroInView = true;
      if (heroEl) {
        const heroRect = heroEl.getBoundingClientRect();
        isHeroInView = heroRect.bottom > windowHeight * 0.15;
      } else {
        isHeroInView = scrollY < windowHeight * 0.6;
      }

      // 2. Footer Check: Navbar is hidden when footer enters view
      const footerEl = document.getElementById("footer-section");
      let isFooterInView = false;
      if (footerEl) {
        const footerRect = footerEl.getBoundingClientRect();
        isFooterInView = footerRect.top < windowHeight;
      }

      setIsVisible(!isHeroInView && !isFooterInView);

      // 3. Section Spy: Highlight active tab
      const scrollPosition = scrollY + windowHeight * 0.35;

      const sectionElements = NAV_SECTIONS.map((sec) => ({
        id: sec.id,
        element: document.getElementById(sec.id),
      })).filter((item) => item.element !== null);

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const item = sectionElements[i];
        if (item.element) {
          const top = item.element.offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(item.id);
            ticking = false;
            return;
          }
        }
      }

      setActiveSection("hero");
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateScrollState);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    updateScrollState();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // On the conference day, auto-switch / scroll to the active session when schedule starts
  useEffect(() => {
    if (!isConferenceDayActive) return;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const activeItem = CONFERENCE_SESSIONS.find(
      (s) => currentMinutes >= s.startMinutes && currentMinutes < s.endMinutes
    );

    if (activeItem) {
      setActiveSection("schedule");
    }
  }, [isConferenceDayActive]);

  const scrollToSection = (id: string) => {
    if (id === "hero") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      className={`fixed top-3 sm:top-4 inset-x-0 z-[9990] flex justify-center pointer-events-none px-3 transition-all duration-300 transform-gpu will-change-transform isolate ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-4 pointer-events-none"
      }`}
    >
      {/* Compact Minimalist Liquid Metal Glowing Rim Pill */}
      <div
        className="pointer-events-auto relative p-[1px] sm:p-[1.5px] rounded-full transition-all duration-300 shadow-[0_4px_24px_rgba(0,0,0,0.35)] transform-gpu"
        style={{
          background:
            "linear-gradient(90deg, rgba(4,0,50,0.3) 0%, rgba(0,229,255,0.7) 25%, rgba(198,245,82,0.85) 50%, rgba(63,255,232,0.7) 75%, rgba(4,0,50,0.3) 100%)",
          backgroundSize: "200% 200%",
          animation: "liquid-metal-glow 8s ease infinite",
          boxShadow:
            "0 0 16px rgba(0, 229, 255, 0.22), 0 0 10px rgba(198, 245, 82, 0.18), 0 4px 18px rgba(0, 0, 0, 0.4)",
        }}
      >
        {/* Transparent Core with Frosted Blur Backdrop (GPU Optimized) */}
        <nav className="bg-[#040032]/75 backdrop-blur-md rounded-full px-2 py-1.5 flex items-center gap-0.5 sm:gap-1 border border-white/10">
          {NAV_SECTIONS.map((sec) => {
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => scrollToSection(sec.id)}
                className={`relative px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-mono-meta font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#c6f552] text-[#040032] shadow-[0_0_10px_rgba(198,245,82,0.4)]"
                    : "text-[#faf8f2]/75 hover:text-white hover:bg-white/10"
                }`}
              >
                <span className="flex items-center gap-1">
                  {sec.label}
                  {/* Subtle session live dot on Agenda if conference is in progress */}
                  {sec.id === "schedule" && isConferenceDayActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c6f552]" />
                  )}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
