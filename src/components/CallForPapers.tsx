"use client";

import TailoredMarqueeStrip from "@/components/TailoredMarqueeStrip";
import ScrollRevealText from "@/components/ScrollRevealText";
import {
  DocumentTextIcon,
  ArrowUpRightIcon,
  ClockIcon,
} from "@heroicons/react/24/solid";

export default function CallForPapers() {
  const marqueeItems = [
    { text: "PRESENTED RESEARCH PAPERS" },
    { text: "UNDERGRADUATE & POSTGRADUATE SHOWCASE" },
    { text: "5 TECHNICAL TRACKS" },
    { text: "LIVE RESEARCH DEFENSES & AWARDS" },
    { text: "ACADEMIC STAGE // KAAF AUDITORIUM" },
    { text: "FACULTY EVALUATION & AWARDS" },
  ];

  const presentedPapers = [
    {
      code: "PAPER #01",
      title: "Automated Line Balancing in FMCG Packaging: A Genetic Algorithm Approach",
      lead: "B. O. Adeleke (IPE, UI)",
      track: "Manufacturing Systems & Optimization",
      status: "DEFENSE READY",
    },
    {
      code: "PAPER #02",
      title: "Predictive Maintenance in Heavy Machinery using Vibration Spectral Analysis",
      lead: "C. E. Okafor (Mechanical/IPE)",
      track: "AI & Industrial IoT",
      status: "DEFENSE READY",
    },
    {
      code: "PAPER #03",
      title: "Circular Supply Chain Framework for Electronic Waste in Sub-Saharan Africa",
      lead: "F. A. Bello (Production Engineering)",
      track: "Sustainability & Green Logistics",
      status: "DEFENSE READY",
    },
    {
      code: "PAPER #04",
      title: "Computer-Vision Based Ergonomic Risk Evaluation on Manual Assembly Lines",
      lead: "T. M. Alabi & Team",
      track: "Human Factors & Ergonomics",
      status: "DEFENSE READY",
    },
    {
      code: "PAPER #05",
      title: "Micro-Grid Energy Scheduling for Nigerian Agro-Processing Facilities",
      lead: "D. K. Oladipo",
      track: "Renewable Energy Systems",
      status: "DEFENSE READY",
    },
  ];

  return (
    <section id="call-for-papers" className="pt-0 pb-20 lg:pb-28 bg-[#ece7d8] text-[#040032] relative">
      {/* Tailored Marquee Strip Entrance Header - Flushed to top edge */}
      <div className="mt-0 mb-8 overflow-visible">
        <TailoredMarqueeStrip
          items={marqueeItems}
          rotateClass="rotate-[1.85deg]"
          bgClass="bg-[#040032]"
          borderClass="border-[#c6f552]"
          textClass="text-[#faf8f2]"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-[#040032]/10 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <DocumentTextIcon className="w-4 h-4 text-[#0a3825]" />
              <span className="font-mono-meta text-[10px] sm:text-xs font-bold text-[#0a3825] uppercase tracking-widest block">
                PEER-REVIEWED UNDERGRADUATE RESEARCH
              </span>
            </div>
            <h2 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#040032]">
              Research <span className="font-serif-italic text-[#0a3825]">Proceedings</span>
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

        {/* Presented Papers Showcase Container */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-[#040032] text-[#faf8f2] p-6 sm:p-10 rounded-3xl border-2 border-[#040032] shadow-2xl space-y-8">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="px-3 py-1 bg-[#c6f552] text-[#040032] rounded-full text-xs font-mono-meta font-extrabold uppercase">
                  5 ACCEPTED DEFENSE PAPERS
                </span>
                <span className="text-xs font-mono-meta text-[#3fffe8] font-bold">
                  ACADEMIC STAGE · KAAF AUDITORIUM
                </span>
              </div>

              <h3 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#faf8f2]">
                Selected Proceedings
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {presentedPapers.map((paper, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between gap-3 hover:border-[#c6f552] transition-colors group"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono-meta text-[#3fffe8] font-bold">
                          {paper.code}
                        </span>
                        <span className="text-[10px] font-mono-meta px-2.5 py-0.5 rounded-full bg-white/10 text-white/90 font-extrabold border border-white/15">
                          {paper.status}
                        </span>
                      </div>
                      <h4 className="text-sm sm:text-base font-serif-display font-bold text-[#faf8f2] leading-snug group-hover:text-[#c6f552] transition-colors">
                        {paper.title}
                      </h4>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono-meta text-[#c6f552]">
                      <span>Authors: {paper.lead}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Defense Schedule Strip */}
            <div className="pt-6 border-t border-white/15 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-mono-meta text-white/70">
                <ClockIcon className="w-4 h-4 text-[#c6f552]" />
                <span>Live Session: <strong>Academic Stage Defenses</strong></span>
              </div>

              <a
                href="#schedule"
                className="inline-flex items-center gap-2 bg-[#c6f552] hover:bg-[#b5e83a] text-[#040032] font-mono-meta font-extrabold text-xs px-6 py-3 rounded-full transition-all active:scale-[0.98] group cursor-pointer"
              >
                <span>VIEW COMPLETE TIMETABLE</span>
                <ArrowUpRightIcon className="w-4 h-4 text-[#040032] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
