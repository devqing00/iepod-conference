"use client";

import TailoredMarqueeStrip from "@/components/TailoredMarqueeStrip";
import ScrollRevealText from "@/components/ScrollRevealText";
import {
  DocumentTextIcon,
  ArrowUpRightIcon,
  CheckCircleIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  TrophyIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/solid";

export default function CallForPapers() {
  const marqueeItems = [
    { text: "PRESENTED RESEARCH PAPERS" },
    { text: "UNDERGRADUATE & POSTGRADUATE SHOWCASE" },
    { text: "5 TECHNICAL TRACKS" },
    { text: "LIVE DEFENSE: 2:45 PM — 3:40 PM" },
    { text: "ACADEMIC STAGE // KAAF AUDITORIUM" },
    { text: "FACULTY EVALUATION & AWARDS" },
  ];

  const presentedPapers = [
    {
      title: "Autonomous Obstacle Avoidance & Path Optimization in Warehouse AGVs",
      code: "TRACK // 01 · AI & ROBOTICS",
      lead: "A. Oladimeji & Team Cyber-Motion",
      status: "DEFENSE @ 2:45 PM",
    },
    {
      title: "Discrete-Event Simulation of Assembly Line Bottlenecks in Bottling Plants",
      code: "TRACK // 02 · MANUFACTURING",
      lead: "T. Adeleke & Team LeanFlow",
      status: "DEFENSE @ 2:58 PM",
    },
    {
      title: "Techno-Economic Assessment of Distributed Solar Microgrids for Industrial Clusters",
      code: "TRACK // 03 · SUSTAINABILITY",
      lead: "E. Okon & Team EcoGrid",
      status: "DEFENSE @ 3:10 PM",
    },
    {
      title: "Predictive Inventory Optimization Using Stochastic Lead-Time Modeling",
      code: "TRACK // 04 · OPERATIONS",
      lead: "M. Balogun & Team Optimix",
      status: "DEFENSE @ 3:22 PM",
    },
    {
      title: "Ergonomic Risk Evaluation in High-Repetition Manual Packaging Workstations",
      code: "TRACK // 05 · HUMAN SYSTEMS",
      lead: "F. Ibrahim & Team SafeWork",
      status: "DEFENSE @ 3:32 PM",
    },
  ];

  const judgingCriteria = [
    "Originality & Engineering Innovation (25%)",
    "Practical Industrial Applicability (25%)",
    "Research Methodology & Analytical Rigor (25%)",
    "Oral Defense & Technical Q&A Handling (25%)",
  ];

  return (
    <section id="call-for-papers" className="pt-0 pb-20 lg:pb-28 bg-[#faf8f2] text-[#040032] relative">
      {/* Tailored Marquee Strip Entrance Header */}
      <div className="mt-0 mb-8 overflow-visible">
        <TailoredMarqueeStrip
          items={marqueeItems}
          rotateClass="-rotate-[1.85deg]"
          bgClass="bg-[#040032]"
          borderClass="border-[#c6f552]"
          textClass="text-[#faf8f2]"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 border-b border-[#040032]/10 pb-8">
          <div>
            <span className="font-mono-meta text-[10px] sm:text-xs font-bold text-[#0a3825] uppercase tracking-widest block mb-2">
              PRESENTED RESEARCH PAPERS // 2026 PROCEEDINGS
            </span>
            <h2 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#040032]">
              Research Papers <span className="font-serif-italic text-[#0a3825]">& Showcase</span>
            </h2>
          </div>

          <div className="max-w-md text-left">
            <ScrollRevealText
              text="Explore the selected undergraduate and postgraduate research papers being presented live today at the Academic Stage before our distinguished faculty judging panel."
              className="text-sm sm:text-base text-[#040032]/80 leading-relaxed text-left justify-start"
              align="left"
              highlightWords={["research", "presented", "live", "faculty"]}
              highlightClass="text-[#0a3825] font-bold"
            />
          </div>
        </div>

        {/* Bento Specification Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Presented Papers List */}
          <div className="lg:col-span-7 bg-[#040032] text-[#faf8f2] p-8 sm:p-10 rounded-3xl border-2 border-[#040032] shadow-2xl flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="px-3 py-1 bg-[#c6f552] text-[#040032] rounded-full text-xs font-mono-meta font-extrabold uppercase">
                  5 ACCEPTED DEFENSE PAPERS
                </span>
                <span className="text-xs font-mono-meta text-[#3fffe8] font-bold">
                  ACADEMIC STAGE · 2:45 PM
                </span>
              </div>

              <h3 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#faf8f2]">
                Selected Proceedings
              </h3>

              <div className="space-y-3.5">
                {presentedPapers.map((paper, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#c6f552] transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono-meta text-[#3fffe8] font-bold">
                          {paper.code}
                        </span>
                      </div>
                      <h4 className="text-sm font-serif-display font-bold text-[#faf8f2] leading-snug">
                        {paper.title}
                      </h4>
                      <p className="text-xs font-mono-meta text-[#c6f552]">
                        Authors: {paper.lead}
                      </p>
                    </div>

                    <span className="text-[10px] font-mono-meta px-2.5 py-1 rounded-full bg-white/10 text-white/90 font-extrabold whitespace-nowrap self-start sm:self-center border border-white/15">
                      {paper.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Defense Schedule Strip */}
            <div className="pt-6 border-t border-white/15 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-mono-meta text-white/70">
                <ClockIcon className="w-4 h-4 text-[#c6f552]" />
                <span>Presentation Time: <strong>2:45 PM — 3:40 PM</strong></span>
              </div>

              <a
                href="#schedule"
                className="inline-flex items-center gap-2 bg-[#c6f552] hover:bg-[#b5e83a] text-[#040032] font-mono-meta font-extrabold text-xs px-6 py-3 rounded-full transition-all active:scale-[0.98] group"
              >
                <span>VIEW COMPLETE TIMETABLE</span>
                <ArrowUpRightIcon className="w-4 h-4 text-[#040032] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>

          {/* Right Column: Faculty Evaluation Box & Delegate Network */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            {/* Evaluation Box */}
            <div className="bg-[#ece7d8] rounded-3xl p-8 border-2 border-[#040032]/20 space-y-6">
              <div className="flex items-center justify-between">
                <span className="font-mono-meta text-xs font-bold text-[#0a3825] uppercase tracking-wider">
                  FACULTY EVALUATION
                </span>
                <AcademicCapIcon className="w-6 h-6 text-[#040032]" />
              </div>

              <h4 className="font-serif-display text-2xl font-bold text-[#040032]">
                Judging Criteria & Awards
              </h4>

              <p className="text-xs text-[#040032]/80 leading-relaxed">
                Presentations are scored independently by University of Ibadan faculty and industry assessors across four rigorous benchmarks:
              </p>

              <div className="space-y-2.5">
                {judgingCriteria.map((criterion, rIdx) => (
                  <div key={rIdx} className="flex items-start gap-3 text-xs sm:text-sm text-[#040032]/85">
                    <CheckCircleIcon className="w-4 h-4 text-[#0a3825] flex-shrink-0 mt-0.5" />
                    <span>{criterion}</span>
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-2xl bg-[#faf8f2] border border-[#040032]/15 flex items-center gap-3">
                <TrophyIcon className="w-5 h-5 text-[#0a3825] flex-shrink-0" />
                <span className="text-xs font-mono-meta font-bold text-[#040032]">
                  Winner presentation & certificate honors take place at 3:45 PM.
                </span>
              </div>
            </div>

            {/* Official WhatsApp Community Box */}
            <div className="bg-[#0a3825] text-[#faf8f2] rounded-3xl p-8 border-2 border-[#0a3825] space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-[#c6f552] text-[#040032] rounded-full text-[10px] font-mono-meta font-extrabold uppercase">
                  OFFICIAL DELEGATE NETWORK
                </span>
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-[#c6f552]" />
              </div>

              <h4 className="font-serif-display text-2xl font-bold text-[#faf8f2]">
                Join Conference Community
              </h4>

              <p className="text-xs text-[#faf8f2]/80 leading-relaxed">
                Connect directly with conference organizers, facilitators, and peer researchers to receive live announcements and masterclass lecture slides.
              </p>

              <a
                href="https://chat.whatsapp.com/G2p8sAbGUxWIas4caTZWdY?s=cl&p=a&ilr=1"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#c6f552] hover:bg-[#b5e83a] text-[#040032] font-mono-meta font-extrabold text-xs px-6 py-3 rounded-full transition-all active:scale-[0.98] w-full justify-center group cursor-pointer"
              >
                <span>JOIN WHATSAPP COMMUNITY</span>
                <ArrowUpRightIcon className="w-4 h-4 text-[#040032] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
