"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import TailoredMarqueeStrip from "@/components/TailoredMarqueeStrip";
import InteractiveProcessTab from "@/components/InteractiveProcessTab";
import ScrollRevealText from "@/components/ScrollRevealText";
import {
  ArrowUpRightIcon,
  ShieldCheckIcon,
  TrophyIcon,
  BuildingLibraryIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ForwardIcon,
} from "@heroicons/react/24/solid";

const INITIAL_QUOTES = [
  {
    id: 1,
    text: "The future is not simply what we wait for. It is what we choose to build.",
    author: "IESA Process Day 2026 Manifesto",
    tag: "READY TO EXECUTE _",
  },
  {
    id: 2,
    text: "Habits and commitments determine capacity long before opportunity arrives.",
    author: "Engr. Adebayo Otokiti (Calor Gas UK)",
    tag: "CAPACITY & HABITS _",
  },
  {
    id: 3,
    text: "Building what AI can't replace: process discipline creates impact, not just output.",
    author: "Dr. Olusola Sayeed Ayoola (RAIN)",
    tag: "PROCESS DISCIPLINE _",
  },
  {
    id: 4,
    text: "The future needs energy. Let’s build it smarter.",
    author: "Itel Energy",
    tag: "SMART ENERGY ⚡ _",
  },
  {
    id: 5,
    text: "Fostering academic excellence and technical leadership in African industrial systems.",
    author: "Prof. Kayode Oyebode Adebowale (VC UI)",
    tag: "INSTITUTIONAL LEADERSHIP _",
  },
];

