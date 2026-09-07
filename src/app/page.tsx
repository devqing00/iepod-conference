"use client";

import { useState } from "react";
import PagePreloader from "@/components/PagePreloader";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import WhyAttend from "@/components/WhyAttend";
import SpeakersSection from "@/components/SpeakersSection";
import CallForPapers from "@/components/CallForPapers";
import ScheduleTimeline from "@/components/ScheduleTimeline";
import VenueCard from "@/components/VenueCard";
import FaqSection from "@/components/FaqSection";
import SpeakerModal from "@/components/SpeakerModal";
import type { Speaker } from "@/components/SpeakersSection";
import Footer from "@/components/Footer";
import ParallaxWrapper from "@/components/ParallaxWrapper";

export default function Home() {
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f2] text-[#0a3825] selection:bg-[#c6f552] selection:text-[#0a3825]">
      {/* Kinetic Letter Cascade Preloader Screen */}
      <PagePreloader />

      {/* Floating Dynamic Pill Navbar with Liquid Metal Glow & Live Program Clock */}
      <Navbar />

      {/* Multi-Section Stacking Curtain Parallax Controller */}
      <ParallaxWrapper>
        <main className="flex-grow relative">
          {/* Section 1: Fullscreen Hero Container */}
          <div id="hero-section" data-stack-section className="relative z-10 bg-[#faf8f2]">
            <Hero />
          </div>

          {/* Section 2: Why Attend Bento Grid (Angled Top Curtain - Slant Left) */}
          <div data-stack-section className="relative z-20 bg-[#faf8f2] shadow-2xl clip-top-slant-left -mt-[1.8vw]">
            <WhyAttend />
          </div>

          {/* Section 3: Keynote & Speakers (Angled Top Curtain - Slant Right) */}
          <div data-stack-section className="relative z-30 bg-[#ece7d8] shadow-2xl clip-top-slant-right -mt-[1.8vw]">
            <SpeakersSection onSelectSpeaker={(speaker) => setSelectedSpeaker(speaker)} />
          </div>

          {/* Section 4: Call For Papers & Research Presentations (Angled Top Curtain - Slant Left) */}
          <div data-stack-section className="relative z-40 bg-[#faf8f2] shadow-2xl clip-top-slant-left -mt-[1.8vw]">
            <CallForPapers />
          </div>

          {/* Section 5: Interactive Schedule Timeline (Angled Top Curtain - Slant Right) */}
          <div data-stack-section className="relative z-50 bg-[#ece7d8] shadow-2xl clip-top-slant-right -mt-[1.8vw]">
            <ScheduleTimeline />
          </div>

          {/* Section 6: Confirmed Venue Pass (Angled Top Curtain - Slant Left) */}
          <div data-stack-section className="relative z-[60] bg-[#faf8f2] shadow-2xl clip-top-slant-left -mt-[1.8vw]">
            <VenueCard />
          </div>

          {/* Section 7: FAQs (Angled Top Curtain - Slant Right - Full Height Sand BG) */}
          <div data-stack-section className="relative z-[70] bg-[#ece7d8] shadow-2xl clip-top-slant-right -mt-[1.8vw]">
            <FaqSection />
          </div>
        </main>

        {/* Section 8: Component Gallery Technical Footer (Angled Top Curtain - Slant Left) */}
        <div id="footer-section" data-stack-section className="relative z-[80] bg-[#040032] shadow-2xl clip-top-slant-left -mt-[1.8vw]">
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
