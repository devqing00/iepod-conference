"use client";

import { useState, useEffect, useRef } from "react";
import {
  ChatBubbleBottomCenterTextIcon,
  ChevronDownIcon,
  UserGroupIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  BookOpenIcon,
  MapPinIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/solid";
import AskStageModal from "@/components/AskStageModal";
import { OFFICIAL_PROGRAM_SESSIONS } from "@/lib/programSessions";

interface ActiveProgramResponse {
  activeSessionId?: string;
  activeSessionTitle?: string;
  activeSession?: {
    id: string;
    orderNumber: number;
    title: string;
    shortTitle: string;
    speaker?: string;
    category: string;
    duration: string;
    location: string;
  };
  updatedAt?: string;
}

const NAV_SECTIONS = [
  { id: "speakers", label: "Speakers", icon: UserGroupIcon },
  { id: "hackathon", label: "Hackathon", icon: CodeBracketIcon },
  { id: "call-for-papers", label: "Research", icon: DocumentTextIcon },
  { id: "schedule", label: "Program", icon: BookOpenIcon },
  { id: "venue", label: "Venue", icon: MapPinIcon },
];

export default function Navbar() {
  const [activeSection, setActiveSection] = useState<string>("hero");
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [isAskModalOpen, setIsAskModalOpen] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [liveSession, setLiveSession] = useState<{
    id: string;
    orderNumber: number;
    shortTitle: string;
  }>({
    id: OFFICIAL_PROGRAM_SESSIONS[0].id,
    orderNumber: OFFICIAL_PROGRAM_SESSIONS[0].orderNumber,
    shortTitle: OFFICIAL_PROGRAM_SESSIONS[0].shortTitle,
  });

  // Poll for active stage session from MongoDB real-time state
  useEffect(() => {
    let isMounted = true;

    const fetchActiveSession = async () => {
      try {
        const res = await fetch("/api/program/active", { cache: "no-store" });
        if (!res.ok) return;
        const data: ActiveProgramResponse = await res.json();
        const targetId = data.activeSession?.id || data.activeSessionId;
        const found =
          data.activeSession ||
          OFFICIAL_PROGRAM_SESSIONS.find((s) => s.id === targetId) ||
          OFFICIAL_PROGRAM_SESSIONS[0];

        if (isMounted && found) {
          setLiveSession({
            id: found.id,
            orderNumber: found.orderNumber,
            shortTitle: found.shortTitle,
          });
        }
      } catch {
        // Silently retain last known state
      }
    };

    fetchActiveSession();
    const interval = setInterval(fetchActiveSession, 3500);

    // Multi-tab instant sync via localStorage
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "iesa_active_session" && e.newValue) {
        const found = OFFICIAL_PROGRAM_SESSIONS.find((s) => s.id === e.newValue);
        if (found && isMounted) {
          setLiveSession({
            id: found.id,
            orderNumber: found.orderNumber,
            shortTitle: found.shortTitle,
          });
        }
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // Close dropdown on outside click or escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsDropdownOpen(false);
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDropdownOpen]);

  // Dynamic Section Spy on Scroll & Footer Visibility Detection
  useEffect(() => {
    let ticking = false;

    const updateScrollState = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;

      // Footer Check: Navbar is hidden only when footer is deeply in view
      const footerEl = document.getElementById("footer-section");
      let isFooterInView = false;
      if (footerEl) {
        const footerRect = footerEl.getBoundingClientRect();
        isFooterInView = footerRect.top < windowHeight * 0.35;
      }

      setIsVisible(!isFooterInView);

      // Section Spy: Accurate viewport detection using getBoundingClientRect
      const spyThreshold = windowHeight * 0.38;
      let detectedSection = "hero";

      for (const sec of NAV_SECTIONS) {
        const el = document.getElementById(sec.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= spyThreshold && rect.bottom > 80) {
            detectedSection = sec.id;
          }
        }
      }

      setActiveSection(detectedSection);
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

  const scrollToSection = (id: string) => {
    setIsDropdownOpen(false);
    if (id === "hero") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      const topOffset = element.getBoundingClientRect().top + window.scrollY - 65;
      window.scrollTo({ top: topOffset, behavior: "smooth" });
    }
  };

  const handleJumpToLiveSession = () => {
    if (typeof window !== "undefined" && liveSession) {
      window.dispatchEvent(
        new CustomEvent("jump-to-session", {
          detail: { sessionId: liveSession.id },
        })
      );
    }
    scrollToSection("schedule");
  };

  const currentSectionItem = NAV_SECTIONS.find((s) => s.id === activeSection);

  return (
    <>
      <header
        className={`fixed top-3 sm:top-4 inset-x-0 z-[9990] flex justify-center pointer-events-none px-2 sm:px-3 transition-all duration-300 transform-gpu will-change-transform isolate max-w-full ${
          isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        {/* Compact Minimalist Liquid Metal Glowing Rim Pill */}
        <div
          className="pointer-events-auto relative p-[1px] sm:p-[1.5px] rounded-full transition-all duration-300 shadow-[0_4px_24px_rgba(0,0,0,0.35)] transform-gpu max-w-[calc(100vw-1rem)] sm:max-w-none"
          style={{
            background:
              "linear-gradient(90deg, rgba(4,0,50,0.3) 0%, rgba(0,229,255,0.7) 25%, rgba(198,245,82,0.85) 50%, rgba(63,255,232,0.7) 75%, rgba(4,0,50,0.3) 100%)",
            backgroundSize: "200% 200%",
            animation: "liquid-metal-glow 8s ease infinite",
            boxShadow:
              "0 0 16px rgba(0, 229, 255, 0.22), 0 0 10px rgba(198, 245, 82, 0.18), 0 4px 18px rgba(0, 0, 0, 0.4)",
          }}
        >
          {/* Transparent Core with Frosted Blur Backdrop */}
          <nav className="bg-[#040032]/92 backdrop-blur-md rounded-full px-2 py-1.5 flex items-center gap-1 sm:gap-1.5 border border-white/10">
            {/* Live Stage Session Pill Button */}
            {liveSession && (
              <>
                <button
                  type="button"
                  onClick={handleJumpToLiveSession}
                  title="Click to flip 3D journal to active program session"
                  className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0a3825] border border-[#c6f552]/40 text-[#c6f552] text-[10px] sm:text-[11px] font-mono-meta font-extrabold uppercase hover:bg-[#0a3825]/80 transition-all cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-[#c6f552] inline-block flex-shrink-0 shadow-[0_0_6px_#c6f552]" />
                  <span className="truncate max-w-[100px] sm:max-w-[140px]">
                    LIVE: {liveSession.shortTitle}
                  </span>
                </button>

                {/* Ask a Question to Stage Button */}
                <button
                  type="button"
                  onClick={() => setIsAskModalOpen(true)}
                  title="Submit a question to the moderator in KAAF Auditorium"
                  className="flex-shrink-0 flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-[#c6f552] text-[10px] sm:text-[11px] font-mono-meta font-bold uppercase transition-all cursor-pointer shadow-sm"
                >
                  <ChatBubbleBottomCenterTextIcon className="w-3 h-3 text-[#c6f552]" />
                  <span className="hidden sm:inline">Ask Stage</span>
                  <span className="sm:hidden">Ask</span>
                </button>
              </>
            )}

            {/* Space-Saving Sections Dropdown Button */}
            <div className="relative flex-shrink-0" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-mono-meta font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                  isDropdownOpen || (currentSectionItem && activeSection !== "hero")
                    ? "bg-[#c6f552] text-[#040032] shadow-[0_0_10px_rgba(198,245,82,0.4)]"
                    : "text-[#faf8f2]/80 hover:text-white hover:bg-white/10"
                }`}
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
              >
                <span>{currentSectionItem ? currentSectionItem.label : "Menu"}</span>
                <ChevronDownIcon
                  className={`w-3 h-3 transition-transform duration-200 ${
                    isDropdownOpen || (currentSectionItem && activeSection !== "hero")
                      ? "text-[#040032]"
                      : "text-white/60"
                  } ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Glassmorphic Dropdown Menu */}
              {isDropdownOpen && (
                <div
                  className="absolute top-full right-0 mt-2.5 w-44 sm:w-48 p-1.5 rounded-2xl bg-[#040032]/95 backdrop-blur-xl border border-white/20 shadow-[0_12px_36px_rgba(0,0,0,0.65)] z-[9999] animate-fade-in"
                  style={{
                    boxShadow:
                      "0 12px 36px rgba(0,0,0,0.6), 0 0 20px rgba(198, 245, 82, 0.15)",
                  }}
                >
                  <div className="px-2.5 py-1 text-[9px] font-mono font-bold text-white/40 uppercase tracking-wider border-b border-white/10 mb-1">
                    Conference Sections
                  </div>

                  <div className="space-y-0.5">
                    {NAV_SECTIONS.map((sec) => {
                      const isActive = activeSection === sec.id;
                      const Icon = sec.icon;

                      return (
                        <button
                          key={sec.id}
                          onClick={() => {
                            scrollToSection(sec.id);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                            isActive
                              ? "bg-[#c6f552] text-[#040032] font-bold shadow-sm"
                              : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon
                              className={`w-3.5 h-3.5 ${
                                isActive ? "text-[#040032]" : "text-[#c6f552]"
                              }`}
                            />
                            <span>{sec.label}</span>
                          </div>
                          {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#040032]" />
                          )}
                        </button>
                      );
                    })}

                    {/* Quick Link to Digital Certificate */}
                    <div className="pt-1 mt-1 border-t border-white/10">
                      <a
                        href="/certificate"
                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left text-xs text-[#c6f552] hover:bg-white/10 transition-colors cursor-pointer font-bold"
                      >
                        <div className="flex items-center gap-2">
                          <AcademicCapIcon className="w-3.5 h-3.5" />
                          <span>Get Certificate</span>
                        </div>
                        <span className="text-[8px] font-mono px-1 py-0.5 rounded bg-[#c6f552]/20">
                          PORTAL
                        </span>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Audience Live Q&A Modal */}
      <AskStageModal
        isOpen={isAskModalOpen}
        onClose={() => setIsAskModalOpen(false)}
        activeSession={liveSession}
      />
    </>
  );
}
