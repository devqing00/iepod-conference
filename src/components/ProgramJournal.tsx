"use client";

import { useState, useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  MotionValue,
} from "framer-motion";
import {
  ClockIcon,
  MapPinIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BookmarkIcon,
  ArrowsRightLeftIcon,
  BookOpenIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/solid";

export interface JournalItem {
  id: string;
  isCover?: boolean;
  isBackCover?: boolean;
  time?: string;
  duration?: string;
  title: string;
  speaker?: string;
  category?: string;
  description: string;
  location?: string;
  imageUrl: string;
  photoCaption?: string;
  stampText?: string;
  badgeColor?: string;
}

export const JOURNAL_PAGES: JournalItem[] = [
  {
    id: "page-cover",
    isCover: true,
    title: "IESA PROCESS DAY 2026",
    speaker: "6th Annual Industrial Engineering Conference",
    description:
      "Official Conference Day Program Journal. A tactile chronicle of keynote addresses, simultaneous technical masterclasses, debates, hackathon showcases, and research proceedings.",
    location: "KAAF Auditorium, University of Ibadan",
    imageUrl: "/assets/generated/logo.png",
    photoCaption: "Official Seal of IESA University of Ibadan",
    stampText: "OFFICIAL DISPATCH // 10TH SEP 2026",
    badgeColor: "bg-[#c6f552] text-[#040032]",
  },
  {
    id: "session-01",
    time: "10:00 AM - 10:35 AM",
    duration: "35 MINS",
    title: "Arrival, Anthems & Presidential Address",
    speaker: "IESA President & Executive Council",
    category: "Protocols & Ceremonies",
    description:
      "Official guest reception and attendee registration checks, host introduction, opening prayers, rendition of the National and University of Ibadan School Anthems, interactive attendee welcome, and the President's opening address.",
    location: "KAAF Main Auditorium",
    imageUrl: "/assets/generated/kaaf_keynote.png",
    photoCaption: "KAAF Main Auditorium · Grand Assembly Hall",
    stampText: "SESSION // 01 · 10:00 AM",
    badgeColor: "bg-[#ece7d8] text-[#040032]",
  },
  {
    id: "session-02",
    time: "10:35 AM - 11:05 AM",
    duration: "30 MINS",
    title: "1st Keynote Session: VC Opening Address & Q&A",
    speaker: "Prof. Kayode Oyebode Adebowale (VC, UI)",
    category: "Keynotes & Talks",
    description:
      "25-minute flagship opening keynote on 'Academic Excellence & Institutional Innovation in Engineering Education', exploring how universities can anchor technical capacity, followed by a 5-minute interactive attendee Q&A.",
    location: "KAAF Main Auditorium",
    imageUrl: "/assets/generated/vice_chancellor.png",
    photoCaption: "Prof. Kayode Oyebode Adebowale, 13th VC of University of Ibadan",
    stampText: "KEYNOTE // 01 · FLAGSHIP",
    badgeColor: "bg-[#c6f552] text-[#040032]",
  },
  {
    id: "session-03",
    time: "11:05 AM - 11:15 AM",
    duration: "10 MINS",
    title: "Headline Sponsor Address & Strategic Spotlight",
    speaker: "Headline Sponsor Leadership Team",
    category: "Keynotes & Talks",
    description:
      "10-minute partner address highlighting industrial engineering partnerships, graduate internships, and corporate technology sponsorships for student innovators.",
    location: "KAAF Main Stage",
    imageUrl: "/assets/generated/iso_ticket_badge.png",
    photoCaption: "Corporate Partner & Engineering Sponsorship Spotlight",
    stampText: "PARTNER // DISPATCH",
    badgeColor: "bg-[#c6f552] text-[#040032]",
  },
  {
    id: "session-04",
    time: "11:15 AM - 11:45 AM",
    duration: "30 MINS",
    title: "2nd Speaker Session: AI, Robotics & Process Discipline",
    speaker: "Dr. Olusola Sayeed Ayoola (Founder & CEO, RAIN)",
    category: "Keynotes & Talks",
    description:
      "25-minute technical keynote: 'Building What AI Can't Replace: How Process Discipline Creates Impact, Not Just Output', followed by 5 minutes of direct audience questions.",
    location: "KAAF Main Auditorium",
    imageUrl: "/assets/generated/ayoola.png",
    photoCaption: "Dr. Olusola Sayeed Ayoola · RAIN Nigeria",
    stampText: "TECH INNOVATION // AI & ROBOTICS",
    badgeColor: "bg-[#c6f552] text-[#040032]",
  },
  {
    id: "session-05",
    time: "11:45 AM - 11:50 AM",
    duration: "5 MINS",
    title: "Delegate Giveaway & Engagement Interlude",
    speaker: "Conference Welfare & Engagement Leads",
    category: "Protocols & Ceremonies",
    description:
      "Fast-paced giveaway interlude featuring conference merchandise, sponsored gift packages, digital passes, and delegate quiz prizes.",
    location: "Auditorium Concourse",
    imageUrl: "/assets/generated/iso_ticket_badge.png",
    photoCaption: "Live Delegate Merchandise & Gift Distribution",
    stampText: "GIVEAWAY // PRIZES",
    badgeColor: "bg-[#ece7d8] text-[#040032]",
  },
  {
    id: "session-06",
    time: "11:50 AM - 12:20 PM",
    duration: "30 MINS",
    title: "Annual Debate, Scholarship Feature & Winner Awards",
    speaker: "Student Debate Teams & Academic Panel",
    category: "Competitions",
    description:
      "20 minutes of competitive debate on emerging industrial paradigms, a 5-minute study path and scholarship feature, culminating in the debate winner trophy presentation.",
    location: "KAAF Main Stage",
    imageUrl: "/assets/generated/iso_gear_ai.png",
    photoCaption: "Undergraduate Debate Championship & Scholarship Grants",
    stampText: "DEBATE // COMPETITION",
    badgeColor: "bg-[#ffdb58] text-[#040032]",
  },
  {
    id: "session-07",
    time: "12:20 PM - 12:50 PM",
    duration: "30 MINS",
    title: "3rd Speaker Session: Professional Capacity & Habits",
    speaker: "Engr. Adebayo Otokiti (Calor Gas Ltd UK)",
    category: "Keynotes & Talks",
    description:
      "25-minute address on 'The Professional You Are Becoming: Why Habits and Commitments Determine Capacity Long Before Opportunity Arrives' (accompanied by snack service) + 5-minute Q&A.",
    location: "KAAF Main Auditorium",
    imageUrl: "/assets/generated/otokiti.png",
    photoCaption: "Engr. Adebayo Otokiti · Calor Gas Ltd UK",
    stampText: "INDUSTRY LEADER // UK ENERGY",
    badgeColor: "bg-[#c6f552] text-[#040032]",
  },
  {
    id: "session-08",
    time: "12:50 PM - 01:00 PM",
    duration: "10 MINS",
    title: "Speaker Award Ceremony & Networking Break",
    speaker: "IESA Executive Council & Honorees",
    category: "Protocols & Ceremonies",
    description:
      "5-minute formal plaque presentation honoring our morning distinguished keynote speakers, followed by a 5-minute networking and leg-stretch interlude.",
    location: "Auditorium Concourse",
    imageUrl: "/assets/generated/kaaf_keynote.png",
    photoCaption: "Honorary Plaque Presentations & Delegate Networking",
    stampText: "HONORS // MIDDAY BREAK",
    badgeColor: "bg-[#ece7d8] text-[#040032]",
  },
  {
    id: "session-09",
    time: "01:00 PM - 01:30 PM",
    duration: "30 MINS",
    title: "Simultaneous Technical Workshops & Masterclasses",
    speaker: "Oluwatobi (Robotics) · Oyindamola Esq (Tech Law) · Emmanuel (Cyber) · Itel Energy (Energy)",
    category: "Workshops",
    description:
      "Concurrent 30-minute breakout tracks: Hands-on Robotics & Physical AI (Aurora Robotics), Tech Law & Intellectual Property (Oyindamola Fasanmi Esq), Industrial Cybersecurity (Cyvant), and Smarter Energy Solutions & Innovation (Itel Energy ⚡).",
    location: "Robotics Lab & Tech Precincts",
    imageUrl: "/assets/generated/itel.png",
    photoCaption: "Concurrent Breakout Tracks: Robotics, Tech Law, SCADA & Itel Energy Solutions ⚡",
    stampText: "WORKSHOPS // 30 MIN BREAKOUT",
    badgeColor: "bg-[#3fffe8] text-[#040032]",
  },
  {
    id: "session-10",
    time: "01:30 PM - 01:45 PM",
    duration: "15 MINS",
    title: "Chairman Keynote Address & Sponsor Talk",
    speaker: "Conference Chairman & Partner Delegates",
    category: "Keynotes & Talks",
    description:
      "10-minute strategic keynote by the Conference Chairman, followed by a 5-minute corporate sponsor presentation celebrating Nigerian engineering talent.",
    location: "KAAF Main Stage",
    imageUrl: "/assets/generated/facilitator.png",
    photoCaption: "Conference Chairman Keynote Address",
    stampText: "CHAIRMAN KEYNOTE // STAGE",
    badgeColor: "bg-[#c6f552] text-[#040032]",
  },
  {
    id: "session-11",
    time: "01:45 PM - 02:30 PM",
    duration: "45 MINS",
    title: "Process Day Hackathon Showcase & Winner Honors",
    speaker: "Hackathon Finalists, Mentors & Judging Panel",
    category: "Competitions",
    description:
      "35 minutes of live student prototype presentations, award presentations to workshop facilitators (2:20 PM), and the coronation of hackathon winners (2:25 PM).",
    location: "Innovation Arena",
    imageUrl: "/assets/generated/iso_analytics_card.png",
    photoCaption: "Hackathon Engineering Prototypes & Award Ceremonies",
    stampText: "HACKATHON // FINALS",
    badgeColor: "bg-[#ffdb58] text-[#040032]",
  },
  {
    id: "session-12",
    time: "02:30 PM - 02:45 PM",
    duration: "15 MINS",
    title: "Engineering Community Games & Audience Trivia",
    speaker: "Conference Social & Engagement Committee",
    category: "Protocols & Ceremonies",
    description:
      "15 minutes of audience trivia, icebreakers, engineering puzzles, and social community prizes for all attendees.",
    location: "KAAF Main Hall",
    imageUrl: "/assets/generated/iso_gear_ai.png",
    photoCaption: "Engineering Trivia & Community Social Interaction",
    stampText: "COMMUNITY // TRIVIA",
    badgeColor: "bg-[#ece7d8] text-[#040032]",
  },
  {
    id: "session-13",
    time: "02:45 PM - 03:50 PM",
    duration: "65 MINS",
    title: "Research Paper Presentation & Peace Club Awards",
    speaker: "Undergraduate Researchers, Peace Club & Faculty Judges",
    category: "Paper Presentations",
    description:
      "55 minutes of competitive student research presentations across industrial engineering disciplines, followed by a 5-minute Peace Club session (3:40 PM) and paper presentation winner awards (3:45 PM).",
    location: "Academic Stage",
    imageUrl: "/assets/generated/iso_robotic_arm.png",
    photoCaption: "Undergraduate Research Defense & Faculty Evaluation",
    stampText: "RESEARCH PAPERS // ACADEMIC",
    badgeColor: "bg-[#bbf2f6] text-[#040032]",
  },
  {
    id: "session-14",
    time: "03:50 PM - 04:00 PM",
    duration: "10 MINS",
    title: "Vote of Thanks, Closing Prayer & Departure",
    speaker: "Conference Lead & IESA Executive Committee",
    category: "Protocols & Ceremonies",
    description:
      "Official vote of thanks by the Conference Lead, closing prayers, sponsor appreciation, and formal attendee departure to conclude IESA Process Day 2026.",
    location: "KAAF Main Auditorium",
    imageUrl: "/assets/generated/logo.png",
    photoCaption: "IESA Process Day 2026 Concluding Assembly",
    stampText: "CLOSING // DEPARTURE",
    badgeColor: "bg-[#ece7d8] text-[#040032]",
  },
  {
    id: "page-back-cover",
    isBackCover: true,
    title: "CONFERENCE DISPATCH ARCHIVE",
    speaker: "Industrial Engineering Students Association",
    description:
      "Thank you for being part of IESA Process Day 2026! Official lecture slides, workshop resources, and digital certificates will be sent directly to everyone joining us today.",
    location: "Department of Industrial & Production Engineering, UI",
    imageUrl: "/assets/generated/logo.png",
    photoCaption: "Forging the Future · UI Industrial Engineering",
    stampText: "OFFICIAL ARCHIVE // CONCLUDED",
    badgeColor: "bg-[#c6f552] text-[#040032]",
  },
];

interface TurnState {
  direction: "next" | "prev";
  targetIndex: number;
}

export default function ProgramJournal() {
  const [displayIndex, setDisplayIndex] = useState(0);
  const [turnState, setTurnState] = useState<TurnState | null>(null);
  const total = JOURNAL_PAGES.length;

  // Real-time normalized turn progress (0 = at rest, 1 = fully flipped to 180deg)
  const turnProgress = useMotionValue(0);
  const isAnimatingRef = useRef(false);
  const currentTurnStateRef = useRef<TurnState | null>(null);

  // Trigger an animated page turn to Next or Prev
  const triggerTurn = (direction: "next" | "prev") => {
    if (isAnimatingRef.current) return;

    // Physical book boundary checks
    if (direction === "next" && displayIndex >= total - 1) return;
    if (direction === "prev" && displayIndex <= 0) return;

    isAnimatingRef.current = true;

    const targetIndex =
      direction === "next"
        ? Math.min(displayIndex + 1, total - 1)
        : Math.max(displayIndex - 1, 0);

    const nextState: TurnState = { direction, targetIndex };
    currentTurnStateRef.current = nextState;
    setTurnState(nextState);
    turnProgress.set(0);

    animate(turnProgress, 1, {
      duration: 0.42,
      ease: [0.22, 1, 0.36, 1],
      onComplete: () => {
        // Synchronously flush state updates into DOM before resetting turnProgress
        flushSync(() => {
          setDisplayIndex(targetIndex);
          setTurnState(null);
          currentTurnStateRef.current = null;
        });
        turnProgress.set(0);
        isAnimatingRef.current = false;
      },
    });
  };

  // Keyboard arrow navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") triggerTurn("next");
      if (e.key === "ArrowLeft") triggerTurn("prev");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [displayIndex, total]);

  // Gesture handling on the active book
  const handleDrag = (_: any, info: any) => {
    if (isAnimatingRef.current) return;

    const dx = info.offset.x;
    if (dx < -6) {
      // Dragging left -> Next page
      if (displayIndex >= total - 1) return; // Cannot flip next on back cover
      const targetIndex = displayIndex + 1;
      if (!currentTurnStateRef.current || currentTurnStateRef.current.direction !== "next") {
        const nextState: TurnState = { direction: "next", targetIndex };
        currentTurnStateRef.current = nextState;
        setTurnState(nextState);
      }
      const progress = Math.min(Math.max(-dx / 320, 0), 1);
      turnProgress.set(progress);
    } else if (dx > 6) {
      // Dragging right -> Prev page
      if (displayIndex <= 0) return; // Cannot flip prev on front cover
      const targetIndex = displayIndex - 1;
      if (!currentTurnStateRef.current || currentTurnStateRef.current.direction !== "prev") {
        const nextState: TurnState = { direction: "prev", targetIndex };
        currentTurnStateRef.current = nextState;
        setTurnState(nextState);
      }
      const progress = Math.min(Math.max(dx / 320, 0), 1);
      turnProgress.set(progress);
    }
  };

  const handleDragEnd = (_: any, info: any) => {
    const activeTurn = currentTurnStateRef.current;
    if (isAnimatingRef.current || !activeTurn) return;

    const currentProgress = turnProgress.get();
    const velocity = Math.abs(info.velocity.x);

    // Commit threshold: turned more than 26% or swiped with speed
    if (currentProgress > 0.26 || velocity > 360) {
      isAnimatingRef.current = true;
      const target = activeTurn.targetIndex;
      animate(turnProgress, 1, {
        duration: Math.max(0.18, 0.35 * (1 - currentProgress)),
        ease: [0.22, 1, 0.36, 1],
        onComplete: () => {
          // Synchronously mount new resting spread in DOM before clearing progress
          flushSync(() => {
            setDisplayIndex(target);
            setTurnState(null);
            currentTurnStateRef.current = null;
          });
          turnProgress.set(0);
          isAnimatingRef.current = false;
        },
      });
    } else {
      // Spring back to rest position
      isAnimatingRef.current = true;
      animate(turnProgress, 0, {
        duration: 0.22,
        ease: [0.25, 1, 0.5, 1],
        onComplete: () => {
          flushSync(() => {
            setTurnState(null);
            currentTurnStateRef.current = null;
          });
          turnProgress.set(0);
          isAnimatingRef.current = false;
        },
      });
    }
  };

  const activePage = JOURNAL_PAGES[displayIndex];

  return (
    <div className="w-full flex flex-col items-center select-none py-2">
      {/* 3D Viewport Stage */}
      <div
        className="relative w-full max-w-6xl h-[340px] xs:h-[360px] sm:h-[440px] md:h-[530px] flex items-center justify-center overflow-visible"
        style={{ perspective: "1600px" }}
      >
        {/* Interactive Gesture Surface */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.16}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Main Book Component */}
          <BookStage
            displayIndex={displayIndex}
            turnState={turnState}
            turnProgress={turnProgress}
          />
        </motion.div>
      </div>

      {/* Tactile Navigation Bar */}
      <div className="mt-4 sm:mt-8 flex flex-col items-center gap-3 sm:gap-4 z-30">
        <div className="flex items-center gap-3 bg-[#040032]/90 backdrop-blur-md px-5 py-2.5 rounded-full border-2 border-[#040032] shadow-2xl">
          <button
            onClick={() => triggerTurn("prev")}
            aria-label="Previous Page"
            className="w-9 h-9 rounded-full bg-[#ece7d8] text-[#040032] flex items-center justify-center hover:bg-[#c6f552] transition-colors active:scale-95 cursor-pointer"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 px-3 text-xs font-mono-meta font-bold text-[#faf8f2]">
            <BookOpenIcon className="w-4 h-4 text-[#c6f552]" />
            <span>
              {activePage.isCover
                ? "FRONT COVER (CLOSED)"
                : activePage.isBackCover
                ? "BACK COVER (CLOSED)"
                : `SPREAD ${displayIndex} OF ${total - 2}`}
            </span>
            <span className="text-[#3fffe8] hidden sm:inline">
              · {activePage.time || "10:00 AM - 4:00 PM"}
            </span>
          </div>

          <button
            onClick={() => triggerTurn("next")}
            aria-label="Next Page"
            className="w-9 h-9 rounded-full bg-[#ece7d8] text-[#040032] flex items-center justify-center hover:bg-[#c6f552] transition-colors active:scale-95 cursor-pointer"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Page Scrubber Dots */}
        <div className="flex items-center gap-1.5 flex-wrap justify-center max-w-lg px-4">
          {JOURNAL_PAGES.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => {
                if (!isAnimatingRef.current && idx !== displayIndex) {
                  triggerTurn(idx > displayIndex ? "next" : "prev");
                }
              }}
              aria-label={`Go to spread ${idx}`}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === displayIndex
                  ? "w-7 bg-[#0a3825]"
                  : "w-2 bg-[#040032]/25 hover:bg-[#040032]/50"
              }`}
            />
          ))}
        </div>

        {/* Tactile Drag Hint */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono-meta font-bold text-[#040032]/60 uppercase tracking-widest text-center px-4">
          <ArrowsRightLeftIcon className="w-3.5 h-3.5 text-[#0a3825]" />
          <span>DRAG LEFT OR RIGHT TO TURN BOOK PAGES IN REAL-TIME 3D</span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   BOOK STAGE DISPATCHER
   ========================================================================= */
function BookStage({
  displayIndex,
  turnState,
  turnProgress,
}: {
  displayIndex: number;
  turnState: TurnState | null;
  turnProgress: MotionValue<number>;
}) {
  const isFrontCover = displayIndex === 0;
  const isBackCover = displayIndex === JOURNAL_PAGES.length - 1;

  // 1. FRONT COVER (Spread 0)
  if (isFrontCover) {
    if (turnState && turnState.direction === "next") {
      // Opening front cover into Spread 1
      return (
        <OpeningFrontCoverTransition
          nextPage={JOURNAL_PAGES[1]}
          turnProgress={turnProgress}
        />
      );
    }
    // Closed Front Cover at rest
    return <ClosedFrontCoverAtRest />;
  }

  // 2. BACK COVER (Spread 15)
  if (isBackCover) {
    if (turnState && turnState.direction === "prev") {
      // Opening back cover backwards into Session 14
      return (
        <OpeningBackCoverTransition
          prevPage={JOURNAL_PAGES[JOURNAL_PAGES.length - 2]}
          turnProgress={turnProgress}
        />
      );
    }
    // Closed Back Cover at rest
    return <ClosedBackCoverAtRest />;
  }

  // 3. OPEN TWO-PAGE SPREADS (Spreads 1 to 14)
  return (
    <OpenBookSpreadStage
      displayIndex={displayIndex}
      turnState={turnState}
      turnProgress={turnProgress}
    />
  );
}

/* =========================================================================
   1. CLOSED FRONT COVER (AT REST)
   ========================================================================= */
function ClosedFrontCoverAtRest() {
  return (
    <div
      className="relative w-[68vw] max-w-[220px] sm:max-w-[320px] md:max-w-[420px] h-[300px] xs:h-[315px] sm:h-[390px] md:h-[470px] flex items-center justify-center select-none"
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* 3D Ground Shadow */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-4/5 h-8 bg-black/45 rounded-full filter blur-xl pointer-events-none" />

      {/* Ribbon Bookmark draped over top */}
      <div className="absolute -top-3 left-16 w-5 h-8 bg-gradient-to-b from-[#c6f552] to-[#9ed828] z-30 shadow-md transform rotate-1 rounded-t-sm pointer-events-none">
        <div className="absolute bottom-0 inset-x-0 h-2 bg-[#040032] [clip-path:polygon(0_100%,50%_0,100%_100%)]" />
      </div>

      {/* 1. Back Cover Rim Underneath (Navy leather extending 10px to the right) */}
      <div
        style={{
          position: "absolute",
          top: "0px",
          bottom: "0px",
          left: "0px",
          right: "-10px",
          transform: "translateZ(-12px)",
        }}
        className="rounded-r-3xl rounded-l-sm border border-[#c6f552]/30 bg-[#040032] shadow-xl pointer-events-none"
      />

      {/* 2. Stepped Closed Pages (Neatly inset between covers, stepping out to the right) */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          bottom: "10px",
          left: "0px",
          right: "-7px",
          transform: "translateZ(-8px)",
          backgroundColor: "#ede3cf",
          borderRadius: "0 18px 18px 0",
          boxShadow: "2px 0 4px rgba(0,0,0,0.08)",
        }}
        className="border-r border-y border-[#040032]/25 pointer-events-none"
      />
      <div
        style={{
          position: "absolute",
          top: "12px",
          bottom: "12px",
          left: "0px",
          right: "-5px",
          transform: "translateZ(-5px)",
          backgroundColor: "#f5eee0",
          borderRadius: "0 16px 16px 0",
        }}
        className="border-r border-y border-[#040032]/20 pointer-events-none"
      />
      <div
        style={{
          position: "absolute",
          top: "14px",
          bottom: "14px",
          left: "0px",
          right: "-3px",
          transform: "translateZ(-2px)",
          backgroundColor: "#faf8f2",
          borderRadius: "0 14px 14px 0",
        }}
        className="border-r border-y border-[#040032]/15 pointer-events-none"
      />

      {/* 3. The Single Hardcover Front Jacket */}
      <div
        style={{
          transformStyle: "preserve-3d",
          // Distinct Book Cover Border Radius:
          // Left (Spine): small rounded-l-sm; Right (Fore-edge): large rounded-r-3xl
        }}
        className="relative w-full h-full rounded-r-3xl rounded-l-sm overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.15)] border-2 border-[#040032] bg-gradient-to-br from-[#020024] via-[#040032] to-[#041c16] text-[#faf8f2]"
      >
        <FrontCoverArtwork />
      </div>
    </div>
  );
}

/* =========================================================================
   2. CLOSED BACK COVER (AT REST)
   ========================================================================= */
function ClosedBackCoverAtRest() {
  return (
    <div
      className="relative w-[68vw] max-w-[220px] sm:max-w-[320px] md:max-w-[420px] h-[300px] xs:h-[315px] sm:h-[390px] md:h-[470px] flex items-center justify-center select-none"
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* 3D Ground Shadow */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-4/5 h-8 bg-black/45 rounded-full filter blur-xl pointer-events-none" />

      {/* 1. Front Cover Rim Underneath (Navy leather extending 10px to the left) */}
      <div
        style={{
          position: "absolute",
          top: "0px",
          bottom: "0px",
          right: "0px",
          left: "-10px",
          transform: "translateZ(-12px)",
        }}
        className="rounded-l-3xl rounded-r-sm border border-[#c6f552]/30 bg-[#040032] shadow-xl pointer-events-none"
      />

      {/* 2. Stepped Closed Pages (Neatly inset between covers, stepping out to the left) */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          bottom: "10px",
          right: "0px",
          left: "-7px",
          transform: "translateZ(-8px)",
          backgroundColor: "#ede3cf",
          borderRadius: "18px 0 0 18px",
          boxShadow: "-2px 0 4px rgba(0,0,0,0.08)",
        }}
        className="border-l border-y border-[#040032]/25 pointer-events-none"
      />
      <div
        style={{
          position: "absolute",
          top: "12px",
          bottom: "12px",
          right: "0px",
          left: "-5px",
          transform: "translateZ(-5px)",
          backgroundColor: "#f5eee0",
          borderRadius: "16px 0 0 16px",
        }}
        className="border-l border-y border-[#040032]/20 pointer-events-none"
      />
      <div
        style={{
          position: "absolute",
          top: "14px",
          bottom: "14px",
          right: "0px",
          left: "-3px",
          transform: "translateZ(-2px)",
          backgroundColor: "#faf8f2",
          borderRadius: "14px 0 0 14px",
        }}
        className="border-l border-y border-[#040032]/15 pointer-events-none"
      />

      {/* 3. The Single Hardcover Back Jacket */}
      <div
        style={{
          transformStyle: "preserve-3d",
          // Distinct Book Cover Border Radius:
          // Right (Spine): small rounded-r-sm; Left (Fore-edge): large rounded-l-3xl
        }}
        className="relative w-full h-full rounded-l-3xl rounded-r-sm overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.15)] border-2 border-[#040032] bg-gradient-to-bl from-[#020024] via-[#040032] to-[#041c16] text-[#faf8f2]"
      >
        <BackCoverArtwork />
      </div>
    </div>
  );
}

/* =========================================================================
   3. OPEN TWO-PAGE SPREADS WITH EXACT NUMBER OF FANNING STACKED PAGES
   ========================================================================= */
function OpenBookSpreadStage({
  displayIndex,
  turnState,
  turnProgress,
}: {
  displayIndex: number;
  turnState: TurnState | null;
  turnProgress: MotionValue<number>;
}) {
  const totalSpreads = JOURNAL_PAGES.length - 2; // 14 spreads
  const currentSpreadNum = displayIndex; // 1 to 14

  // Physical page counting:
  // Left turned pages: exactly (currentSpreadNum - 1)
  const leftPageCount = Math.max(0, currentSpreadNum - 1);
  // Right remaining pages: exactly (totalSpreads - currentSpreadNum)
  const rightPageCount = Math.max(0, totalSpreads - currentSpreadNum);

  const currentPage = JOURNAL_PAGES[displayIndex];

  // Derive dynamic page turn rotations from normalized turnProgress (0 to 1)
  const rightTurnAngle = useTransform(turnProgress, [0, 1], [-14, -180]);
  const leftTurnAngle = useTransform(turnProgress, [0, 1], [14, 180]);
  const rightLiftShadow = useTransform(turnProgress, [0, 0.5, 1], [0, 0.35, 0]);
  const leftLiftShadow = useTransform(turnProgress, [0, 0.5, 1], [0, 0.35, 0]);

  return (
    <div
      className="relative w-[95vw] max-w-[380px] sm:max-w-[620px] md:max-w-[800px] lg:max-w-[880px] h-[300px] xs:h-[315px] sm:h-[390px] md:h-[470px] flex items-center justify-center select-none"
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* 3D Ground Shadow */}
      <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 w-[88%] h-8 bg-black/35 rounded-full filter blur-xl pointer-events-none" />

      {/* -------------------------------------------------------------
          MAIN TWO-PAGE SPREAD (ABSOLUTE POSITIONED, NEVER FLEXES)
          ------------------------------------------------------------- */}
      <div
        className="relative w-full h-full z-20"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* PHYSICAL HARDCOVER BASE & STACKED FORE-EDGE PAGES */}
        <LeftBookStack pageCount={leftPageCount} totalSpreads={totalSpreads} />
        <RightBookStack pageCount={rightPageCount} totalSpreads={totalSpreads} />

        {/* =========================================================
            1. LEFT HALF BASE LAYER (Underneath during Prev Turn, or Resting)
            ========================================================= */}
        {turnState && turnState.direction === "prev" ? (
          // Revealed Underneath on the Left during Prev Turn
          <div
            style={{
              transformOrigin: "right center",
              transform: "rotateY(14deg)",
              transformStyle: "preserve-3d",
            }}
            className="absolute top-0 bottom-0 left-0 w-1/2 rounded-l-3xl rounded-r-none overflow-hidden shadow-lg border border-r-0 border-[#040032]/20 z-10"
          >
            <StandardLeftPageContent
              page={JOURNAL_PAGES[turnState.targetIndex]}
            />
          </div>
        ) : (
          // Resting Left Leaf
          <div
            style={{
              transformOrigin: "right center",
              transform: "rotateY(14deg)",
              transformStyle: "preserve-3d",
            }}
            className="absolute top-0 bottom-0 left-0 w-1/2 rounded-l-3xl rounded-r-none overflow-hidden shadow-[-4px_2px_14px_rgba(0,0,0,0.12)] border border-r-0 border-[#040032]/20 z-10"
          >
            <StandardLeftPageContent page={currentPage} />
          </div>
        )}

        {/* =========================================================
            2. RIGHT HALF BASE LAYER (Underneath during Next Turn, or Resting)
            ========================================================= */}
        {turnState && turnState.direction === "next" ? (
          // Revealed Underneath on the Right during Next Turn
          <div
            style={{
              transformOrigin: "left center",
              transform: "rotateY(-14deg)",
              transformStyle: "preserve-3d",
            }}
            className="absolute top-0 bottom-0 left-1/2 w-1/2 rounded-r-3xl rounded-l-none overflow-hidden shadow-lg border border-l-0 border-[#040032]/20 z-10"
          >
            <StandardRightPageContent
              page={JOURNAL_PAGES[turnState.targetIndex]}
            />
          </div>
        ) : (
          // Resting Right Leaf (Anchored stably on right side at all times)
          <div
            style={{
              transformOrigin: "left center",
              transform: "rotateY(-14deg)",
              transformStyle: "preserve-3d",
            }}
            className="absolute top-0 bottom-0 left-1/2 w-1/2 rounded-r-3xl rounded-l-none overflow-hidden shadow-[4px_2px_14px_rgba(0,0,0,0.12)] border border-l-0 border-[#040032]/20 z-10"
          >
            <StandardRightPageContent page={currentPage} />
          </div>
        )}

        {/* =========================================================
            3. TURNING LEAF (TOP LAYER z-40)
            ========================================================= */}
        {turnState && turnState.direction === "prev" && (
          // Turning Left Leaf backward to previous page (14deg to 180deg)
          <motion.div
            style={{
              transformOrigin: "right center",
              transformStyle: "preserve-3d",
              rotateY: leftTurnAngle,
              zIndex: 40,
            }}
            className="absolute top-0 bottom-0 left-0 w-1/2"
          >
            {/* Front Face: Current Left Leaf (visible from +14deg to +90deg) */}
            <div
              style={{
                backfaceVisibility: "hidden",
                transformStyle: "preserve-3d",
              }}
              className="absolute inset-0 rounded-l-3xl rounded-r-none overflow-hidden shadow-2xl border border-r-0 border-[#040032]/20"
            >
              <StandardLeftPageContent page={currentPage} />
              <motion.div
                className="absolute inset-0 bg-black pointer-events-none select-none"
                style={{ opacity: leftLiftShadow }}
              />
            </div>

            {/* Back Face: Target Right Leaf (visible from +90deg to +180deg) */}
            <div
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                transformStyle: "preserve-3d",
              }}
              className="absolute inset-0 rounded-r-3xl rounded-l-none overflow-hidden shadow-2xl border border-l-0 border-[#040032]/20"
            >
              {turnState.targetIndex === 0 ? (
                <FrontCoverArtwork />
              ) : (
                <StandardRightPageContent
                  page={JOURNAL_PAGES[turnState.targetIndex]}
                />
              )}
            </div>
          </motion.div>
        )}

        {turnState && turnState.direction === "next" && (
          // Turning Right Leaf forward to next page (-14deg to -180deg)
          <motion.div
            style={{
              transformOrigin: "left center",
              transformStyle: "preserve-3d",
              rotateY: rightTurnAngle,
              zIndex: 40,
            }}
            className="absolute top-0 bottom-0 left-1/2 w-1/2"
          >
            {/* Front Face: Current Right Leaf (visible from -14deg to -90deg) */}
            <div
              style={{
                backfaceVisibility: "hidden",
                transformStyle: "preserve-3d",
              }}
              className="absolute inset-0 rounded-r-3xl rounded-l-none overflow-hidden shadow-2xl border border-l-0 border-[#040032]/20"
            >
              <StandardRightPageContent page={currentPage} />
              <motion.div
                className="absolute inset-0 bg-black pointer-events-none select-none"
                style={{ opacity: rightLiftShadow }}
              />
            </div>

            {/* Back Face: Target Left Leaf (visible from -90deg to -180deg) */}
            <div
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                transformStyle: "preserve-3d",
              }}
              className="absolute inset-0 rounded-l-3xl rounded-r-none overflow-hidden shadow-2xl border border-r-0 border-[#040032]/20"
            >
              {turnState.targetIndex === JOURNAL_PAGES.length - 1 ? (
                <BackCoverArtwork />
              ) : (
                <StandardLeftPageContent
                  page={JOURNAL_PAGES[turnState.targetIndex]}
                />
              )}
            </div>
          </motion.div>
        )}

        {/* Center Spine Seam */}
        <div
          className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-3 pointer-events-none select-none z-50 flex items-center justify-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="w-1.5 h-full bg-gradient-to-r from-black/8 via-black/2 to-black/8 mix-blend-multiply" />
          <div className="absolute top-0 bottom-0 w-[1px] bg-white/50 shadow-sm" />
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   PHYSICAL HARDCOVER BASE & STACKED PAPER EDGES
   ========================================================================= */

interface StackProps {
  pageCount: number;
  totalSpreads: number;
}

/** Left Wing Stacked Pages & Hardcover Base */
function LeftBookStack({ pageCount, totalSpreads }: StackProps) {
  // Number of visible stacked sheets (1 when early, up to 6 when many pages turned)
  const ratio = Math.max(0, Math.min(1, pageCount / Math.max(1, totalSpreads - 1)));
  const numSheets = Math.max(1, Math.min(6, Math.round(1 + ratio * 5)));
  const stepPx = 3.5;
  const coverOutset = numSheets * stepPx + 6;

  // Render sheets from bottom (outermost) to top (innermost)
  const sheets = Array.from({ length: numSheets }, (_, i) => numSheets - i);

  return (
    <div
      style={{
        transformOrigin: "right center",
        transform: "rotateY(14deg)",
        transformStyle: "preserve-3d",
      }}
      className="absolute top-0 bottom-0 left-0 w-1/2 pointer-events-none select-none z-0"
    >
      {/* 1. Hardcover Backing Base (Dark Navy Leather extending beyond all sheets) */}
      <div
        style={{
          position: "absolute",
          left: `-${coverOutset}px`,
          right: "0px",
          top: "-5px",
          bottom: "-5px",
          transform: "translateZ(-12px)",
          borderRadius: "28px 0 0 28px",
        }}
        className="bg-[#040032] border border-[#c6f552]/30 shadow-[0_20px_45px_rgba(0,0,0,0.55)]"
      />

      {/* 2. Individual Stacked Paper Sheets (Clean paper color, crisp 1px borders, subtle drop-shadows) */}
      {sheets.map((sheetIndex) => {
        const offset = sheetIndex * stepPx;
        const vertInset = (numSheets - sheetIndex) * 1.5;

        return (
          <div
            key={`left-sheet-${sheetIndex}`}
            style={{
              position: "absolute",
              left: `-${offset}px`,
              right: "0px",
              top: `${vertInset}px`,
              bottom: `${vertInset}px`,
              transform: `translateZ(-${sheetIndex * 1.5}px)`,
              backgroundColor: "#faf8f2",
              borderRadius: "24px 0 0 24px",
              boxShadow:
                "-2px 0 4px rgba(0, 0, 0, 0.08), -1px 0 1px rgba(0, 0, 0, 0.05)",
            }}
            className="border-l border-y border-[#040032]/15"
          />
        );
      })}
    </div>
  );
}

/** Right Wing Stacked Pages & Hardcover Base */
function RightBookStack({ pageCount, totalSpreads }: StackProps) {
  // Number of visible stacked sheets (6 when early / unread, down to 1 when at the end)
  const ratio = Math.max(0, Math.min(1, pageCount / Math.max(1, totalSpreads - 1)));
  const numSheets = Math.max(1, Math.min(6, Math.round(1 + ratio * 5)));
  const stepPx = 3.5;
  const coverOutset = numSheets * stepPx + 6;

  const sheets = Array.from({ length: numSheets }, (_, i) => numSheets - i);

  return (
    <div
      style={{
        transformOrigin: "left center",
        transform: "rotateY(-14deg)",
        transformStyle: "preserve-3d",
      }}
      className="absolute top-0 bottom-0 left-1/2 w-1/2 pointer-events-none select-none z-0"
    >
      {/* 1. Hardcover Backing Base (Dark Navy Leather extending beyond all sheets) */}
      <div
        style={{
          position: "absolute",
          left: "0px",
          right: `-${coverOutset}px`,
          top: "-5px",
          bottom: "-5px",
          transform: "translateZ(-12px)",
          borderRadius: "0 28px 28px 0",
        }}
        className="bg-[#040032] border border-[#c6f552]/30 shadow-[0_20px_45px_rgba(0,0,0,0.55)]"
      />

      {/* 2. Individual Stacked Paper Sheets (Clean paper color, crisp 1px borders, subtle drop-shadows) */}
      {sheets.map((sheetIndex) => {
        const offset = sheetIndex * stepPx;
        const vertInset = (numSheets - sheetIndex) * 1.5;

        return (
          <div
            key={`right-sheet-${sheetIndex}`}
            style={{
              position: "absolute",
              left: "0px",
              right: `-${offset}px`,
              top: `${vertInset}px`,
              bottom: `${vertInset}px`,
              transform: `translateZ(-${sheetIndex * 1.5}px)`,
              backgroundColor: "#faf8f2",
              borderRadius: "0 24px 24px 0",
              boxShadow:
                "2px 0 4px rgba(0, 0, 0, 0.08), 1px 0 1px rgba(0, 0, 0, 0.05)",
            }}
            className="border-r border-y border-[#040032]/15"
          />
        );
      })}
    </div>
  );
}

/* =========================================================================
   OPENING TRANSITIONS TO/FROM COVERS
   ========================================================================= */
function OpeningFrontCoverTransition({
  nextPage,
  turnProgress,
}: {
  nextPage: JournalItem;
  turnProgress: MotionValue<number>;
}) {
  const turnAngle = useTransform(turnProgress, [0, 1], [0, -180]);
  const liftShadow = useTransform(turnProgress, [0, 0.5, 1], [0, 0.4, 0]);
  const totalSpreads = JOURNAL_PAGES.length - 2;

  return (
    <div
      className="relative w-[95vw] max-w-[380px] sm:max-w-[620px] md:max-w-[800px] lg:max-w-[880px] h-[300px] xs:h-[315px] sm:h-[390px] md:h-[470px] flex items-center justify-center select-none"
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 w-[88%] h-8 bg-black/35 rounded-full filter blur-xl pointer-events-none" />

      {/* The Two-Page Stage */}
      <div
        className="relative w-full h-full z-20"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Right Underneath Stack & Hardcover Base */}
        <RightBookStack pageCount={totalSpreads - 1} totalSpreads={totalSpreads} />

        {/* Right Underneath: Spread 1 Right Leaf (Revealed as Front Cover opens) */}
        <div
          style={{
            transformOrigin: "left center",
            transform: "rotateY(-14deg)",
            transformStyle: "preserve-3d",
          }}
          className="absolute top-0 bottom-0 left-1/2 w-1/2 rounded-r-3xl rounded-l-none overflow-hidden shadow-xl border-2 border-l-0 border-[#040032]/25 z-10"
        >
          <StandardRightPageContent page={nextPage} />
        </div>

        {/* The Front Cover Turning Leaf (Hinged at Center Spine left center) */}
        <motion.div
          style={{
            transformOrigin: "left center",
            transformStyle: "preserve-3d",
            rotateY: turnAngle,
            zIndex: 40,
          }}
          className="absolute top-0 bottom-0 left-1/2 w-1/2"
        >
          {/* Front Face: Closed Front Cover (0deg to -90deg) */}
          <div
            style={{
              backfaceVisibility: "hidden",
              transformStyle: "preserve-3d",
            }}
            className="absolute inset-0 rounded-r-3xl rounded-l-sm overflow-hidden shadow-2xl border-2 border-[#040032] bg-gradient-to-br from-[#020024] via-[#040032] to-[#041c16]"
          >
            <FrontCoverArtwork />
            <motion.div
              className="absolute inset-0 bg-black pointer-events-none"
              style={{ opacity: liftShadow }}
            />
          </div>

          {/* Back Face: Spread 1 Left Leaf (Inside Endpaper, -90deg to -180deg) */}
          <div
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              transformStyle: "preserve-3d",
            }}
            className="absolute inset-0 rounded-l-3xl rounded-r-none overflow-hidden shadow-2xl border-2 border-r-0 border-[#040032]/25"
          >
            <StandardLeftPageContent page={nextPage} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function OpeningBackCoverTransition({
  prevPage,
  turnProgress,
}: {
  prevPage: JournalItem;
  turnProgress: MotionValue<number>;
}) {
  const turnAngle = useTransform(turnProgress, [0, 1], [0, 180]);
  const liftShadow = useTransform(turnProgress, [0, 0.5, 1], [0, 0.4, 0]);
  const totalSpreads = JOURNAL_PAGES.length - 2;

  return (
    <div
      className="relative w-[95vw] max-w-[380px] sm:max-w-[620px] md:max-w-[800px] lg:max-w-[880px] h-[300px] xs:h-[315px] sm:h-[390px] md:h-[470px] flex items-center justify-center select-none"
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 w-[88%] h-8 bg-black/35 rounded-full filter blur-xl pointer-events-none" />

      {/* The Two-Page Stage */}
      <div
        className="relative w-full h-full z-20"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Left Underneath Stack & Hardcover Base */}
        <LeftBookStack pageCount={totalSpreads - 1} totalSpreads={totalSpreads} />

        {/* Left Underneath: Session 14 Left Leaf (Revealed as Back Cover opens backward) */}
        <div
          style={{
            transformOrigin: "right center",
            transform: "rotateY(14deg)",
            transformStyle: "preserve-3d",
          }}
          className="absolute top-0 bottom-0 left-0 w-1/2 rounded-l-3xl rounded-r-none overflow-hidden shadow-xl border-2 border-r-0 border-[#040032]/25 z-10"
        >
          <StandardLeftPageContent page={prevPage} />
        </div>

        {/* The Back Cover Turning Leaf (Hinged at Center Spine right center) */}
        <motion.div
          style={{
            transformOrigin: "right center",
            transformStyle: "preserve-3d",
            rotateY: turnAngle,
            zIndex: 40,
          }}
          className="absolute top-0 bottom-0 left-0 w-1/2"
        >
          {/* Front Face: Closed Back Cover (0deg to +90deg) */}
          <div
            style={{
              backfaceVisibility: "hidden",
              transformStyle: "preserve-3d",
            }}
            className="absolute inset-0 rounded-l-3xl rounded-r-sm overflow-hidden shadow-2xl border-2 border-[#040032] bg-gradient-to-bl from-[#020024] via-[#040032] to-[#041c16]"
          >
            <BackCoverArtwork />
            <motion.div
              className="absolute inset-0 bg-black pointer-events-none"
              style={{ opacity: liftShadow }}
            />
          </div>

          {/* Back Face: Session 14 Right Leaf (+90deg to +180deg) */}
          <div
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              transformStyle: "preserve-3d",
            }}
            className="absolute inset-0 rounded-r-3xl rounded-l-none overflow-hidden shadow-2xl border-2 border-l-0 border-[#040032]/25"
          >
            <StandardRightPageContent page={prevPage} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* =========================================================================
   GLOWING COVER ACTION BADGE (COMPACT WITH PLATFORM LIQUID-METAL GLOW)
   ========================================================================= */
function GlowingCoverBadge({ text }: { text: string }) {
  return (
    <div
      className="relative inline-block rounded-full p-[1.5px] transition-all duration-300 pointer-events-none select-none"
      style={{
        background:
          "linear-gradient(90deg, #040032 0%, #00e5ff 25%, #c6f552 50%, #3fffe8 75%, #040032 100%)",
        backgroundSize: "300% 300%",
        animation: "liquid-metal-glow 6s ease infinite",
        boxShadow:
          "0 0 14px rgba(0, 229, 255, 0.4), 0 0 8px rgba(198, 245, 82, 0.3)",
      }}
    >
      <div className="flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#040032] text-[#c6f552] text-[8px] sm:text-[10px] font-mono-meta font-extrabold uppercase tracking-wider">
        <span>{text}</span>
      </div>
    </div>
  );
}

/* =========================================================================
   ABSTRACT LUXURY COVER ARTWORK
   ========================================================================= */
function FrontCoverArtwork() {
  return (
    <div className="relative w-full h-full p-3.5 sm:p-6 md:p-8 flex flex-col justify-between items-center overflow-hidden">
      {/* Abstract Engineering Wireframe Geometry */}
      <div className="absolute inset-0 opacity-15 pointer-events-none select-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50%" cy="48%" r="140" fill="none" stroke="#c6f552" strokeWidth="1" strokeDasharray="4 6" />
          <circle cx="50%" cy="48%" r="180" fill="none" stroke="#3fffe8" strokeWidth="0.75" />
          <line x1="15%" y1="48%" x2="85%" y2="48%" stroke="#faf8f2" strokeWidth="0.5" strokeDasharray="2 4" />
          <line x1="50%" y1="15%" x2="50%" y2="85%" stroke="#faf8f2" strokeWidth="0.5" strokeDasharray="2 4" />
        </svg>
      </div>

      {/* Gold Debossed Outer Border Frame */}
      <div className="absolute inset-2 sm:inset-3 rounded-r-2xl rounded-l-xs border border-[#c6f552]/30 pointer-events-none select-none" />

      {/* Left Bound Spine Seam Bar */}
      <div className="absolute left-0 inset-y-0 w-3 sm:w-4 bg-gradient-to-r from-black/80 via-[#040032] to-transparent pointer-events-none select-none" />
      <div className="absolute left-2.5 sm:left-3 inset-y-2.5 sm:inset-y-3 w-[1px] bg-[#c6f552]/40 pointer-events-none select-none" />

      {/* Top Edition Meta */}
      <div className="relative z-10 text-center space-y-0.5 sm:space-y-1 pt-0.5 pointer-events-none select-none">
        <div className="flex items-center justify-center gap-1.5 text-[8px] sm:text-[9px] font-mono-meta font-extrabold text-[#c6f552] uppercase tracking-widest">
          <span>VOL. VI</span>
          <span>·</span>
          <span>OFFICIAL PROCEEDINGS</span>
        </div>
        <h2 className="font-serif-display text-lg sm:text-2xl md:text-3xl font-bold tracking-tight text-[#faf8f2] leading-tight drop-shadow-[0_2px_12px_rgba(0,229,255,0.3)]">
          FORGE THE{" "}
          <span
            className="font-serif-italic inline-block"
            style={{
              background:
                "linear-gradient(90deg, #c6f552 0%, #3fffe8 35%, #00e5ff 70%, #c6f552 100%)",
              backgroundSize: "200% auto",
              animation: "liquid-metal-glow 4s linear infinite",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 10px rgba(198,245,82,0.5))",
            }}
          >
            Future
          </span>
        </h2>
        <p className="text-[8px] sm:text-[10px] font-mono-meta text-[#3fffe8] tracking-wider uppercase font-bold text-center">
          IESA PROCESS DAY // 2026
        </p>
      </div>

      {/* Center Luxury Medallion with Liquid Metal Glowing Rim */}
      <div className="relative my-auto flex items-center justify-center pointer-events-none select-none">
        {/* Ambient liquid metal glow pulse behind medallion */}
        <div
          className="absolute -inset-1.5 rounded-full opacity-60 blur-md pointer-events-none select-none"
          style={{
            background:
              "linear-gradient(90deg, #040032 0%, #00e5ff 25%, #c6f552 50%, #3fffe8 75%, #040032 100%)",
            backgroundSize: "300% 300%",
            animation: "liquid-metal-glow 6s ease infinite",
          }}
        />

        {/* Animated Liquid Metal Border Rim */}
        <div
          className="relative w-16 h-16 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-full p-[2.5px] shadow-[0_0_25px_rgba(0,229,255,0.4),0_0_15px_rgba(198,245,82,0.35)] flex items-center justify-center"
          style={{
            background:
              "linear-gradient(135deg, #040032 0%, #00e5ff 25%, #c6f552 50%, #3fffe8 75%, #040032 100%)",
            backgroundSize: "300% 300%",
            animation: "liquid-metal-glow 6s ease infinite",
          }}
        >
          <div className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-[#040032]/90 border border-[#faf8f2]/10">
            <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/60 pointer-events-none" />
            <Image
              src="/assets/generated/logo.png"
              alt="IESA Official Crest"
              fill
              draggable={false}
              className="object-contain p-2 sm:p-3 filter drop-shadow-[0_0_12px_rgba(0,229,255,0.6)] drop-shadow-[0_0_6px_rgba(198,245,82,0.5)] pointer-events-none select-none"
            />
          </div>
        </div>
      </div>

      {/* Bottom Technical Seal & Glowing Action Cue */}
      <div className="relative z-10 text-center space-y-1 sm:space-y-1.5 pb-0.5 pointer-events-none select-none">
        <div className="flex items-center justify-center gap-1.5 text-[8px] sm:text-[10px] font-mono-meta text-[#c6f552] font-extrabold tracking-wide">
          <span>KAAF AUDITORIUM</span>
          <span>·</span>
          <span>UNIV. OF IBADAN</span>
        </div>
        <GlowingCoverBadge text="✦ DRAG TO OPEN ✦" />
      </div>
    </div>
  );
}

function BackCoverArtwork() {
  return (
    <div className="relative w-full h-full p-3.5 sm:p-6 md:p-8 flex flex-col justify-between items-center overflow-hidden">
      {/* Abstract Archival Geometric Lines */}
      <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50%" cy="50%" r="150" fill="none" stroke="#faf8f2" strokeWidth="1" strokeDasharray="3 5" />
          <circle cx="50%" cy="50%" r="90" fill="none" stroke="#c6f552" strokeWidth="0.8" />
        </svg>
      </div>

      {/* Gold Debossed Outer Border Frame */}
      <div className="absolute inset-2 sm:inset-3 rounded-l-2xl rounded-r-xs border border-[#c6f552]/30 pointer-events-none select-none" />

      {/* Right Bound Spine Seam Bar */}
      <div className="absolute right-0 inset-y-0 w-3 sm:w-4 bg-gradient-to-l from-black/80 via-[#040032] to-transparent pointer-events-none select-none" />
      <div className="absolute right-2.5 sm:right-3 inset-y-2.5 sm:inset-y-3 w-[1px] bg-[#c6f552]/40 pointer-events-none select-none" />

      {/* Header Badge */}
      <div className="relative z-10 text-center space-y-0.5 sm:space-y-1 pt-0.5 pointer-events-none select-none">
        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#c6f552] text-[#040032] text-[8px] sm:text-[9px] font-mono-meta font-extrabold uppercase tracking-wider shadow-sm">
          <CheckBadgeIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span>CONCLUDED</span>
        </div>
        <h3 className="font-serif-display text-lg sm:text-2xl md:text-3xl font-bold text-[#faf8f2]">
          Archive
        </h3>
      </div>

      {/* Center Archival Crest with Liquid Metal Glowing Rim */}
      <div className="relative my-auto flex items-center justify-center pointer-events-none select-none">
        <div
          className="absolute -inset-1.5 rounded-full opacity-40 blur-md pointer-events-none select-none"
          style={{
            background:
              "linear-gradient(90deg, #040032 0%, #00e5ff 25%, #c6f552 50%, #3fffe8 75%, #040032 100%)",
            backgroundSize: "300% 300%",
            animation: "liquid-metal-glow 8s ease infinite",
          }}
        />

        <div
          className="relative w-16 h-16 sm:w-28 sm:h-28 rounded-full p-[2px] shadow-[0_0_20px_rgba(0,229,255,0.3)] flex items-center justify-center"
          style={{
            background:
              "linear-gradient(135deg, #040032 0%, #00e5ff 25%, #c6f552 50%, #3fffe8 75%, #040032 100%)",
            backgroundSize: "300% 300%",
            animation: "liquid-metal-glow 8s ease infinite",
          }}
        >
          <div className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-[#040032]/85">
            <Image
              src="/assets/generated/logo.png"
              alt="IESA Seal"
              fill
              draggable={false}
              className="object-contain p-2 sm:p-3 filter grayscale contrast-125 opacity-75 drop-shadow-[0_0_12px_rgba(0,229,255,0.4)] pointer-events-none select-none"
            />
          </div>
        </div>
      </div>

      {/* Archival Note & Glowing Reopen Cue */}
      <div className="relative z-10 text-center space-y-1 sm:space-y-1.5 pb-0.5 pointer-events-none select-none">
        <p className="text-[8px] sm:text-xs text-[#faf8f2]/75 font-sans max-w-xs leading-relaxed line-clamp-1 sm:line-clamp-none">
          Verified digital credentials dispatched to delegates.
        </p>
        <GlowingCoverBadge text="← DRAG TO REOPEN" />
      </div>
    </div>
  );
}

/* =========================================================================
   PAGE TEMPLATES (WITH SOFT NATURAL CREASE SHADOWS)
   ========================================================================= */

/** Standard Left Leaf: Textual Program Details */
function StandardLeftPageContent({ page }: { page: JournalItem }) {
  return (
    <div className="relative w-full h-full bg-[#faf8f2] text-[#040032] p-2.5 sm:p-5 md:p-8 flex flex-col justify-between overflow-hidden">
      <div className="absolute inset-0 bg-[#f5ede1]/50 pointer-events-none select-none" />

      {/* Subtle Spine Fold Shadow along right edge */}
      <div className="absolute right-0 inset-y-0 w-4 sm:w-8 bg-gradient-to-l from-black/8 via-black/2 to-transparent pointer-events-none select-none mix-blend-multiply z-20" />
      <div className="absolute right-0 inset-y-0 w-px bg-[#040032]/10 pointer-events-none select-none z-20" />

      {/* Content */}
      <div className="relative z-10 space-y-1 sm:space-y-2 pointer-events-none select-none">
        <div className="flex flex-wrap items-center justify-between gap-1 sm:gap-2">
          <span
            className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[8px] sm:text-[10px] font-mono-meta font-extrabold uppercase border border-[#040032] ${
              page.badgeColor || "bg-[#c6f552] text-[#040032]"
            }`}
          >
            {page.category}
          </span>

          <div className="flex items-center gap-1 text-[9px] sm:text-xs font-mono-meta font-extrabold text-[#0a3825]">
            <ClockIcon className="w-3 h-3 sm:w-4 sm:h-4 text-[#0a3825]" />
            <span>{page.time}</span>
            <span className="text-[8px] sm:text-[10px] px-1 py-0.2 rounded bg-[#040032]/10 hidden sm:inline">
              {page.duration}
            </span>
          </div>
        </div>

        <h3 className="font-serif-display text-xs sm:text-lg md:text-2xl font-bold text-[#040032] leading-snug line-clamp-2">
          {page.title}
        </h3>

        {page.speaker && (
          <div className="p-1 sm:p-2 rounded-lg bg-[#ece7d8] border border-[#040032]/15">
            <span className="text-[7px] sm:text-[8px] font-mono-meta uppercase font-extrabold text-[#0a3825] tracking-wider block">
              FACILITATOR / LEAD
            </span>
            <p className="text-[9px] sm:text-xs md:text-sm font-serif-display font-bold text-[#040032] line-clamp-1">
              {page.speaker}
            </p>
          </div>
        )}

        <p className="text-[9px] sm:text-xs md:text-sm text-[#040032]/85 font-sans leading-snug line-clamp-2 sm:line-clamp-4 md:line-clamp-none">
          {page.description}
        </p>
      </div>

      {/* Footer Stamp */}
      <div className="relative z-10 pt-1 sm:pt-2 border-t border-[#040032]/10 flex items-center justify-between pointer-events-none select-none">
        <div className="flex items-center gap-1 text-[8px] sm:text-xs font-mono-meta text-[#0a3825] font-bold">
          <MapPinIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#0a3825]" />
          <span className="truncate max-w-[100px] sm:max-w-none">{page.location}</span>
        </div>

        <span className="text-[8px] sm:text-[10px] font-mono-meta text-[#040032]/50 font-extrabold hidden sm:inline">
          IESA // DISPATCH
        </span>
      </div>
    </div>
  );
}

