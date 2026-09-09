"use client";

import { useState, useEffect } from "react";
import TailoredMarqueeStrip from "@/components/TailoredMarqueeStrip";
import ScrollRevealText from "@/components/ScrollRevealText";
import ProgramJournal from "@/components/ProgramJournal";
import {
  ClockIcon,
  MapPinIcon,
  FunnelIcon,
  SparklesIcon,
  BookOpenIcon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";

export type ScheduleCategory =
  | "Keynotes & Talks"
  | "Workshops"
  | "Competitions"
  | "Paper Presentations"
  | "Protocols & Ceremonies";

interface ScheduleItem {
  id: string;
  order: string;
  duration: string;
  title: string;
  speaker?: string;
  category: ScheduleCategory;
  description: string;
  location: string;
}

export default function ScheduleTimeline() {
  const [viewMode, setViewMode] = useState<"journal" | "list">("journal");
  const [filter, setFilter] = useState<string>("All");
  const [activeSessionId, setActiveSessionId] = useState<string>("session-01");

  // Poll for active stage session from MongoDB real-time state
  useEffect(() => {
    let isMounted = true;
    const fetchActive = async () => {
      try {
        const res = await fetch("/api/program/active", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data.activeSessionId) {
          setActiveSessionId(data.activeSessionId);
        }
      } catch {
        // Silently retain current state
      }
    };

    fetchActive();
    const interval = setInterval(fetchActive, 12000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    // Dispatch resize/refresh event to inform ParallaxWrapper and GSAP of new height
    const t1 = setTimeout(() => {
      window.dispatchEvent(new CustomEvent("refresh-parallax"));
      window.dispatchEvent(new Event("resize"));
    }, 50);

    const t2 = setTimeout(() => {
      window.dispatchEvent(new CustomEvent("refresh-parallax"));
      window.dispatchEvent(new Event("resize"));
    }, 250);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [viewMode, filter]);

  const marqueeItems = [
    { text: "OFFICIAL ORDER OF PROGRAM" },
    { text: "CONFERENCE PROCEEDINGS · STARTS 10:00 AM" },
    { text: "FLAGSHIP VC KEYNOTE" },
    { text: "SIMULTANEOUS WORKSHOPS" },
    { text: "ANNUAL DEBATE & HACKATHON" },
    { text: "RESEARCH PAPER PRESENTATIONS" },
    { text: "AWARDS & CLOSING PROTOCOLS" },
  ];

  const schedule: ScheduleItem[] = [
    {
      id: "session-01",
      order: "Session 01",
      duration: "35 mins",
      title: "Arrival, Anthems, Interactive Welcome & Presidential Speech",
      speaker: "IESA President & Executive Council",
      category: "Protocols & Ceremonies",
      description: "Guest reception, attendee check-in, rendition of the National and UI Anthems, interactive welcome, and the President's opening speech.",
      location: "KAAF Main Auditorium",
    },
    {
      id: "session-02",
      order: "Session 02",
      duration: "30 mins",
      title: "1st Speaker Session: VC Opening Keynote & Q&A",
      speaker: "Prof. Kayode Oyebode Adebowale (VC, University of Ibadan)",
      category: "Keynotes & Talks",
      description: "Flagship keynote address on 'Academic Excellence & Institutional Innovation in Engineering Education', followed by interactive attendee Q&A.",
      location: "KAAF Main Auditorium",
    },
    {
      id: "session-03",
      order: "Session 03",
      duration: "10 mins",
      title: "Headline Sponsor Address & Strategic Spotlight",
      speaker: "Headline Sponsor Leadership",
      category: "Keynotes & Talks",
      description: "Special address highlighting industrial engineering partnerships, graduate career pathways, and technology sponsorships.",
      location: "KAAF Main Stage",
    },
    {
      id: "session-04",
      order: "Session 04",
      duration: "30 mins",
      title: "2nd Speaker Session: Robotics, AI & Process Discipline",
      speaker: "Dr. Olusola Sayeed Ayoola (Founder & CEO, RAIN)",
      category: "Keynotes & Talks",
      description: "Technical address on 'Building What AI Can't Replace: How Process Discipline Creates Impact, Not Just Output', with interactive audience questions.",
      location: "KAAF Main Auditorium",
    },
    {
      id: "session-05",
      order: "Session 05",
      duration: "5 mins",
      title: "Delegate Giveaway & Audience Engagement Interlude",
      speaker: "Conference Welfare & Engagement Leads",
      category: "Protocols & Ceremonies",
      description: "Interactive giveaway interlude featuring conference merchandise, sponsored gift packages, and audience trivia prizes.",
      location: "Auditorium Concourse",
    },
    {
      id: "session-06",
      order: "Session 06",
      duration: "30 mins",
      title: "IESA Annual Debate, Scholarship Spotlight & Winner Presentation",
      speaker: "Student Debate Finalists & Academic Panel",
      category: "Competitions",
      description: "Annual student debate on emerging industrial paradigms, scholarship feature, and presentation of the debate winner awards.",
      location: "KAAF Main Stage",
    },
    {
      id: "session-07",
      order: "Session 07",
      duration: "30 mins",
      title: "3rd Speaker Session: Professional Capacity & Habit Building",
      speaker: "Engr. Adebayo Otokiti (Engineering Programme Manager, Calor Gas UK)",
      category: "Keynotes & Talks",
      description: "Executive keynote on 'The Professional You Are Becoming: Why Habits and Commitments Determine Capacity Long Before Opportunity Arrives' + audience Q&A.",
      location: "KAAF Main Auditorium",
    },
    {
      id: "session-08",
      order: "Session 08",
      duration: "10 mins",
      title: "Award Presentation to Keynote Speakers & Networking Break",
      speaker: "IESA Executive Council & Guests",
      category: "Protocols & Ceremonies",
      description: "Honorary plaque presentations recognizing our distinguished morning keynote speakers, followed by a networking intermission.",
      location: "Auditorium Concourse",
    },
    {
      id: "session-09",
      order: "Session 09",
      duration: "30 mins",
      title: "Simultaneous Hands-On Workshop Sessions",
      speaker: "Oluwatobi (Robotics) · Oyindamola Esq (Tech Law) · Emmanuel (Cybersecurity) · Itel Energy (Energy)",
      category: "Workshops",
      description: "Concurrent breakout tracks: Hands-on Robotics & Physical AI (Aurora Robotics), Tech Law & IP (Oyindamola Fasanmi Esq), Industrial Cybersecurity (Cyvant), and Energy Solutions & Innovation (Itel Energy ⚡).",
      location: "Robotics Lab & Main Precincts",
    },
    {
      id: "session-10",
      order: "Session 10",
      duration: "15 mins",
      title: "Chairman Keynote Address & Sponsor Talk",
      speaker: "Conference Chairman & Partner Delegates",
      category: "Keynotes & Talks",
      description: "Strategic keynote by the Conference Chairman, followed by a partner spotlight celebrating student engineering excellence.",
      location: "KAAF Main Stage",
    },
    {
      id: "session-11",
      order: "Session 11",
      duration: "45 mins",
      title: "Process Day Hackathon Showcase, Facilitator Honors & Winner Awards",
      speaker: "Hackathon Teams, Mentors & Judging Panel",
      category: "Competitions",
      description: "Presentation of engineering prototypes built during the hackathon, recognition of workshop facilitators, and coronation of winning teams.",
      location: "Innovation Arena",
    },
    {
      id: "session-12",
      order: "Session 12",
      duration: "15 mins",
      title: "Engineering Community Games & Audience Trivia",
      speaker: "Conference Social Committee",
      category: "Protocols & Ceremonies",
      description: "Audience trivia, interactive games, and peer networking activities for all delegates.",
      location: "KAAF Main Auditorium",
    },
    {
      id: "session-13",
      order: "Session 13",
      duration: "55 mins",
      title: "Research Paper Presentation, Peace Club Session & Winner Awards",
      speaker: "Student Researchers, Peace Club Leads & Faculty Panel",
      category: "Paper Presentations",
      description: "Competitive undergraduate research presentations across industrial engineering disciplines, Peace Club feature, and paper presentation awards.",
      location: "Academic Stage",
    },
    {
      id: "session-14",
      order: "Session 14",
      duration: "15 mins",
      title: "Conference Lead Vote of Thanks, Closing Prayer & Departure",
      speaker: "Conference Lead & IESA Executive Committee",
      category: "Protocols & Ceremonies",
      description: "Official vote of thanks by the Conference Lead, closing prayers, sponsor appreciation, and formal attendee departure.",
      location: "KAAF Main Auditorium",
    },
  ];

  const categories = [
    "All",
    "Keynotes & Talks",
    "Workshops",
    "Competitions",
    "Paper Presentations",
    "Protocols & Ceremonies",
  ];

  const filteredSchedule =
    filter === "All"
      ? schedule
      : schedule.filter((item) => item.category === filter);

  const getCategoryBadgeClass = (category: ScheduleCategory) => {
    switch (category) {
      case "Keynotes & Talks":
        return "bg-[#c6f552] text-[#040032]";
      case "Workshops":
        return "bg-[#3fffe8] text-[#040032]";
      case "Competitions":
        return "bg-[#ffdb58] text-[#040032]";
      case "Paper Presentations":
        return "bg-[#bbf2f6] text-[#040032]";
      default:
        return "bg-[#ece7d8] text-[#040032]";
    }
  };

  return (
    <section id="schedule" className="pt-0 pb-36 lg:pb-48 bg-[#faf8f2] text-[#040032] relative">
      {/* Tailored Marquee Strip Entrance Header - Flushed to top edge */}
      <div className="mt-0 mb-8 overflow-visible">
        <TailoredMarqueeStrip
          items={marqueeItems}
          rotateClass="-rotate-[1.85deg]"
          bgClass="bg-[#040032]"
          borderClass="border-[#c6f552]"
          textClass="text-[#c6f552]"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6 border-b border-[#040032]/10 pb-8">
          <div>
            <span className="font-mono-meta text-[10px] sm:text-xs font-bold text-[#0a3825] uppercase tracking-widest block mb-2">
              ORDER OF PROGRAM // STARTS 10:00 AM LIVE
            </span>
            <h2 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#040032]">
              Today&apos;s <span className="font-serif-italic text-[#0a3825]">Program</span>
            </h2>
          </div>

          <div className="flex flex-col md:items-end gap-4 max-w-md">
            <ScrollRevealText
              text="Everything happening today at KAAF Auditorium. Flip through our 3D Scrapbook Journal or switch to the timetable list to check session details and workshop halls."
              className="text-sm sm:text-base text-[#040032]/80 leading-relaxed md:text-right"
              highlightWords={["today", "Scrapbook", "Journal", "timetable", "workshop"]}
              highlightClass="text-[#0a3825] font-bold"
            />

            {/* View Mode Toggle Pill */}
            <div className="inline-flex items-center p-1.5 rounded-full bg-[#ece7d8] border-2 border-[#040032] shadow-md">
              <button
                onClick={() => setViewMode("journal")}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono-meta font-extrabold uppercase transition-all cursor-pointer ${
                  viewMode === "journal"
                    ? "bg-[#040032] text-[#c6f552] shadow-sm"
                    : "text-[#040032] hover:bg-[#040032]/10"
                }`}
              >
                <BookOpenIcon className="w-4 h-4" />
                <span>3D Scrapbook Journal</span>
              </button>

              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono-meta font-extrabold uppercase transition-all cursor-pointer ${
                  viewMode === "list"
                    ? "bg-[#040032] text-[#c6f552] shadow-sm"
                    : "text-[#040032] hover:bg-[#040032]/10"
                }`}
              >
                <ListBulletIcon className="w-4 h-4" />
                <span>Full Timetable List</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3D Journal View */}
        {viewMode === "journal" && (
          <div className="py-4">
            <ProgramJournal />
          </div>
        )}

        {/* Full Timetable List View */}
        {viewMode === "list" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
              <FunnelIcon className="w-4 h-4 text-[#0a3825] mr-2 flex-shrink-0" />
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-mono-meta font-extrabold uppercase transition-all whitespace-nowrap border border-[#040032] cursor-pointer ${
                    filter === cat
                      ? "bg-[#040032] text-[#c6f552] shadow-sm"
                      : "bg-[#ece7d8] text-[#040032] hover:bg-[#040032]/10"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Schedule List Timeline Cards */}
            <div className="space-y-6">
              {filteredSchedule.map((item, idx) => {
                const isLiveOnStage = activeSessionId === item.id;
                return (
                  <div
                    key={item.id}
                    className={`liquid-metal-card group ${
                      isLiveOnStage ? "ring-2 ring-[#0a3825]" : ""
                    }`}
                  >
                    <div
                      className={`rounded-3xl p-6 sm:p-8 border flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-300 ${
                        isLiveOnStage
                          ? "bg-[#f5ede1] border-[#0a3825] shadow-lg"
                          : "bg-[#faf8f2] border-[#040032]/15 group-hover:border-[#0a3825]"
                      }`}
                    >
                      <div className="space-y-3 max-w-2xl">
                        <div className="flex flex-wrap items-center gap-3">
                          {isLiveOnStage && (
                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono-meta font-extrabold uppercase bg-[#0a3825] text-[#c6f552] border border-[#c6f552]/40 shadow-sm">
                              <span className="w-2 h-2 rounded-full bg-[#c6f552] inline-block shadow-[0_0_6px_#c6f552]" />
                              ON STAGE NOW
                            </span>
                          )}
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-mono-meta font-extrabold uppercase border border-[#040032] ${getCategoryBadgeClass(
                              item.category
                            )}`}
                          >
                            {item.category}
                          </span>
                          <div className="flex items-center gap-1.5 text-xs font-mono-meta text-[#0a3825] font-extrabold">
                            <ClockIcon className="w-4 h-4 text-[#0a3825]" />
                            <span>{item.order}</span>
                          </div>
                          <span className="text-[10px] font-mono-meta font-bold text-[#040032]/60 px-2 py-0.5 rounded-md bg-[#040032]/5">
                            {item.duration}
                          </span>
                        </div>

                        <h3 className="font-serif-display text-2xl font-bold text-[#040032] group-hover:text-[#0a3825] transition-colors">
                          {item.title}
                        </h3>

                        {item.speaker && (
                          <p className="text-xs font-mono-meta font-extrabold text-[#0a3825]">
                            SPEAKER / LEAD: {item.speaker}
                          </p>
                        )}

                        <p className="text-xs sm:text-sm text-[#040032]/75 font-sans leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="flex md:flex-col items-start md:items-end justify-between border-t md:border-t-0 md:border-l border-[#040032]/10 pt-4 md:pt-0 md:pl-8 gap-2 flex-shrink-0">
                        <div className="flex items-center gap-1.5 text-xs font-mono-meta text-[#040032]/70 font-semibold">
                          <MapPinIcon className="w-4 h-4 text-[#0a3825]" />
                          <span>{item.location}</span>
                        </div>
                        <span className="text-[10px] font-mono-meta font-bold text-[#0a3825] uppercase tracking-wider">
                          TIMETABLE // #{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Event Day Partner Note */}
        <div className="mt-12 p-5 rounded-2xl bg-[#ece7d8]/60 border border-[#040032]/15 flex items-center gap-3 text-xs font-sans text-[#040032]/80">
          <SparklesIcon className="w-5 h-5 text-[#0a3825] flex-shrink-0" />
          <span>
            <strong>Official Partner Note:</strong> Corporate partners and supporting sponsors will be acknowledged and appreciated throughout the conference proceedings.
          </span>
        </div>
      </div>
    </section>
  );
}