export default function WhyAttend() {
  const [cards, setCards] = useState(INITIAL_QUOTES);

  const marqueeItems = [
    { text: "FORGE THE FUTURE" },
    { text: "IESA PROCESS DAY 2026" },
    { text: "UNIVERSITY OF IBADAN" },
    { text: "TECH & AI FACILITATION" },
    { text: "INDUSTRIAL ENGINEERING" },
    { text: "KAAF AUDITORIUM" },
  ];

  const moveToEnd = (id: number) => {
    setCards((prev) => {
      const idx = prev.findIndex((c) => c.id === id);
      if (idx === -1) return prev;
      const newCards = [...prev];
      const [removed] = newCards.splice(idx, 1);
      newCards.push(removed);
      return newCards;
    });
  };

  const moveToFront = () => {
    setCards((prev) => {
      const newCards = [...prev];
      const removed = newCards.pop();
      if (removed) {
        newCards.unshift(removed);
      }
      return newCards;
    });
  };

  const nextQuote = () => {
    if (cards.length > 0) {
      moveToEnd(cards[0].id);
    }
  };

  return (
    <section id="why-attend" className="pt-0 pb-8 lg:pb-12 bg-[#faf8f2] text-[#040032] relative">
      {/* Tailored Marquee Strip Entrance Header - Flushed to top edge */}
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
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-[#040032]/10 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0a3825] animate-pulse" />
              <span className="font-mono-meta text-xs font-bold text-[#0a3825] uppercase tracking-widest block">
                WHAT'S HAPPENING TODAY // KAAF AUDITORIUM
              </span>
            </div>
            <h2 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#040032]">
              What We're <span className="font-serif-italic text-[#0a3825]">Building Today</span>
            </h2>
          </div>

          <div className="max-w-md">
            <ScrollRevealText
              text="Forget dry, boring seminars. Today is loaded with high-energy keynotes, hands-on masterclasses, live student debates, and industry mentors ready to share practical insights."
              className="text-sm sm:text-base text-[#040032]/80 leading-relaxed"
              highlightWords={["high-energy", "masterclasses", "debates", "mentors", "practical"]}
              highlightClass="text-[#0a3825] font-bold"
            />
          </div>
        </div>

        {/* Interactive 3-Tab Fill Progress Feature */}
        <InteractiveProcessTab />

        {/* Bento Grid Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 01: Keynote & Vision */}
          <div className="liquid-metal-card">
            <div className="h-full bg-[#faf8f2] rounded-[1.4rem] p-7 flex flex-col justify-between border border-[#040032]/15">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono-meta text-xs font-bold text-[#0a3825]">PILLAR // 01</span>
                  <div className="w-10 h-10 rounded-full bg-[#ece7d8] border border-[#040032]/20 flex items-center justify-between px-2.5">
                    <BuildingLibraryIcon className="w-5 h-5 text-[#040032]" />
                  </div>
                </div>

                <h3 className="font-serif-display text-2xl font-bold text-[#040032] mb-3">
                  Academic & VC Leadership
                </h3>

                <p className="text-sm text-[#040032]/75 leading-relaxed mb-6">
                  Hear directly from Prof. Kayode Oyebode Adebowale (VC, University of Ibadan) and academic pioneers shaping industrial engineering education.
                </p>
              </div>

              <div className="pt-4 border-t border-[#040032]/10 flex items-center justify-between">
                <span className="text-xs font-mono-meta text-[#040032]/60 font-semibold">VC KEYNOTE ADDRESS</span>
                <AcademicCapIcon className="w-5 h-5 text-[#0a3825]" />
              </div>
            </div>
          </div>

          {/* Pillar 02: Real Draggable Stacked Quote Cards */}
          <div className="liquid-metal-card md:col-span-2">
            <div className="relative h-full min-h-[22rem] select-none touch-pan-y">
              <AnimatePresence>
                {cards.slice(0, 3).reverse().map((card, idx, arr) => {
                  const i = arr.length - 1 - idx; 
                  const isTop = i === 0;

                  return (
                    <motion.div
                      key={card.id}
                      layout
                      className={`absolute inset-0 bg-[#faf8f2] bg-component-grid border-2 border-[#040032] rounded-3xl p-7 sm:p-9 flex flex-col justify-between shadow-2xl origin-top ${isTop ? "cursor-grab active:cursor-grabbing" : ""}`}
                      style={{
                        zIndex: 30 - i,
                      }}
                      initial={{ opacity: 0, scale: 0.9, y: -20 }}
                      animate={{
                        opacity: 1,
                        scale: 1 - i * 0.05,
                        y: i * 16,
                        x: i * 16,
                      }}
                      exit={{ opacity: 0, x: -200, scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      drag={isTop ? "x" : false}
                      dragConstraints={{ left: 0, right: 0 }}
                      onDragEnd={(e, { offset }) => {
                        if (offset.x < -100) {
                          // Swipe left -> Next card
                          moveToEnd(card.id);
                        } else if (offset.x > 100) {
                          // Swipe right -> Prev card
                          moveToFront();
                        }
                      }}
                    >
                      {/* Top Bar Controls */}
                      <div className="flex items-center justify-between pointer-events-none">
                        {/* Brand Monogram Icon */}
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[#040032] text-[#c6f552] flex items-center justify-center font-mono-meta font-extrabold text-xs tracking-tighter">
                            IESA
                          </div>
                          <span className="font-mono-meta text-xs font-bold text-[#040032]/60 uppercase">
                            MANIFESTO // 2026
                          </span>
                        </div>

                        {/* Step Switcher Controls */}
                        <div className="flex items-center gap-3 pointer-events-auto">
                          <div className="flex items-center gap-1.5 font-mono-meta text-xs font-bold text-[#040032]">
                            <span className="w-4 h-4 rounded-full border border-[#040032] flex items-center justify-center text-[9px] font-bold">
                              {INITIAL_QUOTES.findIndex(q => q.id === card.id) + 1}
                            </span>
                            <span>/ {INITIAL_QUOTES.length}</span>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              nextQuote();
                            }}
                            className="w-8 h-8 rounded-full border border-[#040032] bg-[#faf8f2] hover:bg-[#040032] hover:text-[#c6f552] text-[#040032] flex items-center justify-center transition-colors shadow-sm"
                            title="Next Quote"
                          >
                            <ForwardIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Center Massive Quote Text */}
                      <div className="my-6 space-y-3 pointer-events-none">
                        <h3 className="font-mono-meta text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#040032] leading-snug tracking-tight">
                          "{card.text}"
                        </h3>
                        <p className="font-serif-italic text-sm sm:text-base text-[#0a3825] font-semibold">
                          — {card.author}
                        </p>
                      </div>

                      {/* Bottom Terminal Tagline - Divider Removed */}
                      <div className="flex items-center justify-between text-xs font-mono-meta font-bold text-[#040032]/80 pointer-events-none">
                        <span className="flex items-center gap-1 text-[#0a3825]">
                          <span>&gt;</span>
                          <span>{card.tag}</span>
                        </span>
                        {isTop && (
                          <span className="text-[10px] text-[#040032]/40 hidden sm:inline-block animate-pulse">
                            SWIPE CARD ←→
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Pillar 03: Energy Solutions & Industrial Cybersecurity */}
          <div className="liquid-metal-card md:col-span-2">
            <div className="h-full bg-[#ece7d8] rounded-[1.4rem] p-7 flex flex-col justify-between border border-[#040032]/20 relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono-meta text-xs font-bold text-[#0a3825]">PILLAR // 03</span>
                  <div className="w-10 h-10 rounded-full bg-[#faf8f2] border border-[#040032]/20 flex items-center justify-center">
                    <ShieldCheckIcon className="w-5 h-5 text-[#040032]" />
                  </div>
                </div>

                <h3 className="font-serif-display text-2xl font-bold text-[#040032] mb-3">
                  Smart Energy Solutions & Systems Security
                </h3>

                <p className="text-sm text-[#040032]/80 leading-relaxed mb-6">
                  Hands-on masterclasses with Itel Energy (Smarter Power & Energy Innovation ⚡) and Emmanuel Tavershima (Cyvant) breaking down the real power grids and industrial networks driving African manufacturing.
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-[#faf8f2] border border-[#040032]/20 rounded-full text-xs font-mono-meta font-bold text-[#040032]">
                    ITEL ENERGY ⚡
                  </span>
                  <span className="px-3 py-1 bg-[#faf8f2] border border-[#040032]/20 rounded-full text-xs font-mono-meta font-bold text-[#040032]">
                    CYVANT SCADA LAB
                  </span>
                  <span className="px-3 py-1 bg-[#faf8f2] border border-[#040032]/20 rounded-full text-xs font-mono-meta font-bold text-[#040032]">
                    BREAKOUT TRACKS
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pillar 04: Networking & Community */}
          <div className="liquid-metal-card">
            <div className="h-full bg-[#faf8f2] rounded-[1.4rem] p-7 flex flex-col justify-between border border-[#040032]/15">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono-meta text-xs font-bold text-[#0a3825]">PILLAR // 04</span>
                  <div className="w-10 h-10 rounded-full bg-[#c6f552] border border-[#040032] flex items-center justify-center">
                    <TrophyIcon className="w-5 h-5 text-[#040032]" />
                  </div>
                </div>

                <h3 className="font-serif-display text-2xl font-bold text-[#040032] mb-3">
                  Alumni & Peer Connections
                </h3>

                <p className="text-sm text-[#040032]/75 leading-relaxed mb-6">
                  Catch senior UI engineering alumni, industry partners, and fellow student builders during refreshments. Great conversations happen right in the concourse.
                </p>
              </div>

              <div className="pt-4 border-t border-[#040032]/10 flex items-center justify-between">
                <span className="text-xs font-mono-meta text-[#040032]/60 font-semibold">CAMPUS COMMUNITY</span>
                <UserGroupIcon className="w-5 h-5 text-[#0a3825]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