/** Standard Right Leaf: Polaroid Photo Scrapbook */
function StandardRightPageContent({ page }: { page: JournalItem }) {
  const isItel = page.imageUrl.includes("itel") || page.id === "session-09";

  return (
    <div className="relative w-full h-full bg-[#ece7d8] text-[#040032] p-2.5 sm:p-5 md:p-8 flex flex-col justify-between items-center overflow-hidden">
      <div className="absolute inset-0 bg-[#f5ede1]/40 pointer-events-none select-none" />

      {/* Subtle Spine Fold Shadow along left edge */}
      <div className="absolute left-0 inset-y-0 w-4 sm:w-8 bg-gradient-to-r from-black/8 via-black/2 to-transparent pointer-events-none select-none mix-blend-multiply z-20" />
      <div className="absolute left-0 inset-y-0 w-px bg-[#040032]/10 pointer-events-none select-none z-20" />

      {/* Header */}
      <div className="relative z-10 w-full flex items-center justify-between pb-0.5 pointer-events-none select-none">
        <span className="text-[8px] sm:text-[10px] font-mono-meta font-extrabold text-[#0a3825] uppercase tracking-widest truncate max-w-[140px] sm:max-w-[180px]">
          {page.stampText || "OFFICIAL DISPATCH PHOTO"}
        </span>
        <BookmarkIcon className="w-3 h-3 sm:w-4 sm:h-4 text-[#0a3825]/40" />
      </div>

      {/* Polaroid Photo Frame - Interactive Hover & Height Increase */}
      <div className="relative z-10 w-full max-w-[170px] sm:max-w-[240px] md:max-w-[315px] aspect-[4/3.2] sm:aspect-[16/13] my-auto pointer-events-auto cursor-pointer group">
        {/* Tactile masking tape with subtle hover wiggle */}
        <div className="absolute -top-2 sm:-top-2.5 left-1/2 -translate-x-1/2 w-14 sm:w-24 h-3.5 sm:h-5 bg-[#faf8f2]/90 border border-[#040032]/15 shadow-sm transform -rotate-2 group-hover:-rotate-1 group-hover:-translate-y-0.5 transition-all duration-300 z-30 backdrop-blur-[1px] pointer-events-none select-none" />

        {/* Polaroid card with liquid-metal glowing halo and straightening on hover */}
        <div className="relative w-full h-full rounded-xl sm:rounded-2xl p-[2px] bg-[#040032]/20 group-hover:bg-gradient-to-r group-hover:from-[#00e5ff] group-hover:via-[#c6f552] group-hover:to-[#3fffe8] transform rotate-1 group-hover:rotate-0 group-hover:scale-[1.03] transition-all duration-300 shadow-xl group-hover:shadow-[0_0_28px_rgba(0,229,255,0.45),0_0_16px_rgba(198,245,82,0.35)] select-none">
          <div className="relative w-full h-full rounded-[10px] sm:rounded-[14px] overflow-hidden bg-[#040032] border border-[#040032]">
            <Image
              src={page.imageUrl}
              alt={page.title}
              fill
              draggable={false}
              className={`filter contrast-[1.03] brightness-[1.02] group-hover:scale-105 group-hover:brightness-105 transition-all duration-500 pointer-events-none select-none ${
                isItel ? "object-cover object-center" : "object-cover object-top"
              }`}
            />
            {/* Dynamic liquid shimmer overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none select-none" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-transparent via-[#00e5ff]/10 to-[#c6f552]/10 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Footnote Caption */}
      <div className="relative z-10 w-full pt-1 sm:pt-2 text-center pointer-events-none select-none">
        <p className="font-serif-italic text-[9px] sm:text-xs md:text-sm text-[#040032]/85 line-clamp-1">
          "{page.photoCaption || page.title}"
        </p>
      </div>
    </div>
  );
}
