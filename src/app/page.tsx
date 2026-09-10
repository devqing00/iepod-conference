"use client";

import { useState } from "react";
import PagePreloader from "@/components/PagePreloader";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import SpeakersSection from "@/components/SpeakersSection";
import HackathonFinalists from "@/components/HackathonFinalists";
import CallForPapers from "@/components/CallForPapers";
import ScheduleTimeline from "@/components/ScheduleTimeline";
import SpeakerModal from "@/components/SpeakerModal";
import type { Speaker } from "@/components/SpeakersSection";
import Footer from "@/components/Footer";
import ParallaxWrapper from "@/components/ParallaxWrapper";
import LiveReactionOverlay from "@/components/LiveReactionOverlay";

export default function Home() {
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f2] text-[#0a3825] selection:bg-[#c6f552] selection:text-[#0a3825]">
      {/* Kinetic Letter Cascade Preloader Screen */}
      <PagePreloader />

      {/* Floating Dynamic Pill Navbar with Live Stage Status */}
      <Navbar />

      {/* In-Hall Live Audience Reaction Bar */}
      <LiveReactionOverlay />

      {/* Multi-Section Stacking Curtain Parallax Controller */}
      <ParallaxWrapper>
        <main className="flex-grow relative">
          {/* Section 1: Fullscreen Hero Container */}
          <div id="hero-section" data-stack-section className="relative z-10 bg-[#faf8f2]">
            <Hero />
          </div>

          {/* Section 2: Keynote & Facilitators (Angled Top Curtain - Slant Right) */}
          <div data-stack-section className="relative z-20 bg-[#ece7d8] shadow-2xl clip-top-slant-right -mt-[1.8vw]">
            <SpeakersSection onSelectSpeaker={(speaker) => setSelectedSpeaker(speaker)} />
          </div>

          {/* Section 3: Hackathon Finalists (Angled Top Curtain - Slant Left) */}
          <div data-stack-section className="relative z-30 bg-[#faf8f2] shadow-2xl clip-top-slant-left -mt-[1.8vw]">
            <HackathonFinalists />
          </div>

          {/* Section 4: Research Papers Showcase (Angled Top Curtain - Slant Right) */}
          <div data-stack-section className="relative z-40 bg-[#ece7d8] shadow-2xl clip-top-slant-right -mt-[1.8vw]">
            <CallForPapers />
          </div>

          {/* Section 5: Interactive Schedule Timeline (Angled Top Curtain - Slant Left) */}
          <div data-stack-section className="relative z-50 bg-[#faf8f2] shadow-2xl clip-top-slant-left -mt-[1.8vw]">
            <ScheduleTimeline />
          </div>
        </main>

        {/* Section 6: Technical Footer (Angled Top Curtain - Slant Right) */}
        <div id="footer-section" data-stack-section className="relative z-60 bg-[#040032] shadow-2xl clip-top-slant-right -mt-[1.8vw]">
          <Footer />
        </div>
      </ParallaxWrapper>

      {/* Speaker Biography Modal Dialog */}
      <SpeakerModal
        speaker={selectedSpeaker}
        onClose={() => setSelectedSpeaker(null)}
      />
    </div>
  );
}
